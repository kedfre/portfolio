# Positionnement des Roues - Portfolio 3D

## Vue d'ensemble

Le système de positionnement des roues de la voiture utilise une **architecture sophistiquée** qui combine la physique Cannon.js avec l'affichage 3D Three.js. Les roues sont positionnées de manière précise par rapport au châssis et synchronisées en temps réel pour créer un comportement réaliste.

## Architecture du Système de Roues

### 1. Système de Positionnement Physique ⚙️

#### A. Configuration des Décalages des Roues

**Fichier :** `src/javascript/World/Physics.js` (lignes 349-352)

```javascript
// Position des roues
this.car.options.wheelFrontOffsetDepth = 0.635    // Décalage avant des roues
this.car.options.wheelBackOffsetDepth = - 0.475   // Décalage arrière des roues
this.car.options.wheelOffsetWidth = 0.39          // Décalage latéral des roues
```

**Explication des paramètres :**
- **`wheelFrontOffsetDepth`** : Distance des roues avant par rapport au centre du châssis (0.635 unités vers l'avant)
- **`wheelBackOffsetDepth`** : Distance des roues arrière par rapport au centre du châssis (-0.475 unités vers l'arrière)
- **`wheelOffsetWidth`** : Distance latérale des roues par rapport au centre du châssis (0.39 unités de chaque côté)

#### B. Création des Points de Connexion des Roues

**Fichier :** `src/javascript/World/Physics.js` (lignes 469-483)

```javascript
// Roue avant gauche
this.car.wheels.options.chassisConnectionPointLocal.set(
    this.car.options.wheelFrontOffsetDepth,    // X : 0.635 (avant)
    this.car.options.wheelOffsetWidth,         // Y : 0.39 (gauche)
    0                                          // Z : 0 (hauteur)
)
this.car.vehicle.addWheel(this.car.wheels.options)

// Roue avant droite
this.car.wheels.options.chassisConnectionPointLocal.set(
    this.car.options.wheelFrontOffsetDepth,    // X : 0.635 (avant)
    -this.car.options.wheelOffsetWidth,        // Y : -0.39 (droite)
    0                                          // Z : 0 (hauteur)
)
this.car.vehicle.addWheel(this.car.wheels.options)

// Roue arrière gauche
this.car.wheels.options.chassisConnectionPointLocal.set(
    this.car.options.wheelBackOffsetDepth,     // X : -0.475 (arrière)
    this.car.options.wheelOffsetWidth,         // Y : 0.39 (gauche)
    0                                          // Z : 0 (hauteur)
)
this.car.vehicle.addWheel(this.car.wheels.options)

// Roue arrière droite
this.car.wheels.options.chassisConnectionPointLocal.set(
    this.car.options.wheelBackOffsetDepth,     // X : -0.475 (arrière)
    -this.car.options.wheelOffsetWidth,        // Y : -0.39 (droite)
    0                                          // Z : 0 (hauteur)
)
this.car.vehicle.addWheel(this.car.wheels.options)
```

**Coordonnées finales des roues :**
- **Roue avant gauche** : (0.635, 0.39, 0)
- **Roue avant droite** : (0.635, -0.39, 0)
- **Roue arrière gauche** : (-0.475, 0.39, 0)
- **Roue arrière droite** : (-0.475, -0.39, 0)

### 2. Système de Synchronisation Visuel-Physique 🔄

#### A. Création des Objets Visuels des Roues

**Fichier :** `src/javascript/World/Car.js` (lignes 407-421)

```javascript
/**
 * SetWheels - Configuration des roues
 */
setWheels() {
    // Configuration des roues
    this.wheels = {}
    this.wheels.object = this.objects.getConvertedMesh(this.models.wheel.scene.children)
    this.wheels.items = []

    // Création des 4 roues
    for(let i = 0; i < 4; i++) {
        const object = this.wheels.object.clone()
        this.wheels.items.push(object)
        this.container.add(object)  // Ajout au conteneur principal
    }
}
```

**Processus de création :**
1. **Modèle de base** : Un modèle de roue est chargé depuis Blender
2. **Clonage** : 4 copies identiques sont créées
3. **Stockage** : Les 4 roues sont stockées dans `this.wheels.items[]`
4. **Indexation** : L'ordre correspond aux index de la physique (0=avant gauche, 1=avant droite, 2=arrière gauche, 3=arrière droite)

#### B. Synchronisation en Temps Réel

**Fichier :** `src/javascript/World/Car.js` (lignes 423-439)

```javascript
// Synchronisation avec la physique
this.time.on('tick', () => {
    if(!this.transformControls.enabled) {
        // Mise à jour de chaque roue avec la physique
        for(const _wheelKey in this.physics.car.wheels.bodies) {
            const wheelBody = this.physics.car.wheels.bodies[_wheelKey]      // Corps physique de la roue
            const wheelObject = this.wheels.items[_wheelKey]                 // Objet visuel de la roue

            // Synchronisation de la position et de la rotation
            wheelObject.position.copy(wheelBody.position)                    // Position physique → visuelle
            wheelObject.quaternion.copy(wheelBody.quaternion)                // Rotation physique → visuelle
        }
    }
})
```

**Fonctionnement de la synchronisation :**
- **Boucle de rendu** : À chaque frame (60 FPS)
- **Correspondance** : `_wheelKey` correspond aux index (0, 1, 2, 3)
- **Synchronisation** : Position et rotation de la physique vers le visuel
- **Condition** : Désactivé en mode debug (TransformControls)

### 3. Système de Debug et Modèles Physiques 🛠️

#### A. Modèles de Debug dans la Physique

**Fichier :** `src/javascript/World/Physics.js` (lignes 707-715)

```javascript
// Mise à jour des modèles des roues
for(const _wheelKey in this.car.wheels.bodies) {
    const wheelBody = this.car.wheels.bodies[_wheelKey]                    // Corps physique de la roue
    const wheelMesh = this.car.model.wheels[_wheelKey]                     // Modèle de debug de la roue

    wheelMesh.position.copy(wheelBody.position)                            // Synchronisation de la position
    wheelMesh.quaternion.copy(wheelBody.quaternion)                        // Synchronisation de la rotation
}
```

**Double synchronisation :**
- **Modèles de debug** : Visualisation wireframe des corps physiques
- **Modèles visuels** : Roues avec matériaux et textures
- **Synchronisation parallèle** : Les deux systèmes suivent la même physique

### 4. Configuration des Index des Roues 🔢

**Fichier :** `src/javascript/World/Physics.js` (lignes 488-494)

```javascript
// Configuration des index des roues
this.car.wheels.indexes = {}
this.car.wheels.indexes.frontLeft = 0        // Index de la roue avant gauche
this.car.wheels.indexes.frontRight = 1       // Index de la roue avant droite
this.car.wheels.indexes.backLeft = 2         // Index de la roue arrière gauche
this.car.wheels.indexes.backRight = 3        // Index de la roue arrière droite
this.car.wheels.bodies = []                  // Corps physiques des roues
```

**Ordre de création :**
1. **Index 0** : Roue avant gauche
2. **Index 1** : Roue avant droite  
3. **Index 2** : Roue arrière gauche
4. **Index 3** : Roue arrière droite

### 5. Interface de Debug pour Ajuster les Positions 🎛️

**Fichier :** `src/javascript/World/Physics.js` (lignes 869-871)

```javascript
// Contrôles de debug pour la position des roues
this.car.debugFolder.add(this.car.options, 'wheelFrontOffsetDepth').step(0.001).min(0).max(5).name('wheelFrontOffsetDepth').onFinishChange(this.car.recreate)
this.car.debugFolder.add(this.car.options, 'wheelBackOffsetDepth').step(0.001).min(-5).max(0).name('wheelBackOffsetDepth').onFinishChange(this.car.recreate)
this.car.debugFolder.add(this.car.options, 'wheelOffsetWidth').step(0.001).min(0).max(5).name('wheelOffsetWidth').onFinishChange(this.car.recreate)
```

**Fonctionnalités de debug :**
- **Ajustement en temps réel** : Modification des positions des roues
- **Recreation automatique** : Recréation de la voiture avec les nouveaux paramètres
- **Limites** : Valeurs min/max pour éviter les positions impossibles

### 6. Propriétés Physiques des Roues ⚙️

**Fichier :** `src/javascript/World/Physics.js` (lignes 354-365)

```javascript
// Propriétés des roues
this.car.options.wheelRadius = 0.25                                            // Rayon des roues
this.car.options.wheelHeight = 0.24                                            // Hauteur des roues
this.car.options.wheelSuspensionStiffness = 50                                 // Rigidité de la suspension
this.car.options.wheelSuspensionRestLength = 0.1                               // Longueur de repos de la suspension
this.car.options.wheelFrictionSlip = 10                                        // Friction de glissement
this.car.options.wheelRollInfluence = 0.01                                     // Influence du roulis
this.car.options.wheelMaxSuspensionTravel = 0.3                                // Course maximale de suspension
this.car.options.wheelCustomSlidingRotationalSpeed = -30                       // Vitesse de rotation de glissement
```

**Paramètres configurables :**
- **Rayon et hauteur** : Dimensions physiques des roues
- **Suspension** : Rigidité et course de la suspension
- **Friction** : Comportement de glissement et de roulis
- **Rotation** : Vitesse de rotation personnalisée

### 7. Configuration des Options de Roues 🔧

**Fichier :** `src/javascript/World/Physics.js` (lignes 456-467)

```javascript
// Options de configuration des roues
this.car.wheels.options = {
    radius: this.car.options.wheelRadius,                                       // Rayon de la roue
    directionLocal: new CANNON.Vec3(0, 0, - 1),                               // Direction locale (vers le bas)
    suspensionStiffness: this.car.options.wheelSuspensionStiffness,            // Rigidité de la suspension
    suspensionRestLength: this.car.options.wheelSuspensionRestLength,          // Longueur de repos
    frictionSlip: this.car.options.wheelFrictionSlip,                          // Friction de glissement
    dampingRelaxation: this.car.options.wheelDampingRelaxation,                // Amortissement de relaxation
    dampingCompression: this.car.options.wheelDampingCompression,              // Amortissement de compression
    maxSuspensionForce: this.car.options.wheelMaxSuspensionForce,              // Force maximale de suspension
    rollInfluence: this.car.options.wheelRollInfluence,                        // Influence du roulis
    axleLocal: new CANNON.Vec3(0, 1, 0),                                      // Axe local (latéral)
    chassisConnectionPointLocal: new CANNON.Vec3(1, 1, 0)                     // Point de connexion (sera modifié pour chaque roue)
}
```

**Configuration complète :**
- **Géométrie** : Rayon et direction de la roue
- **Suspension** : Rigidité, longueur et forces
- **Amortissement** : Relaxation et compression
- **Physique** : Friction, roulis et connexion au châssis

### 8. Processus de Création des Corps Physiques 🏗️

**Fichier :** `src/javascript/World/Physics.js` (lignes 496-537)

```javascript
// Création des corps physiques des roues
for(let i = 0; i < 4; i++) {
    const wheelBody = new CANNON.Body({ mass: 0 })                            // Corps physique sans masse
    wheelBody.type = CANNON.Body.KINEMATIC                                    // Type cinématique
    wheelBody.material = this.car.wheels.material                             // Matériau de la roue
    wheelBody.addShape(this.car.wheels.shape)                                 // Forme de la roue
    wheelBody.position.set(0, 0, 0)                                           // Position initiale
    wheelBody.angularVelocity.set(0, 0, 0)                                    // Vitesse angulaire initiale
    wheelBody.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 0, 1), Math.PI * 0.5)  // Rotation initiale

    this.car.wheels.bodies.push(wheelBody)                                    // Ajout à la liste
    this.world.addBody(wheelBody)                                             // Ajout au monde physique
}
```

**Caractéristiques des corps physiques :**
- **Masse nulle** : Les roues n'ont pas de masse propre
- **Type cinématique** : Contrôlées par le véhicule
- **Matériau spécial** : Propriétés de friction spécifiques
- **Forme cylindrique** : Correspond à la géométrie de la roue

### 9. Synchronisation avec le Véhicule 🚗

**Fichier :** `src/javascript/World/Physics.js` (lignes 850-900)

```javascript
// Synchronisation des roues avec le véhicule
this.time.on('tick', () => {
    // Mise à jour des roues
    for(let i = 0; i < this.car.vehicle.wheelInfos.length; i++) {
        this.car.vehicle.updateWheelTransform(i)                              // Mise à jour de la transformation
        const transform = this.car.vehicle.wheelInfos[i].worldTransform       // Transformation monde

        // Mise à jour de la position et rotation du corps physique
        this.car.wheels.bodies[i].position.set(
            transform.position.x,
            transform.position.y,
            transform.position.z
        )
        this.car.wheels.bodies[i].quaternion.set(
            transform.quaternion.x,
            transform.quaternion.y,
            transform.quaternion.z,
            transform.quaternion.w
        )
    }
})
```

**Processus de synchronisation :**
1. **Mise à jour des transformations** : Calcul des nouvelles positions
2. **Application aux corps physiques** : Synchronisation avec Cannon.js
3. **Propagation visuelle** : Les objets 3D suivent automatiquement

### 10. Gestion des Contrôles de Direction 🎮

**Fichier :** `src/javascript/World/Physics.js` (lignes 720-750)

```javascript
// Gestion de la direction
if(this.controls.actions.left || this.controls.actions.right) {
    let steerValue = 0
    if(this.controls.actions.left) {
        steerValue = 0.5                                                      // Direction à gauche
    }
    if(this.controls.actions.right) {
        steerValue = -0.5                                                     // Direction à droite
    }

    // Application de la direction aux roues avant
    this.car.vehicle.setSteeringValue(steerValue, this.car.wheels.indexes.frontLeft)
    this.car.vehicle.setSteeringValue(steerValue, this.car.wheels.indexes.frontRight)
}
```

**Système de direction :**
- **Roues directrices** : Seules les roues avant tournent
- **Valeurs de direction** : -0.5 (droite) à +0.5 (gauche)
- **Application simultanée** : Les deux roues avant tournent ensemble

### 11. Gestion de l'Accélération et du Freinage ⚡

**Fichier :** `src/javascript/World/Physics.js` (lignes 750-800)

```javascript
// Gestion de l'accélération
if(this.controls.actions.up || this.controls.actions.down) {
    let engineForce = 0
    if(this.controls.actions.up) {
        engineForce = this.controls.actions.boost ? 1500 : 1000               // Force d'accélération
    }
    if(this.controls.actions.down) {
        engineForce = -800                                                    // Force de freinage
    }

    // Application de la force aux roues arrière
    this.car.vehicle.applyEngineForce(engineForce, this.car.wheels.indexes.backLeft)
    this.car.vehicle.applyEngineForce(engineForce, this.car.wheels.indexes.backRight)
}
```

**Système de propulsion :**
- **Roues motrices** : Seules les roues arrière propulsent
- **Force variable** : Accélération normale (1000) ou boost (1500)
- **Freinage** : Force négative (-800) pour ralentir

### 12. Optimisations de Performance 🚀

#### A. Désactivation de la Mise à Jour Automatique

```javascript
// Optimisation pour les objets statiques
if(_options.mass === 0) {
    container.matrixAutoUpdate = false
    container.updateMatrix()

    // Optimisation des enfants
    for(const _child of container.children) {
        _child.matrixAutoUpdate = false
        _child.updateMatrix()
    }
}
```

#### B. Gestion des Matériaux

```javascript
// Matériau spécial pour les roues
this.car.wheels.material = new CANNON.Material('wheelMaterial')
this.car.wheels.material.friction = 0.4
this.car.wheels.material.restitution = 0.3
```

**Optimisations appliquées :**
- **Matrices statiques** : Pas de recalcul inutile
- **Matériaux optimisés** : Propriétés de friction spécifiques
- **Gestion des collisions** : Interactions réalistes avec le sol

### 13. Résumé du Processus Complet 🎯

1. **Configuration initiale** : 
   - Définition des décalages des roues
   - Configuration des propriétés physiques

2. **Création physique** : 
   - Création des corps physiques Cannon.js
   - Configuration des points de connexion

3. **Création visuelle** : 
   - Clonage du modèle de roue
   - Application des matériaux et shaders

4. **Synchronisation** : 
   - Boucle de rendu à 60 FPS
   - Copie des positions et rotations

5. **Contrôles** : 
   - Direction sur les roues avant
   - Propulsion sur les roues arrière

6. **Optimisations** : 
   - Gestion des matrices
   - Matériaux spécialisés

## Conclusion

Le système de positionnement des roues est un exemple parfait d'**intégration physique-visuelle** qui combine :

- **Positionnement précis** basé sur des décalages configurables
- **Synchronisation temps réel** entre la physique et l'affichage
- **Contrôles réalistes** avec direction et propulsion séparées
- **Optimisations de performance** pour un rendu fluide
- **Interface de debug** pour l'ajustement en temps réel

Ce système permet une **conduite réaliste** avec des roues qui roulent, tournent et réagissent physiquement aux interactions ! ✨
