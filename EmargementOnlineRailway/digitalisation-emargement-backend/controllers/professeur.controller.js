const db = require("../config/db"); // Connexion à la base de données

// ==============================
// 👤 Récupération des infos du professeur connecté
// ==============================
const getEnseignantInfo = async (req, res) => {
    const idProf = req.user.id; // ID extrait du token JWT

    try {
        // 🔍 Requête pour récupérer les informations de base du prof
        const [rows] = await db.query(
            "SELECT id_professeur, nom, prenom, email FROM professeur WHERE id_professeur = ?",
            [idProf]
        );

        if (rows.length === 0) {
            // ❌ Aucun prof trouvé
            return res.status(404).json({ message: "Professeur non trouvé" });
        }

        // ✅ Envoi des données au client
        res.json(rows[0]);
    } catch (err) {
        console.error("Erreur getEnseignantInfo :", err);
        res.status(500).json({ message: "Erreur serveur" });
    }
};

const getEmploiDuTemps = async (req, res) => {
    const idProf = req.params.id;

    // 🔐 Vérification que le prof ne demande QUE son propre emploi du temps
    if (parseInt(req.user.id) !== parseInt(idProf)) {
        return res.status(403).json({ message: "Accès interdit à l'emploi du temps d'un autre professeur." });
    }

    try {
        // 🔄 Requête pour récupérer tous les créneaux de cours associés à ce prof
        const [rows] = await db.query(
            `SELECT
                creneau.id_cours,
                creneau.id_groupe,
                creneau.id_professeur,
                cours.nom AS nom_cours,
                creneau.date_heure_debut,
                creneau.date_heure_fin,
                groupe.nom AS nom_groupe
             FROM creneau
             JOIN cours ON creneau.id_cours = cours.id_cours
             JOIN groupe ON creneau.id_groupe = groupe.id_groupe
             WHERE creneau.id_professeur = ?
             ORDER BY creneau.date_heure_debut ASC`,
            [idProf]
        );

        res.json(rows);
    } catch (err) {
        console.error("Erreur emploi du temps prof :", err);
        res.status(500).json({ message: "Erreur serveur" });
    }
};

module.exports = { getEnseignantInfo , getEmploiDuTemps };