// services/etudiants.js
const db = require("../config/db"); // Connexion à ta BDD

async function getEthAddressByNumeroEtudiant(numeroEtudiant) {
    const [rows] = await db.query(
        "SELECT adresse_eth FROM etudiant WHERE NEtudiant = ?",
        [numeroEtudiant]
    );
    return rows.length ? rows[0].adresse_eth : null;
}

module.exports = {
    getEthAddressByNumeroEtudiant
};
// Fonction pour récupérer l'adresse ETH d'un étudiant par son numéro