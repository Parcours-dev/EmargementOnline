const crypto = require("crypto");              // Utilisé pour générer des tokens sécurisés
const db = require("../config/db");            // Connexion base de données
const { UBToken } = require("../blockchain/blockchain"); // Smart contract local

// ==============================
// 🎓 1. Génération d’un QR Code par le professeur
// ==============================
const generateQrCode = async (req, res) => {
    const idProf = req.user.id;
    const { id } = req.params;

    try {
        const [id_cours, id_groupe, id_professeur, ...dateParts] = id.split("-");
        const date_heure_debut = dateParts.join("-");

        if (!id_cours || !id_groupe || !id_professeur || !date_heure_debut) {
            return res.status(400).json({ message: "Identifiant de créneau invalide." });
        }

        // 🔍 Vérifie que le créneau existe
        const [creneaux] = await db.query(
            `SELECT * FROM creneau WHERE id_cours = ? AND id_groupe = ? AND id_professeur = ? AND date_heure_debut = ?`,
            [id_cours, id_groupe, id_professeur, date_heure_debut]
        );

        if (creneaux.length === 0) {
            return res.status(404).json({ message: "Créneau introuvable." });
        }

        // ✅ Création du token sécurisé
        const token = crypto.randomBytes(16).toString("hex");

        // 🕒 Décalage UTC+2 (ajout de 2 heures)
        const now = new Date();
        const nowPlus2h = new Date(now.getTime() + 2 * 60 * 60 * 1000);
        const expirationPlus2h = new Date(nowPlus2h.getTime() + 90 * 1000);

        const formatDate = (d) => d.toISOString().slice(0, 19).replace("T", " ");

        // 💾 Insertion du QR code en base avec décalage
        await db.query(
            `INSERT INTO qr_code (token, date_creation, date_expiration, id_cours, id_groupe, id_professeur, date_heure_debut)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [token, formatDate(nowPlus2h), formatDate(expirationPlus2h), id_cours, id_groupe, id_professeur, date_heure_debut]
        );

        res.json({
            message: "QR Code généré ✅",
            token,
            expires_in: 90,
            scan_url: `https://emargementonline-production.up.railway.app/scan/${token}`
        });

    } catch (err) {
        console.error("❌ Erreur génération QR Code :", err);
        res.status(500).json({ message: "Erreur serveur" });
    }
};


// ========================================
// 🧍‍♂️ 2. Scan du QR Code par un étudiant
// ========================================
const enregistrerPresenceViaQr = async (req, res) => {
    const { token } = req.params;
    const { empreinte_device } = req.body;
    const user = req.user;

    console.log("📲 Appel depuis :", req.user ? req.user.role : "aucun token reçu");

    try {
        // 🔒 Vérifie que seul un étudiant peut accéder à cette route
        if (!user || user.role !== "etudiant") {
            return res.status(403).json({ message: "Seuls les étudiants peuvent émarger via QR Code." });
        }

        // 1️⃣ Vérifie la validité du QR code (on compare les dates en JS pour gérer le fuseau)
        const [result] = await db.query(`SELECT * FROM qr_code WHERE token = ?`, [token]);

        if (result.length === 0) {
            return res.status(400).json({ message: "QR Code introuvable." });
        }

        const qr = result[0];
        const now = new Date();
        const expiration = new Date(qr.date_expiration);

        if (now > expiration) {
            return res.status(400).json({ message: "QR Code expiré." });
        }

        // 2️⃣ Vérifie que l’empreinte device n’a pas déjà été utilisée
        const [deviceExists] = await db.query(
            `SELECT * FROM emargement
             WHERE empreinte_device = ? AND id_cours = ? AND date_heure_debut = ?`,
            [empreinte_device, qr.id_cours, qr.date_heure_debut]
        );

        if (deviceExists.length > 0) {
            return res.status(403).json({ message: "Ce téléphone a déjà été utilisé pour ce cours." });
        }

        // 3️⃣ Vérifie que l’étudiant n’a pas déjà émargé
        const [existant] = await db.query(
            `SELECT * FROM emargement 
             WHERE NEtudiant = ? AND id_cours = ? AND date_heure_debut = ?`,
            [user.id, qr.id_cours, qr.date_heure_debut]
        );

        if (existant.length > 0) {
            return res.status(409).json({ message: "Présence déjà enregistrée pour ce cours." });
        }

        // 4️⃣ Enregistrement de la présence
        await db.query(
            `INSERT INTO emargement
             (NEtudiant, id_cours, id_groupe, id_professeur, date_heure_signature, date_heure_debut,
              token_utilisé, empreinte_device, ip_adresse, user_agent)
             VALUES (?, ?, ?, ?, NOW(), ?, ?, ?, ?, ?)`,
            [
                user.id,
                qr.id_cours,
                qr.id_groupe,
                qr.id_professeur,
                qr.date_heure_debut,
                token,
                empreinte_device || null,
                req.ip,
                req.headers["user-agent"]
            ]
        );

        // 5️⃣ Récompense via UBToken
        const [[etu]] = await db.query(
            "SELECT adresse_eth FROM etudiant WHERE NEtudiant = ?",
            [user.id]
        );

        if (!etu || !etu.adresse_eth) {
            console.warn("⚠️ Pas d’adresse ETH pour l’étudiant", user.id);
        } else {
            try {
                const tx = await rewardStudent(etu.adresse_eth, 10); // 10 UBT
                await tx.wait();
                console.log(`✅ 10 UBT envoyés à ${etu.adresse_eth} (tx: ${tx.hash})`);
            } catch (err) {
                console.error("❌ Échec envoi UBToken :", err.message);
            }
        }

        res.status(200).json({ message: "Présence enregistrée et récompense envoyée ✅" });

    } catch (err) {
        console.error("❌ Erreur générale :", err);
        res.status(500).json({ message: "Erreur serveur." });
    }
};


module.exports = {
    generateQrCode,
    enregistrerPresenceViaQr
};
