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

# Vérifie que le dossier de build existe
BUILD_DIR="./public/digitalisation-emargement-frontend/browser"
if [ ! -f "$BUILD_DIR/index.html" ]; then
  echo -e "${RED}❌ index.html introuvable dans le build. Vérifie ton angular.json et le build.${NC}"
  exit 1
fi

# Étape 2 : Nettoyage backend
echo -e "${GREEN}🧹 2. Nettoyage de l'ancien build dans le backend...${NC}"
cd ../digitalisation-emargement-backend || exit 1
TARGET_DIR="./public/digitalisation-emargement-frontend/browser"
rm -rf "$TARGET_DIR"
mkdir -p "$TARGET_DIR"

# Étape 3 : Copie du nouveau build Angular vers le backend
echo -e "${GREEN}📂 3. Copie du build dans Express...${NC}"
cp -r ../digitalisation-emargement-frontend/public/digitalisation-emargement-frontend/browser/* "$TARGET_DIR"

# Étape 4 : Vérification post-copie
if [ ! -f "$TARGET_DIR/index.html" ]; then
  echo -e "${RED}❌ index.html manquant après la copie. Problème pendant le transfert.${NC}"
  exit 1
fi

echo -e "${GREEN}✅ index.html copié avec succès dans le backend !${NC}"

# Étape 5 : Test manuel
echo -e "${GREEN}🚀 5. Test manuel : Lance ton serveur Express et accède à :${NC}"
echo "http://localhost:3000"  # Ou l'URL Railway

echo -e "${GREEN}🎉 Déploiement terminé ! Tu peux maintenant tester ton front servi par Express.${NC}"
