const express = require("express");
const router = express.Router();
const { login, logout } = require("../controllers/auth.controller");

/**
 * @swagger
 * /api/login:
 *   post:
 *     summary: Connexion utilisateur (étudiant, professeur ou CFA)
 *     description: Authentifie un utilisateur selon son email et son mot de passe, et retourne un token JWT.
 *     tags: [Authentification]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - mot_de_passe
 *             properties:
 *               email:
 *                 type: string
 *                 example: prof@example.com
 *               mot_de_passe:
 *                 type: string
 *                 example: secret123
 *     responses:
 *       200:
 *         description: Connexion réussie avec retour du token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                 role:
 *                   type: string
 *                 nom:
 *                   type: string
 *                 prenom:
 *                   type: string
 *       401:
 *         description: Identifiants incorrects
 *       500:
 *         description: Erreur serveur
 */
router.post('/login', login);

/**
 * @swagger
 * /api/logout:
 *   post:
 *     summary: Déconnexion utilisateur
 *     description: Ne fait qu’envoyer un message de confirmation, la suppression du token est gérée côté client.
 *     tags: [Authentification]
 *     responses:
 *       200:
 *         description: Déconnexion réussie
 *       500:
 *         description: Erreur serveur
 */
router.post('/logout', logout);

module.exports = router;
