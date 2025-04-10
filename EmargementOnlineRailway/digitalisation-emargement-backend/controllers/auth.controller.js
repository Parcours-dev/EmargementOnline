const bcrypt = require("bcryptjs"); // Bibliothèque pour le hachage de mots de passe (non encore utilisée ici)
const jwt = require("jsonwebtoken"); // Utilisé pour générer des jetons JWT
const db = require("../config/db"); // Connexion à la base de données

// 🔐 Contrôleur de connexion - Authentifie un utilisateur et renvoie un token JWT
const login = async (req, res) => {
    const { email, mot_de_passe } = req.body; // Récupération des identifiants depuis le body de la requête

    try {
        // On prépare les rôles disponibles dans le système avec les infos spécifiques à chaque table
        const roles = [
            { table: "etudiant", idCol: "NEtudiant", nomCol: "nom", prenomCol: "prenom" },
            { table: "professeur", idCol: "id_professeur", nomCol: "nom", prenomCol: "prenom" },
            { table: "cfa", idCol: "id_cfa", nomCol: "nom", prenomCol: "prenom" }
        ];

        // 🔍 On parcourt chaque table pour tenter de trouver l'utilisateur
        for (const roleEntry of roles) {
            const { table, idCol, nomCol, prenomCol } = roleEntry;

            // Requête SQL pour vérifier si l’email existe dans cette table
            const [rows] = await db.query(`SELECT * FROM ${table} WHERE email = ?`, [email]);

            // Si l’utilisateur est trouvé
            if (rows.length) {
                const user = rows[0];

                // Vérification du mot de passe (ici en clair, mais prêt pour utiliser bcrypt)
                if (user.mot_de_passe === mot_de_passe /* || await bcrypt.compare(mot_de_passe, user.mot_de_passe) */) {
                    const role = table;

                    // On prépare les données à stocker dans le token JWT
                    const payload = {
                        id: user[idCol],
                        role,
                        nom: user[nomCol],
                        prenom: user[prenomCol]
                    };

                    // 🔐 Génération du token avec une durée de validité de 6 heures
                    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "6h" });

                    // Envoi de la réponse avec le token et les infos de l'utilisateur
                    return res.json({ token, role, nom: user[nomCol], prenom: user[prenomCol] });
                }
            }
        }

        // Si aucun rôle n’a matché, on renvoie une erreur d’identifiants
        return res.status(401).json({ message: "Identifiants incorrects." });

    } catch (err) {
        // 💥 Gestion des erreurs serveur
        console.error("Erreur dans login :", err);
        res.status(500).json({ message: "Erreur serveur." });
    }
};

// 🔓 Contrôleur de déconnexion - Pas de vraie invalidation du token côté serveur
const logout = async (req, res) => {
    try {
        // Le front est responsable de supprimer le token (ex: localStorage)
        return res.status(200).json({ message: "Déconnexion réussie. Veuillez supprimer le token côté client." });
    } catch (err) {
        console.error("Erreur logout :", err);
        res.status(500).json({ message: "Erreur serveur lors de la déconnexion." });
    }
};

// Export des fonctions pour les routes
module.exports = { login, logout };
