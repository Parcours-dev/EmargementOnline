const { UBToken, rewardStudent, getBalance } = require("../blockchain/blockchain");
const { getEthAddressByNumeroEtudiant } = require("../utils/etudiant");

// =============================
// 🎓 Signature d’émargement + reward
// =============================
const enregistrerPresence = async (req, res) => {
    try {
        const { numeroEtudiant, nomCours, horodatage } = req.body;

        // 🔏 Enregistrement de l’émargement dans le smart contract
        const tx = await UBToken.signerPresence(numeroEtudiant, nomCours, horodatage);
        await tx.wait();

        // 🔍 Récupération de l'adresse ETH de l’étudiant
        const ethAddress = await getEthAddressByNumeroEtudiant(numeroEtudiant);
        if (!ethAddress) {
            return res.status(404).json({ message: "Adresse ETH non trouvée pour l'étudiant." });
        }

        // 🎁 Envoi des UBToken
        const rewardTx = await rewardStudent(ethAddress, 10); // 10 UBT par présence
        await rewardTx.wait();

        res.json({
            success: true,
            message: "Présence enregistrée et tokens envoyés.",
            txHash: tx.hash,
            rewardTxHash: rewardTx.hash
        });

    } catch (err) {
        console.error("Erreur blockchain :", err);
        res.status(500).json({ message: "Erreur lors de la signature ou de la récompense de la présence." });
    }
};

// =============================
// 💰 Récupération du solde UBT
// =============================
const getSoldeEtudiant = async (req, res) => {
    try {
        const { numeroEtudiant } = req.params;
        console.log("💡 Numéro reçu :", numeroEtudiant);

        const ethAddress = await getEthAddressByNumeroEtudiant(numeroEtudiant);
        if (!ethAddress) {
            return res.status(404).json({ message: "Étudiant introuvable ou adresse ETH absente." });
        }

        const solde = await getBalance(ethAddress);

        res.json({
            numeroEtudiant,
            adresse: ethAddress,
            soldeUBT: solde
        });

    } catch (err) {
        console.error("Erreur récupération solde :", err);
        res.status(500).json({ message: "Erreur serveur lors de la récupération du solde." });
    }
};

module.exports = {
    enregistrerPresence,
    getSoldeEtudiant
};
