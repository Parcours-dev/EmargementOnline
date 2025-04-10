const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middleware/auth.middleware");
const { checkRole } = require("../middleware/checkRole");

const {
    getPromotions,
    createPromotion,
    updatePromotion,
    deletePromotion,
    getGroupes,
    createGroupe,
    updateGroupe,
    deleteGroupe,
    getEtudiants,
    creerEtudiant,
    modifierEtudiant,
    supprimerEtudiant
} = require("../controllers/cfa.controller");

/**
 * @swagger
 * tags:
 *   name: CFA
 *   description: Gestion CFA (promotions, groupes, étudiants)
 */

/**
 * @swagger
 * /api/cfa/promotions:
 *   get:
 *     summary: Liste des promotions
 *     tags: [CFA]
 *     security: [ { bearerAuth: [] } ]
 *     responses:
 *       200:
 *         description: OK
 */
router.get("/cfa/promotions", verifyToken, checkRole("cfa"), getPromotions);

/**
 * @swagger
 * /api/cfa/promotions:
 *   post:
 *     summary: Crée une promotion
 *     tags: [CFA]
 *     security: [ { bearerAuth: [] } ]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nom:
 *                 type: string
 *     responses:
 *       201:
 *         description: Créé
 */
router.post("/cfa/promotions", verifyToken, checkRole("cfa"), createPromotion);

/**
 * @swagger
 * /api/cfa/promotions/{id}:
 *   put:
 *     summary: Met à jour une promotion
 *     tags: [CFA]
 *     security: [ { bearerAuth: [] } ]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema: { type: integer }
 *         required: true
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nom:
 *                 type: string
 *     responses:
 *       200:
 *         description: OK
 */
router.put("/cfa/promotions/:id", verifyToken, checkRole("cfa"), updatePromotion);

/**
 * @swagger
 * /api/cfa/promotions/{id}:
 *   delete:
 *     summary: Supprime une promotion
 *     tags: [CFA]
 *     security: [ { bearerAuth: [] } ]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema: { type: integer }
 *         required: true
 *     responses:
 *       200:
 *         description: Supprimé
 */
router.delete("/cfa/promotions/:id", verifyToken, checkRole("cfa"), deletePromotion);

/**
 * @swagger
 * /api/cfa/groupes:
 *   get:
 *     summary: Liste des groupes
 *     tags: [CFA]
 *     security: [ { bearerAuth: [] } ]
 *     responses:
 *       200:
 *         description: OK
 */
router.get("/cfa/groupes", verifyToken, checkRole("cfa"), getGroupes);

/**
 * @swagger
 * /api/cfa/groupes:
 *   post:
 *     summary: Crée un groupe
 *     tags: [CFA]
 *     security: [ { bearerAuth: [] } ]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nom:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: [TD, Anglais]
 *     responses:
 *       201:
 *         description: Créé
 */
router.post("/cfa/groupes", verifyToken, checkRole("cfa"), createGroupe);

/**
 * @swagger
 * /api/cfa/groupes/{id}:
 *   put:
 *     summary: Met à jour un groupe
 *     tags: [CFA]
 *     security: [ { bearerAuth: [] } ]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema: { type: integer }
 *         required: true
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nom:
 *                 type: string
 *     responses:
 *       200:
 *         description: OK
 */
router.put("/cfa/groupes/:id", verifyToken, checkRole("cfa"), updateGroupe);

/**
 * @swagger
 * /api/cfa/groupes/{id}:
 *   delete:
 *     summary: Supprime un groupe
 *     tags: [CFA]
 *     security: [ { bearerAuth: [] } ]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema: { type: integer }
 *         required: true
 *     responses:
 *       200:
 *         description: Supprimé
 */
router.delete("/cfa/groupes/:id", verifyToken, checkRole("cfa"), deleteGroupe);

/**
 * @swagger
 * /api/cfa/etudiants:
 *   get:
 *     summary: Liste tous les étudiants
 *     tags: [CFA]
 *     responses:
 *       200:
 *         description: OK
 */
router.get("/cfa/etudiants", getEtudiants);

/**
 * @swagger
 * /api/cfa/etudiants:
 *   post:
 *     summary: Crée un étudiant
 *     tags: [CFA]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nom
 *               - prenom
 *               - email
 *               - id_groupe_TD
 *               - id_groupe_Anglais
 *             properties:
 *               nom:
 *                 type: string
 *               prenom:
 *                 type: string
 *               email:
 *                 type: string
 *               mot_de_passe:
 *                 type: string
 *               id_groupe_TD:
 *                 type: integer
 *               id_groupe_Anglais:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Étudiant créé
 */
router.post("/cfa/etudiants", creerEtudiant);

/**
 * @swagger
 * /api/cfa/etudiants/{id}:
 *   put:
 *     summary: Met à jour un étudiant
 *     tags: [CFA]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema: { type: string }
 *         required: true
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nom:
 *                 type: string
 *               prenom:
 *                 type: string
 *               email:
 *                 type: string
 *               mot_de_passe:
 *                 type: string
 *               id_groupe_TD:
 *                 type: integer
 *               id_groupe_Anglais:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Étudiant mis à jour
 */
router.put("/cfa/etudiants/:id", modifierEtudiant);

/**
 * @swagger
 * /api/cfa/etudiants/{id}:
 *   delete:
 *     summary: Supprime un étudiant
 *     tags: [CFA]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema: { type: string }
 *         required: true
 *     responses:
 *       200:
 *         description: Supprimé
 */
router.delete("/cfa/etudiants/:id", supprimerEtudiant);

module.exports = router;
