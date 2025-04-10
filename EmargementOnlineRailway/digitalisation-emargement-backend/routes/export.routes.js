const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middleware/auth.middleware");
const { checkRole } = require("../middleware/checkRole");
const {
    getPresencesJson,
    exportPresencesFile
} = require("../controllers/export.controller");

/**
 * @swagger
 * tags:
 *   name: Export
 *   description: Export des présences pour le CFA
 */

/**
 * @swagger
 * /api/cfa/export:
 *   get:
 *     summary: Récupère les présences filtrées au format JSON
 *     tags: [Export]
 *     security: [ { bearerAuth: [] } ]
 *     parameters:
 *       - in: query
 *         name: debut
 *         schema: { type: string, format: date }
 *         required: false
 *         description: Date de début
 *       - in: query
 *         name: fin
 *         schema: { type: string, format: date }
 *         required: false
 *         description: Date de fin
 *       - in: query
 *         name: id_promotion
 *         schema: { type: integer }
 *         required: false
 *         description: Filtrer par promotion
 *       - in: query
 *         name: id_groupe_TD
 *         schema: { type: integer }
 *         required: false
 *         description: Filtrer par groupe TD
 *       - in: query
 *         name: id_groupe_Anglais
 *         schema: { type: integer }
 *         required: false
 *         description: Filtrer par groupe d’anglais
 *       - in: query
 *         name: id_etudiant
 *         schema: { type: string }
 *         required: false
 *         description: Filtrer par étudiant
 *     responses:
 *       200:
 *         description: Données des présences au format JSON
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *       401:
 *         description: Non autorisé
 */
router.get("/export", verifyToken, checkRole("cfa"), getPresencesJson);

/**
 * @swagger
 * /api/cfa/export-file:
 *   get:
 *     summary: Télécharge les présences au format Excel ou CSV
 *     tags: [Export]
 *     security: [ { bearerAuth: [] } ]
 *     parameters:
 *       - in: query
 *         name: format
 *         schema:
 *           type: string
 *           enum: [excel, csv]
 *         required: true
 *         description: Format de fichier à exporter
 *       - in: query
 *         name: debut
 *         schema: { type: string, format: date }
 *         required: false
 *       - in: query
 *         name: fin
 *         schema: { type: string, format: date }
 *         required: false
 *       - in: query
 *         name: id_promotion
 *         schema: { type: integer }
 *         required: false
 *       - in: query
 *         name: id_groupe_TD
 *         schema: { type: integer }
 *         required: false
 *       - in: query
 *         name: id_groupe_Anglais
 *         schema: { type: integer }
 *         required: false
 *       - in: query
 *         name: id_etudiant
 *         schema: { type: string }
 *         required: false
 *     responses:
 *       200:
 *         description: Fichier généré (Excel ou CSV)
 *         content:
 *           application/octet-stream:
 *             schema:
 *               type: string
 *               format: binary
 *       400:
 *         description: Format non supporté
 *       401:
 *         description: Non autorisé
 */
router.get("/export-file", verifyToken, checkRole("cfa"), exportPresencesFile);

module.exports = router;
