const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swaggerConfig');

const app = express();
dotenv.config();

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

// 📦 Build Angular
const angularBuildPath = path.join(__dirname, "public", "digitalisation-emargement-frontend", "browser");
app.use(express.static(angularBuildPath));

// 🧩 API routes
const authRoutes = require("./routes/auth.routes");
const enseignantRoutes = require("./routes/professeur.routes");
const cfaRoutes = require("./routes/cfa.routes");
const qrcodeRoutes = require("./routes/qrcode.routes");
const presencesRoutes = require("./routes/presence.routes");
const etudiantRoutes = require("./routes/etudiant.routes");
const exportRoutes = require("./routes/export.routes");

app.use("/api", authRoutes);
app.use("/api", enseignantRoutes);
app.use("/api", cfaRoutes);
app.use("/api", qrcodeRoutes);
app.use("/api", etudiantRoutes);
app.use("/api/presences", presencesRoutes);
app.use("/api/cfa", exportRoutes);
app.use("/api", require("./routes/ubtoken.routes"));

// 🧾 Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// 🎯 Route racine → page accueil Angular
app.get('/', (req, res) => {
    res.sendFile(path.join(angularBuildPath, 'accueil', 'index.html'));
});

// 🎯 Fallback Angular Router (ex: /dashboard-cfa)
app.get('*', (req, res) => {
    res.sendFile(path.join(angularBuildPath, 'accueil', 'index.html'));
});

// 🎧 Lancement serveur
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Serveur actif sur http://localhost:${PORT}`);
});
