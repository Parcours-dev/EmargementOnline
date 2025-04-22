const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swaggerConfig');

dotenv.config();
const app = express();

// ✅ Middleware CORS
app.use(cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));

// ✅ Middleware JSON
app.use(express.json());

// ✅ Justificatifs statiques (avant toutes routes dynamiques)
app.use('/uploads/justificatifs', express.static(path.join(__dirname, 'uploads/justificatifs')));
console.log('🛠️ Serving justificatifs from:', path.join(__dirname, 'uploads/justificatifs'));

// ✅ ROUTES API
const authRoutes = require("./routes/auth.routes");
const enseignantRoutes = require("./routes/professeur.routes");
const cfaRoutes = require("./routes/cfa.routes");
const qrcodeRoutes = require("./routes/qrcode.routes");
const presencesRoutes = require("./routes/presence.routes");
const etudiantRoutes = require("./routes/etudiant.routes");
const exportRoutes = require("./routes/export.routes");
const justificatifRoutes = require("./routes/justificatif.routes");
const ubtokenRoutes = require("./routes/ubtoken.routes");

app.use("/api", authRoutes);
app.use("/api", enseignantRoutes);
app.use("/api", cfaRoutes);
app.use("/api", qrcodeRoutes);
app.use("/api", etudiantRoutes);
app.use("/api", justificatifRoutes); // ✅ Avant les autres pour éviter conflits
app.use("/api/presences", presencesRoutes);
app.use("/api/cfa", exportRoutes);
app.use("/api", ubtokenRoutes);

// ✅ Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// ============================
// ✅ Servir le frontend Angular
// ============================
const frontendPath = path.join(__dirname, 'public/digitalisation-emargement-frontend');

// ✅ Fichiers Angular compilés
app.use(express.static(frontendPath));

// ✅ Fallback vers index.html pour Angular routing
app.get('*', (req, res) => {
    res.sendFile(path.join(frontendPath, 'index.html'));
});

// ✅ Lancement serveur
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Serveur actif sur http://localhost:${PORT}`);
});
