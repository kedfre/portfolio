# MATCAP - Guide Complet pour Débutants

## Qu'est-ce que le Matcap ? 🎯

**Matcap** = **Material Capture** (Capture de Matériau)

Le Matcap est une technique révolutionnaire en 3D qui permet de créer des matériaux photoréalistes **sans calculs de lumière complexes**. C'est comme avoir un "kit de matériaux pré-fabriqués" !

## Le Problème Traditionnel 😵

Normalement, pour créer un objet 3D réaliste, il faut :

```javascript
// Approche traditionnelle (compliquée)
- 5+ lumières directionnelles
- Calculs d'ombres en temps réel
- Gestion des reflets complexes
- Raytracing pour la qualité
- Résultat : 60 FPS → 20 FPS 😱
```

## La Solution Matcap ✨

Le Matcap, c'est **"tricher intelligemment"** :

### Principe Simple
Au lieu de calculer la lumière en temps réel, on utilise une **image pré-calculée** qui contient déjà tous les effets de lumière !

```
Image Matcap = Photo d'une sphère avec le matériau qu'on veut
```

### Comment ça marche
1. **Photographie** : On prend une sphère avec le matériau désiré
2. **Capture** : On la photographie sous tous les angles
3. **Application** : L'objet 3D "lit" cette carte selon son orientation
4. **Résultat** : Matériau photoréaliste instantané !

## Exemple Visuel

```
Sphère Matcap (image)     →    Objet 3D (résultat)
┌─────────────────┐            ┌─────────────────┐
│  🔴 Métal Rouge │            │  🚗 Voiture     │
│  ⚡ Reflets     │    applique │  Métallique     │
│  ✨ Brillance   │    ──────→ │  avec reflets   │
└─────────────────┘            └─────────────────┘
```

## Code Simplifié

```javascript
// Au lieu de ça (compliqué) :
const material = new THREE.MeshStandardMaterial({
    metalness: 0.8,
    roughness: 0.2,
    // + 5 lumières + ombres + reflets...
});

// On fait ça (simple) :
const material = new THREE.ShaderMaterial({
    uniforms: {
        matcap: { value: textureMetal }  // Une seule image !
    }
});
```

## Avantages du Matcap

### 🚀 Performance
- **Ultra rapide** : Pas de calculs de lumière
- **60 FPS** garantis même sur mobile
- **Une seule texture** au lieu de multiples lumières
- **GPU optimisé** : Calculs parallèles

### 🎨 Qualité
- **Rendu photoréaliste** : Basé sur de vraies photos
- **Effets complexes** : Reflets, brillance, métal, etc.
- **Cohérence** : Même éclairage partout
- **Détails fins** : Micro-reflets et variations

### 🛠️ Simplicité
- **Pas de lumières** à configurer
- **Une texture** = un matériau
- **Plug & play** : Tu changes la texture, tu changes le matériau
- **Debug facile** : Problème de rendu ? Change la texture !

## Types de Matcaps

### Métaux
- **Or** : Texture dorée avec reflets chauds
- **Argent** : Texture argentée avec reflets froids
- **Cuivre** : Texture cuivrée avec reflets orangés
- **Acier** : Texture grise avec reflets neutres

### Matériaux Organiques
- **Peau** : Texture de peau humaine
- **Bois** : Texture de bois avec grain
- **Cuir** : Texture de cuir avec plis
- **Cire** : Texture de cire avec transparence

### Matériaux Techniques
- **Plastique** : Texture plastique lisse
- **Céramique** : Texture céramique mate
- **Verre** : Texture de verre avec reflets
- **Caoutchouc** : Texture de caoutchouc mat

## Dans le Portfolio Bruno Simon

### Configuration
```javascript
// Le matériau Matcap du portfolio
uniforms: {
    matcap: { value: null },                    // Texture Matcap principale
    uRevealProgress: { value: null },           // Animation de révélation
    uIndirectDistanceAmplitude: { value: null }, // Effet de distance
    uIndirectDistanceStrength: { value: null },  // Force de distance
    uIndirectDistancePower: { value: null },     // Puissance de distance
    uIndirectAngleStrength: { value: null },     // Force d'angle
    uIndirectAngleOffset: { value: null },       // Décalage d'angle
    uIndirectAnglePower: { value: null },        // Puissance d'angle
    uIndirectColor: { value: null }              // Couleur indirecte
}
```

### Fonctionnalités Avancées
- **Animation de révélation** : Les objets apparaissent progressivement
- **Éclairage indirect** : Effets basés sur la distance et l'angle
- **Couleurs personnalisées** : Teinte des matériaux
- **Extensions WebGL** : Optimisations GPU

## Créer ses Propres Matcaps

### Méthode 1 : Photographie
1. **Sphère** : Utilise une sphère blanche
2. **Éclairage** : Éclaire uniformément
3. **Photo** : Prends une photo de face
4. **Traitement** : Ajuste les couleurs et contrastes

### Méthode 2 : Logiciels 3D
1. **Blender** : Crée une sphère avec le matériau
2. **Rendu** : Rends avec éclairage uniforme
3. **Export** : Exporte en texture 2D
4. **Optimisation** : Compresse pour le web

### Méthode 3 : Bibliothèques
- **Three.js** : Textures Matcap intégrées
- **Sketchfab** : Bibliothèque de Matcaps
- **Poly Haven** : Matcaps gratuits
- **Substance** : Matcaps professionnels

## Optimisations Web

### Formats de Texture
```javascript
// Formats recommandés
- WebP : Meilleure compression
- JPEG : Compatibilité maximale
- PNG : Transparence si nécessaire
- KTX2 : Compression GPU native
```

### Tailles Optimales
```javascript
// Tailles recommandées
- 256x256 : Mobile, performance
- 512x512 : Desktop, qualité
- 1024x1024 : Haute qualité
- 2048x2048 : Ultra qualité (attention au poids)
```

### Compression
```javascript
// Techniques de compression
- Draco : Compression géométrie
- Basis : Compression texture
- LZ4 : Compression rapide
- Gzip : Compression standard
```

## Cas d'Usage

### Portfolio Web
- **Performance** : Site rapide même avec beaucoup d'objets
- **Qualité** : Rendu professionnel
- **Mobile** : Fonctionne sur tous les appareils
- **SEO** : Temps de chargement optimisé

### Jeux Vidéo
- **60 FPS** : Performance constante
- **Batterie** : Moins de consommation
- **Compatibilité** : Fonctionne sur tous les GPU
- **Développement** : Itération rapide

### Applications 3D
- **Prototypage** : Test rapide de matériaux
- **Présentation** : Rendu immédiat
- **Éducation** : Apprentissage simplifié
- **Art** : Création artistique

## Limitations

### Contraintes
- **Éclairage fixe** : Pas de changement d'éclairage dynamique
- **Ombres limitées** : Pas d'ombres portées complexes
- **Reflets statiques** : Reflets pré-calculés
- **Interactions** : Pas de réaction à la lumière

### Solutions
- **Hybride** : Combine Matcap + éclairage dynamique
- **Multi-Matcap** : Plusieurs textures selon l'angle
- **Post-processing** : Effets additionnels
- **LOD** : Niveaux de détail

## Ressources

### Bibliothèques
- [Three.js Matcaps](https://threejs.org/examples/webgl_materials_matcap.html)
- [Sketchfab Matcaps](https://sketchfab.com/3d-models?features=downloadable&sort_by=-likeCount&type=models)
- [Poly Haven](https://polyhaven.com/textures)
- [Substance Source](https://source.substance3d.com/)

### Outils
- [Blender](https://www.blender.org/) : Création 3D
- [Substance Painter](https://www.substance3d.com/products/substance-painter/) : Texturing
- [Photoshop](https://www.adobe.com/products/photoshop.html) : Édition d'images
- [GIMP](https://www.gimp.org/) : Alternative gratuite

### Tutoriels
- [Three.js Matcap Tutorial](https://threejs.org/docs/#api/en/materials/MeshMatcapMaterial)
- [Blender Matcap Creation](https://www.youtube.com/watch?v=example)
- [WebGL Matcap Shader](https://www.shadertoy.com/view/example)

## Guide Intermédiaire - Implémentation Technique

### Architecture des Shaders Matcap

#### Vertex Shader
```glsl
// Calcul de la normale en espace monde
vec3 worldNormal = normalize(normalMatrix * normal);

// Projection de la normale sur la sphère Matcap
vec2 matcapUV = worldNormal.xy * 0.5 + 0.5;

// Passage au fragment shader
vMatcapUV = matcapUV;
```

#### Fragment Shader
```glsl
// Échantillonnage de la texture Matcap
vec4 matcapColor = texture2D(matcap, vMatcapUV);

// Application des effets indirects
vec3 indirectLight = calculateIndirectLighting();

// Combinaison finale
gl_FragColor = vec4(matcapColor.rgb * indirectLight, 1.0);
```

### Système d'Uniformes Avancé

#### Structure des Uniformes
```javascript
const uniforms = {
    // Matcap principal
    matcap: { value: null },
    
    // Animation de révélation
    uRevealProgress: { value: 0.0 },
    
    // Éclairage indirect basé sur la distance
    uIndirectDistanceAmplitude: { value: 1.0 },
    uIndirectDistanceStrength: { value: 0.5 },
    uIndirectDistancePower: { value: 2.0 },
    
    // Éclairage indirect basé sur l'angle
    uIndirectAngleStrength: { value: 0.3 },
    uIndirectAngleOffset: { value: 0.0 },
    uIndirectAnglePower: { value: 1.5 },
    
    // Couleur et teinte
    uIndirectColor: { value: new THREE.Color(0xffffff) }
};
```

#### Gestion Dynamique des Uniformes
```javascript
// Mise à jour en temps réel
function updateMatcapUniforms(material, options) {
    material.uniforms.uRevealProgress.value = options.revealProgress;
    material.uniforms.uIndirectDistanceAmplitude.value = options.distanceAmplitude;
    material.uniforms.uIndirectColor.value.setHex(options.color);
    
    // Mise à jour des flags de rendu
    material.needsUpdate = true;
}
```

### Optimisations Avancées

#### Gestion de la Mémoire GPU
```javascript
// Réutilisation des textures
const textureCache = new Map();

function getMatcapTexture(path) {
    if (textureCache.has(path)) {
        return textureCache.get(path);
    }
    
    const texture = new THREE.TextureLoader().load(path);
    textureCache.set(path, texture);
    return texture;
}

// Compression des textures
const compressedTexture = new THREE.CompressedTextureLoader().load(
    'texture.ktx2',
    (texture) => {
        texture.colorSpace = THREE.SRGBColorSpace;
        material.uniforms.matcap.value = texture;
    }
);
```

#### Instancing pour Performance
```javascript
// Matériau instancié
const instancedMaterial = new THREE.ShaderMaterial({
    uniforms: uniforms,
    vertexShader: instancedVertexShader,
    fragmentShader: fragmentShader,
    instanced: true
});

// Gestion des instances
const instancedMesh = new THREE.InstancedMesh(
    geometry,
    instancedMaterial,
    instanceCount
);
```

### Système de Révélation Avancé

#### Animation de Révélation
```javascript
// Timeline de révélation
const revealTimeline = gsap.timeline();

revealTimeline
    .to(material.uniforms.uRevealProgress, {
        value: 1.0,
        duration: 2.0,
        ease: "power2.out"
    })
    .to(material.uniforms.uIndirectDistanceAmplitude, {
        value: 0.0,
        duration: 1.0,
        ease: "power2.inOut"
    }, "-=0.5");
```

#### Révélation Basée sur la Distance
```glsl
// Dans le fragment shader
float distanceToCamera = length(vWorldPosition - cameraPosition);
float revealFactor = smoothstep(uRevealDistance, uRevealDistance + uRevealFade, distanceToCamera);
float finalReveal = uRevealProgress * revealFactor;

// Application de la révélation
gl_FragColor.a = finalReveal;
```

### Éclairage Indirect Personnalisé

#### Calcul de l'Éclairage Indirect
```glsl
// Fonction d'éclairage indirect
vec3 calculateIndirectLighting() {
    // Éclairage basé sur la distance
    float distanceFactor = pow(1.0 - distance(vWorldPosition, uLightPosition) / uMaxDistance, uIndirectDistancePower);
    vec3 distanceLight = uIndirectColor * distanceFactor * uIndirectDistanceStrength;
    
    // Éclairage basé sur l'angle
    float angleFactor = pow(max(0.0, dot(normalize(vWorldNormal), uLightDirection)), uIndirectAnglePower);
    vec3 angleLight = uIndirectColor * angleFactor * uIndirectAngleStrength;
    
    // Combinaison
    return distanceLight + angleLight;
}
```

#### Système de Lumières Multiples
```javascript
// Gestion de plusieurs sources d'éclairage
const lightSources = [
    { position: new THREE.Vector3(0, 0, 10), color: 0xff0000, strength: 1.0 },
    { position: new THREE.Vector3(10, 0, 0), color: 0x00ff00, strength: 0.5 },
    { position: new THREE.Vector3(0, 10, 0), color: 0x0000ff, strength: 0.3 }
];

// Mise à jour des uniformes
lightSources.forEach((light, index) => {
    material.uniforms[`uLight${index}Position`] = { value: light.position };
    material.uniforms[`uLight${index}Color`] = { value: new THREE.Color(light.color) };
    material.uniforms[`uLight${index}Strength`] = { value: light.strength };
});
```

### Gestion des États et Transitions

#### Système de Transitions
```javascript
class MatcapTransition {
    constructor(material) {
        this.material = material;
        this.currentTexture = null;
        this.targetTexture = null;
        this.transitionProgress = 0.0;
    }
    
    transitionTo(newTexture, duration = 1.0) {
        this.targetTexture = newTexture;
        
        gsap.to(this, {
            transitionProgress: 1.0,
            duration: duration,
            ease: "power2.inOut",
            onUpdate: () => {
                this.updateTransition();
            },
            onComplete: () => {
                this.currentTexture = this.targetTexture;
                this.transitionProgress = 0.0;
            }
        });
    }
    
    updateTransition() {
        // Mélange des textures
        this.material.uniforms.uTransitionProgress.value = this.transitionProgress;
        this.material.uniforms.uCurrentMatcap.value = this.currentTexture;
        this.material.uniforms.uTargetMatcap.value = this.targetTexture;
    }
}
```

#### Gestion des LOD (Level of Detail)
```javascript
// Système de LOD pour les Matcaps
const matcapLODs = {
    high: { resolution: 1024, texture: null },
    medium: { resolution: 512, texture: null },
    low: { resolution: 256, texture: null }
};

function updateMatcapLOD(distance) {
    let targetLOD;
    
    if (distance < 10) {
        targetLOD = 'high';
    } else if (distance < 50) {
        targetLOD = 'medium';
    } else {
        targetLOD = 'low';
    }
    
    material.uniforms.matcap.value = matcapLODs[targetLOD].texture;
}
```

### Debug et Profiling

#### Outils de Debug
```javascript
// Interface de debug avancée
const debugFolder = gui.addFolder('Matcap Debug');

debugFolder.add(material.uniforms.uRevealProgress, 'value', 0, 1).name('Reveal Progress');
debugFolder.add(material.uniforms.uIndirectDistanceAmplitude, 'value', 0, 2).name('Distance Amplitude');
debugFolder.add(material.uniforms.uIndirectAngleStrength, 'value', 0, 1).name('Angle Strength');

// Contrôle des couleurs
const colorController = debugFolder.addColor(material.uniforms.uIndirectColor, 'value');
colorController.onChange((value) => {
    material.uniforms.uIndirectColor.value.setHex(value);
});
```

#### Profiling de Performance
```javascript
// Mesure des performances
const performanceMonitor = {
    frameCount: 0,
    lastTime: performance.now(),
    
    update() {
        this.frameCount++;
        const currentTime = performance.now();
        
        if (currentTime - this.lastTime >= 1000) {
            const fps = this.frameCount;
            console.log(`FPS: ${fps}, Matcap Draw Calls: ${renderer.info.render.calls}`);
            
            this.frameCount = 0;
            this.lastTime = currentTime;
        }
    }
};
```

### Intégration avec Post-Processing

#### Effets Post-Processing
```javascript
// Intégration avec EffectComposer
const composer = new EffectComposer(renderer);

// Pass de rendu principal
const renderPass = new RenderPass(scene, camera);
composer.addPass(renderPass);

// Pass de bloom pour les reflets
const bloomPass = new UnrealBloomPass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    1.5,  // strength
    0.4,  // radius
    0.85  // threshold
);
composer.addPass(bloomPass);

// Pass de tonemapping
const tonemapPass = new ToneMapPass();
composer.addPass(tonemapPass);
```

#### Shader de Post-Processing Personnalisé
```glsl
// Fragment shader pour post-processing
uniform sampler2D tDiffuse;
uniform float uMatcapIntensity;
uniform float uContrast;
uniform float uSaturation;

void main() {
    vec4 color = texture2D(tDiffuse, vUv);
    
    // Ajustement de l'intensité Matcap
    color.rgb *= uMatcapIntensity;
    
    // Contraste
    color.rgb = (color.rgb - 0.5) * uContrast + 0.5;
    
    // Saturation
    float luminance = dot(color.rgb, vec3(0.299, 0.587, 0.114));
    color.rgb = mix(vec3(luminance), color.rgb, uSaturation);
    
    gl_FragColor = color;
}
```

## Conclusion

Le Matcap est une technique **révolutionnaire** qui permet de créer des matériaux photoréalistes avec une **simplicité déconcertante**. C'est parfait pour :

- **Débutants** : Apprentissage simplifié
- **Performance** : Rendu ultra-rapide
- **Qualité** : Résultats professionnels
- **Flexibilité** : Changement de matériau instantané

**C'est magique, rapide, et beau !** ✨

---

## Application du Matcap dans le Portfolio - Système de Parsing Intelligent

### Comment le Matcap est appliqué aux objets 🎯

Le Matcap n'est **PAS appliqué à tous les objets**, mais seulement à ceux qui respectent une **convention de nommage spécifique**. C'est un système intelligent et automatique qui permet de contrôler précisément quels objets reçoivent quels matériaux.

### Système de Parsing Intelligent

```javascript
// Dans Objects.js - Parser pour les matériaux matcap
{
    regex: /^shade([a-z]+)_?[0-9]{0,3}?/i,  // Regex pour identifier les objets matcap
    apply: (_mesh, _options) => {
        // Extraction du nom du matériau depuis le nom de l'objet
        const match = _mesh.name.match(/^shade([a-z]+)_?[0-9]{0,3}?/i)
        const materialName = `${match[1].substring(0, 1).toLowerCase()}${match[1].substring(1)}`
        let material = this.materials.shades.items[materialName]
        
        // Application du matériau matcap
        mesh.material = material
    }
}
```

### Convention de Nommage

Pour qu'un objet reçoive un matériau Matcap, son nom doit commencer par **`shade`** suivi du nom de la couleur :

```javascript
// Exemples de noms d'objets qui recevront des Matcaps :
- "shadeWhite"     → Matériau matcap blanc
- "shadeRed"       → Matériau matcap rouge  
- "shadeMetal"     → Matériau matcap métal
- "shadeBlue_01"   → Matériau matcap bleu
- "shadeGreen_123" → Matériau matcap vert
```

### Matériaux Matcap Disponibles

Le système crée **13 matériaux matcap différents** dans `Materials.js` :

```javascript
// Matériaux matcap créés automatiquement :
this.shades.items = {
    white: new MatcapMaterial(),        // Matcap blanc
    orange: new MatcapMaterial(),       // Matcap orange
    green: new MatcapMaterial(),        // Matcap vert
    brown: new MatcapMaterial(),        // Matcap marron
    gray: new MatcapMaterial(),         // Matcap gris
    beige: new MatcapMaterial(),        // Matcap beige
    red: new MatcapMaterial(),          // Matcap rouge
    black: new MatcapMaterial(),        // Matcap noir
    emeraldGreen: new MatcapMaterial(), // Matcap vert émeraude
    purple: new MatcapMaterial(),       // Matcap violet
    blue: new MatcapMaterial(),         // Matcap bleu
    yellow: new MatcapMaterial(),       // Matcap jaune
    metal: new MatcapMaterial()         // Matcap métal
}
```

### Processus d'Application

1. **Chargement des objets** : Les objets 3D sont chargés depuis le fichier `.glb`
2. **Parsing automatique** : Le système analyse le nom de chaque objet
3. **Détection Matcap** : Si le nom commence par `shade`, l'objet est marqué pour recevoir un Matcap
4. **Extraction du matériau** : Le nom de la couleur est extrait (`shadeRed` → `red`)
5. **Application** : Le matériau matcap correspondant est appliqué à l'objet

### Autres Types d'Objets

Les objets qui **ne commencent pas par `shade`** reçoivent d'autres types de matériaux :

```javascript
// Parser pour les matériaux purs (pure*)
{
    regex: /^pure([a-z]+)_?[0-9]{0,3}?/i,
    // → Matériaux de couleur pure (sans texture)
}

// Parser pour les sols (floor*)
{
    regex: /^floor/i,
    // → Matériau de sol avec ombres
}

// Objets par défaut
// → Matériau blanc standard
```

### Uniforms Partagés

Tous les matériaux matcap partagent les **mêmes uniforms** pour l'éclairage indirect :

```javascript
// Uniforms partagés entre tous les matériaux matcap
this.shades.uniforms = {
    uRevealProgress: 0,                    // Animation de révélation
    uIndirectDistanceAmplitude: 1.75,     // Effet de distance
    uIndirectDistanceStrength: 0.5,       // Force de distance
    uIndirectDistancePower: 2.0,          // Puissance de distance
    uIndirectAngleStrength: 1.5,          // Force d'angle
    uIndirectAngleOffset: 0.6,            // Décalage d'angle
    uIndirectAnglePower: 1.0,             // Puissance d'angle
    uIndirectColor: '#d04500'             // Couleur indirecte
}
```

### Résumé du Système

**Le Matcap est appliqué de manière sélective** :

- ✅ **Objets avec nom `shade*`** → Reçoivent des matériaux matcap
- ❌ **Objets avec nom `pure*`** → Reçoivent des matériaux de couleur pure
- ❌ **Objets avec nom `floor*`** → Reçoivent des matériaux de sol
- ❌ **Autres objets** → Reçoivent des matériaux par défaut

### Avantages de ce Système

- **Automatique** : Pas besoin de coder manuellement chaque objet
- **Flexible** : Changement de matériau en modifiant juste le nom
- **Organisé** : Convention claire et cohérente
- **Performant** : Parsing optimisé et réutilisation des matériaux
- **Maintenable** : Facile à comprendre et modifier

C'est un système **intelligent et automatique** qui permet de contrôler précisément quels objets reçoivent quels matériaux simplement en nommant correctement les objets dans Blender ! 🚀

---

## Images et Textures Matcap - Le Cœur du Système 🖼️

### **Images Matcap dans le Portfolio**

Oui, des **images de textures** sont absolument essentielles pour les Matcaps. Votre portfolio utilise **13 images PNG** différentes pour créer les matériaux matcap.

### **13 Textures Matcap Chargées**

```javascript
// Dans Resources.js - Chargement des textures matcap
{ name: 'matcapBeige', source: './models/matcaps/beige.png', type: 'texture' },
{ name: 'matcapBlack', source: './models/matcaps/black.png', type: 'texture' },
{ name: 'matcapOrange', source: './models/matcaps/orange.png', type: 'texture' },
{ name: 'matcapRed', source: './models/matcaps/red.png', type: 'texture' },
{ name: 'matcapWhite', source: './models/matcaps/white.png', type: 'texture' },
{ name: 'matcapGreen', source: './models/matcaps/green.png', type: 'texture' },
{ name: 'matcapBrown', source: './models/matcaps/brown.png', type: 'texture' },
{ name: 'matcapGray', source: './models/matcaps/gray.png', type: 'texture' },
{ name: 'matcapEmeraldGreen', source: './models/matcaps/emeraldGreen.png', type: 'texture' },
{ name: 'matcapPurple', source: './models/matcaps/purple.png', type: 'texture' },
{ name: 'matcapBlue', source: './models/matcaps/blue.png', type: 'texture' },
{ name: 'matcapYellow', source: './models/matcaps/yellow.png', type: 'texture' },
{ name: 'matcapMetal', source: './models/matcaps/metal.png', type: 'texture' }
```

### **Fichiers Physiques Présents**

Dans le dossier `static/models/matcaps/`, vous avez **14 images PNG** :

- `beige.png` - Matcap beige
- `black.png` - Matcap noir  
- `blue.png` - Matcap bleu
- `brown.png` - Matcap marron
- `emeraldGreen.png` - Matcap vert émeraude
- `gold.png` - Matcap or (non utilisé)
- `gray.png` - Matcap gris
- `green.png` - Matcap vert
- `metal.png` - Matcap métal
- `orange.png` - Matcap orange
- `purple.png` - Matcap violet
- `red.png` - Matcap rouge
- `white.png` - Matcap blanc
- `yellow.png` - Matcap jaune

### **Comment les Images sont Utilisées**

#### 1. **Chargement des Textures**
```javascript
// Dans Resources.js
this.loader.load([
    { name: 'matcapWhite', source: './models/matcaps/white.png', type: 'texture' },
    // ... autres textures
])
```

#### 2. **Assignation aux Matériaux**
```javascript
// Dans Materials.js
this.shades.items.white.uniforms.matcap.value = this.resources.items.matcapWhiteTexture
this.shades.items.red.uniforms.matcap.value = this.resources.items.matcapRedTexture
// ... pour chaque matériau
```

#### 3. **Utilisation dans le Shader**
```glsl
// Dans fragment.glsl
uniform sampler2D matcap;  // La texture matcap

// Échantillonnage de la texture
vec4 matcapColor = texture2D( matcap, uv );

// Application de la couleur
vec3 outgoingLight = diffuseColor.rgb * matcapColor.rgb;
```

### **Qu'est-ce qu'une Image Matcap ?**

#### **Format Typique**
- **Image carrée** (ex: 512x512 ou 1024x1024 pixels)
- **Représente une sphère** avec le matériau photographié
- **Éclairage uniforme** de tous les angles
- **Format PNG** pour la qualité

#### **Exemple Visuel**
```
Image Matcap (beige.png)     →    Objet 3D (résultat)
┌─────────────────┐                ┌─────────────────┐
│  🟤 Sphère Beige │                │  🏠 Maison      │
│  ⚡ Reflets      │    applique    │  avec matériau  │
│  ✨ Ombres       │    ──────→     │  beige réaliste │
└─────────────────┘                └─────────────────┘
```

### **Processus Technique**

#### **1. Chargement**
- Les images PNG sont chargées par le `Loader`
- Converties en textures Three.js
- Stockées dans `this.resources.items`

#### **2. Application**
- Chaque matériau matcap reçoit sa texture spécifique
- La texture est assignée à l'uniform `matcap`
- Le shader utilise cette texture pour le rendu

#### **3. Rendu**
- Le shader calcule les coordonnées UV basées sur la normale
- Échantillonne la texture matcap à ces coordonnées
- Applique la couleur résultante à l'objet

### **Avantages des Images Matcap**

- **Réalisme** : Basé sur de vraies photos de matériaux
- **Performance** : Une seule texture au lieu de calculs complexes
- **Flexibilité** : Changement de matériau = changement d'image
- **Qualité** : Détails fins et reflets photoréalistes

**En résumé** : Les Matcaps utilisent des **images de textures PNG** qui représentent des sphères avec différents matériaux photographiés sous tous les angles. C'est le cœur de la technique Matcap ! 🎯✨

---

