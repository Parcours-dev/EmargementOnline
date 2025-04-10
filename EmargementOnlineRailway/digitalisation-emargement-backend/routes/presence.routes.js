const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middleware/auth.middleware");
const { checkRole } = require("../middleware/checkRole");

const {
    validerPresenceManuelle,
    getListeEtudiantsAvecPresences,
    getCoursEtudiant
} = require("../controllers/presence.controller");

/**
 * @swagger
 * tags:
 *   name: Présences
 *   description: Suivi et gestion des présences
 */

/**
 * @swagger
 * /api/presences/valider:
 *   patch:
 *     summary: Valide manuellement la présence d’un étudiant
 *     tags: [Présences]
 *     security: [ { bearerAuth: [] } ]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id_creneau
 *               - id_etudiant
 *               - statut
 *             properties:
 *               id_creneau:
 *                 type: string
 *               id_etudiant:
 *                 type: string
 *               statut:
 *                 type: string
 *                 enum: [present, absent, retard]
 *     responses:
 *       200:
 *         description: Présence validée
 *       400:
 *         description: Requête invalide
 *       401:
 *         description: Non autorisé
 */
router.patch("/valider", verifyToken, checkRole("professeur"), validerPresenceManuelle);

/**
 * @swagger
 * /api/presences/controle:
 *   get:
 *     summary: Liste les étudiants et leur statut de présence pour un créneau
 *     tags: [Présences]
 *     security: [ { bearerAuth: [] } ]
 *     parameters:
 *       - in: query
 *         name: id_creneau
 *         schema:
 *           type: string
 *         required: true
 *         description: Identifiant du créneau à contrôler
 *     responses:
 *       200:
 *         description: Liste des présences par étudiant
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *       400:
 *         description: Paramètre manquant ou invalide
 *       401:
 *         description: Non autorisé
 */
router.get("/controle", verifyToken, checkRole("professeur"), getListeEtudiantsAvecPresences);

/**
 * @swagger
 * /api/presences/etudiants/{id}/cours:
 *   get:
 *     summary: Récupère les cours et les présences d’un étudiant
 *     tags: [Présences]
 *     security: [ { bearerAuth: [] } ]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Numéro d’étudiant
 *       - in: query
 *         name: debut
 *         schema:
 *           type: string
 *           format: date
 *         required: false
 *       - in: query
 *         name: fin
 *         schema:
 *           type: string
 *           format: date
 *         required: false
 *     responses:
 *       200:
 *         description: Liste des cours avec statut de présence
 *       401:
 *         description: Non autorisé
 */
router.get("/etudiants/:id/cours", verifyToken, checkRole("etudiant"), getCoursEtudiant);

module.exports = router;
