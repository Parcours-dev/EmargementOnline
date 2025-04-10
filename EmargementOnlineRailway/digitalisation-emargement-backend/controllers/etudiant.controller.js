const db = require("../config/db"); // Connexion à la base de données

// 🎓 Récupère les informations personnelles de l'étudiant connecté
const getEtudiantInfo = async (req, res) => {
    const etudiantId = req.user.id; // Récupère l’ID de l’étudiant depuis le token JWT

    try {
        // 🔍 Requête SQL pour récupérer les infos de l’étudiant en base
        const [rows] = await db.query(
            "SELECT NEtudiant, nom, prenom, email, id_groupe_TD, id_groupe_Anglais, adresse_eth FROM etudiant WHERE NEtudiant = ?",
            [etudiantId]
        );

        // ❌ Si aucun étudiant n’est trouvé → erreur 404
        if (rows.length === 0) {
            return res.status(404).json({ message: "Étudiant non trouvé" });
        }

        // ✅ On renvoie les informations de l’étudiant (1 seul objet)
        res.json(rows[0]);
    } catch (err) {
        console.error("Erreur getEtudiantInfo :", err);
        res.status(500).json({ message: "Erreur serveur" });
    }
};

module.exports = { getEtudiantInfo };
