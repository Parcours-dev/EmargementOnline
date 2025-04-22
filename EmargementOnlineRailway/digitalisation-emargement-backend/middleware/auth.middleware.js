const jwt = require("jsonwebtoken"); // Librairie JWT

const verifyToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    console.log("🔍 [verifyToken] Authorization header reçu :", authHeader);

    // Étape 1 : header manquant ou mal formé
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        console.warn("❌ [verifyToken] Token manquant ou ne commence pas par 'Bearer '");
        return res.status(401).json({ message: "Token manquant ou invalide" });
    }

    // Étape 2 : récupération du token
    const token = authHeader.split(" ")[1];
    console.log("🧾 [verifyToken] Token extrait :", token);

    try {
        // Étape 3 : vérification du token avec la clé secrète
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log("✅ [verifyToken] Token valide. Payload :", decoded);

        req.user = decoded;
        next();
    } catch (err) {
        console.error("❌ [verifyToken] Erreur vérification JWT :", err.message);
        return res.status(403).json({ message: "Token invalide" });
    }
};
