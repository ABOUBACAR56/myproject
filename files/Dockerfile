# ── Stage 1 : dépendances de production ──────────────────────────────────────
FROM node:20-alpine AS deps

WORKDIR /app

# Copier uniquement les fichiers de dépendances pour profiter du cache Docker
COPY package*.json ./

# Installer uniquement les dépendances de production
RUN npm install --omit=dev --no-audit --no-fund

# ── Stage 2 : image finale légère ────────────────────────────────────────────
FROM node:20-alpine AS runner

# Métadonnées de l'image
LABEL maintainer="TechLogix DevOps Team"
LABEL description="TechLogix Inventory Management System"
LABEL version="1.0"

WORKDIR /app

# Créer un utilisateur non-root pour la sécurité
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Copier les dépendances depuis le stage précédent
COPY --from=deps /app/node_modules ./node_modules

# Copier le code source de l'application
COPY server.js ./
COPY package.json ./

# Changer le propriétaire des fichiers
RUN chown -R appuser:appgroup /app

# Utiliser l'utilisateur non-root
USER appuser

# Exposer le port de l'application
EXPOSE 3000

# Variables d'environnement par défaut
ENV NODE_ENV=production
ENV PORT=3000

# Health check intégré
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:3000/healthz || exit 1

# Démarrer l'application
CMD ["node", "server.js"]
