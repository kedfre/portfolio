# Makefile pour le projet Portfolio
# Gestion des tâches npm et serveur de développement

# Variables
NPM := npm
PORT := 5173
PID_FILE := .dev-server.pid

# Couleurs pour les messages
GREEN := \033[0;32m
YELLOW := \033[1;33m
RED := \033[0;31m
NC := \033[0m # No Color

.PHONY: help install dev build stop restart clean

# Aide par défaut
help:
	@echo "$(GREEN)=== Makefile Portfolio ===$(NC)"
	@echo ""
	@echo "$(YELLOW)Commandes disponibles:$(NC)"
	@echo "  $(GREEN)make install$(NC)     - Installer les dépendances npm"
	@echo "  $(GREEN)make dev$(NC)         - Démarrer le serveur de développement"
	@echo "  $(GREEN)make build$(NC)       - Construire le projet pour la production"
	@echo "  $(GREEN)make stop$(NC)        - Arrêter le serveur de développement"
	@echo "  $(GREEN)make restart$(NC)     - Redémarrer le serveur de développement"
	@echo "  $(GREEN)make clean$(NC)       - Nettoyer les fichiers temporaires"
	@echo "  $(GREEN)make help$(NC)        - Afficher cette aide"
	@echo ""

# Installer les dépendances npm
install:
	@echo "$(GREEN)📦 Installation des dépendances npm...$(NC)"
	$(NPM) install
	@echo "$(GREEN)✅ Installation terminée !$(NC)"

# Démarrer le serveur de développement
dev:
	@echo "$(GREEN)🚀 Démarrage du serveur de développement...$(NC)"
	@if [ -f $(PID_FILE) ]; then \
		echo "$(YELLOW)⚠️  Un serveur semble déjà en cours d'exécution.$(NC)"; \
		echo "$(YELLOW)   Utilisez 'make stop' pour l'arrêter d'abord.$(NC)"; \
		exit 1; \
	fi
	$(NPM) run dev &
	@echo $$! > $(PID_FILE)
	@echo "$(GREEN)✅ Serveur démarré sur http://localhost:$(PORT)$(NC)"
	@echo "$(YELLOW)💡 Utilisez 'make stop' pour arrêter le serveur$(NC)"

# Construire le projet pour la production
build:
	@echo "$(GREEN)🔨 Construction du projet pour la production...$(NC)"
	$(NPM) run build
	@echo "$(GREEN)✅ Build terminé ! Les fichiers sont dans le dossier 'dist'$(NC)"

# Arrêter le serveur de développement
stop:
	@echo "$(YELLOW)🛑 Arrêt de tous les serveurs de développement...$(NC)"
	@# Arrêter les processus npm run dev
	@pkill -f "npm run dev" 2>/dev/null || true
	@# Arrêter les processus vite
	@pkill -f "vite" 2>/dev/null || true
	@# Arrêter les processus node avec vite
	@pkill -f "node.*vite" 2>/dev/null || true
	@# Nettoyer le fichier PID
	@rm -f $(PID_FILE)
	@echo "$(GREEN)✅ Tous les serveurs arrêtés !$(NC)"

# Redémarrer le serveur de développement
restart:
	@echo "$(GREEN)🔄 Redémarrage du serveur de développement...$(NC)"
	@$(MAKE) stop
	@sleep 1
	@$(MAKE) dev

# Nettoyer les fichiers temporaires
clean:
	@echo "$(GREEN)🧹 Nettoyage des fichiers temporaires...$(NC)"
	@rm -f $(PID_FILE)
	@rm -rf node_modules/.vite
	@rm -rf dist
	@echo "$(GREEN)✅ Nettoyage terminé !$(NC)"

# Nettoyage complet (supprime node_modules)
clean-all: clean
	@echo "$(GREEN)🧹 Nettoyage complet...$(NC)"
	@rm -rf node_modules
	@rm -f package-lock.json
	@echo "$(GREEN)✅ Nettoyage complet terminé !$(NC)"
	@echo "$(YELLOW)💡 Utilisez 'make install' pour réinstaller les dépendances$(NC)"
