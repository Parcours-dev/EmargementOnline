const db = require("../config/db"); // Connexion à la base de données

// 📋 Récupère la liste des étudiants d’un groupe pour un cours donné + statut de présence
const getParticipantsCours = async (req, res) => {
    const { id_cours, id_groupe, date_heure_debut } = req.query;

    // 🔎 Vérification que tous les paramètres nécessaires sont bien fournis
    if (!id_cours || !id_groupe || !date_heure_debut) {
        return res.status(400).json({ message: "Paramètres manquants" });
    }

    try {
        // 🧠 Détermine le type de groupe selon le code du cours
        // Si le cours commence par "ANG" → groupe d'anglais, sinon → groupe TD
        const typeGroupe = id_cours.startsWith("ANG") ? "id_groupe_Anglais" : "id_groupe_TD";

        // 👥 Récupère tous les étudiants du groupe concerné
        const [etudiants] = await db.query(
            `SELECT nom, prenom, email, NEtudiant FROM etudiant WHERE ${typeGroupe} = ?`,
            [id_groupe]
        );

        // ✅ Récupère les étudiants ayant déjà émargé pour ce cours et ce créneau
        const [emargements] = await db.query(
            `SELECT NEtudiant FROM emargement WHERE id_cours = ? AND id_groupe = ? AND date_heure_debut = ?`,
            [id_cours, id_groupe, date_heure_debut]
        );

        // 💾 Transforme la liste des présents en Set pour un accès rapide
        const presents = new Set(emargements.map(e => e.NEtudiant));

        // 🔄 Combine les deux sources : liste d’étudiants + info de présence
        const resultat = etudiants.map(e => ({
            nom: e.nom,
            prenom: e.prenom,
            email: e.email,
            present: presents.has(e.NEtudiant), // true si l'étudiant est présent
        }));

        // 🚀 Envoie du tableau final des participants avec leur statut
        res.json({ participants: resultat });

    } catch (err) {
        console.error("Erreur getParticipantsCours:", err);
        res.status(500).json({ message: "Erreur serveur" });
    }
};

module.exports = { getParticipantsCours };
