const db = require('../config/db');
const express = require("express");
const router = express.Router();
const path = require("path");
const fs = require("fs");
const multer = require("multer");

const { getEtudiantInfo } = require("../controllers/etudiant.controller");
const { verifyToken } = require("../middleware/auth.middleware");
const { checkRole } = require("../middleware/checkRole");
const { getCoursEtudiant } = require("../controllers/presence.controller");
const {
    enregistrerPhotoReference,
    verifierVisage
} = require("../controllers/reconnaissance.controller");

/**
 * @swagger
 * tags:
 *   name: Étudiant
 *   description: Opérations liées à l’étudiant connecté
 */

// ======================
// 📌 Middleware d'upload (non utilisé ici)
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

// =========================================
// ✅ Route : Vérifie si une photo est dispo
// =========================================
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
router.get("/etudiants/photo-reference", verifyToken, checkRole("etudiant"), async (req, res) => {
    const idEtudiant = req.user.id;
    console.log("📩 Vérification de la photo de référence pour l'étudiant :", idEtudiant);

    try {
        const [[etudiant]] = await db.query(
            `SELECT face_descriptor FROM etudiant WHERE NEtudiant = ?`,
            [idEtudiant]
        );

        if (!etudiant || !etudiant.face_descriptor) {
            console.log("📭 Aucun visage trouvé (champ null ou étudiant introuvable)");
            return res.json({ exists: false });
        }

        let descriptor;
        try {
            descriptor = JSON.parse(etudiant.face_descriptor);
        } catch (err) {
            console.error("❌ Erreur parsing JSON du descripteur :", err);
            return res.json({ exists: false });
        }

        const isValid = Array.isArray(descriptor) && descriptor.length === 128;

        if (isValid) {
            console.log("✅ Visage trouvé en base et valide (128 points)");
        } else {
            console.warn("⚠️ Visage trouvé mais invalide (longueur :", descriptor.length, ")");
        }

        return res.json({ exists: isValid });
    } catch (err) {
        console.error("❌ Erreur lors de la récupération du visage :", err);
        return res.status(500).json({ exists: false });
    }
});


// ===========================================
// ✅ Route : Enregistrement du descripteur
// ===========================================
/**
 * @swagger
 * /api/etudiants/face-reference:
 *   post:
 *     summary: Enregistre le descripteur facial comme référence
 *     tags: [Étudiant]
 *     security: [ { bearerAuth: [] } ]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               descriptor:
 *                 type: array
 *                 items:
 *                   type: number
 *     responses:
 *       200:
 *         description: Signature enregistrée
 *       400:
 *         description: Format incorrect
 */
router.post("/etudiants/face-reference", verifyToken, checkRole("etudiant"), enregistrerPhotoReference);

// =============================================
// ✅ Route : Vérification du descripteur facial
// =============================================
/**
 * @swagger
 * /api/etudiants/face-verify:
 *   post:
 *     summary: Vérifie la similarité entre visage scanné et référence
 *     tags: [Étudiant]
 *     security: [ { bearerAuth: [] } ]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               descriptor:
 *                 type: array
 *                 items:
 *                   type: number
 *     responses:
 *       200:
 *         description: Résultat de la vérification
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 match:
 *                   type: boolean
 */
router.post("/etudiants/face-verify", verifyToken, checkRole("etudiant"), verifierVisage);

module.exports = router;
