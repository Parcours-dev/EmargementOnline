const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middleware/auth.middleware");
const { checkRole } = require("../middleware/checkRole");
const { getParticipantsCours } = require("../controllers/cours.controller");

/**
 * @swagger
 * tags:
 *   name: Cours
 *   description: Gestion des cours et participants
 */

/**
 * @swagger
 * /api/cours/participants:
 *   get:
 *     summary: Récupère les participants d’un cours
 *     tags: [Cours]
 *     security: [ { bearerAuth: [] } ]
 *     parameters:
 *       - in: query
 *         name: id_creneau
 *         schema:
 *           type: string
 *         required: true
 *         description: Identifiant du créneau de cours
 *     responses:
 *       200:
 *         description: Liste des participants renvoyée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   nom:
 *                     type: string
 *                   prenom:
 *                     type: string
 *                   email:
 *                     type: string
 *       400:
 *         description: Paramètre manquant ou invalide
 *       401:
 *         description: Non autorisé (token manquant ou rôle invalide)
 *       500:
 *         description: Erreur serveur
 */
router.get("/cours/participants", verifyToken, checkRole("professeur"), getParticipantsCours);

module.exports = router;
