const { ethers } = require("ethers");
require("dotenv").config();

// Connexion au réseau Sepolia (Alchemy ou autre)
const provider = new ethers.JsonRpcProvider(process.env.ALCHEMY_URL);

// Wallet de l'owner du token (déployeur)
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

// ABI partielle du contrat UBToken
const contractABI = [
    "function reward(address student, uint256 amount) public",
    "function balanceOf(address account) view returns (uint256)"
];

// Contrat ERC20 UBToken
const tokenContract = new ethers.Contract(process.env.TOKEN_ADDRESS, contractABI, wallet);

// Fonction : envoyer des tokens à un étudiant
async function rewardStudent(ethAddress, amount) {
    const tx = await tokenContract.reward(ethAddress, amount);
    return tx; // à attendre avec tx.wait() dans le controller
}

// Fonction : lire le solde d’un étudiant
async function getBalance(ethAddress) {
    const balance = await tokenContract.balanceOf(ethAddress);
    return ethers.formatUnits(balance, 18); // retourne un float
}

// 👉 Optionnel : interface pour signer une présence (autre contrat ?)
const UBToken = {
    signerPresence: async (nomEtudiant, nomCours, horodatage) => {
        // Remplace ceci par ton vrai contrat UBTokenEmargement
        // Simulé ici pour garder ton controller actuel compatible
        throw new Error("Méthode signerPresence non implémentée ici.");
    },
    getTotalEmargements: async () => {
        throw new Error("Méthode getTotalEmargements non implémentée ici.");
    },
    getEmargement: async (index) => {
        throw new Error("Méthode getEmargement non implémentée ici.");
    }
};

module.exports = {
    UBToken,
    rewardStudent,
    getBalance
};
