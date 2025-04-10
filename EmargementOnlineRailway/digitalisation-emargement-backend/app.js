const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swaggerConfig');

const app = express();
dotenv.config();

const helmet = require("helmet");

// 🔓 Politique CSP permissive pour que le front Angular fonctionne
app.use(
    helmet.contentSecurityPolicy({
        useDefaults: true,
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https:"],
            styleSrc: ["'self'", "'unsafe-inline'", "https:"],
            imgSrc: ["'self'", "data:", "https:"],
            connectSrc: ["'self'", "https:"],
            fontSrc: ["'self'", "https:", "data:"],
            objectSrc: ["'none'"],
            upgradeInsecureRequests: [],
        },
    })
);

// 🌍 Autoriser les origines front en dev + prod
const allowedOrigins = [
    "http://localhost:4200",
    "https://emargementonline-production.up.railway.app"
];

app.use(cors({
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error("Not allowed by CORS"));
        }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true
}));

app.use(express.json());

// 📦 Sert les fichiers Angular
const angularBuildPath = path.join(__dirname, "public", "digitalisation-emargement-frontend", "browser");
app.use(express.static(angularBuildPath));

// 📡 Routes API
const authRoutes = require("./routes/auth.routes");
const enseignantRoutes = require("./routes/professeur.routes");
const cfaRoutes = require("./routes/cfa.routes");
const qrcodeRoutes = require("./routes/qrcode.routes");
const presencesRoutes = require("./routes/presence.routes");
const etudiantRoutes = require("./routes/etudiant.routes");
const exportRoutes = require("./routes/export.routes");
const ubtokenRoutes = require("./routes/ubtoken.routes");

app.use("/api", authRoutes);
app.use("/api", enseignantRoutes);
app.use("/api", cfaRoutes);
app.use("/api", qrcodeRoutes);
app.use("/api", etudiantRoutes);
app.use("/api/presences", presencesRoutes);
app.use("/api/cfa", exportRoutes);
app.use("/api", ubtokenRoutes);

// 📄 Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// 📦 Serve Angular files from build (index.html dans 'accueil')
const accueilPath = path.join(__dirname, 'public', 'digitalisation-emargement-frontend', 'accueil');
app.use(express.static(accueilPath));

// 🎯 Fallback Angular Router (redirige toutes les autres requêtes vers index.html)
app.get('*', (req, res) => {
    res.sendFile(path.join(accueilPath, 'index.html')); // Si route non trouvée, renvoyer index.html
});

// 🚀 Lancement serveur
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Serveur actif sur http://localhost:${PORT}`);
});
