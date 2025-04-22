#!/bin/bash

# =========================
# DEPLOY ANGULAR FRONT → BACKEND (Express + Railway)
# =========================

# Couleurs
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[1;34m'
NC='\033[0m'

# Étape 0 : sécurité
set -e

# Vars
FRONT_DIR="digitalisation-emargement-frontend"
BACK_DIR="digitalisation-emargement-backend"
BUILD_OUTPUT_DIR="dist/digitalisation-emargement-frontend"
TARGET_DIR="../$BACK_DIR/public/digitalisation-emargement-frontend"

echo -e "${BLUE}🔧 Variables utilisées :${NC}"
echo -e "FRONT_DIR=${FRONT_DIR}"
echo -e "BACK_DIR=${BACK_DIR}"
echo -e "BUILD_OUTPUT_DIR=${BUILD_OUTPUT_DIR}"
echo -e "TARGET_DIR=${TARGET_DIR}"
echo ""

# Étape 1 : Build Angular
echo -e "${GREEN}📦 1. Build Angular en mode production...${NC}"
cd "$FRONT_DIR" || { echo -e "${RED}❌ Dossier frontend introuvable${NC}"; exit 1; }

# Nettoyage de l’ancien build local
rm -rf "$BUILD_OUTPUT_DIR"

# Build prod
ng build --configuration production || { echo -e "${RED}❌ Échec du build Angular${NC}"; exit 1; }

# ✅ Debug : liste du contenu généré
echo -e "${BLUE}📂 Contenu généré dans $BUILD_OUTPUT_DIR :${NC}"
ls -la "$BUILD_OUTPUT_DIR"

# Vérification post-build
if [ ! -f "$BUILD_OUTPUT_DIR/index.html" ]; then
  echo -e "${RED}❌ index.html introuvable dans le build. Vérifie ton angular.json et le build.${NC}"
  echo -e "${YELLOW}Contenu actuel de $BUILD_OUTPUT_DIR :${NC}"
  ls -la "$BUILD_OUTPUT_DIR"
  exit 1
fi

# Étape 2 : Nettoyage du build dans le backend
echo -e "${YELLOW}🧹 2. Nettoyage du dossier cible dans le backend...${NC}"
rm -rf "$TARGET_DIR"
mkdir -p "$TARGET_DIR"

# Étape 3 : Copie
echo -e "${GREEN}📂 3. Copie du build Angular vers le backend...${NC}"
cp -r "$BUILD_OUTPUT_DIR/"* "$TARGET_DIR"

# ✅ Debug : listing backend
echo -e "${BLUE}📁 Fichiers copiés dans $TARGET_DIR :${NC}"
ls -la "$TARGET_DIR"

# Vérification post-copie
if [ ! -f "$TARGET_DIR/index.html" ]; then
  echo -e "${RED}❌ index.html manquant après la copie. Problème pendant le transfert.${NC}"
  exit 1
fi

# Étape 4 : Fin
echo -e "${GREEN}✅ index.html copié avec succès dans le backend !${NC}"
echo -e "${GREEN}🚀 Déploiement terminé avec succès !${NC}"
echo -e "${YELLOW}👉 Lance le serveur Express et ouvre : https://emargementonline-production.up.railway.app${NC}"
