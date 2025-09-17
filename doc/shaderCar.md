# Shaders sur la Voiture - Portfolio 3D

## Vue d'ensemble

La voiture du portfolio utilise un **système de shaders sophistiqué** basé sur la technique **Matcap** (Material Capture) combinée à des matériaux purs pour créer un rendu photoréaliste. Le système utilise un **parsing automatique** basé sur les noms des objets dans Blender pour appliquer les matériaux appropriés.

## Architecture du Système de Shaders

### 1. Système de Parsing Intelligent 🧠

La voiture utilise un **système de parsing automatique** qui analyse les noms des objets dans Blender et applique automatiquement les matériaux appropriés.

#### A. Parsing des Matériaux Matcap (shade*)

**Fichier :** `src/javascript/World/Objects.js` (lignes 118-151)

```javascript
// Parser pour les matériaux matcap (shade*)
{
    regex: /^shade([a-z]+)_?[0-9]{0,3}?/i,  // Regex pour identifier les objets matcap
    apply: (_mesh, _options) => {
        // Extraction du nom du matériau depuis le nom de l'objet
        const match = _mesh.name.match(/^shade([a-z]+)_?[0-9]{0,3}?/i)
        const materialName = `${match[1].substring(0, 1).toLowerCase()}${match[1].substring(1)}`
        let material = this.materials.shades.items[materialName]

        // Matériau par défaut si le matériau spécifique n'existe pas
        if(typeof material === 'undefined') {
            material = new THREE.MeshNormalMaterial()  // Matériau de fallback
        }

        // Création du mesh avec le nouveau matériau
        const mesh = _options.duplicated ? _mesh.clone() : _mesh
        mesh.material = material  // Application du matériau

        // Application du matériau aux enfants si présents
        if(mesh.children.length) {
            for(const _child of mesh.children) {
                if(_child instanceof THREE.Mesh) {
                    _child.material = material  // Application du matériau aux enfants
                }
            }
        }

        return mesh
    }
}
```

**Fonctionnement :**
- **Regex** : `/^shade([a-z]+)_?[0-9]{0,3}?/i` détecte les objets nommés `shade*`
- **Extraction** : Le nom du matériau est extrait (ex: `shadeMetal_01` → `Metal`)
- **Conversion** : PascalCase vers camelCase (`Metal` → `metal`)
- **Application** : Le matériau matcap correspondant est appliqué
- **Fallback** : Si le matériau n'existe pas, utilise `MeshNormalMaterial`

#### B. Parsing des Matériaux Purs (pure*)

```javascript
// Parser pour les matériaux purs (pure*)
{
    regex: /^pure([a-z]+)_?[0-9]{0,3}?/i,
    apply: (_mesh, _options) => {
        const match = _mesh.name.match(/^pure([a-z]+)_?[0-9]{0,3}?/i)
        const materialName = match[1].toLowerCase()
        let material = this.materials.pures.items[materialName]

        // Matériau par défaut si le matériau spécifique n'existe pas
        if(typeof material === 'undefined') {
            material = new THREE.MeshNormalMaterial()  // Matériau de fallback
        }

        const mesh = _options.duplicated ? _mesh.clone() : _mesh
        mesh.material = material  // Application du matériau

        return mesh
    }
}
```

**Fonctionnement :**
- **Regex** : `/^pure([a-z]+)_?[0-9]{0,3}?/i` détecte les objets nommés `pure*`
- **Extraction** : Le nom du matériau est extrait (ex: `pureRed_01` → `Red`)
- **Application** : Le matériau pur correspondant est appliqué

### 2. Application sur les Composants de la Voiture 🔧

#### A. Châssis Principal

**Fichier :** `src/javascript/World/Car.js` (ligne 220)

```javascript
/**
 * SetChassis - Configuration du châssis principal de la voiture
 */
setChassis() {
    // Configuration du châssis principal
    this.chassis = {}
    this.chassis.offset = new THREE.Vector3(0, 0, - 0.28)

    // Création de l'objet 3D du châssis à partir du modèle
    this.chassis.object = this.objects.getConvertedMesh(this.models.chassis.scene.children)
    this.chassis.object.position.copy(this.physics.car.chassis.body.position)
    this.chassis.oldPosition = this.chassis.object.position.clone()
    this.container.add(this.chassis.object)

    // Configuration de l'ombre portée du châssis
    this.shadows.add(this.chassis.object, { 
        sizeX: 3,      // Taille X de l'ombre
        sizeY: 2,      // Taille Y de l'ombre
        offsetZ: 0.2   // Décalage vertical de l'ombre
    })
}
```

**Processus d'application des shaders :**
1. Le modèle 3D du châssis est chargé depuis Blender
2. `getConvertedMesh()` parcourt tous les enfants du modèle
3. Pour chaque mesh avec un nom comme `shadeMetal_01`, `shadeWhite_02`, etc.
4. Le parser matcap extrait le nom du matériau (`Metal`, `White`)
5. Le matériau matcap correspondant est appliqué automatiquement

#### B. Antenne

**Fichier :** `src/javascript/World/Car.js` (ligne 281)

```javascript
/**
 * SetAntena - Configuration de l'antenne avec simulation physique réaliste
 */
setAntena() {
    // Configuration de l'antenne
    this.antena = {}

    // Paramètres de simulation physique
    this.antena.speedStrength = 10
    this.antena.damping = 0.035
    this.antena.pullBackStrength = 0.02

    // Création de l'objet 3D de l'antenne à partir du modèle
    this.antena.object = this.objects.getConvertedMesh(this.models.antena.scene.children)
    this.chassis.object.add(this.antena.object)
}
```

**Application des shaders :**
- L'antenne utilise le même système de parsing automatique
- Les matériaux matcap sont appliqués selon les noms des objets dans Blender
- L'antenne hérite des transformations du châssis

#### C. Feux Arrière

**Fichier :** `src/javascript/World/Car.js` (lignes 355-399)

```javascript
/**
 * SetBackLights - Configuration des feux arrière
 */
setBackLights() {
    // Configuration des feux de freinage
    this.backLightsBrake = {}

    // Matériau rouge pour les feux de freinage
    this.backLightsBrake.material = this.materials.pures.items.red.clone()
    this.backLightsBrake.material.transparent = true
    this.backLightsBrake.material.opacity = 0.5

    // Création de l'objet 3D des feux de freinage
    this.backLightsBrake.object = this.objects.getConvertedMesh(this.models.backLightsBrake.scene.children)
    for(const _child of this.backLightsBrake.object.children) {
        _child.material = this.backLightsBrake.material  // Application manuelle du matériau
    }

    this.chassis.object.add(this.backLightsBrake.object)

    // Configuration des feux de marche arrière
    this.backLightsReverse = {}

    // Matériau jaune pour les feux de marche arrière
    this.backLightsReverse.material = this.materials.pures.items.yellow.clone()
    this.backLightsReverse.material.transparent = true
    this.backLightsReverse.material.opacity = 0.5

    // Création de l'objet 3D des feux de marche arrière
    this.backLightsReverse.object = this.objects.getConvertedMesh(this.models.backLightsReverse.scene.children)
    for(const _child of this.backLightsReverse.object.children) {
        _child.material = this.backLightsReverse.material  // Application manuelle du matériau
    }

    this.chassis.object.add(this.backLightsReverse.object)

    // Animation des feux selon les actions
    this.time.on('tick', () => {
        // Activation des feux de freinage
        this.backLightsBrake.material.opacity = this.physics.controls.actions.brake ? 1 : 0.5
        // Activation des feux de marche arrière
        this.backLightsReverse.material.opacity = this.physics.controls.actions.down ? 1 : 0.5
    })
}
```

**Caractéristiques des feux :**
- **Matériaux purs** : Utilisation de `MeshBasicMaterial` pour les couleurs
- **Transparence** : Opacité variable selon les actions (freinage, marche arrière)
- **Animation** : Opacité dynamique basée sur les contrôles de la voiture
- **Application manuelle** : Override du système de parsing pour des matériaux spécifiques

#### D. Roues

**Fichier :** `src/javascript/World/Car.js` (lignes 407-440)

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
        this.container.add(object)
    }

    // Synchronisation avec la physique
    this.time.on('tick', () => {
        if(!this.transformControls.enabled) {
            // Mise à jour de chaque roue avec la physique
            for(const _wheelKey in this.physics.car.wheels.bodies) {
                const wheelBody = this.physics.car.wheels.bodies[_wheelKey]
                const wheelObject = this.wheels.items[_wheelKey]

                // Synchronisation de la position et de la rotation
                wheelObject.position.copy(wheelBody.position)
                wheelObject.quaternion.copy(wheelBody.quaternion)
            }
        }
    })
}
```

**Application des shaders sur les roues :**
- Les roues utilisent le système de parsing automatique
- Chaque roue est clonée à partir du modèle de base
- Les matériaux matcap sont appliqués selon les noms des objets
- Synchronisation avec la physique pour les rotations

### 3. Matériaux Disponibles pour la Voiture 🎨

#### A. Matériaux Matcap (avec shaders personnalisés)

**Fichier :** `src/javascript/World/Materials.js` (lignes 128-255)

```javascript
/**
 * SetShades - Configuration des matériaux matcap
 */
setShades() {
    // Configuration du conteneur des matériaux matcap
    this.shades = {}
    this.shades.items = {}

    // Matériau matcap blanc
    this.shades.items.white = new Matcap()
    this.shades.items.white.name = 'shadeWhite'
    this.shades.items.white.uniforms.matcap.value = this.resources.items.matcapWhiteTexture
    this.items.white = this.shades.items.white

    // Matériau matcap orange
    this.shades.items.orange = new Matcap()
    this.shades.items.orange.name = 'shadeOrange'
    this.shades.items.orange.uniforms.matcap.value = this.resources.items.matcapOrangeTexture
    this.items.orange = this.shades.items.orange

    // Matériau matcap vert
    this.shades.items.green = new Matcap()
    this.shades.items.green.name = 'shadeGreen'
    this.shades.items.green.uniforms.matcap.value = this.resources.items.matcapGreenTexture
    this.items.green = this.shades.items.green

    // Matériau matcap marron
    this.shades.items.brown = new Matcap()
    this.shades.items.brown.name = 'shadeBrown'
    this.shades.items.brown.uniforms.matcap.value = this.resources.items.matcapBrownTexture
    this.items.brown = this.shades.items.brown

    // Matériau matcap gris
    this.shades.items.gray = new Matcap()
    this.shades.items.gray.name = 'shadeGray'
    this.shades.items.gray.uniforms.matcap.value = this.resources.items.matcapGrayTexture
    this.items.gray = this.shades.items.gray

    // Matériau matcap beige
    this.shades.items.beige = new Matcap()
    this.shades.items.beige.name = 'shadeBeige'
    this.shades.items.beige.uniforms.matcap.value = this.resources.items.matcapBeigeTexture
    this.items.beige = this.shades.items.beige

    // Matériau matcap rouge
    this.shades.items.red = new Matcap()
    this.shades.items.red.name = 'shadeRed'
    this.shades.items.red.uniforms.matcap.value = this.resources.items.matcapRedTexture
    this.items.red = this.shades.items.red

    // Matériau matcap noir
    this.shades.items.black = new Matcap()
    this.shades.items.black.name = 'shadeBlack'
    this.shades.items.black.uniforms.matcap.value = this.resources.items.matcapBlackTexture
    this.items.black = this.shades.items.black

    // Matériau matcap vert émeraude
    this.shades.items.emeraldGreen = new Matcap()
    this.shades.items.emeraldGreen.name = 'shadeEmeraldGreen'
    this.shades.items.emeraldGreen.uniforms.matcap.value = this.resources.items.matcapEmeraldGreenTexture
    this.items.emeraldGreen = this.shades.items.emeraldGreen

    // Matériau matcap violet
    this.shades.items.purple = new Matcap()
    this.shades.items.purple.name = 'shadePurple'
    this.shades.items.purple.uniforms.matcap.value = this.resources.items.matcapPurpleTexture
    this.items.purple = this.shades.items.purple

    // Matériau matcap bleu
    this.shades.items.blue = new Matcap()
    this.shades.items.blue.name = 'shadeBlue'
    this.shades.items.blue.uniforms.matcap.value = this.resources.items.matcapBlueTexture
    this.items.blue = this.shades.items.blue

    // Matériau matcap jaune
    this.shades.items.yellow = new Matcap()
    this.shades.items.yellow.name = 'shadeYellow'
    this.shades.items.yellow.uniforms.matcap.value = this.resources.items.matcapYellowTexture
    this.items.yellow = this.shades.items.yellow

    // Matériau matcap métallique
    this.shades.items.metal = new Matcap()
    this.shades.items.metal.name = 'shadeMetal'
    this.shades.items.metal.uniforms.matcap.value = this.resources.items.matcapMetalTexture
    this.items.metal = this.shades.items.metal
}
```

**Caractéristiques des matériaux matcap :**
- **13 matériaux** différents disponibles
- **Shaders personnalisés** avec éclairage baked
- **Textures matcap** pré-calculées pour chaque matériau
- **Uniforms partagés** pour la cohérence visuelle

#### B. Matériaux Purs (couleurs simples)

```javascript
/**
 * SetPures - Configuration des matériaux de base (couleurs pures)
 */
setPures() {
    // Configuration du conteneur des matériaux purs
    this.pures = {}
    this.pures.items = {}

    // Matériau rouge pur
    this.pures.items.red = new THREE.MeshBasicMaterial({ 
        color: 0xff0000  // Rouge pur
    })
    this.pures.items.red.name = 'pureRed'
    this.items.red = this.pures.items.red

    // Matériau blanc pur
    this.pures.items.white = new THREE.MeshBasicMaterial({ 
        color: 0xffffff  // Blanc pur
    })
    this.pures.items.white.name = 'pureWhite'
    this.items.white = this.pures.items.white

    // Matériau jaune personnalisé
    this.pures.items.yellow = new THREE.MeshBasicMaterial({ 
        color: 0xffe889  // Jaune personnalisé
    })
    this.pures.items.yellow.name = 'pureYellow'
    this.items.yellow = this.pures.items.yellow
}
```

**Caractéristiques des matériaux purs :**
- **Couleurs de base** sans effets d'éclairage
- **Matériaux simples** pour les éléments qui n'ont pas besoin de shaders
- **Utilisés principalement** pour les feux et éléments d'interface

### 4. Uniforms Partagés ⚙️

Tous les matériaux matcap de la voiture partagent les mêmes uniforms pour assurer la cohérence visuelle :

```javascript
// Uniforms partagés entre tous les matériaux matcap
this.shades.uniforms = {
    uRevealProgress: 0,                    // Progression de l'animation de révélation
    uIndirectDistanceAmplitude: 1.75,     // Amplitude de l'effet de distance
    uIndirectDistanceStrength: 0.5,       // Force de l'effet de distance
    uIndirectDistancePower: 2.0,          // Puissance de l'effet de distance
    uIndirectAngleStrength: 1.5,          // Force de l'effet d'angle
    uIndirectAngleOffset: 0.6,            // Décalage de l'effet d'angle
    uIndirectAnglePower: 1.0,             // Puissance de l'effet d'angle
    uIndirectColor: null                  // Couleur de l'éclairage indirect
}
```

### 5. Mise à Jour en Temps Réel 🔄

**Fichier :** `src/javascript/World/Materials.js` (lignes 234-251)

```javascript
/**
 * Fonction de mise à jour des uniforms de tous les matériaux matcap
 */
this.shades.updateMaterials = () => {
    // Conversion de la couleur indirecte en objet THREE.Color
    this.shades.uniforms.uIndirectColor = new THREE.Color(this.shades.indirectColor)

    // Mise à jour de chaque uniform pour chaque matériau
    for(const _uniformName in this.shades.uniforms) {
        const _uniformValue = this.shades.uniforms[_uniformName]

        // Application de l'uniform à tous les matériaux matcap
        for(const _materialKey in this.shades.items) {
            const material = this.shades.items[_materialKey]
            material.uniforms[_uniformName].value = _uniformValue
        }
    }
}

// Mise à jour initiale des matériaux
this.shades.updateMaterials()
```

**Fonctionnement :**
- **Synchronisation** : Tous les matériaux matcap sont mis à jour simultanément
- **Cohérence** : Les mêmes paramètres d'éclairage sont appliqués partout
- **Performance** : Mise à jour groupée pour optimiser les performances

### 6. Exemple Concret : Configuration Blender 🎯

Voici comment un châssis de voiture serait configuré dans Blender :

```
Modèle 3D du châssis :
├── shadeMetal_01    → Matériau métallique (shader matcap)
├── shadeBlack_02    → Matériau noir (shader matcap)
├── shadeWhite_03    → Matériau blanc (shader matcap)
├── pureRed_04       → Matériau rouge pur (pas de shader)
└── center_01        → Point de centrage
```

**Résultat dans l'application :**
- `shadeMetal_01` → Matériau matcap métallique avec éclairage baked
- `shadeBlack_02` → Matériau matcap noir avec éclairage baked
- `shadeWhite_03` → Matériau matcap blanc avec éclairage baked
- `pureRed_04` → Matériau rouge pur sans shader

### 7. Processus de Conversion des Meshes 🔄

**Fichier :** `src/javascript/World/Objects.js` (lignes 358-413)

```javascript
/**
 * GetConvertedMesh - Conversion des meshes avec application des matériaux
 */
getConvertedMesh(_children, _options = {}) {
    const container = new THREE.Object3D()  // Conteneur pour les meshes convertis
    const center = new THREE.Vector3()      // Centre de l'objet

    // Parcours de tous les enfants de base
    const baseChildren = [..._children]

    for(const _child of baseChildren) {
        // Détection du centre de l'objet
        if(_child.name.match(/^center_?[0-9]{0,3}?/i)) {
            center.set(_child.position.x, _child.position.y, _child.position.z)
        }

        // Traitement des meshes
        if(_child instanceof THREE.Mesh) {
            // Recherche du parser approprié
            let parser = this.parsers.items.find((_item) => _child.name.match(_item.regex))
            if(typeof parser === 'undefined') {
                parser = this.parsers.default  // Parser par défaut si aucun trouvé
            }

            // Création du mesh en appliquant le parser
            const mesh = parser.apply(_child, _options)

            // Ajout au conteneur
            container.add(mesh)
        }
    }

    // Recentrage des enfants par rapport au centre
    if(center.length() > 0) {
        // Déplacement de tous les enfants vers le centre
        for(const _child of container.children) {
            _child.position.sub(center)
        }

        // Déplacement du conteneur vers le centre
        container.position.add(center)
    }

    // Optimisation pour les objets statiques (masse = 0)
    if(_options.mass && _options.mass === 0) {
        container.matrixAutoUpdate = false
        container.updateMatrix()
    }

    return container
}
```

**Étapes du processus :**
1. **Parcours des enfants** : Analyse de tous les objets du modèle
2. **Détection du centre** : Identification du point de centrage
3. **Application des parsers** : Attribution automatique des matériaux
4. **Recentrage** : Ajustement des positions par rapport au centre
5. **Optimisation** : Désactivation de la mise à jour automatique pour les objets statiques

### 8. Configuration des Modèles de Voiture 🚗

**Fichier :** `src/javascript/World/Car.js` (lignes 114-140)

```javascript
/**
 * SetModels - Configuration des modèles 3D de la voiture
 */
setModels() {
    // Initialisation du conteneur des modèles
    this.models = {}

    // Configuration CyberTruck (mode futuriste)
    if(this.config.cyberTruck) {
        this.models.chassis = this.resources.items.carCyberTruckChassis
        this.models.antena = this.resources.items.carCyberTruckAntena
        this.models.backLightsBrake = this.resources.items.carCyberTruckBackLightsBrake
        this.models.backLightsReverse = this.resources.items.carCyberTruckBackLightsReverse
        this.models.wheel = this.resources.items.carCyberTruckWheel
    }

    // Configuration par défaut (voiture standard)
    else {
        this.models.chassis = this.resources.items.carDefaultChassis
        this.models.antena = this.resources.items.carDefaultAntena
        this.models.backLightsBrake = this.resources.items.carDefaultBackLightsBrake
        this.models.backLightsReverse = this.resources.items.carDefaultBackLightsReverse
        this.models.wheel = this.resources.items.carDefaultWheel
    }
}
```

**Types de véhicules supportés :**
- **Voiture par défaut** : Modèle standard avec matériaux matcap
- **CyberTruck** : Modèle futuriste avec fonctionnalités spéciales
- **Composants identiques** : Châssis, antenne, feux, roues

### 9. Interface de Debug 🛠️

**Fichier :** `src/javascript/World/Materials.js` (lignes 256-271)

```javascript
// Configuration de l'interface de debug
if(this.debug) {
    // Contrôles pour l'éclairage indirect
    const indirectFolder = this.debugFolder.addFolder('indirect')
    indirectFolder.open()

    // Paramètres d'éclairage indirect
    indirectFolder.add(this.shades.uniforms, 'uIndirectDistanceAmplitude').step(0.001).min(0).max(10)
    indirectFolder.add(this.shades.uniforms, 'uIndirectDistanceStrength').step(0.001).min(0).max(2)
    indirectFolder.add(this.shades.uniforms, 'uIndirectDistancePower').step(0.001).min(0).max(10)
    indirectFolder.add(this.shades.uniforms, 'uIndirectAngleStrength').step(0.001).min(0).max(10)
    indirectFolder.add(this.shades.uniforms, 'uIndirectAngleOffset').step(0.001).min(-2).max(2)
    indirectFolder.add(this.shades.uniforms, 'uIndirectAnglePower').step(0.001).min(0).max(10)

    // Couleur de l'éclairage indirect
    indirectFolder.addColor(this.shades, 'indirectColor').onChange(() => {
        this.shades.updateMaterials()
    })

    // Contrôles pour la révélation
    const revealFolder = this.debugFolder.addFolder('reveal')
    revealFolder.add(this.shades.uniforms, 'uRevealProgress').step(0.001).min(0).max(1)
}
```

**Fonctionnalités de debug :**
- **Contrôles en temps réel** : Ajustement des paramètres d'éclairage
- **Visualisation** : Modification des couleurs et intensités
- **Tests** : Validation des effets visuels
- **Optimisation** : Ajustement des performances

### 10. Optimisations de Performance 🚀

#### A. Fusion de Géométries

**Fichier :** `src/javascript/World/Objects.js` (lignes 235-331)

```javascript
/**
 * SetMerge - Configuration du système de fusion de géométries
 */
setMerge() {
    // Configuration du système de fusion
    this.merge = {}
    this.merge.items = {}

    // Fonction d'ajout d'un mesh au système de fusion
    this.merge.add = (_name, _mesh) => {
        let mergeItem = this.merge.items[_name]

        // Création d'un élément de fusion s'il n'existe pas
        if(!mergeItem) {
            mergeItem = {}
            mergeItem.geometry = new THREE.BufferGeometry()
            mergeItem.geometriesToMerge = []
            mergeItem.material = _mesh.material
            mergeItem.material.side = THREE.DoubleSide
            mergeItem.mesh = new THREE.Mesh(mergeItem.geometry, mergeItem.material)
            this.merge.container.add(mergeItem.mesh)
            this.merge.items[_name] = mergeItem
        }

        // Application de la transformation de l'objet à la géométrie
        const geometry = _mesh.geometry
        _mesh.updateMatrixWorld()
        geometry.applyMatrix(_mesh.matrixWorld)
        mergeItem.geometriesToMerge.push(geometry)
    }

    // Fonction d'application de la fusion des géométries
    this.merge.applyMerge = () => {
        for(const _mergeItemName in this.merge.items) {
            const mergeItem = this.merge.items[_mergeItemName]
            mergeItem.geometry = BufferGeometryUtils.mergeGeometries(mergeItem.geometriesToMerge)
            mergeItem.mesh.geometry = mergeItem.geometry
        }
    }
}
```

**Avantages de la fusion :**
- **Réduction des draw calls** : Moins d'appels de rendu
- **Amélioration des performances** : Rendu plus fluide
- **Optimisation GPU** : Meilleure utilisation des ressources

#### B. Désactivation de la Mise à Jour Automatique

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

**Optimisations appliquées :**
- **Matrices statiques** : Pas de recalcul inutile
- **Objets fixes** : Optimisation pour les éléments qui ne bougent pas
- **Performance** : Réduction de la charge CPU

### 11. Résumé du Processus Complet 🎯

1. **Modélisation Blender** : 
   - Les objets sont nommés avec des préfixes (`shade*`, `pure*`)
   - Chaque composant a un nom spécifique

2. **Chargement des Ressources** : 
   - Les modèles 3D sont chargés via `Resources.js`
   - Les textures matcap sont associées aux matériaux

3. **Parsing Automatique** : 
   - Le système détecte les noms et applique les matériaux appropriés
   - Fallback vers des matériaux par défaut si nécessaire

4. **Application des Shaders** : 
   - Les matériaux matcap utilisent des shaders personnalisés
   - Les matériaux purs utilisent des couleurs de base

5. **Synchronisation** : 
   - Tous les matériaux matcap partagent les mêmes uniforms
   - Mise à jour en temps réel des paramètres d'éclairage

6. **Optimisations** : 
   - Fusion de géométries pour réduire les draw calls
   - Désactivation de la mise à jour automatique pour les objets statiques

7. **Interface de Debug** : 
   - Contrôles en temps réel pour ajuster les paramètres
   - Visualisation des effets d'éclairage

## Conclusion

Le système de shaders de la voiture est un exemple parfait d'**architecture modulaire et optimisée** qui combine :

- **Parsing automatique** basé sur les noms des objets
- **Matériaux matcap** avec éclairage baked pour un rendu photoréaliste
- **Matériaux purs** pour les éléments simples
- **Uniforms partagés** pour la cohérence visuelle
- **Optimisations de performance** avec fusion de géométries
- **Interface de debug** pour l'ajustement en temps réel

Ce système permet une **gestion automatique et cohérente** des matériaux sur la voiture, avec un rendu photoréaliste et des performances optimales ! ✨
