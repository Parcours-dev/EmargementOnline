const express = require("express");
const router = express.Router();
const path = require("path");
const fs = require("fs");
const multer = require("multer");

const { getEtudiantInfo } = require("../controllers/etudiant.controller");
const { verifyToken } = require("../middleware/auth.middleware");
const { checkRole } = require("../middleware/checkRole");
const { getCoursEtudiant } = require("../controllers/presence.controller");
const { getQrCodeActif } = require("../controllers/qrcode.controller");
const {
    enregistrerPhotoReference,
    verifierVisage,
} = require("../controllers/reconnaissance.controller");

/**
 * @swagger
 * tags:
 *   name: Étudiant
 *   description: Opérations liées à l’étudiant connecté
 */

// ======================
// 📌 Middleware d'upload
// ======================
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const dir = path.join(__dirname, '../uploads/references');
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        cb(null, dir);
    },
    filename: function (req, file, cb) {
        const etudiantId = req.user.id;
        cb(null, `${etudiantId}.jpg`);
    }
});
const upload = multer({ storage });

// ==========================
// ✅ Route : Infos étudiant
// ==========================
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
 */
router.get("/etudiants/me", verifyToken, checkRole("etudiant"), getEtudiantInfo);

// ==================================
// ✅ Route : Présences de l'étudiant
// ==================================
/**
 * @swagger
 * /api/etudiants/mes-presences:
 *   get:
 *     summary: Récupère tous les cours et les présences de l’étudiant
 *     tags: [Étudiant]
 *     security: [ { bearerAuth: [] } ]
 */
router.get("/etudiants/mes-presences", verifyToken, checkRole("etudiant"), getCoursEtudiant);

// =============================================
// ✅ Nouvelle Route : Upload photo de référence
// =============================================
/**
 * @swagger
 * /api/etudiants/photo-reference:
 *   post:
 *     summary: Upload de la photo de référence de l'étudiant
 *     tags: [Étudiant]
 *     security: [ { bearerAuth: [] } ]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               photo:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Photo enregistrée
 *       400:
 *         description: Erreur lors de l'enregistrement
 */
router.post("/etudiants/photo-reference", verifyToken, checkRole("etudiant"), upload.single("photo"), enregistrerPhotoReference);

// =====================================================
// ✅ Nouvelle Route : Vérifie si la photo de référence existe
// =====================================================
/**
 * @swagger
 * /api/etudiants/photo-reference:
 *   get:
 *     summary: Vérifie si la photo de référence existe pour l'étudiant
 *     tags: [Étudiant]
 *     security: [ { bearerAuth: [] } ]
 *     responses:
 *       200:
 *         description: Résultat de la vérification
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 exists:
 *                   type: boolean
 */
router.get("/etudiants/photo-reference", verifyToken, checkRole("etudiant"), (req, res) => {
    const filePath = path.join(__dirname, `../uploads/references/${req.user.id}.jpg`);
    const exists = fs.existsSync(filePath);
    return res.json({ exists });
});

// =====================================
// ✅ Route : Vérification reconnaissance
// =====================================
router.post("/etudiants/verifier-visage", verifyToken, checkRole("etudiant"), verifierVisage);

module.exports = router;
