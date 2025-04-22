const jwt = require("jsonwebtoken"); // Librairie JWT pour vérifier et décoder les tokens

// 🔒 Middleware pour sécuriser les routes avec authentification par JWT
const verifyToken = (req, res, next) => {
    const authHeader = req.headers.authorization; // 📨 Récupère l’en-tête Authorization

    // 🔍 Vérifie que le token est bien présent et commence par "Bearer "
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Token manquant ou invalide" });
    }

    // 🔐 Extrait le token (juste la valeur après "Bearer ")
    const token = authHeader.split(" ")[1];

    try {
        // ✅ Vérifie et décode le token avec la clé secrète de l'application
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // 💾 Injecte l'utilisateur dans req.user pour les middlewares ou contrôleurs suivants
        req.user = decoded;

        next(); // 🟢 Passe au middleware suivant ou au contrôleur
    } catch (err) {
        // ❌ Token mal formé, expiré ou falsifié
        return res.status(403).json({ message: "Token invalide" });
    }
};

module.exports = { verifyToken };
