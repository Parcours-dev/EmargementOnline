// 🔐 Middleware de contrôle d'accès basé sur le rôle utilisateur
const checkRole = (expectedRole) => {
    // 💡 expectedRole : "etudiant", "professeur", "cfa", etc.
    return (req, res, next) => {
        // ❌ Vérifie qu’un utilisateur est bien connecté et qu’il a le bon rôle
        if (!req.user || req.user.role !== expectedRole) {
            return res.status(403).json({ message: `Accès réservé au rôle : ${expectedRole}` });
        }

        // ✅ Si le rôle correspond, on passe à l'étape suivante
        next();
    };
};

module.exports = { checkRole };
