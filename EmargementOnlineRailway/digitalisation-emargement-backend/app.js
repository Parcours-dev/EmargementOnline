const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swaggerConfig');
const helmet = require("helmet");

const app = express();
dotenv.config();

// 🔐 CSP permissive pour Angular
app.use(
    helmet.contentSecurityPolicy({
        useDefaults: true,
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https:"],
            scriptSrcAttr: ["'unsafe-inline'"], // Pour avoir du css sinon bruh
            styleSrc: ["'self'", "'unsafe-inline'", "https:"],
            imgSrc: ["'self'", "data:", "https:"],
            connectSrc: ["'self'", "https:"],
            fontSrc: ["'self'", "https:", "data:"],
            objectSrc: ["'none'"]
        }
    })
);


// ✅ CORS
const allowedOrigins = [
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

// ✅ Sert les fichiers Angular compilés (CSR)
const angularBuildPath = path.join(__dirname, "public", "digitalisation-emargement-frontend");
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

// ✅ Fallback Angular router : redirige tout vers index.html
app.get('*', (req, res) => {
    res.sendFile(path.join(angularBuildPath, 'index.html'));
});

// 🚀 Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Serveur actif sur http://localhost:${PORT}`);
});
