# Documentation Technique - Galerie de Sélection de Véhicules

## Vue d'ensemble

La galerie de sélection de véhicules est une nouvelle fonctionnalité qui permet aux utilisateurs de choisir leur véhicule avant de lancer l'application principale. Elle s'affiche au clic sur le bouton "Start" et propose une interface interactive pour naviguer entre les véhicules disponibles.

## Architecture

### Composants principaux

#### 1. VehicleGallery.js
**Rôle :** Gestionnaire principal de la galerie
**Responsabilités :**
- Orchestration de tous les composants
- Gestion des états (fermé, ouvert, sélection)
- Navigation entre les véhicules
- Transition vers l'application principale
- Intégration avec le système existant

**Méthodes principales :**
- `open()` : Ouverture de la galerie avec animation
- `close()` : Fermeture de la galerie avec animation
- `changeVehicle(index)` : Changement de véhicule avec transition
- `selectVehicle(vehicle)` : Sélection d'un véhicule et fermeture

#### 2. VehiclePreview.js
**Rôle :** Prévisualisation des véhicules
**Responsabilités :**
- Affichage des véhicules en gros plan
- Rotation des véhicules avec la souris
- Gestion des transitions entre véhicules
- Intégration avec CarFactory existant

**Fonctionnalités :**
- Rotation fluide avec la souris
- Auto-rotation quand pas d'interaction
- Animations de transition entre véhicules
- Gestion des matériaux et éclairage

#### 3. GalleryControls.js
**Rôle :** Contrôles de navigation
**Responsabilités :**
- Flèches de navigation gauche/droite
- Indicateurs de position (points)
- Bouton de sélection "Choisir ce véhicule"
- Gestion des événements tactiles

**Éléments UI :**
- Flèches de navigation avec animation de pulsation
- Indicateurs de position avec animation d'activation
- Bouton de sélection avec effet de brillance

#### 4. GalleryCamera.js
**Rôle :** Caméra fixe pour la galerie
**Responsabilités :**
- Positionnement fixe pour le gros plan
- Configuration de l'éclairage
- Gestion du redimensionnement

**Configuration :**
- Position : (0, 2, 8) pour un gros plan optimal
- FOV : 50° pour une vue naturelle
- Éclairage : Directionnel + Ambiant + Remplissage + Rim

## Véhicules supportés

### 1. Voiture par défaut
- **ID :** `default`
- **Classe :** `Car.js`
- **Configuration :** `{ dukeHazzard: false, cyberTruck: false }`

### 2. CyberTruck
- **ID :** `cybertruck`
- **Classe :** `Car.js`
- **Configuration :** `{ dukeHazzard: false, cyberTruck: true }`

### 3. Duke Hazzard
- **ID :** `dukehazzard`
- **Classe :** `DukeHazzardCar.js`
- **Configuration :** `{ dukeHazzard: true, cyberTruck: false }`

## Intégration avec l'application

### Modification de World/index.js

#### Ajout de l'import
```javascript
import VehicleGallery from './VehicleGallery.js'
```

#### Initialisation dans le constructeur
```javascript
this.setVehicleGallery() // Ajouté dans la séquence d'initialisation
```

#### Modification de l'écran de démarrage
```javascript
// Au lieu de démarrer directement l'application
this.start()

// Maintenant ouvre la galerie
this.vehicleGallery.open()
```

#### Callback de sélection
```javascript
this.vehicleGallery.onVehicleSelected = (selectedVehicle) => {
    // Mise à jour de la configuration
    this.config = { ...this.config, ...selectedVehicle.config }
    
    // Démarrage de l'application
    this.start()
    
    // Déclenchement de la révélation
    window.setTimeout(() => {
        this.reveal.go()
    }, 600)
}
```

## Séquence d'exécution

1. **Chargement de l'application** → Écran de démarrage
2. **Clic sur "Start"** → Ouverture de la galerie
3. **Navigation dans la galerie** → Sélection du véhicule
4. **Clic "Choisir ce véhicule"** → Fermeture galerie + démarrage application
5. **Application démarre** → Avec le véhicule sélectionné

## Gestion des erreurs

### Objets temporaires
La galerie utilise des objets temporaires pour créer les véhicules sans initialiser complètement tous les systèmes :

```javascript
const tempObjects = {
    container: new THREE.Object3D(),
    floorShadows: []
}

const tempPhysics = {
    car: {
        chassis: {
            body: {
                position: { x: 0, y: 0, z: 0 }
            }
        }
    }
}
```

### Gestion des erreurs
Toutes les méthodes critiques sont protégées par des try-catch :

```javascript
try {
    this.state.currentVehicle.update()
} catch(error) {
    console.warn('Erreur lors de la mise à jour du véhicule dans la galerie:', error)
}
```

## Interface de debug

### Contrôles disponibles
- **VehicleGallery :** État, actions (open/close), navigation
- **VehiclePreview :** Index véhicule, auto-rotation, vitesse rotation
- **GalleryControls :** Index véhicule, visibilité, actions
- **GalleryCamera :** Position caméra, éclairage, FOV

### Activation
Ajouter `#debug` à l'URL pour activer l'interface de debug.

## Optimisations

### Performance
- Chargement différé des véhicules
- Gestion mémoire des modèles 3D
- Optimisation du rendu
- Animations GSAP optimisées

### Mobile
- Support des événements tactiles
- Adaptation des contrôles
- Optimisation des performances

## Extensibilité

### Ajout de nouveaux véhicules
1. Ajouter la configuration dans `VehicleGallery.js`
2. Créer la classe de véhicule si nécessaire
3. Mettre à jour `CarFactory.js` si besoin

### Personnalisation
- Modification des animations dans les composants
- Ajustement de l'éclairage dans `GalleryCamera.js`
- Personnalisation des contrôles dans `GalleryControls.js`

## Tests

### Tests fonctionnels
- [x] Ouverture/fermeture de la galerie
- [x] Navigation entre véhicules
- [x] Rotation des véhicules
- [x] Sélection de véhicule
- [x] Transition vers l'application

### Tests de compatibilité
- [x] Navigateurs modernes
- [x] Appareils mobiles
- [x] Différentes résolutions
- [x] Mode debug

## Maintenance

### Nettoyage des ressources
Tous les composants implémentent une méthode `destroy()` pour :
- Désabonnement des événements
- Libération des ressources Three.js
- Nettoyage des animations GSAP

### Logs et monitoring
- Messages d'erreur avec `console.warn`
- Logs de sélection de véhicule
- Monitoring des performances

---

*Documentation créée le $(date) - Version 1.0*
