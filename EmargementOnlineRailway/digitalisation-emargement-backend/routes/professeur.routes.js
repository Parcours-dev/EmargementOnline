const express = require("express");
const router = express.Router();
const {
    getEnseignantInfo,
    getEmploiDuTemps
} = require("../controllers/professeur.controller");

const { verifyToken } = require("../middleware/auth.middleware");
const { checkRole } = require("../middleware/checkRole");

/**
 * @swagger
 * tags:
 *   name: Enseignants
 *   description: Opérations liées aux enseignants (professeurs)
 */

/**
 * @swagger
 * /api/enseignants/me:
 *   get:
 *     summary: Infos du professeur connecté
 *     tags: [Enseignants]
 *     security: [ { bearerAuth: [] } ]
 *     responses:
 *       200:
 *         description: Informations du professeur
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
 */
router.get("/enseignants/me", verifyToken, checkRole("professeur"), getEnseignantInfo);

/**
 * @swagger
 * /api/enseignants/{id}/emplois:
 *   get:
 *     summary: Récupère l’emploi du temps d’un professeur
 *     tags: [Enseignants]
 *     security: [ { bearerAuth: [] } ]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID du professeur
 *       - in: query
 *         name: debut
 *         schema:
 *           type: string
 *           format: date
 *         required: false
 *         description: Date de début de la période
 *       - in: query
 *         name: fin
 *         schema:
 *           type: string
 *           format: date
 *         required: false
 *         description: Date de fin de la période
 *     responses:
 *       200:
 *         description: Liste des créneaux du professeur
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *       401:
 *         description: Non autorisé
 */
router.get("/enseignants/:id/emplois", verifyToken, checkRole("professeur"), getEmploiDuTemps);

module.exports = router;
