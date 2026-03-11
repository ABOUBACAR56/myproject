# 🏢 TechLogix Inventory — Cloud-Native App Delivery

Application de gestion d'inventaire informatique déployée en mode Cloud-Native : conteneurisée avec Docker, livrée automatiquement via GitHub Actions, et orchestrée sur Kubernetes.

---

## 📁 Structure du dépôt

```
.
├── app/                        # Code source de l'application
│   ├── server.js
│   └── package.json
├── .github/
│   └── workflows/
│       └── ci-cd.yml           # Pipeline CI/CD GitHub Actions
├── k8s/
│   ├── deployment.yaml         # Déploiement Kubernetes (3 réplicas)
│   └── service.yaml            # Service LoadBalancer
├── Dockerfile                  # Image Docker multi-stage (Alpine)
└── README.md
```

---

## 🐳 Phase 1 — Conteneurisation avec Docker

### Lancer l'application en local

```bash
# 1. Construire l'image
docker build -t techlogix-inventory:v1.0 .

# 2. Lancer le conteneur
docker run -d -p 3000:3000 --name techlogix techlogix-inventory:v1.0

# 3. Vérifier que l'app répond
curl http://localhost:3000/healthz

# 4. Ouvrir dans le navigateur
open http://localhost:3000
```

### Points clés du Dockerfile

- **Multi-stage build** : sépare les dépendances de l'image finale
- **Alpine** (`node:20-alpine`) : image ultra-légère (~50 MB vs ~350 MB)
- **Utilisateur non-root** : sécurité renforcée
- **HEALTHCHECK** : surveillance intégrée de l'état du conteneur
- **Cache optimisé** : `COPY package*.json` avant le code source

---

## ⚙️ Phase 2 — Pipeline CI/CD avec GitHub Actions

### Configuration des secrets

Avant de pusher, configurez ces secrets dans **Settings → Secrets → Actions** de votre dépôt GitHub :

| Secret | Description |
|--------|-------------|
| `DOCKER_HUB_USERNAME` | Votre nom d'utilisateur Docker Hub |
| `DOCKER_HUB_TOKEN` | Token d'accès Docker Hub (Account Settings → Security) |

### Fonctionnement du pipeline

Le fichier `.github/workflows/ci-cd.yml` déclenche automatiquement deux jobs à chaque `git push` sur `main` :

```
git push → 🧪 test → 🐳 build-and-push
```

**Job 1 — Test** :
- Checkout du code
- Installation des dépendances (`npm ci`)
- Vérification syntaxique de `server.js`

**Job 2 — Build & Push** (après succès du test) :
- Login sur Docker Hub via les secrets
- Build de l'image avec **cache GitHub Actions** (plus rapide)
- Push avec plusieurs tags : `latest`, `v1.0`, `sha-<commit>`

### Lancer le pipeline

```bash
git add .
git commit -m "feat: add cloud-native delivery pipeline"
git push origin main
```

---

## ☸️ Phase 3 — Déploiement sur Kubernetes

### Prérequis

```bash
# Vérifier kubectl
kubectl version --client

# Démarrer Minikube (si en local)
minikube start
```

### Déploiement

```bash
# 1. Mettre à jour le nom d'image dans le manifest
# Éditez k8s/deployment.yaml : remplacez <VOTRE_USERNAME> par votre username Docker Hub

# 2. Appliquer les manifestes
kubectl apply -f k8s/deployment.yaml
kubectl apply -f k8s/service.yaml

# 3. Vérifier le déploiement
kubectl get all
```

### Commandes de vérification

```bash
# État des pods, services et déploiements
kubectl get all

# Détails du déploiement
kubectl describe deployment techlogix-inventory

# Logs d'un pod
kubectl logs -l app=techlogix-inventory --tail=50

# Récupérer l'IP du service (Minikube)
minikube service techlogix-inventory-service --url

# Scaler l'application
kubectl scale deployment techlogix-inventory --replicas=5
```

### Accès à l'application

```bash
# Sur Minikube
minikube service techlogix-inventory-service

# Sur cluster Cloud (LoadBalancer)
kubectl get service techlogix-inventory-service
# → Utiliser l'EXTERNAL-IP affichée
```

---

## 📡 Endpoints de l'application

| Endpoint | Description |
|----------|-------------|
| `GET /` | Interface web principale (inventaire) |
| `GET /healthz` | Liveness probe — retourne `{"status":"ok"}` |
| `GET /ready` | Readiness probe — retourne `{"ready":true}` |

---

## 📸 Captures d'écran

> *(À compléter après exécution)*

| Étape | Capture |
|-------|---------|
| ✅ Pipeline CI/CD réussi | `screenshots/cicd-success.png` |
| ✅ Image sur Docker Hub | `screenshots/dockerhub-image.png` |
| ✅ `kubectl get all` | `screenshots/kubectl-get-all.png` |
| ✅ Application dans le navigateur | `screenshots/app-browser.png` |

---

## 🔧 Variables d'environnement

| Variable | Défaut | Description |
|----------|--------|-------------|
| `PORT` | `3000` | Port d'écoute du serveur |
| `NODE_ENV` | `production` | Environnement d'exécution |
