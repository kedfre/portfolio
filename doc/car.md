# Documentation du Véhicule - Portfolio 3D

## Vue d'ensemble

Le véhicule est l'élément central interactif de ce portfolio 3D. Il s'agit d'un système complexe qui combine physique réaliste, rendu 3D, sons dynamiques, ombres et effets visuels pour créer une expérience immersive de conduite dans un environnement 3D.

## Architecture générale

Le véhicule est composé de plusieurs systèmes interconnectés :

- **Car.js** : Gestionnaire principal du véhicule
- **Physics.js** : Système de physique avec Cannon.js
- **Sounds.js** : Gestionnaire audio avec Howler.js
- **Shadows.js** : Système d'ombres dynamiques
- **Matcap.js** : Matériaux et shaders personnalisés

---

## 1. Création et Assemblage du Véhicule

### 1.1 Structure du véhicule

Le véhicule est créé dans la classe `Car` avec les composants suivants :

```javascript
// Composants principaux
this.setModels()        // Sélection des modèles 3D
this.setMovement()      // Système de calcul de vitesse
this.setChassis()       // Châssis principal
this.setAntena()        // Antenne avec physique
this.setBackLights()    // Feux arrière
this.setWheels()        // 4 roues
this.setTransformControls() // Contrôles de debug
this.setShootingBall()  // Tir de boules (CyberTruck)
this.setKlaxon()        // Klaxon et effets spéciaux
```

### 1.2 Modèles disponibles

Le système supporte deux types de véhicules :

#### Voiture par défaut
- Châssis standard
- Antenne classique
- Feux de freinage et marche arrière
- Roues standard
- Oreilles de lapin (fonctionnalité commentée)

#### CyberTruck (mode futuriste)
- Châssis futuriste
- Antenne stylisée
- Feux LED
- Roues spéciales
- Fonctionnalité de tir de boules de bowling

### 1.3 Assemblage des composants

```javascript
// Châssis principal
this.chassis.object = this.objects.getConvertedMesh(this.models.chassis.scene.children)
this.chassis.object.position.copy(this.physics.car.chassis.body.position)
this.container.add(this.chassis.object)

// Antenne attachée au châssis
this.antena.object = this.objects.getConvertedMesh(this.models.antena.scene.children)
this.chassis.object.add(this.antena.object)

// Feux arrière attachés au châssis
this.chassis.object.add(this.backLightsBrake.object)
this.chassis.object.add(this.backLightsReverse.object)

// Roues dans le conteneur principal
for(let i = 0; i < 4; i++) {
    const object = this.wheels.object.clone()
    this.wheels.items.push(object)
    this.container.add(object)
}
```

---

## 2. Physique du Véhicule

### 2.1 Système de physique Cannon.js

Le véhicule utilise le système `RaycastVehicle` de Cannon.js pour une simulation réaliste :

#### Châssis
```javascript
// Configuration du châssis
this.car.chassis = {
    shape: new CANNON.Box(new CANNON.Vec3(depth/2, width/2, height/2)),
    body: new CANNON.Body({ mass: 40 }),
    // Position initiale et rotation
}
```

#### Roues
```javascript
// Configuration des 4 roues
this.car.wheels.options = {
    radius: 0.25,                    // Rayon des roues
    height: 0.24,                    // Hauteur des roues
    suspensionStiffness: 50,         // Rigidité de la suspension
    suspensionRestLength: 0.1,       // Longueur de repos
    frictionSlip: 10,                // Friction de glissement
    dampingRelaxation: 1.8,          // Amortissement de relaxation
    dampingCompression: 1.5,         // Amortissement de compression
    maxSuspensionForce: 100000,      // Force maximale de suspension
    rollInfluence: 0.01,             // Influence du roulis
    maxSuspensionTravel: 0.3,        // Course maximale
    customSlidingRotationalSpeed: -30, // Vitesse de rotation de glissement
    mass: 5                          // Masse des roues
}
```

### 2.2 Contrôles de conduite

#### Direction
```javascript
// Direction progressive avec limite d'angle
this.car.steering += steerStrength  // Force de direction
if(Math.abs(this.car.steering) > this.car.options.controlsSteeringMax) {
    this.car.steering = Math.sign(this.car.steering) * this.car.options.controlsSteeringMax
}

// Application aux roues avant
this.car.vehicle.setSteeringValue(-this.car.steering, frontLeft)
this.car.vehicle.setSteeringValue(-this.car.steering, frontRight)
```

#### Accélération
```javascript
// Force d'accélération avec boost
const accelerationSpeed = this.controls.actions.boost ? 
    this.car.options.controlsAcceleratingSpeedBoost : 
    this.car.options.controlsAcceleratingSpeed

// Application aux roues arrière
this.car.vehicle.applyEngineForce(-this.car.accelerating, backLeft)
this.car.vehicle.applyEngineForce(-this.car.accelerating, backRight)
```

#### Freinage
```javascript
// Freinage sur toutes les roues
if(this.controls.actions.brake) {
    this.car.vehicle.setBrake(this.car.options.controlsBrakeStrength, 0)
    this.car.vehicle.setBrake(this.car.options.controlsBrakeStrength, 1)
    this.car.vehicle.setBrake(this.car.options.controlsBrakeStrength, 2)
    this.car.vehicle.setBrake(this.car.options.controlsBrakeStrength, 3)
}
```

### 2.3 Détection de retournement

```javascript
// Vérification si la voiture est retournée
const localUp = new CANNON.Vec3(0, 0, 1)
const worldUp = new CANNON.Vec3()
this.car.chassis.body.vectorToWorldFrame(localUp, worldUp)

if(worldUp.dot(localUp) < 0.5) {
    // État : watching -> pending -> turning
    this.car.jump(true)  // Saut pour se retourner
}
```

---

## 3. Gestion dans l'Environnement

### 3.1 Synchronisation physique-visuel

```javascript
// Synchronisation continue à chaque frame
this.time.on('tick', () => {
    // Position et rotation du châssis
    this.chassis.object.position.copy(this.physics.car.chassis.body.position).add(this.chassis.offset)
    this.chassis.object.quaternion.copy(this.physics.car.chassis.body.quaternion)
    
    // Position et rotation des roues
    for(const wheelKey in this.physics.car.wheels.bodies) {
        const wheelBody = this.physics.car.wheels.bodies[wheelKey]
        const wheelObject = this.wheels.items[wheelKey]
        wheelObject.position.copy(wheelBody.position)
        wheelObject.quaternion.copy(wheelBody.quaternion)
    }
})
```

### 3.2 Calcul de mouvement

```javascript
// Calcul de la vitesse globale et locale
const movementSpeed = new THREE.Vector3()
movementSpeed.copy(this.chassis.object.position).sub(this.chassis.oldPosition)
movementSpeed.multiplyScalar(1 / this.time.delta * 17)

// Conversion en coordonnées locales
this.movement.localSpeed = this.movement.speed.clone().applyAxisAngle(
    new THREE.Vector3(0, 0, 1), 
    -this.chassis.object.rotation.z
)
```

### 3.3 Antenne avec simulation physique

```javascript
// Simulation physique de l'antenne
this.antena.speed.x -= accelerationX * this.antena.speedStrength
this.antena.speed.y -= accelerationY * this.antena.speedStrength

// Force de retour élastique
const pullBack = position.negate().multiplyScalar(position.length() * this.antena.pullBackStrength)
this.antena.speed.add(pullBack)

// Amortissement
this.antena.speed.x *= 1 - this.antena.damping
this.antena.speed.y *= 1 - this.antena.damping

// Application de la rotation
this.antena.object.rotation.y = this.antena.localPosition.x * 0.1
this.antena.object.rotation.x = this.antena.localPosition.y * 0.1
```

---

## 4. Gestion des Sons

### 4.1 Système de moteur dynamique

```javascript
// Configuration du moteur
this.engine = {
    progress: 0,                    // Progression (0-1)
    progressEasingUp: 0.3,         // Vitesse de montée
    progressEasingDown: 0.15,      // Vitesse de descente
    speed: 0,                      // Vitesse de la voiture
    speedMultiplier: 2.5,          // Multiplicateur de vitesse
    acceleration: 0,               // Accélération
    accelerationMultiplier: 0.4,   // Multiplicateur d'accélération
    rate: { min: 0.4, max: 1.4 }, // Plage de pitch
    volume: { min: 0.4, max: 1 }   // Plage de volume
}

// Calcul de la progression
let progress = Math.abs(this.engine.speed) * this.engine.speedMultiplier + 
               Math.max(this.engine.acceleration, 0) * this.engine.accelerationMultiplier

// Easing différencié
this.engine.progress += (progress - this.engine.progress) * 
    this.engine[progress > this.engine.progress ? 'progressEasingUp' : 'progressEasingDown']

// Mise à jour du son
this.engine.sound.rate(this.engine.rate.min + rateAmplitude * this.engine.progress)
this.engine.sound.volume((this.engine.volume.min + volumeAmplitude * this.engine.progress) * this.engine.volume.master)
```

### 4.2 Sons de collision

```javascript
// Sons basés sur la vélocité
this.settings = [
    {
        name: 'carHit',
        sounds: ['./sounds/car-hits/car-hit-1.mp3', './sounds/car-hits/car-hit-3.mp3', ...],
        minDelta: 100,              // Délai minimum entre lectures
        velocityMin: 2,             // Vélocité minimum requise
        velocityMultiplier: 1,      // Multiplicateur de vélocité
        volumeMin: 0.2,            // Volume minimum
        volumeMax: 0.6,            // Volume maximum
        rateMin: 0.35,             // Pitch minimum
        rateMax: 0.55              // Pitch maximum
    }
]

// Lecture avec paramètres dynamiques
const volume = Math.min(Math.max((velocity - item.velocityMin) * item.velocityMultiplier, item.volumeMin), item.volumeMax)
const rate = item.rateMin + Math.random() * (item.rateMax - item.rateMin)
sound.volume(volume)
sound.rate(rate)
sound.play()
```

### 4.3 Sons spéciaux

```javascript
// Klaxon avec limitation de fréquence
if(this.time.elapsed - this.klaxon.lastTime > 400) {
    this.physics.car.jump(false, 150)
    this.sounds.play(Math.random() < 0.002 ? 'carHorn2' : 'carHorn1')
}

// Son de crissement lors d'accélération forte
if(this.movement.localAcceleration.x > 0.03 && this.time.elapsed - this.movement.lastScreech > 5000) {
    this.sounds.play('screech')
}
```

---

## 5. Gestion des Collisions

### 5.1 Matériaux et contacts

```javascript
// Matériaux physiques
this.materials.items = {
    floor: new CANNON.Material('floorMaterial'),
    dummy: new CANNON.Material('dummyMaterial'),
    wheel: new CANNON.Material('wheelMaterial')
}

// Contacts entre matériaux
this.materials.contacts = {
    floorDummy: new CANNON.ContactMaterial(floor, dummy, {
        friction: 0.05,           // Friction faible
        restitution: 0.3,         // Restitution modérée
        contactEquationStiffness: 1000
    }),
    floorWheel: new CANNON.ContactMaterial(floor, wheel, {
        friction: 0.3,            // Friction modérée pour les roues
        restitution: 0,           // Pas de restitution
        contactEquationStiffness: 1000
    })
}
```

### 5.2 Détection de collisions

```javascript
// Événement de collision du châssis
this.car.chassis.body.addEventListener('collide', (event) => {
    if(event.body.mass === 0) {  // Collision avec objet statique
        const relativeVelocity = event.contact.getImpactVelocityAlongNormal()
        this.sounds.play('carHit', relativeVelocity)
    }
})
```

### 5.3 Création d'objets physiques

```javascript
// Création automatique depuis meshes Three.js
addObjectFromThree(options) {
    // Détection de la forme selon le nom
    if(mesh.name.match(/^cube_?[0-9]{0,3}?|box[0-9]{0,3}?$/i)) {
        shape = 'box'
    } else if(mesh.name.match(/^cylinder_?[0-9]{0,3}?$/i)) {
        shape = 'cylinder'
    } else if(mesh.name.match(/^sphere_?[0-9]{0,3}?$/i)) {
        shape = 'sphere'
    }
    
    // Création du corps physique
    const body = new CANNON.Body({
        position: new CANNON.Vec3(offset.x, offset.y, offset.z),
        mass: options.mass,
        material: this.materials.items.dummy
    })
}
```

---

## 6. Gestion des Ombres

### 6.1 Système d'ombres dynamiques

```javascript
// Configuration de l'ombre du châssis
this.shadows.add(this.chassis.object, { 
    sizeX: 3,        // Taille X de l'ombre
    sizeY: 2,        // Taille Y de l'ombre
    offsetZ: 0.2     // Décalage vertical
})
```

### 6.2 Calcul de projection

```javascript
// Position du soleil
this.sun.position = new THREE.Vector3(-2.5, -2.65, 3.75)

// Calcul du vecteur de projection
this.sun.vector.copy(this.sun.position).multiplyScalar(1 / this.sun.position.z).negate()

// Position de l'ombre
const z = Math.max(reference.position.z + offsetZ, 0)
const sunOffset = this.sun.vector.clone().multiplyScalar(z)
shadow.mesh.position.x = reference.position.x + sunOffset.x
shadow.mesh.position.y = reference.position.y + sunOffset.y
```

### 6.3 Transparence dynamique

```javascript
// Calcul de l'alpha basé sur la distance
let alpha = (this.maxDistance - z) / this.maxDistance
alpha = Math.min(Math.max(alpha, 0), 1)
alpha = Math.pow(alpha, this.distancePower)

// Alpha final combinant tous les facteurs
shadow.material.uniforms.uAlpha.value = this.alpha * shadow.alpha * orientationAlpha * alpha
```

---

## 7. Shaders et Matériaux

### 7.1 Matériau Matcap personnalisé

Le véhicule utilise un matériau shader personnalisé basé sur la technique Matcap :

```javascript
// Uniformes du shader
const uniforms = {
    ...THREE.UniformsLib.common,
    matcap: { value: null },                    // Texture Matcap
    uRevealProgress: { value: null },           // Animation de révélation
    
    // Éclairage indirect basé sur la distance
    uIndirectDistanceAmplitude: { value: null },
    uIndirectDistanceStrength: { value: null },
    uIndirectDistancePower: { value: null },
    
    // Éclairage indirect basé sur l'angle
    uIndirectAngleStrength: { value: null },
    uIndirectAngleOffset: { value: null },
    uIndirectAnglePower: { value: null },
    
    uIndirectColor: { value: null }             // Couleur de l'éclairage
}
```

### 7.2 Shader Vertex

```glsl
// Animation de révélation
float distanceToCenter = length(worldPosition);
float zAmplitude = 3.2;
float revealProgress = (uRevealProgress - distanceToCenter / 30.0) * 5.0;
revealProgress = 1.0 - clamp(revealProgress, -0.1, 1.0);
revealProgress = pow(revealProgress, 2.0);
worldPosition.z -= revealProgress * zAmplitude;
```

### 7.3 Shader Fragment

```glsl
// Éclairage indirect avec Matcap
uniform sampler2D matcap;
uniform vec3 uIndirectColor;
uniform float uIndirectDistanceAmplitude;
uniform float uIndirectAngleStrength;

// Calcul de l'éclairage indirect basé sur la distance et l'angle
// Application de la texture Matcap
// Combinaison avec l'éclairage indirect
```

### 7.4 Matériaux des feux

```javascript
// Feux de freinage (rouge)
this.backLightsBrake.material = this.materials.pures.items.red.clone()
this.backLightsBrake.material.transparent = true
this.backLightsBrake.material.opacity = 0.5

// Feux de marche arrière (jaune)
this.backLightsReverse.material = this.materials.pures.items.yellow.clone()
this.backLightsReverse.material.transparent = true
this.backLightsReverse.material.opacity = 0.5

// Animation selon les actions
this.backLightsBrake.material.opacity = this.physics.controls.actions.brake ? 1 : 0.5
this.backLightsReverse.material.opacity = this.physics.controls.actions.down ? 1 : 0.5
```

---

## 8. Fonctionnalités Spéciales

### 8.1 Tir de boules (CyberTruck)

```javascript
// Gestion avec la touche B
window.addEventListener('keydown', (event) => {
    if(event.key === 'b') {
        // Position aléatoire autour de la voiture
        const angle = Math.random() * Math.PI * 2
        const distance = 10
        const x = this.position.x + Math.cos(angle) * distance
        const y = this.position.y + Math.sin(angle) * distance
        const z = 2 + 2 * Math.random()
        
        // Création de la boule de bowling
        const bowlingBall = this.objects.add({
            base: this.resources.items.bowlingBallBase.scene,
            collision: this.resources.items.bowlingBallCollision.scene,
            offset: new THREE.Vector3(x, y, z),
            rotation: new THREE.Euler(Math.PI * 0.5, 0, 0),
            duplicated: true,
            shadow: { sizeX: 1.5, sizeY: 1.5, offsetZ: -0.15, alpha: 0.35 },
            mass: 5,
            soundName: 'bowlingBall',
            sleep: false
        })
        
        // Application de l'impulsion
        const direction = carPosition.vsub(bowlingBall.collision.body.position)
        direction.normalize().scale(100)
        bowlingBall.collision.body.applyImpulse(direction, bowlingBall.collision.body.position)
    }
})
```

### 8.2 Pluie de klaxons

```javascript
// Gestion avec la touche K
if(event.key === 'k') {
    const x = this.position.x + (Math.random() - 0.5) * 3
    const y = this.position.y + (Math.random() - 0.5) * 3
    const z = 6 + 2 * Math.random()
    
    // Création d'un klaxon qui tombe
    this.objects.add({
        base: this.resources.items.hornBase.scene,
        collision: this.resources.items.hornCollision.scene,
        offset: new THREE.Vector3(x, y, z),
        rotation: new THREE.Euler(Math.random() * Math.PI * 2, Math.random() * Math.PI * 2, Math.random() * Math.PI * 2),
        duplicated: true,
        shadow: { sizeX: 1.5, sizeY: 1.5, offsetZ: -0.15, alpha: 0.35 },
        mass: 5,
        soundName: 'horn',
        sleep: false
    })
}
```

### 8.3 Contrôles de debug

```javascript
// TransformControls pour manipulation manuelle
this.transformControls = new TransformControls(this.camera.instance, this.renderer.domElement)
this.transformControls.size = 0.5
this.transformControls.attach(this.chassis.object)
this.transformControls.enabled = false

// Raccourcis clavier
document.addEventListener('keydown', (event) => {
    if(event.key === 'r') {
        this.transformControls.setMode('rotate')
    } else if(event.key === 'g') {
        this.transformControls.setMode('translate')
    }
})
```

---

## 9. Optimisations et Performance

### 9.1 Gestion du sommeil

```javascript
// Objets endormis pour économiser les calculs
collision.body.allowSleep = true
collision.body.sleepSpeedLimit = 0.01

// Châssis sans sommeil pour réactivité
this.car.chassis.body.allowSleep = false
```

### 9.2 Limitation de fréquence

```javascript
// Sons avec délai minimum
minDelta: 100,  // 100ms entre deux lectures

// Vérification avant lecture
if(time > item.lastTime + item.minDelta) {
    // Lecture du son
}
```

### 9.3 Synchronisation optimisée

```javascript
// Mise à jour conditionnelle
if(!this.transformControls.enabled) {
    // Synchronisation physique-visuel
}
```

---

## 10. Interface de Debug

### 10.1 Contrôles de physique

```javascript
// Paramètres du châssis
this.car.debugFolder.add(this.car.options, 'chassisWidth').onFinishChange(this.car.recreate)
this.car.debugFolder.add(this.car.options, 'chassisHeight').onFinishChange(this.car.recreate)
this.car.debugFolder.add(this.car.options, 'chassisDepth').onFinishChange(this.car.recreate)

// Paramètres des roues
this.car.debugFolder.add(this.car.options, 'wheelRadius').onFinishChange(this.car.recreate)
this.car.debugFolder.add(this.car.options, 'wheelSuspensionStiffness').onFinishChange(this.car.recreate)

// Paramètres de contrôle
this.car.debugFolder.add(this.car.options, 'controlsSteeringSpeed')
this.car.debugFolder.add(this.car.options, 'controlsAcceleratingSpeed')
```

### 10.2 Contrôles d'ombres

```javascript
// Paramètres d'ombres
this.debugFolder.add(this, 'alpha').step(0.01).min(0).max(1)
this.debugFolder.add(this, 'maxDistance').step(0.01).min(0).max(10)
this.debugFolder.add(this, 'distancePower').step(0.01).min(1).max(5)

// Position du soleil
folder.add(this.sun.position, 'x').onChange(this.sun.update)
folder.add(this.sun.position, 'y').onChange(this.sun.update)
folder.add(this.sun.position, 'z').onChange(this.sun.update)
```

### 10.3 Contrôles audio

```javascript
// Volume principal
this.debugFolder.add(this, 'masterVolume').onChange(() => {
    Howler.volume(this.masterVolume)
})

// Paramètres du moteur
folder.add(this.engine, 'speedMultiplier')
folder.add(this.engine, 'accelerationMultiplier')
folder.add(this.engine.rate, 'min')
folder.add(this.engine.rate, 'max')
```

---

## Conclusion

Le système de véhicule de ce portfolio 3D est un exemple complexe d'intégration de multiples technologies :

- **Physique réaliste** avec Cannon.js et RaycastVehicle
- **Rendu 3D** avec Three.js et shaders personnalisés
- **Audio dynamique** avec Howler.js
- **Ombres réalistes** avec projection solaire
- **Contrôles intuitifs** clavier et tactile
- **Effets visuels** et fonctionnalités spéciales

Cette architecture modulaire permet une maintenance facile et des extensions futures, tout en offrant une expérience utilisateur immersive et réaliste.
