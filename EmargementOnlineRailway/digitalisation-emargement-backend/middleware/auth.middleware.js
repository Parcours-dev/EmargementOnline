const jwt = require("jsonwebtoken"); // Librairie JWT pour vérifier et décoder les tokens

// 🔒 Middleware pour sécuriser les routes avec authentification par JWT
const verifyToken = (req, res, next) => {
    const authHeader = req.headers.authorization; // 📨 Récupère l’en-tête Authorization
    console.log("🔍 [verifyToken] Authorization header reçu :", authHeader);

    // 🔍 Vérifie que le token est bien présent et commence par "Bearer "
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        console.warn("❌ [verifyToken] Token manquant ou ne commence pas par 'Bearer '");
        return res.status(401).json({ message: "Token manquant ou invalide" });
    }

    // 🔐 Extrait le token (juste la valeur après "Bearer ")
    const token = authHeader.split(" ")[1];
    console.log("🧾 [verifyToken] Token extrait :", token);

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        console.log("✅ [verifyToken] Token valide");
        console.log("🧠 Payload complet :", decoded);
        console.log("📅 Généré le :", new Date(decoded.iat * 1000).toLocaleString());
        console.log("⌛ Expire le :", new Date(decoded.exp * 1000).toLocaleString());
        console.log("🕓 Heure actuelle :", new Date().toLocaleString());
        // 💾 Injecte l'utilisateur dans req.user pour les middlewares ou contrôleurs suivants
        req.user = decoded;

        next(); // 🟢 Passe au middleware suivant ou au contrôleur
    } catch (err) {
        // ❌ Token mal formé, expiré ou falsifié
        console.error("❌ [verifyToken] Erreur vérification JWT :", err.message);
        return res.status(403).json({ message: "Token invalide" });
    }
};

module.exports = { verifyToken };