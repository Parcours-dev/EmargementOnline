const db = require("../config/db"); // Connexion à la base de données

function toMySQLDateTime(isoString) {
    return new Date(isoString).toISOString().slice(0, 19).replace("T", " ");
}


// ==============================
// 📝 Validation manuelle par le professeur
// ==============================
const validerPresenceManuelle = async (req, res) => {
    const { email, id_cours, id_groupe, date_heure_debut } = req.body;
    const dateMySQL = toMySQLDateTime(date_heure_debut);

    const professeur = req.user; // Récupération du prof via le token JWT

    try {
        // 📧 On cherche l'étudiant via son email
        const [etudiants] = await db.query("SELECT * FROM etudiant WHERE email = ?", [email]);
        if (etudiants.length === 0) return res.status(404).json({ message: "Étudiant introuvable." });

        const etudiant = etudiants[0];

        // ❌ Vérifie si une présence est déjà enregistrée
        const [existants] = await db.query(
            "SELECT * FROM emargement WHERE NEtudiant = ? AND id_cours = ? AND id_groupe = ? AND date_heure_debut = ?",
            [etudiant.NEtudiant, id_cours, id_groupe, date_heure_debut]
        );

        if (existants.length > 0) {
            return res.status(409).json({ message: "Présence déjà enregistrée pour cet étudiant." });
        }

        // ✅ Insère une présence avec les infos du prof + ajout manuel = true
        await db.query(
            `INSERT INTO emargement
             (NEtudiant, id_cours, id_groupe, id_professeur, date_heure_signature, date_heure_debut, ajout_manuel, valide_par)
             VALUES (?, ?, ?, ?, NOW(), ?, true, ?)`,
            [etudiant.NEtudiant, id_cours, id_groupe, professeur.id, dateMySQL, `${professeur.nom} ${professeur.prenom}`]
        );

        // 🎁 Récompense : envoie de 10 UBToken à l'étudiant
        const { rewardStudent } = require("../blockchain/blockchain");

        try {
            if (!etudiant.adresse_eth) {
                console.warn("⚠️ Adresse ETH manquante pour l'étudiant", etudiant.NEtudiant);
            } else {
                const tx = await rewardStudent(etudiant.adresse_eth, 10);
                await tx.wait();
                console.log(`✅ ${etudiant.nom} a reçu 10 UBT (${tx.hash})`);
            }
        } catch (err) {
            console.error("❌ Erreur envoi UBToken :", err.message);
        }


        res.status(200).json({ message: "Présence ajoutée manuellement ✅" });
    } catch (err) {
        console.error("Erreur validation manuelle :", err);
        res.status(500).json({ message: "Erreur serveur." });
    }
};

// ==============================
// 📋 Liste des étudiants attendus + leur statut de présence
// ==============================
const getListeEtudiantsAvecPresences = async (req, res) => {
    const { id_cours, id_groupe, date_heure_debut } = req.query;

    try {
        // 📥 Vérifie que tous les paramètres sont bien fournis
        if (!id_cours || !id_groupe || !date_heure_debut) {
            return res.status(400).json({ message: "Paramètres manquants." });
        }

        // 👥 Récupère tous les étudiants du groupe (TD ou anglais)
        const [etudiants] = await db.query(`
            SELECT
                e.NEtudiant,
                e.nom,
                e.prenom,
                e.email
            FROM etudiant e
            WHERE e.id_groupe_TD = ? OR e.id_groupe_Anglais = ?
        `, [id_groupe, id_groupe]);

        // 🔄 Pour chaque étudiant, on vérifie s’il a été émargé pour ce créneau
        const results = await Promise.all(etudiants.map(async (etudiant) => {
            const [presences] = await db.query(
                `SELECT * FROM emargement 
                 WHERE NEtudiant = ? AND id_cours = ? AND id_groupe = ? AND date_heure_debut = ?`,
                [etudiant.NEtudiant, id_cours, id_groupe, date_heure_debut]
            );

            return {
                ...etudiant,
                present: presences.length > 0, // true si présence trouvée
                presence: presences[0] || null // détails de présence si existant
            };
        }));

        res.status(200).json(results);
    } catch (err) {
        console.error("Erreur récupération des présences :", err);
        res.status(500).json({ message: "Erreur serveur." });
    }
};

// ==============================
// 🎓 Liste des cours d’un étudiant connecté, avec son statut de présence
// ==============================
const getCoursEtudiant = async (req, res) => {
    const idEtudiant = req.user.id;

    // 🔒 Sécurité : seul un étudiant peut accéder à ses cours
    if (req.user.role !== "etudiant") {
        return res.status(403).json({ message: "Accès non autorisé." });
    }

    const { date, from, to } = req.query;
    let dateDebut, dateFin;

    // 🗓️ Gestion des filtres de date
    if (date) {
        dateDebut = `${date} 00:00:00`;
        dateFin = `${date} 23:59:59`;
    } else if (from && to) {
        dateDebut = `${from} 00:00:00`;
        dateFin = `${to} 23:59:59`;
    } else {
        // Aucun filtre = récupère tout
        dateDebut = "2000-01-01 00:00:00";
        dateFin = "2100-01-01 00:00:00";
    }

    try {
        // 🔍 Récupération des groupes de l’étudiant
        const [[etu]] = await db.query(
            "SELECT id_groupe_TD, id_groupe_Anglais FROM etudiant WHERE NEtudiant = ?",
            [idEtudiant]
        );

        if (!etu) {
            return res.status(404).json({ message: "Étudiant introuvable" });
        }

        // 📚 Récupération des cours dans les groupes de l'étudiant
        const [cours] = await db.query(
            `SELECT
                 c.id_cours,
                 c.nom AS nom_cours,
                 g.id_groupe,                    -- ✅ AJOUTÉ
                 g.nom AS nom_groupe,
                 cr.date_heure_debut,
                 cr.date_heure_fin
             FROM creneau cr
                      JOIN cours c ON cr.id_cours = c.id_cours
                      JOIN groupe g ON cr.id_groupe = g.id_groupe
             WHERE cr.id_groupe IN (?, ?)
               AND cr.date_heure_debut BETWEEN ? AND ?
             ORDER BY cr.date_heure_debut ASC`,
            [etu.id_groupe_TD, etu.id_groupe_Anglais, dateDebut, dateFin]
        );

        // ➕ On ajoute le statut de présence à chaque cours
        for (const c of cours) {
            const [presence] = await db.query(
                `SELECT * FROM emargement
                 WHERE NEtudiant = ? AND id_cours = ? AND date_heure_debut = ?`,
                [idEtudiant, c.id_cours, c.date_heure_debut]
            );
            c.present = presence.length > 0;
        }

        res.json(cours);
    } catch (err) {
        console.error("Erreur récupération cours étudiant :", err);
        res.status(500).json({ message: "Erreur serveur." });
    }
};


module.exports = {
    validerPresenceManuelle,
    getListeEtudiantsAvecPresences,
    getCoursEtudiant
};
