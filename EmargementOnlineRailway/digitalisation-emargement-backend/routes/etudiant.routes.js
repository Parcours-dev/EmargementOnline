const express = require("express");
const router = express.Router();
const { getEtudiantInfo } = require("../controllers/etudiant.controller");
const { verifyToken } = require("../middleware/auth.middleware");
const { checkRole } = require("../middleware/checkRole");
const { getCoursEtudiant } = require("../controllers/presence.controller");
const { getQrCodeActif } = require("../controllers/qrcode.controller");

/**
 * @swagger
 * tags:
 *   name: Étudiant
 *   description: Opérations liées à l’étudiant connecté
 */

/**
 * @swagger
 * /api/etudiants/me:
 *   get:
 *     summary: Récupère les infos de l’étudiant connecté
 *     tags: [Étudiant]
 *     security: [ { bearerAuth: [] } ]
 *     responses:
 *       200:
 *         description: Infos personnelles de l’étudiant
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 nom:
 *                   type: string
 *                 prenom:
 *                   type: string
 *                 email:
 *                   type: string
 *       401:
 *         description: Non autorisé
 *       500:
 *         description: Erreur serveur
 */
router.get("/etudiants/me", verifyToken, checkRole("etudiant"), getEtudiantInfo);

/**
 * @swagger
 * /api/etudiants/mes-presences:
 *   get:
 *     summary: Récupère tous les cours et les présences de l’étudiant
 *     tags: [Étudiant]
 *     security: [ { bearerAuth: [] } ]
 *     parameters:
 *       - in: query
 *         name: debut
 *         schema:
 *           type: string
 *           format: date
 *         required: false
 *         description: Filtrer à partir d’une date (AAAA-MM-JJ)
 *       - in: query
 *         name: fin
 *         schema:
 *           type: string
 *           format: date
 *         required: false
 *         description: Filtrer jusqu’à une date
 *     responses:
 *       200:
 *         description: Liste des cours avec statut de présence
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   cours:
 *                     type: string
 *                   date:
 *                     type: string
 *                   statut:
 *                     type: string
 *       401:
 *         description: Non autorisé
 *       500:
 *         description: Erreur serveur
 */
router.get("/etudiants/mes-presences", verifyToken, checkRole("etudiant"), getCoursEtudiant);

module.exports = router;
