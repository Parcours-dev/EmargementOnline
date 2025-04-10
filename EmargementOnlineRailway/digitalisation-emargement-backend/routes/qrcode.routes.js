const express = require("express");
const router = express.Router();
const { generateQrCode, enregistrerPresenceViaQr } = require("../controllers/qrcode.controller");
const { verifyToken } = require("../middleware/auth.middleware");
const { checkRole } = require("../middleware/checkRole");

/**
 * @swagger
 * tags:
 *   name: QR Code
 *   description: Présence via QR code (prof & étudiant)
 */

/**
 * @swagger
 * /api/creneaux/{id}/generate-qr:
 *   post:
 *     summary: Génère un QR code temporaire pour un créneau
 *     tags: [QR Code]
 *     security: [ { bearerAuth: [] } ]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID du créneau
 *     responses:
 *       200:
 *         description: QR code généré avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   description: Jeton temporaire pour le scan
 *       401:
 *         description: Non autorisé
 *       404:
 *         description: Créneau introuvable
 */
router.post("/creneaux/:id/generate-qr", verifyToken, checkRole("professeur"), generateQrCode);

/**
 * @swagger
 * /api/qrcode/{token}/scan:
 *   post:
 *     summary: Valide la présence via un QR code scanné
 *     tags: [QR Code]
 *     security: [ { bearerAuth: [] } ]
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *         description: Jeton contenu dans le QR code
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               empreinte_device:
 *                 type: string
 *                 example: device-fingerprint123
 *     responses:
 *       200:
 *         description: Présence validée
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       400:
 *         description: Jeton invalide ou expiré
 *       401:
 *         description: Non autorisé
 */
router.post("/qrcode/:token/scan", verifyToken, checkRole("etudiant"), enregistrerPresenceViaQr);

module.exports = router;
