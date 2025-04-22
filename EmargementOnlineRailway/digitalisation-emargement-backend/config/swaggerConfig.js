// swaggerConfig.js
// 🔧 Fichier de configuration Swagger pour générer la documentation de l’API

const swaggerJSDoc = require('swagger-jsdoc');

// 🧾 Informations générales sur l'API
const swaggerDefinition = {
    openapi: '3.0.0',
    info: {
        title: "API d'émargement", // Titre visible dans Swagger UI
        version: '1.0.0',
        description: "Documentation de l'API d'émargement (prof/étudiant/CFA)"
    },
    servers: [
        {
            url: 'https://emargementonline-production.up.railway.app/', // 💡 Adapter cette URL avec ton lien ngrok si besoin
            description: 'Serveur local'
        }
    ]
};

// 📚 Options de génération : où Swagger doit aller chercher les annotations JSDoc
const options = {
    swaggerDefinition,
    apis: ['./routes/*.js'] // 👉 Swagger lit les commentaires dans tous les fichiers du dossier routes
};

// 📦 Génère le swaggerSpec à partir des options
const swaggerSpec = swaggerJSDoc(options);

// 🚀 On exporte le résultat pour l’utiliser dans app.js
module.exports = swaggerSpec;
