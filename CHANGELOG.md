# Changelog

Toutes les modifications notables de ce projet seront documentées dans ce fichier.

Le format est basé sur [Keep a Changelog](https://keepachangelog.com/fr/1.0.0/),
et ce projet adhère au [Versioning Sémantique](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### À venir
- Personnalisation du contenu et des projets
- Amélioration des modèles 3D
- Nouvelles fonctionnalités interactives
- Optimisations de performance

## [1.3.0] - 2025-01-27

### Ajouté
- **Voiture Duke Hazzard** : Nouvelle voiture avec caractéristiques uniques
  - Roues avant et arrière séparées avec propriétés différentes
  - Paramètres de conduite spécifiques (vitesse, accélération, freinage)
  - Pas de feux de marche arrière (backLightsReverse)
  - Comportement de conduite unique
- **CarFactory.js** : Factory pattern pour la sélection des voitures
- **DukeHazzardCar.js** : Classe dédiée pour la voiture Duke Hazzard
- **Configuration #dukehazzard** : Activation via URL hash
- Documentation complète du système Duke Hazzard ([dukeHazzard.md](doc/dukeHazzard.md))
- Documentation complète du système d'ombres de sol ([floorShadow.md](doc/floorShadow.md))
- Analyse détaillée des ombres bakées et dynamiques
- Liste exhaustive des 8 textures d'ombres précalculées
- Explication de l'architecture hybride du système d'ombres

### Modifié
- **Application.js** : Ajout de la détection du mode Duke Hazzard (#dukehazzard)
- **World/index.js** : Intégration de CarFactory pour la sélection des voitures
- **Resources.js** : Ajout des ressources Duke Hazzard (chassis, roues avant/arrière, antenne, feux de freinage)
- **World/Physics.js** : Support des nouvelles voitures avec physique Cannon.js
- **World/Materials.js** : Ajout de nouveaux matériaux pour Duke Hazzard

### Technique
- **Architecture** : Pattern Factory pour la sélection des voitures
- **Voitures** : 3 types supportés (default, cyberTruck, dukeHazzard)
- **Ressources** : 5 nouveaux modèles 3D Duke Hazzard
- **Configuration** : Détection automatique via URL hash
- **Documentation** : Guide complet du système Duke Hazzard

## [1.2.0] - 2025-01-27

### Ajouté
- Commentaires détaillés dans tous les fichiers JavaScript principaux
- Documentation complète des fonctionnalités et architectures
- Explications des optimisations et bonnes pratiques
- Guide de compréhension du code source

### Modifié
- **Application.js** : Commentaires détaillés sur l'architecture MVC et optimisations
- **Camera.js** : Documentation complète du système de caméra avancé avec raycasting
- **Resources.js** : Explication du gestionnaire d'assets (225+ fichiers)
- **ThreejsJourney.js** : Documentation de l'interface promotionnelle
- **Project.js** : Documentation complète du système de projets avec slides et distinctions
- **ProjectsSection.js** : Documentation de la section de projets avec gestion des zones et navigation
- **Area.js** : Documentation des zones interactives avec clôtures et clés d'interaction
- **Areas.js** : Documentation du gestionnaire de zones avec raycasting et détection tactile
- **Car.js** : Documentation complète de la voiture interactive avec physique Cannon.js, simulation d'antenne, feux arrière, roues, contrôles de debug, tir de boules et klaxon
- **Controls.js** : Documentation complète du système de contrôles avec joystick analogique, boutons tactiles (boost, forward, brake, backward) et gestion des événements tactiles
- **EasterEggs.js** : Documentation complète des œufs de Pâques avec codes de réduction, système de collision et interface utilisateur
- **Floor.js** : Documentation du système de sol avec dégradé de couleurs et matériau shader personnalisé
- **fragment.glsl (matcap)** : Commentaires détaillés du shader Matcap avec éclairage indirect personnalisé
- **vertex.glsl (matcap)** : Commentaires détaillés du shader vertex avec système de révélation progressive

### Documentation
- Commentaires JSDoc pour toutes les méthodes principales
- Explications des patterns et optimisations utilisés
- Guide de compréhension de l'architecture modulaire
- Documentation des fonctionnalités avancées (post-processing, raycasting, etc.)
- [Documentation des Shaders Matcap](doc/shaders-matcap.md) : Guide complet du système de rendu Matcap avec éclairage indirect et révélation progressive

### Détails Techniques
- **Camera.js** : Système de pan avec raycasting, zoom tactile, angles prédéfinis
- **Application.js** : Post-processing, configuration intelligente, animation du titre
- **Resources.js** : Gestionnaire d'assets (225+ fichiers), compression Draco, textures automatiques
- **ThreejsJourney.js** : Interface promotionnelle intelligente avec persistance localStorage
- **AreaFenceGeometry.js** : Géométrie personnalisée de clôture avec BufferGeometry optimisée
- **AreaFloorBorderGeometry.js** : Géométrie de bordure de sol rectangulaire creuse
- **Project.js** : Système de projets avec slides automatiques, distinctions et zones interactives
- **ProjectsSection.js** : Section de projets avec gestion des zones de caméra et navigation automatique
- **Area.js** : Zones interactives avec clôtures animées, clés d'interaction et détection de collision
- **Areas.js** : Gestionnaire de zones avec raycasting, détection tactile et coordination des interactions
- **Car.js** : Voiture interactive avec physique Cannon.js, simulation d'antenne réaliste, feux arrière dynamiques, synchronisation des roues, contrôles de debug, tir de boules (CyberTruck) et klaxon avec effets spéciaux
- **Controls.js** : Système de contrôles clavier (WASD) et tactile avec joystick analogique, boutons tactiles (boost, forward, brake, backward) et gestion des événements tactiles
- **EasterEggs.js** : Code Konami avec support tactile/clavier, perruques interactives avec matériaux aléatoires et œufs de Pâques avec codes de réduction Three.js Journey
- **Floor.js** : Système de sol avec dégradé de couleurs aux 4 coins, texture de fond dynamique et interface de debug
- **Matériaux** : 7 matériaux shader personnalisés (AreaFence, AreaFloorBorder, Floor, FloorShadow, Matcap, ProjectBoard, Shadow)
- **Passes** : 2 passes de post-processing (Blur, Glows) avec shaders GLSL
- **Utils** : 4 classes utilitaires (EventEmitter, Loader, Sizes, Time) avec système d'événements
- **Sections** : 10 sections de portfolio (Crossroads, Distinctions A-D, Information, Intro, Playground, Project, Projects) avec objets interactifs
- **Architecture** : Pattern MVC, event-driven, optimisations performance

## [1.1.0] - 2025-01-27

### Ajouté
- Analyse complète du code source et de l'architecture
- Documentation détaillée des composants Three.js
- Analyse des shaders GLSL personnalisés
- Identification des optimisations et bonnes pratiques

### Technique
- **Architecture** : Pattern MVC avec classes modulaires
- **Assets** : 225+ ressources (modèles 3D, textures, sons)
- **Shaders** : Système matcap personnalisé avec effets de révélation
- **Post-processing** : EffectComposer avec passes de blur et glows
- **Performance** : Optimisations (matrix auto-update, delta capping)

### Documentation
- [Analyse du Code Source](doc/analyse-code-source.md) : Architecture et composants détaillés
- Mise à jour du DevBook avec résultats de l'analyse
- Identification des points d'amélioration

## [1.0.0] - 2025-01-27

### Ajouté
- Initialisation du projet basé sur folio-2019 de Bruno Simon
- Configuration Git et dépôt GitHub
- Installation des dépendances Node.js
- Serveur de développement fonctionnel
- Documentation technique complète
- DevBook avec phases de développement
- Structure de documentation dans `/doc`

### Modifié
- Renommage de la branche par défaut de `master` vers `main`
- Configuration du remote Git vers le dépôt personnel

### Technique
- **Technologies** : Three.js, Vite, JavaScript ES6+, GLSL
- **Assets** : 389 fichiers (modèles 3D, textures, sons, shaders)
- **Dépendances** : 40 packages npm installés
- **Serveur** : Vite v5.2.11 sur http://localhost:5173

### Documentation
- [DevBook](doc/devbook.md) : Plan de développement en 7 phases
- [Documentation Technique](doc/documentation-technique.md) : Architecture et implémentation
- [Changelog](CHANGELOG.md) : Historique des modifications

### Sécurité
- 6 vulnérabilités détectées (4 moderate, 2 high)
- Packages concernés : braces, esbuild, micromatch, nanoid, rollup, vite
- Recommandation : Mise à jour des dépendances pour la production

---

## Types de modifications

- **Ajouté** : Nouvelles fonctionnalités
- **Modifié** : Changements dans les fonctionnalités existantes
- **Déprécié** : Fonctionnalités qui seront supprimées dans une version future
- **Supprimé** : Fonctionnalités supprimées dans cette version
- **Corrigé** : Corrections de bugs
- **Sécurité** : Corrections de vulnérabilités
- **Technique** : Détails techniques et infrastructure
