# Documentation Technique - Portfolio 3D Interactif

## Vue d'ensemble

Ce portfolio est une application web 3D interactive basée sur Three.js, permettant de naviguer dans un environnement virtuel pour découvrir des projets et informations personnelles.

## Architecture Technique

### Stack Technologique

- **Frontend** : JavaScript ES6+, HTML5, CSS3
- **3D Engine** : Three.js (r128)
- **Build Tool** : Vite 5.2.11
- **Shaders** : GLSL (OpenGL Shading Language)
- **Modélisation 3D** : Blender
- **Audio** : Web Audio API

### Structure du Code

#### Point d'entrée
- `src/index.html` : Page HTML principale
- `src/index.js` : Point d'entrée JavaScript
- `src/javascript/Application.js` : Classe principale de l'application

#### Architecture Modulaire

```
Application.js
├── Camera.js              # Gestion de la caméra 3D
├── Resources.js           # Chargement des assets
├── World/                 # Monde 3D principal
│   ├── index.js          # Point d'entrée du monde
│   ├── Areas.js          # Gestion des zones interactives
│   ├── Car.js            # Véhicule de navigation par défaut
│   ├── DukeHazzardCar.js # Voiture Duke Hazzard spéciale
│   ├── CarFactory.js     # Factory pattern pour les voitures
│   ├── Controls.js       # Contrôles utilisateur
│   ├── Physics.js        # Physique du monde
│   ├── Materials.js      # Matériaux 3D
│   ├── Objects.js        # Objets 3D
│   ├── Shadows.js        # Système d'ombres
│   ├── Sounds.js         # Gestion audio
│   └── Sections/         # Sections de contenu
│       ├── IntroSection.js
│       ├── ProjectsSection.js
│       ├── InformationSection.js
│       └── ...
└── Utils/                # Utilitaires
    ├── EventEmitter.js   # Système d'événements
    ├── Loader.js         # Chargement d'assets
    ├── Sizes.js          # Gestion des dimensions
    └── Time.js           # Gestion du temps
```

## Système de Rendu 3D

### Pipeline de Rendu

1. **Initialisation** : Création de la scène, caméra, renderer
2. **Chargement** : Assets 3D, textures, sons
3. **Mise à jour** : Animation, physique, contrôles
4. **Rendu** : Calcul des shaders, affichage

### Shaders Personnalisés

Le projet utilise plusieurs shaders GLSL personnalisés :

- **Floor Shader** : Rendu du sol avec effets de profondeur
- **Matcap Shader** : Matériaux avec capture de matériau
- **Blur Shader** : Effets de flou pour les transitions
- **Glow Shader** : Effets de lueur et éclairage
- **Shadow Shader** : Système d'ombres personnalisé

### Gestion des Assets

#### Modèles 3D
- Format : GLB (glTF Binary)
- Compression : Draco pour optimiser la taille
- Organisation : Dossiers par type d'objet

#### Textures
- Formats : PNG, JPG, WebP
- Optimisation : Compression automatique
- Matcaps : Textures de matériau prédéfinies

#### Audio
- Formats : MP3, WAV
- Catégories : Sons d'interface, effets, musique d'ambiance

## Système de Navigation

### Contrôles Utilisateur

- **Clavier** : Navigation directionnelle (WASD/Flèches)
- **Souris** : Rotation de la caméra
- **Mobile** : Contrôles tactiles adaptés

### Physique du Monde

- **Moteur Physique** : Intégration avec Three.js
- **Collisions** : Détection des obstacles
- **Gravité** : Simulation physique réaliste

## Optimisations Performance

### Chargement Lazy
- Chargement progressif des assets
- Streaming des modèles 3D
- Cache intelligent des ressources

### Rendu Optimisé
- Frustum culling automatique
- LOD (Level of Detail) pour les modèles
- Occlusion culling pour les objets cachés

### Gestion Mémoire
- Libération automatique des ressources
- Pool d'objets réutilisables
- Garbage collection optimisé

## Configuration de Développement

### Variables d'Environnement
```javascript
// Configuration Vite
const config = {
  server: {
    port: 5173,
    host: true
  },
  build: {
    outDir: 'dist',
    assetsDir: 'static'
  }
}
```

### Scripts NPM
- `npm run dev` : Serveur de développement
- `npm run build` : Build de production
- `npm run preview` : Prévisualisation du build

## Déploiement

### Build de Production
1. Optimisation des assets
2. Minification du code
3. Compression des textures
4. Génération des bundles

### Hébergement Recommandé
- **Netlify** : Déploiement automatique depuis Git
- **Vercel** : Optimisé pour les applications Vite
- **GitHub Pages** : Hébergement statique gratuit

## Système de Voitures Interactives

### Architecture des Voitures

Le portfolio dispose d'un système de voitures modulaire utilisant le pattern Factory pour gérer différents types de véhicules.

#### Types de Voitures Supportées

1. **Voiture par Défaut** (`Car.js`)
   - Véhicule standard avec toutes les fonctionnalités
   - Support du mode CyberTruck
   - Feux avant/arrière complets
   - Paramètres de conduite standard

2. **Voiture Duke Hazzard** (`DukeHazzardCar.js`)
   - Caractéristiques uniques spécialisées
   - Roues avant et arrière séparées
   - Paramètres de conduite spécifiques
   - Pas de feux de marche arrière
   - Comportement de conduite unique

#### CarFactory - Pattern Factory

```javascript
// Sélection automatique de la voiture
if(config.dukeHazzard) {
    car = new DukeHazzardCar(options)
} else if(config.cyberTruck) {
    car = new Car(options) // Mode CyberTruck
} else {
    car = new Car(options) // Voiture par défaut
}
```

#### Configuration des Voitures

- **Activation Duke Hazzard** : `#dukehazzard` dans l'URL
- **Activation CyberTruck** : `#cybertruck` dans l'URL
- **Voiture par défaut** : Aucun hash dans l'URL

#### Ressources Duke Hazzard

```javascript
// Modèles 3D spécifiques
carDukeHazzardChassis        // Châssis principal
carDukeHazzardWheelFront     // Roues avant
carDukeHazzardWheelRear      // Roues arrière
carDukeHazzardBackLightsBrake // Feux de freinage
carDukeHazzardAntenna        // Antenne avec physique
```

### Avantages de l'Architecture

- **Séparation des responsabilités** : Chaque voiture a sa propre logique
- **Extensibilité** : Facile d'ajouter de nouveaux types de voitures
- **Performance** : Chargement conditionnel des ressources
- **Maintenabilité** : Code modulaire et organisé

## Sécurité

### Bonnes Pratiques
- Validation des entrées utilisateur
- Sanitisation des données
- HTTPS obligatoire en production
- Headers de sécurité appropriés

### Vulnérabilités Connues
- Dépendances obsolètes (voir npm audit)
- Mise à jour recommandée des packages

## Maintenance

### Mise à Jour du Contenu
- Modification des fichiers de configuration
- Ajout de nouveaux projets
- Mise à jour des informations personnelles

### Monitoring
- Performance du rendu 3D
- Temps de chargement des assets
- Erreurs JavaScript en production

## Ressources et Références

### Documentation Officielle
- [Three.js Documentation](https://threejs.org/docs/)
- [Vite Documentation](https://vitejs.dev/)
- [glTF Specification](https://github.com/KhronosGroup/glTF)

### Outils de Développement
- [Three.js Editor](https://threejs.org/editor/)
- [Blender](https://www.blender.org/)
- [glTF Viewer](https://gltf-viewer.donmccurdy.com/)

---
*Documentation générée le : $(date)*
*Version : 1.3.0*
