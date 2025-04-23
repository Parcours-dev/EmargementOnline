const db = require('../config/db');

// 🔢 Helper : Calcule la distance euclidienne entre deux vecteurs
function distanceEuclidienne(v1, v2) {
    let sum = 0;
    for (let i = 0; i < v1.length; i++) {
        const diff = v1[i] - v2[i];
        sum += diff * diff;
    }
    return Math.sqrt(sum);
}

// ✅ Enregistrement du descripteur facial de référence
exports.enregistrerPhotoReference = async (req, res) => {
    const { descriptor } = req.body;
    const idEtudiant = req.user.id;

    if (!descriptor || !Array.isArray(descriptor)) {
        return res.status(400).json({ message: "❌ Descripteur invalide" });
    }

    try {
        await db.query(
            `UPDATE etudiant SET face_descriptor = ? WHERE NEtudiant = ?`,
            [JSON.stringify(descriptor), idEtudiant]
        );
        res.status(200).json({ message: "✅ Photo de référence enregistrée" });
    } catch (err) {
        console.error("❌ Erreur insertion photo:", err);
        res.status(500).json({ message: "Erreur serveur" });
    }
};

// ✅ Vérifie la correspondance entre le descripteur et la photo de référence
exports.verifierVisage = async (req, res) => {
    const { descriptor } = req.body;
    const idEtudiant = req.user.id;

    if (!descriptor || !Array.isArray(descriptor)) {
        return res.status(400).json({ message: "❌ Descripteur invalide" });
    }

    try {
        const [rows] = await db.query(
            `SELECT face_descriptor FROM etudiant WHERE NEtudiant = ?`,
            [idEtudiant]
        );

        if (!rows.length || !rows[0].face_descriptor) {
            return res.status(404).json({ message: "❌ Pas de photo de référence trouvée" });
        }

        const reference = JSON.parse(rows[0].face_descriptor);
        const distance = distanceEuclidienne(reference, descriptor);

        console.log(`ℹ️ Distance calculée : ${distance.toFixed(3)}`);

        const seuil = 0.5;
        const match = distance < seuil;

        if (match) {
            return res.status(200).json({ match: true, message: "✅ Visage reconnu, correspondance établie." });
        } else {
            return res.status(401).json({ match: false, message: "❌ Visage non reconnu." });
        }
    } catch (err) {
        console.error("❌ Erreur comparaison visage:", err);
        res.status(500).json({ message: "Erreur serveur" });
    }
};

// ✅ Fonction réutilisable pour vérifier un descripteur facial en interne
exports.verifierDescripteur = async (idEtudiant, descriptor) => {
    try {
        const [rows] = await db.query(
            `SELECT face_descriptor FROM etudiant WHERE NEtudiant = ?`,
            [idEtudiant]
        );

        if (!rows.length || !rows[0].face_descriptor) return false;

        const reference = JSON.parse(rows[0].face_descriptor);
        const distance = distanceEuclidienne(reference, descriptor);

        return distance < 0.5; // seuil de similarité
    } catch (err) {
        console.error("❌ Erreur dans verifierDescripteur:", err);
        return false;
    }
};