const express = require("express");
const router = express.Router();
const {
    enregistrerPresence,
    getSoldeEtudiant
} = require("../controllers/ubtoken.controller");

router.post("/signer", enregistrerPresence);
//router.get("/presences", getPresences); // 👈 si utilisé, doit exister
router.get("/soldes/:numeroEtudiant", getSoldeEtudiant); // ✅ cette ligne est en cause

module.exports = router;
