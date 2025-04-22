const express = require("express");
const router = express.Router();
const path = require("path");
const multer = require("multer");
const { verifyToken } = require("../middleware/auth.middleware");
const { checkRole } = require("../middleware/checkRole");
const justificatifController = require("../controllers/justificatif.controller");

// 📦 Config Multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/justificatifs/");
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        const ext = path.extname(file.originalname);
        cb(null, "justif-" + uniqueSuffix + ext);
    }
});
const upload = multer({ storage });

/**
 * @swagger
 * /etudiants/justificatifs:
 *   post:
 *     summary: Déposer un justificatif d'absence
 *     description: Permet à un étudiant authentifié de soumettre une pièce justificative pour un cours.
 *     tags: [Justificatifs]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               id_cours:
 *                 type: string
 *                 example: "4TYE813U"
 *               id_groupe:
 *                 type: integer
 *                 example: 7
 *               date_heure_debut:
 *                 type: string
 *                 format: date-time
 *                 example: 2025-03-31T07:00:00
 *               commentaire_etudiant:
 *                 type: string
 *                 example: "Je suis malade, voici l’arrêt."
 *               fichier:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Justificatif soumis avec succès
 *       400:
 *         description: Requête invalide
 */
router.post(
    "/etudiants/justificatifs",
    verifyToken,
    checkRole("etudiant"),
    upload.single("fichier"),
    justificatifController.ajouterJustificatif
);

/**
 * @swagger
 * /cfa/justificatifs/{id}:
 *   patch:
 *     summary: Traiter un justificatif (accepter ou refuser)
 *     description: Permet au CFA de valider ou refuser un justificatif soumis par un étudiant.
 *     tags: [Justificatifs]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID du justificatif à traiter
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               statut:
 *                 type: string
 *                 enum: [accepte, refuse]
 *               commentaire_admin:
 *                 type: string
 *     responses:
 *       200:
 *         description: Statut mis à jour avec succès
 *       404:
 *         description: Justificatif introuvable
 */
router.patch("/cfa/justificatifs/:id", justificatifController.traiterJustificatif);

/**
 * @swagger
 * /cfa/justificatifs:
 *   get:
 *     summary: Lister tous les justificatifs avec filtres facultatifs
 *     description: Permet au CFA de consulter les justificatifs, avec filtres dynamiques (promotion, étudiant, statut, période).
 *     tags: [Justificatifs]
 *     parameters:
 *       - in: query
 *         name: id_promotion
 *         schema:
 *           type: integer
 *         required: false
 *         description: ID de la promotion
 *       - in: query
 *         name: id_etudiant
 *         schema:
 *           type: string
 *         required: false
 *         description: Numéro d'étudiant
 *       - in: query
 *         name: statut
 *         schema:
 *           type: string
 *           enum: [en_attente, accepte, refuse]
 *         required: false
 *       - in: query
 *         name: date_min
 *         schema:
 *           type: string
 *           format: date
 *         required: false
 *       - in: query
 *         name: date_max
 *         schema:
 *           type: string
 *           format: date
 *         required: false
 *     responses:
 *       200:
 *         description: Liste des justificatifs
 */
router.get("/cfa/justificatifs", justificatifController.getJustificatifs);

module.exports = router;
