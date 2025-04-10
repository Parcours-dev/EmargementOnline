#!/bin/bash

# =========================
# DEPLOY ANGULAR FRONT → BACKEND (Express + Railway)
# =========================

# Couleurs
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

# Étape 0 : sécurité
set -e

# Étape 1 : Build Angular
echo -e "${GREEN}📦 1. Build Angular en mode production...${NC}"
cd digitalisation-emargement-frontend || { echo -e "${RED}❌ Dossier frontend introuvable${NC}"; exit 1; }

ng build --configuration production || { echo -e "${RED}❌ Échec du build Angular${NC}"; exit 1; }

# Vérifie que le dossier dist existe
BUILD_DIR="./dist/digitalisation-emargement-frontend"
if [ ! -d "$BUILD_DIR" ]; then
  echo -e "${RED}❌ Dossier de build introuvable. Vérifie ton fichier angular.json.${NC}"
  exit 1
fi

# Étape 2 : Nettoyage backend
echo -e "${GREEN}🧹 2. Nettoyage de l'ancien build dans le backend...${NC}"
cd ../digitalisation-emargement-backend || exit 1
TARGET_DIR="./public/digitalisation-emargement-frontend"
rm -rf "$TARGET_DIR"
mkdir -p "$TARGET_DIR"

# Étape 3 : Copie
echo -e "${GREEN}📂 3. Copie du nouveau build Angular dans Express...${NC}"
cp -r ../digitalisation-emargement-frontend/dist/digitalisation-emargement-frontend/* "$TARGET_DIR"

# Copie aussi le fichier index.csr.html et le renommer index.html dans le backend
cp ../digitalisation-emargement-frontend/dist/digitalisation-emargement-frontend/browser/index.csr.html "$TARGET_DIR/index.html"

# Étape 4 : Vérification post-copie
if [ ! -f "$TARGET_DIR/index.html" ]; then
  echo -e "${RED}❌ index.html (ou index.csr.html) manquant après la copie. Vérifie que le build a bien généré les fichiers.${NC}"
  exit 1
fi

echo -e "${GREEN}📂 Fichier index.html copié avec succès dans le dossier backend !${NC}"

# Étape 5 : Test manuel
echo -e "${GREEN}🚀 5. Test manuel du fichier index.html dans Express...${NC}"
echo "Accédez à votre serveur via l'URL suivante pour vérifier :"
echo "http://localhost:3000"  # Si le serveur Express est local, sinon remplace par l'URL de production

echo -e "${GREEN}🎉 Déploiement terminé sans commit ! Tu peux tester et valider dans Express.${NC}"
