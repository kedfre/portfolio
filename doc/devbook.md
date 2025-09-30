# DevBook - Portfolio 3D Interactif

## Vue d'ensemble du projet

Ce projet est basé sur le portfolio 3D interactif de Bruno Simon (folio-2019) et sera personnalisé pour créer un portfolio personnel moderne et interactif.

**Technologies utilisées :**
- Three.js pour la 3D
- Vite pour le build
- JavaScript ES6+
- GLSL pour les shaders
- Blender pour les modèles 3D

## Phase 1 : Analyse et Compréhension du Code Existant ✅
- [x] Cloner le projet folio-2019
- [x] Initialiser Git et pousser vers le dépôt personnel
- [x] Installer les dépendances
- [x] Lancer le serveur de développement
- [x] Analyser la structure du code source
- [x] Comprendre l'architecture Three.js
- [x] Identifier les composants principaux
- [x] Documenter les shaders utilisés

**Résultats de l'analyse :**
- Architecture modulaire basée sur Three.js avec pattern MVC
- 225+ assets (modèles 3D, textures, sons) avec compression Draco
- Système de shaders personnalisés (matcap, glows, blur)
- Post-processing avec EffectComposer
- Système de révélation progressive avec GSAP
- Gestion intelligente des dimensions et du temps
- Interface de debug intégrée avec dat.GUI

**Documentation créée :** 
- [Analyse du Code Source](analyse-code-source.md)
- [Documentation des Shaders Matcap](shaders-matcap.md)
- [Système de Baking d'Éclairage](baking.md)
- [Shaders sur la Voiture](shaderCar.md)
- [Positionnement des Roues](roues.md)
- [Système d'Ombres de Sol](floorShadow.md)

**Commentaires ajoutés :** 
- Application.js : Architecture MVC et orchestration
- Camera.js : Système de caméra avancé avec raycasting
- Resources.js : Gestionnaire d'assets (225+ fichiers)
- ThreejsJourney.js : Interface promotionnelle intelligente
- fragment.glsl (matcap) : Shader Matcap avec éclairage indirect personnalisé
- vertex.glsl (matcap) : Shader vertex avec système de révélation progressive

## Phase 2 : Personnalisation du Contenu
- [ ] Remplacer les informations personnelles de Bruno Simon
- [ ] Adapter les projets affichés
- [ ] Personnaliser les textes et descriptions
- [ ] Modifier les liens sociaux
- [ ] Adapter les couleurs et le thème visuel

## Phase 2.2 : Galerie de Sélection de Véhicules ✅
- [x] **VehicleGallery.js** : Gestionnaire principal de la galerie
  - [x] Orchestration de tous les composants
  - [x] Gestion des états (fermé, ouvert, sélection)
  - [x] Navigation entre les véhicules
  - [x] Transition vers l'application principale
  - [x] Intégration avec le système existant
- [x] **VehiclePreview.js** : Prévisualisation des véhicules
  - [x] Affichage des véhicules en gros plan
  - [x] Rotation des véhicules avec la souris
  - [x] Gestion des transitions entre véhicules
  - [x] Intégration avec CarFactory existant
  - [x] Optimisation des performances
- [x] **GalleryControls.js** : Contrôles de navigation
  - [x] Flèches de navigation gauche/droite
  - [x] Indicateurs de position (points)
  - [x] Bouton de sélection "Choisir ce véhicule" (HTML centré en bas)
  - [x] Bouton sélecteur de couleurs (🎨 en haut à droite)
  - [x] Animations de transition
  - [x] Gestion des événements tactiles
- [x] **GalleryCamera.js** : Caméra fixe pour la galerie
  - [x] Positionnement fixe pour le gros plan
  - [x] Configuration de l'éclairage
  - [x] Gestion du redimensionnement
  - [x] Optimisation pour la prévisualisation
- [x] **Intégration dans World/index.js**
  - [x] Modification de l'écran de démarrage
  - [x] Ouverture de la galerie au clic sur "Start"
  - [x] Callback de sélection de véhicule
  - [x] Démarrage de l'application avec le véhicule sélectionné

**Résultats de la Phase 2.2 :**
- Galerie de sélection de véhicules fonctionnelle
- Navigation fluide entre les 3 véhicules disponibles
- Rotation des véhicules avec la souris
- Même configuration de scène (éclairage, sol)
- Transition fluide vers l'application principale
- Intégration transparente avec l'architecture existante
- **Amélioration** : Bouton "Choisir ce véhicule" en HTML centré en bas de l'écran (plus optimal que le bouton 3D)

## Phase 2.1 : Développement de Nouvelles Fonctionnalités Interactives ✅
- [x] **Voiture Duke Hazzard** : Nouvelle voiture avec caractéristiques uniques
  - [x] Roues avant et arrière séparées avec propriétés différentes
  - [x] Paramètres de conduite spécifiques (vitesse, accélération, freinage)
  - [x] Pas de feux de marche arrière (backLightsReverse)
  - [x] Comportement de conduite unique
- [x] **CarFactory.js** : Factory pattern pour la sélection des voitures
- [x] **DukeHazzardCar.js** : Classe dédiée pour la voiture Duke Hazzard
- [x] **Configuration #dukehazzard** : Activation via URL hash
- [x] Documentation complète du système Duke Hazzard ([dukeHazzard.md](dukeHazzard.md))

**Résultats de la Phase 2.1 :**
- Architecture modulaire avec pattern Factory pour les voitures
- Voiture Duke Hazzard avec caractéristiques uniques
- Système de sélection de voitures via URL hash
- Documentation complète du nouveau système
- Intégration transparente avec l'architecture existante

## Phase 3 : Amélioration des Modèles 3D
- [ ] Analyser les modèles Blender existants
- [ ] Créer ou adapter des modèles personnalisés
- [ ] Optimiser les textures et matériaux
- [ ] Tester les performances sur différents appareils

## Phase 4 : Développement de Nouvelles Fonctionnalités
- [ ] Ajouter de nouvelles sections de projets
- [ ] Implémenter des interactions supplémentaires
- [ ] Améliorer l'expérience mobile
- [ ] Ajouter des animations personnalisées
- [ ] Intégrer des effets visuels avancés

## Phase 5 : Optimisation et Performance
- [ ] Optimiser le chargement des assets
- [ ] Améliorer les performances 3D
- [ ] Implémenter le lazy loading
- [ ] Optimiser pour les appareils mobiles
- [ ] Tester la compatibilité navigateurs

## Phase 6 : Déploiement et Mise en Production
- [ ] Configurer le build de production
- [ ] Optimiser les assets pour la production
- [ ] Configurer le déploiement (Netlify/Vercel)
- [ ] Mettre en place le monitoring
- [ ] Documenter le processus de déploiement

## Phase 7 : Maintenance et Évolutions
- [ ] Mettre en place un système de mise à jour du contenu
- [ ] Planifier les futures améliorations
- [ ] Documenter les procédures de maintenance
- [ ] Créer un guide d'utilisation

## Phase 8 : Améliorations Futures - Contrôle Granulaire des Matcaps

### 🎨 Stratégie de Nommage des Matcaps

**Objectif :** Permettre la modification des couleurs de matcaps pour des parties spécifiques du véhicule (carrosserie, jantes, vitres, etc.) avec un contrôle granulaire.

**Convention de nommage recommandée :**
- Format : `partie_typeMatcap`
- Exemples : `body_chrome`, `wheels_blackMetal`, `tires_black`, `windows_glass`

**Tâches à réaliser :**
- [ ] **Préparer la stratégie de nommage des matcaps pour contrôle granulaire**
- [ ] **Renommer les objets dans Blender selon la convention partie_typeMatcap**
- [ ] **Modifier getMatcapTypeFromName() pour supporter le nouveau format**

**Avantages :**
- Contrôle granulaire sur chaque partie du véhicule
- Noms explicites et cohérents
- Facile d'ajouter de nouvelles parties
- Compatibilité avec l'ancien système

**Exemple de migration :**
```
Ancien : chrome_carrosserie_duke_hazzard
Nouveau : body_chrome

Ancien : blackMetal_jantes_avant  
Nouveau : wheels_blackMetal
```

Cette amélioration permettra un contrôle précis et intuitif des couleurs de chaque partie du véhicule dans l'interface de sélection des couleurs.

### 🎨 Interface de Sélection des Couleurs - Implémentée ✅

**Composants créés :**
- [x] **MatcapColorController.js** : Contrôleur de couleurs des matcaps
- [x] **ColorSelector.js** : Interface utilisateur HTML pour la sélection
- [x] **Intégration dans VehicleGallery.js** : Connexion avec la prévisualisation
- [x] **Bouton dans GalleryControls.js** : Bouton 🎨 pour ouvrir/fermer

**Fonctionnalités :**
- [x] Sélection de matériau via dropdown
- [x] Contrôles HSL (Hue, Saturation, Lightness)
- [x] Prévisualisation en temps réel
- [x] Application immédiate aux véhicules
- [x] Boutons de réinitialisation
- [x] Interface responsive avec animations

**Utilisation :**
1. Ouvrir la galerie (clic sur "Start")
2. Cliquer sur le bouton 🎨 en haut à droite
3. Sélectionner un matériau dans le dropdown
4. Ajuster les couleurs avec les sliders HSL
5. Voir le résultat en temps réel sur le véhicule

## Notes de Développement

### Structure du Projet
```
Portfolio/
├── src/                    # Code source principal
│   ├── javascript/         # Logique JavaScript
│   ├── shaders/           # Shaders GLSL
│   ├── style/             # Styles CSS
│   └── images/            # Images et assets
├── static/                # Assets statiques
│   ├── models/            # Modèles 3D (.glb)
│   └── sounds/            # Fichiers audio
├── resources/             # Fichiers Blender
└── doc/                   # Documentation
```

### Commandes Utiles
- `npm run dev` : Lance le serveur de développement
- `npm run build` : Build de production
- `npm audit` : Vérifie les vulnérabilités

### Liens Utiles
- [Three.js Documentation](https://threejs.org/docs/)
- [Vite Documentation](https://vitejs.dev/)
- [Blender Documentation](https://docs.blender.org/)

---
*Dernière mise à jour : $(date)*