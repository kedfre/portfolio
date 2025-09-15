# Documentation des Shaders Matcap

## Vue d'ensemble

Le système de shaders Matcap du portfolio utilise une technique avancée de rendu de matériaux qui combine :
- **Matcap traditionnel** : Rendu photoréaliste basé sur des textures pré-calculées
- **Éclairage indirect personnalisé** : Effets basés sur la distance et l'angle
- **Système de révélation** : Animation progressive des objets

## Architecture du Shader

### Vertex Shader (`vertex.glsl`)

Le vertex shader traite chaque sommet (vertex) de l'objet 3D et prépare les données pour le fragment shader. Il gère :
- **Transformations géométriques** : Position, normale, coordonnées UV
- **Système de révélation** : Animation progressive des objets
- **Calculs d'espace** : Transformations vers l'espace monde et de vue

### Fragment Shader (`fragment.glsl`)

Le fragment shader est le cœur du système Matcap. Il traite chaque pixel (fragment) de l'objet 3D pour déterminer sa couleur finale.

#### Structure du Code

```glsl
// 1. Définitions et configuration
#define MATCAP
#define USE_MATCAP

// 2. Uniformes standard Three.js
uniform vec3 diffuse;        // Couleur de base
uniform float opacity;       // Opacité
uniform sampler2D matcap;    // Texture Matcap

// 3. Uniformes personnalisés
uniform float uIndirectDistanceAmplitude;  // Amplitude de l'effet distance
uniform float uIndirectDistanceStrength;   // Force de l'effet distance
uniform float uIndirectDistancePower;      // Puissance de l'effet distance
uniform float uIndirectAngleStrength;      // Force de l'effet angle
uniform float uIndirectAngleOffset;        // Décalage de l'effet angle
uniform float uIndirectAnglePower;         // Puissance de l'effet angle
uniform vec3 uIndirectColor;               // Couleur de l'éclairage indirect

// 4. Variables varying (passées du vertex shader)
varying vec3 vViewPosition;   // Position en espace de vue
varying vec3 vWorldPosition;  // Position en espace monde
varying vec3 vNormal;         // Normale du fragment
```

## Fonctionnement Détaillé

### 1. Système de Révélation Progressive (Vertex Shader)

Le vertex shader implémente un système sophistiqué d'animation de révélation :

```glsl
// Calcul de la distance au centre pour déterminer l'ordre de révélation
float distanceToCenter = length(worldPosition);

// Paramètres de l'animation
float zAmplitude = 3.2;  // Amplitude de l'effet de "plongée"

// Calcul du progrès de révélation basé sur la distance
float revealProgress = (uRevealProgress - distanceToCenter / 30.0) * 5.0;
revealProgress = 1.0 - clamp(revealProgress, - 0.1, 1.0);
revealProgress = pow(revealProgress, 2.0);

// Application de l'effet de révélation
worldPosition.z -= revealProgress * zAmplitude;
```

**Explication :**
- Les objets apparaissent progressivement du centre vers l'extérieur
- L'effet de "plongée" (déplacement en Z) crée une animation fluide
- La courbe quadratique (`pow(..., 2.0)`) adoucit l'animation
- La condition `uRevealProgress > 0.9` supprime l'effet en fin d'animation

### 2. Calcul des Coordonnées Matcap (Fragment Shader)

```glsl
// Direction de vue normalisée
vec3 viewDir = normalize( vViewPosition );

// Système de coordonnées orthonormé
vec3 x = normalize( vec3( viewDir.z, 0.0, - viewDir.x ) );
vec3 y = cross( viewDir, x );

// Projection de la normale sur le plan tangent
vec2 uv = vec2( dot( x, normal ), dot( y, normal ) ) * 0.495 + 0.5;
```

**Explication :**
- On crée un système de coordonnées basé sur la direction de vue
- La normale de l'objet est projetée sur ce plan tangent
- Le facteur `0.495` évite les artefacts de bordure
- Les coordonnées UV résultantes permettent d'échantillonner la texture Matcap

### 3. Échantillonnage de la Texture Matcap

```glsl
#ifdef USE_MATCAP
    vec4 matcapColor = texture2D( matcap, uv );
#else
    vec4 matcapColor = vec4( 1.0 );
#endif
```

**Explication :**
- Si le Matcap est activé, on récupère la couleur de la texture
- Sinon, on utilise une couleur blanche neutre
- La texture Matcap contient l'image d'une sphère avec le matériau désiré

### 4. Éclairage Indirect Basé sur la Distance

```glsl
float indirectDistanceStrength = clamp(1.0 - vWorldPosition.z / uIndirectDistanceAmplitude, 0.0, 1.0) * uIndirectDistanceStrength;
indirectDistanceStrength = pow(indirectDistanceStrength, uIndirectDistancePower);
indirectDistanceStrength = clamp(indirectDistanceStrength, 0.0, 1.0);
```

**Explication :**
- L'effet est maximum à `z = 0` et diminue avec la distance
- `uIndirectDistanceAmplitude` contrôle la portée de l'effet
- `uIndirectDistancePower` contrôle la courbe de décroissance
- Plus la puissance est élevée, plus l'effet est concentré près de l'origine

### 5. Éclairage Indirect Basé sur l'Angle

```glsl
vec3 worldNormal = inverseTransformDirection(vNormal, viewMatrix);
float indirectAngleStrength = dot(normalize(worldNormal), vec3(0.0, 0.0, - 1.0)) + uIndirectAngleOffset;
indirectAngleStrength = clamp(indirectAngleStrength * uIndirectAngleStrength, 0.0, 1.0);
indirectAngleStrength = pow(indirectAngleStrength, uIndirectAnglePower);
```

**Explication :**
- La normale est transformée en espace monde
- On calcule l'angle entre la normale et la direction vers le bas `(0,0,-1)`
- `uIndirectAngleOffset` permet d'ajuster l'orientation de l'effet
- `uIndirectAnglePower` contrôle la courbe de l'effet

### 6. Combinaison des Effets

```glsl
float indirectStrength = indirectDistanceStrength * indirectAngleStrength;
gl_FragColor = vec4(mix(outgoingLight, uIndirectColor, indirectStrength), diffuseColor.a);
```

**Explication :**
- Les deux effets (distance ET angle) sont multipliés
- `mix()` fait une interpolation linéaire entre la couleur de base et la couleur indirecte
- Plus `indirectStrength` est élevé, plus la couleur indirecte domine

## Paramètres de Configuration

### Uniformes de Révélation

| Paramètre | Description | Valeur Typique | Effet |
|-----------|-------------|----------------|-------|
| `uRevealProgress` | Progrès de l'animation de révélation | 0.0 à 1.0 | 0.0 = caché, 1.0 = visible |
| `zAmplitude` | Amplitude de l'effet de "plongée" | 3.2 | Plus grand = effet plus prononcé |
| `distanceToCenter / 30.0` | Normalisation de la distance | 30.0 | Contrôle la portée de l'effet |
| `* 5.0` | Accélération de l'effet | 5.0 | Plus grand = révélation plus rapide |

### Uniformes de Distance

| Paramètre | Description | Valeur Typique | Effet |
|-----------|-------------|----------------|-------|
| `uIndirectDistanceAmplitude` | Portée de l'effet | 1.0 | Plus grand = effet plus étendu |
| `uIndirectDistanceStrength` | Force de l'effet | 0.5 | Plus grand = effet plus visible |
| `uIndirectDistancePower` | Courbe de l'effet | 2.0 | Plus grand = effet plus concentré |

### Uniformes d'Angle

| Paramètre | Description | Valeur Typique | Effet |
|-----------|-------------|----------------|-------|
| `uIndirectAngleStrength` | Force de l'effet | 0.3 | Plus grand = effet plus visible |
| `uIndirectAngleOffset` | Décalage de l'angle | 0.0 | Ajuste l'orientation de l'effet |
| `uIndirectAnglePower` | Courbe de l'effet | 1.5 | Plus grand = effet plus concentré |

### Couleur

| Paramètre | Description | Valeur Typique | Effet |
|-----------|-------------|----------------|-------|
| `uIndirectColor` | Couleur de l'éclairage | `vec3(1.0, 0.5, 0.0)` | Teinte appliquée aux zones affectées |

## Cas d'Usage

### 1. Révélation Progressive (Vertex Shader)

```javascript
// Animation de révélation avec GSAP
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

### 2. Effet de Distance (Fragment Shader)

```javascript
// Effet qui diminue avec la distance
material.uniforms.uIndirectDistanceAmplitude.value = 5.0;
material.uniforms.uIndirectDistanceStrength.value = 0.8;
material.uniforms.uIndirectDistancePower.value = 3.0;
```

### 3. Effet d'Angle (Fragment Shader)

```javascript
// Effet basé sur l'orientation de la surface
material.uniforms.uIndirectAngleStrength.value = 0.5;
material.uniforms.uIndirectAngleOffset.value = 0.2;
material.uniforms.uIndirectAnglePower.value = 2.0;
```

## Optimisations

### 1. Gestion de la Mémoire GPU

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
```

### 2. Compression des Textures

```javascript
// Utilisation de formats compressés
const compressedTexture = new THREE.CompressedTextureLoader().load(
    'texture.ktx2',
    (texture) => {
        texture.colorSpace = THREE.SRGBColorSpace;
        material.uniforms.matcap.value = texture;
    }
);
```

### 3. LOD (Level of Detail)

```javascript
// Différentes résolutions selon la distance
const matcapLODs = {
    high: { resolution: 1024, texture: null },
    medium: { resolution: 512, texture: null },
    low: { resolution: 256, texture: null }
};
```

## Debug et Profiling

### 1. Interface de Debug

```javascript
// Contrôles pour ajuster les paramètres en temps réel
const debugFolder = gui.addFolder('Matcap Debug');

debugFolder.add(material.uniforms.uIndirectDistanceAmplitude, 'value', 0, 2).name('Distance Amplitude');
debugFolder.add(material.uniforms.uIndirectAngleStrength, 'value', 0, 1).name('Angle Strength');

const colorController = debugFolder.addColor(material.uniforms.uIndirectColor, 'value');
colorController.onChange((value) => {
    material.uniforms.uIndirectColor.value.setHex(value);
});
```

### 2. Lignes de Debug (Commentées)

```glsl
// Affiche la normale monde (pour visualiser l'orientation)
// gl_FragColor = vec4(vec3(worldNormal), 1.0);

// Affiche la lumière de base (sans effets indirects)
// gl_FragColor = vec4(outgoingLight, diffuseColor.a);

// Affiche la force de l'effet indirect (pour debug)
// gl_FragColor = vec4(vec3(indirectStrength), diffuseColor.a);
```

## Intégration avec Three.js

### 1. Création du Matériau

```javascript
const material = new THREE.ShaderMaterial({
    uniforms: {
        matcap: { value: null },
        uIndirectDistanceAmplitude: { value: 1.0 },
        uIndirectDistanceStrength: { value: 0.5 },
        uIndirectDistancePower: { value: 2.0 },
        uIndirectAngleStrength: { value: 0.3 },
        uIndirectAngleOffset: { value: 0.0 },
        uIndirectAnglePower: { value: 1.5 },
        uIndirectColor: { value: new THREE.Color(0xffffff) }
    },
    vertexShader: vertexShaderSource,
    fragmentShader: fragmentShaderSource
});
```

### 2. Mise à Jour des Uniformes

```javascript
// Mise à jour en temps réel
function updateMatcapUniforms(material, options) {
    material.uniforms.uIndirectDistanceAmplitude.value = options.distanceAmplitude;
    material.uniforms.uIndirectDistanceStrength.value = options.distanceStrength;
    material.uniforms.uIndirectColor.value.setHex(options.color);
    
    material.needsUpdate = true;
}
```

## Conclusion

Le système de shaders Matcap du portfolio offre :

- **Performance** : Rendu ultra-rapide sans calculs de lumière complexes
- **Qualité** : Résultats photoréalistes basés sur des textures pré-calculées
- **Flexibilité** : Effets personnalisés basés sur la distance et l'angle
- **Contrôle** : Paramètres ajustables en temps réel pour le debug

Cette approche permet de créer des matériaux complexes avec une simplicité déconcertante, parfait pour un portfolio web interactif.

---

*Documentation mise à jour le : $(date)*
