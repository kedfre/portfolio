# Documentation Duke Hazzard - Voiture Interactive

## Vue d'ensemble

Duke Hazzard est une voiture interactive spéciale du portfolio 3D avec des caractéristiques uniques qui la distinguent des autres véhicules disponibles. Elle a été conçue avec une architecture dédiée pour gérer ses spécificités.

## Caractéristiques Uniques

### 🚗 **Roues Avant et Arrière Séparées**
- **Roues avant** : `wheel_front.glb` avec propriétés spécifiques
- **Roues arrière** : `wheel_rear.glb` avec propriétés différentes
- **Avantage** : Permet d'avoir des roues différentes à l'avant et à l'arrière

### ⚡ **Paramètres de Conduite Spécifiques**
- **Vitesse maximale** : 15 (plus rapide que la voiture standard)
- **Accélération** : 0.8 (spécifique à Duke Hazzard)
- **Freinage** : 0.9 (adapté aux caractéristiques du véhicule)
- **Vitesse de virage** : 0.05 (comportement unique)

### 🔦 **Système d'Éclairage Simplifié**
- **Feux de freinage uniquement** : `backLightsBrake.glb`
- **Pas de feux de marche arrière** : Intentionnellement absent
- **Raison** : Duke Hazzard n'a pas besoin de feux de marche arrière

## Architecture Technique

### 🏗️ **Structure des Fichiers**

```
src/javascript/World/
├── Car.js              # Voiture par défaut + CyberTruck
├── DukeHazzardCar.js    # Voiture Duke Hazzard dédiée
└── CarFactory.js        # Factory pour choisir la bonne voiture
```

### 📦 **Ressources Duke Hazzard**

```javascript
// Ressources ajoutées dans Resources.js
{ name: 'carDukeHazzardChassis', source: './models/car/dukeHazzard/chassis.glb' },
{ name: 'carDukeHazzardWheelFront', source: './models/car/dukeHazzard/wheel_front.glb' },
{ name: 'carDukeHazzardWheelRear', source: './models/car/dukeHazzard/wheel_rear.glb' },
{ name: 'carDukeHazzardBackLightsBrake', source: './models/car/dukeHazzard/backLightsBrake.glb' },
{ name: 'carDukeHazzardAntenna', source: './models/car/dukeHazzard/antenna.glb' }
```

### 🎮 **Activation**

Duke Hazzard s'active via l'URL hash :
```
http://localhost:5173/#dukehazzard
```

## Classe DukeHazzardCar

### 🏗️ **Constructor**
```javascript
constructor(_options) {
    // Configuration spécifique à Duke Hazzard
    this.setModels()        // Modèles Duke Hazzard uniquement
    this.setMovement()     // Paramètres de conduite spécifiques
    this.setChassis()      // Châssis Duke Hazzard
    this.setAntenna()      // Antenne Duke Hazzard
    this.setBackLights()   // Feux de freinage uniquement
    this.setWheels()       // Roues avant/arrière séparées
    this.setTransformControls() // Contrôles de debug
    this.setKlaxon()       // Klaxon et effets spéciaux
}
```

### 🎯 **Méthodes Principales**

#### `setModels()`
- Sélectionne les modèles 3D spécifiques à Duke Hazzard
- Configure les roues avant/arrière séparées
- Exclut intentionnellement les feux de marche arrière

#### `setMovement()`
- Configure les paramètres de conduite spécifiques
- Vitesse maximale : 15
- Accélération : 0.8
- Freinage : 0.9
- Vitesse de virage : 0.05

#### `setWheels()`
- Configure les roues avant et arrière séparément
- Chaque type de roue a ses propres propriétés
- Positionnement spécifique pour chaque type

#### `setBackLights()`
- Configure uniquement les feux de freinage
- Pas de feux de marche arrière
- Positionnement adapté à Duke Hazzard

## CarFactory - Pattern Factory

### 🏭 **Responsabilités**
- Détection du type de voiture demandé
- Instanciation de la bonne classe de voiture
- Gestion de la configuration des voitures
- Interface unifiée pour toutes les voitures

### 🔄 **Types de Voitures Supportés**
- **'dukehazzard'** : Voiture Duke Hazzard avec caractéristiques uniques
- **'cybertruck'** : CyberTruck (mode futuriste)
- **'default'** : Voiture par défaut

### 📋 **Méthodes Principales**

#### `createCar()`
```javascript
createCar() {
    if(this.options.config.dukeHazzard) {
        this.carType = 'dukehazzard'
        this.car = new DukeHazzardCar(this.options)
    }
    // ... autres types de voitures
}
```

#### `getCar()`
- Retourne l'instance de la voiture créée
- Interface unifiée pour toutes les voitures

#### `update()`
- Met à jour la voiture actuelle
- Délègue l'appel à la méthode update de la voiture instanciée

## Configuration

### 🔧 **Application.js**
```javascript
// Détection du mode Duke Hazzard
this.config.dukeHazzard = window.location.hash === '#dukehazzard'
```

### 🌍 **World/index.js**
```javascript
// Utilisation de la factory
this.carFactory = new CarFactory(options)
this.car = this.carFactory.getCar()
```

## Avantages de l'Architecture

### ✅ **Séparation des Responsabilités**
- Chaque voiture a sa propre logique
- Pas de conditions complexes dans une seule classe
- Code plus maintenable et extensible

### ✅ **Extensibilité**
- Facile d'ajouter d'autres voitures
- Pattern Factory réutilisable
- Architecture modulaire

### ✅ **Performance**
- Chargement conditionnel des ressources
- Optimisation selon le type de voiture
- Gestion intelligente de la mémoire

## Utilisation

### 🚀 **Démarrage**
1. Lancer le serveur : `npm run dev`
2. Accéder à : `http://localhost:5173/#dukehazzard`
3. Duke Hazzard sera automatiquement chargé

### 🎮 **Contrôles**
- **Clavier** : WASD pour la direction
- **Tactile** : Joystick et boutons sur mobile
- **Debug** : Interface dat.GUI pour les paramètres

### 🔧 **Debug**
- Interface de debug dédiée : `dukeHazzardCar`
- Contrôles des paramètres de conduite
- TransformControls pour le positionnement

## Ressources

### 📁 **Modèles 3D**
- `chassis.glb` : Châssis principal
- `antenna.glb` : Antenne avec physique
- `wheel_front.glb` : Roues avant
- `wheel_rear.glb` : Roues arrière
- `backLightsBrake.glb` : Feux de freinage

### 🎨 **Matériaux**
- Utilise le système de matériaux existant
- Support des shaders personnalisés
- Gestion des ombres et éclairage

## Évolutions Futures

### 🔮 **Améliorations Possibles**
- Sons spécifiques à Duke Hazzard
- Effets visuels uniques
- Animations spéciales
- Paramètres de physique personnalisés

### 🛠️ **Maintenance**
- Mise à jour des modèles 3D
- Optimisation des performances
- Ajout de nouvelles fonctionnalités
- Tests de compatibilité

---

*Dernière mise à jour : 2025-01-27*
