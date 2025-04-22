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
        return res.status(400).json({ message: "❌ Descriptor invalide" });
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

// ✅ Vérification du visage par rapport à la référence
exports.verifierVisage = async (req, res) => {
    const { descriptor } = req.body;
    const idEtudiant = req.user.id;

    if (!descriptor || !Array.isArray(descriptor)) {
        return res.status(400).json({ message: "❌ Descriptor invalide" });
    }

    try {
        const [rows] = await db.query(
            `SELECT face_descriptor FROM etudiant WHERE NEtudiant = ?`,
            [idEtudiant]
        );

        if (!rows.length || !rows[0].face_descriptor) {
            return res.status(404).json({ message: "❌ Pas de photo de référence" });
        }

        const reference = JSON.parse(rows[0].face_descriptor);
        const distance = distanceEuclidienne(reference, descriptor);

        console.log(`ℹ️ Distance calculée : ${distance.toFixed(3)}`);

        const seuil = 0.5;
        res.json({ match: distance < seuil });
    } catch (err) {
        console.error("❌ Erreur comparaison visage:", err);
        res.status(500).json({ message: "Erreur serveur" });
    }
};
