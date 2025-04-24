const db = require("../config/db"); // Connexion à la base de données

// ==============================
// ✅ Valider ou refuser un justificatif (CFA)
// ==============================
const traiterJustificatif = async (req, res) => {
    const idJustificatif = req.params.id;
    const { statut, commentaire_admin } = req.body;

    // ✅ Vérification du statut reçu
    if (!["accepte", "refuse"].includes(statut)) {
        return res.status(400).json({ message: "Statut invalide. Utilisez 'accepte' ou 'refuse'." });
    }

    try {
        // 🔍 Récupération du justificatif
        const [rows] = await db.query(
            "SELECT * FROM justificatifs WHERE id = ?",
            [idJustificatif]
        );

        if (rows.length === 0) {
            return res.status(404).json({ message: "Justificatif non trouvé." });
        }

        const justificatif = rows[0];

        // 📝 Mise à jour du justificatif avec le nouveau statut
        await db.query(
            `UPDATE justificatifs 
             SET statut = ?, commentaire_admin = ? 
             WHERE id = ?`,
            [statut, commentaire_admin || null, idJustificatif]
        );

// ➕ Si accepté, on insère une ligne dans la table emargement
        if (statut === "accepte") {
            // 🔍 Vérification qu'une présence n'existe pas déjà
            const [emargementExistant] = await db.query(
                `SELECT * FROM emargement 
         WHERE NEtudiant = ? AND id_cours = ? AND id_groupe = ? AND date_heure_debut = ?`,
                [justificatif.id_etudiant, justificatif.id_cours, justificatif.id_groupe, justificatif.date_heure_debut]
            );

            if (emargementExistant.length === 0) {
                // 🔄 On récupère les infos du créneau
                const [creneaux] = await db.query(
                    `SELECT * FROM creneau
             WHERE id_cours = ? AND id_groupe = ? AND date_heure_debut = ?`,
                    [justificatif.id_cours, justificatif.id_groupe, justificatif.date_heure_debut]
                );

                if (creneaux.length === 0) {
                    return res.status(404).json({ message: "Créneau non trouvé pour ce justificatif." });
                }

                const creneau = creneaux[0];

                // ✅ Insertion de la présence rétroactive
                await db.query(
                    `INSERT INTO emargement
                     (NEtudiant, id_cours, id_groupe, id_professeur, date_heure_debut, date_heure_signature, ajout_manuel, valide_par)
                     VALUES (?, ?, ?, ?, ?, NOW(), TRUE, 'CFA')`,
                    [justificatif.id_etudiant, justificatif.id_cours, justificatif.id_groupe, creneau.id_professeur, justificatif.date_heure_debut]
                );
            }
        }



        // 🎉 Réponse finale
        res.json({
            message: `Justificatif ${statut === "accepte" ? "accepté" : "refusé"} avec succès.`,
            presenceCreee: statut === "accepte"
        });

    } catch (err) {
        console.error("Erreur lors du traitement du justificatif :", err);
        res.status(500).json({ message: "Erreur serveur lors du traitement du justificatif." });
    }
};

// ==============================
// 📄 Liste des justificatifs avec filtres (CFA)
// ==============================
const getJustificatifs = async (req, res) => {
    const { id_promotion, id_etudiant, statut, date_min, date_max } = req.query;

    try {
        let conditions = [];
        let params = [];

        // 🔍 Construction dynamique des filtres
        if (id_promotion) {
            conditions.push("groupe.id_promotion = ?");
            params.push(id_promotion);
        }

        if (id_etudiant) {
            conditions.push("justificatifs.id_etudiant = ?");
            params.push(id_etudiant);
        }

        if (statut) {
            conditions.push("justificatifs.statut = ?");
            params.push(statut);
        }

        if (date_min) {
            conditions.push("justificatifs.date_soumission >= ?");
            params.push(date_min);
        }

        if (date_max) {
            conditions.push("justificatifs.date_soumission <= ?");
            params.push(date_max);
        }

        const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

        // 📦 Requête enrichie avec jointures utiles
        const [rows] = await db.query(
            `
                SELECT
                    justificatifs.*,
                    etudiant.nom AS nom_etudiant,
                    etudiant.prenom AS prenom_etudiant,
                    groupe.id_promotion,
                    creneau.date_heure_debut,
                    creneau.date_heure_fin,
                    cours.nom AS nom_cours
                FROM justificatifs
                         JOIN etudiant ON justificatifs.id_etudiant COLLATE utf8mb4_unicode_ci = etudiant.NEtudiant COLLATE utf8mb4_unicode_ci
                         JOIN groupe ON justificatifs.id_groupe COLLATE utf8mb4_unicode_ci = groupe.id_groupe COLLATE utf8mb4_unicode_ci
                         JOIN cours ON justificatifs.id_cours COLLATE utf8mb4_unicode_ci = cours.id_cours COLLATE utf8mb4_unicode_ci
                         LEFT JOIN creneau ON
                    justificatifs.id_cours COLLATE utf8mb4_unicode_ci = creneau.id_cours COLLATE utf8mb4_unicode_ci AND
                    justificatifs.id_groupe COLLATE utf8mb4_unicode_ci = creneau.id_groupe COLLATE utf8mb4_unicode_ci AND
                    justificatifs.date_heure_debut = creneau.date_heure_debut
                    ${whereClause}
                ORDER BY justificatifs.date_soumission DESC
            `,
            params
        );

        res.json(rows);

    } catch (err) {
        console.error("Erreur récupération justificatifs CFA :", err);
        res.status(500).json({ message: "Erreur serveur lors de la récupération des justificatifs." });
    }
};

module.exports = {
    getJustificatifs
};


// ==============================
// 📤 Déposer un justificatif (étudiant)
// ==============================
const ajouterJustificatif = async (req, res) => {
    const idEtudiant = req.user.id;
    const { id_cours, id_groupe, date_heure_debut, commentaire } = req.body;
    const fichier = req.file?.filename;

    if (!id_cours || !id_groupe || !date_heure_debut || !fichier) {
        return res.status(400).json({ message: "Champs requis manquants." });
    }

    try {
        // ✅ Formatage de la date pour MySQL (YYYY-MM-DD HH:MM:SS)
        const dateObj = new Date(date_heure_debut);
        const mysqlFormattedDate = dateObj.toISOString().slice(0, 19).replace('T', ' ');

        await db.query(
            `INSERT INTO justificatifs
             (id_etudiant, id_cours, id_groupe, date_heure_debut, fichier_url, commentaire_etudiant, statut, date_soumission)
             VALUES (?, ?, ?, ?, ?, ?, 'en_attente', NOW())`,
            [
                idEtudiant,
                id_cours,
                id_groupe,
                mysqlFormattedDate,
                fichier,
                commentaire || null
            ]
        );

        res.status(201).json({ message: "Justificatif soumis avec succès." });
    } catch (err) {
        console.error("❌ Erreur ajout justificatif :", err);
        res.status(500).json({ message: "Erreur serveur lors de l'ajout du justificatif." });
    }
};



module.exports = {
    traiterJustificatif,
    getJustificatifs,
    ajouterJustificatif
};
