const db = require("../config/db"); // Connexion à la base de données

// ================================
// 📚 PROMOTIONS
// ================================

// 🔍 Récupère toutes les promotions existantes, triées par ordre alphabétique
const getPromotions = async (req, res) => {
    try {
        const [rows] = await db.query(
            "SELECT id_promotion, nom, debut_annee_scolaire, fin_annee_scolaire FROM promotion ORDER BY nom ASC"
        );
        res.json(rows);
    } catch (err) {
        console.error("Erreur getPromotions :", err);
        res.status(500).json({ message: "Erreur serveur lors de la récupération des promotions." });
    }
};

// ✅ Crée une nouvelle promotion à partir des données envoyées dans le body
const createPromotion = async (req, res) => {
    const { nom, debut_annee_scolaire, fin_annee_scolaire } = req.body;

    // Vérification des champs requis
    if (!nom || !debut_annee_scolaire || !fin_annee_scolaire) {
        return res.status(400).json({ message: "Tous les champs sont obligatoires." });
    }

    try {
        await db.query(
            "INSERT INTO promotion (nom, debut_annee_scolaire, fin_annee_scolaire) VALUES (?, ?, ?)",
            [nom, debut_annee_scolaire, fin_annee_scolaire]
        );
        res.status(201).json({ message: "Promotion créée avec succès ✅" });
    } catch (err) {
        console.error("Erreur création promotion :", err);
        res.status(500).json({ message: "Erreur serveur." });
    }
};

// ✏️ Met à jour une promotion existante selon son ID
const updatePromotion = async (req, res) => {
    const { id } = req.params;
    const { nom, debut_annee_scolaire, fin_annee_scolaire } = req.body;

    try {
        const [result] = await db.query(
            "UPDATE promotion SET nom = ?, debut_annee_scolaire = ?, fin_annee_scolaire = ? WHERE id_promotion = ?",
            [nom, debut_annee_scolaire, fin_annee_scolaire, id]
        );

        // Si aucun enregistrement n’a été modifié
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Promotion introuvable." });
        }

        res.json({ message: "Promotion mise à jour avec succès ✅" });
    } catch (err) {
        console.error("Erreur modification promotion :", err);
        res.status(500).json({ message: "Erreur serveur." });
    }
};

// 🗑️ Supprime une promotion selon son ID
const deletePromotion = async (req, res) => {
    const { id } = req.params;

    try {
        const [result] = await db.query("DELETE FROM promotion WHERE id_promotion = ?", [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Promotion introuvable." });
        }

        res.json({ message: "Promotion supprimée avec succès 🗑️" });
    } catch (err) {
        console.error("Erreur suppression promotion :", err);
        res.status(500).json({ message: "Erreur serveur." });
    }
};


// ================================
// 👥 GROUPES
// ================================

// ➕ Crée un groupe (TD ou anglais) rattaché à une promotion
const createGroupe = async (req, res) => {
    const { nom, id_promotion } = req.body;

    if (!nom || !id_promotion) {
        return res.status(400).json({ message: "Tous les champs sont obligatoires." });
    }

    try {
        await db.query(
            `INSERT INTO groupe (nom, id_promotion) VALUES (?, ?)`,
            [nom, id_promotion]
        );
        res.status(201).json({ message: "Groupe créé avec succès ✅" });
    } catch (err) {
        console.error("Erreur création groupe :", err);
        res.status(500).json({ message: "Erreur serveur." });
    }
};

// ✏️ Met à jour un groupe existant (nom et promotion)
const updateGroupe = async (req, res) => {
    const { id } = req.params;
    const { nom, id_promotion } = req.body;

    if (!nom || !id_promotion) {
        return res.status(400).json({ message: "Tous les champs sont obligatoires." });
    }

    try {
        await db.query(
            `UPDATE groupe SET nom = ?, id_promotion = ? WHERE id_groupe = ?`,
            [nom, id_promotion, id]
        );
        res.status(200).json({ message: "Groupe mis à jour avec succès ✅" });
    } catch (err) {
        console.error("Erreur mise à jour groupe :", err);
        res.status(500).json({ message: "Erreur serveur." });
    }
};

// 🗑️ Supprime un groupe par son ID
const deleteGroupe = async (req, res) => {
    const { id } = req.params;

    try {
        await db.query(`DELETE FROM groupe WHERE id_groupe = ?`, [id]);
        res.status(200).json({ message: "Groupe supprimé ✅" });
    } catch (err) {
        console.error("Erreur suppression groupe :", err);
        res.status(500).json({ message: "Erreur serveur." });
    }
};

// 📋 Récupère tous les groupes avec le nom de leur promotion associée
const getGroupes = async (req, res) => {
    try {
        const [groupes] = await db.query(`
            SELECT g.id_groupe, g.nom, g.id_promotion, p.nom AS nom_promotion
            FROM groupe g
            LEFT JOIN promotion p ON g.id_promotion = p.id_promotion
            ORDER BY g.nom ASC
        `);
        res.json(groupes);
    } catch (err) {
        console.error("Erreur récupération groupes :", err);
        res.status(500).json({ message: "Erreur serveur." });
    }
};


// ================================
// 🎓 ÉTUDIANTS
// ================================

// 📥 Récupère tous les étudiants triés par nom
const getEtudiants = async (req, res) => {
    try {
        const [etudiants] = await db.query("SELECT * FROM etudiant ORDER BY nom, prenom");
        res.json(etudiants);
    } catch (err) {
        console.error("Erreur récupération étudiants :", err);
        res.status(500).json({ message: "Erreur serveur." });
    }
};

// ➕ Crée un nouvel étudiant avec ses infos personnelles et ses groupes (TD & Anglais)
const creerEtudiant = async (req, res) => {
    const { NEtudiant, nom, prenom, email, mot_de_passe, id_groupe_TD, id_groupe_Anglais } = req.body;

    if (!NEtudiant || !nom || !prenom || !email || !mot_de_passe || !id_groupe_TD || !id_groupe_Anglais) {
        return res.status(400).json({ message: "Tous les champs sont obligatoires." });
    }

    try {
        await db.query(
            `INSERT INTO etudiant (NEtudiant, nom, prenom, email, mot_de_passe, id_groupe_TD, id_groupe_Anglais)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [NEtudiant, nom, prenom, email, mot_de_passe, id_groupe_TD, id_groupe_Anglais]
        );
        res.status(201).json({ message: "Étudiant créé avec succès." });
    } catch (err) {
        console.error("Erreur création étudiant :", err);
        res.status(500).json({ message: "Erreur serveur." });
    }
};

// ✏️ Met à jour les informations d’un étudiant (identifié par NEtudiant)
const modifierEtudiant = async (req, res) => {
    const { id } = req.params;
    const { nom, prenom, email, mot_de_passe, id_groupe_TD, id_groupe_Anglais } = req.body;

    // Vérifie les champs obligatoires (sauf mot_de_passe qui est optionnel en modification)
    if (!nom || !prenom || !email || !id_groupe_TD || !id_groupe_Anglais) {
        return res.status(400).json({ message: "Certains champs obligatoires sont manquants." });
    }

    try {
        // 🔄 Requête SQL différente selon si mot_de_passe est fourni ou non
        if (mot_de_passe && mot_de_passe.trim() !== "") {
            await db.query(
                `UPDATE etudiant 
                 SET nom = ?, prenom = ?, email = ?, mot_de_passe = ?, 
                     id_groupe_TD = ?, id_groupe_Anglais = ?
                 WHERE NEtudiant = ?`,
                [nom, prenom, email, mot_de_passe, id_groupe_TD, id_groupe_Anglais, id]
            );
        } else {
            await db.query(
                `UPDATE etudiant 
                 SET nom = ?, prenom = ?, email = ?, 
                     id_groupe_TD = ?, id_groupe_Anglais = ?
                 WHERE NEtudiant = ?`,
                [nom, prenom, email, id_groupe_TD, id_groupe_Anglais, id]
            );
        }

        res.json({ message: "Étudiant modifié avec succès." });
    } catch (err) {
        console.error("Erreur modification étudiant :", err);
        res.status(500).json({ message: "Erreur serveur." });
    }
};


// 🗑️ Supprime un étudiant selon son NEtudiant
const supprimerEtudiant = async (req, res) => {
    const { id } = req.params;

    try {
        await db.query("DELETE FROM etudiant WHERE NEtudiant = ?", [id]);
        res.json({ message: "Étudiant supprimé avec succès." });
    } catch (err) {
        console.error("Erreur suppression étudiant :", err);
        res.status(500).json({ message: "Erreur serveur." });
    }
};

// 📦 Export des fonctions pour les utiliser dans les routes CFA
module.exports = {
    getPromotions,
    createPromotion,
    updatePromotion,
    deletePromotion,
    getGroupes,
    createGroupe,
    updateGroupe,
    deleteGroupe,
    getEtudiants,
    creerEtudiant,
    modifierEtudiant,
    supprimerEtudiant
};
