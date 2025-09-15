# Système de Baking d'Éclairage - Portfolio 3D

## Vue d'ensemble

Le portfolio utilise un système de **baking d'éclairage** très sophistiqué basé sur la technique **Matcap** (Material Capture) combinée à des effets d'éclairage indirect personnalisés. Ce système permet d'obtenir un rendu photoréaliste avec des performances optimales en pré-calculant l'éclairage dans des textures.

## Qu'est-ce que le Baking d'Éclairage ? 🎯

Le **baking d'éclairage** (ou "cuisson" de l'éclairage) est une technique qui consiste à **pré-calculer** les effets de lumière et à les stocker dans des textures 2D. Au lieu de calculer la lumière en temps réel, l'application "lit" ces textures pré-calculées.

### Principe du Baking Matcap

1. **Photographie** : Une sphère avec le matériau désiré est photographiée sous tous les angles
2. **Capture** : L'image résultante contient tous les effets d'éclairage "cuits" dans la texture
3. **Application** : L'objet 3D "lit" cette carte selon son orientation
4. **Résultat** : Matériau photoréaliste instantané

## Architecture du Système de Baking

### 1. Textures Matcap (Baking Principal)

Le portfolio utilise **14 textures Matcap** différentes, chacune contenant un éclairage pré-calculé :

```
/static/models/matcaps/
├── beige.png          # Matériau beige avec éclairage baked
├── black.png          # Matériau noir avec éclairage baked
├── blue.png           # Matériau bleu avec éclairage baked
├── brown.png          # Matériau marron avec éclairage baked
├── emeraldGreen.png   # Matériau vert émeraude avec éclairage baked
├── gold.png           # Matériau doré avec éclairage baked
├── gray.png           # Matériau gris avec éclairage baked
├── green.png          # Matériau vert avec éclairage baked
├── metal.png          # Matériau métallique avec éclairage baked
├── orange.png         # Matériau orange avec éclairage baked
├── purple.png         # Matériau violet avec éclairage baked
├── red.png            # Matériau rouge avec éclairage baked
├── white.png          # Matériau blanc avec éclairage baked
└── yellow.png         # Matériau jaune avec éclairage baked
```

### 2. Implémentation Technique

#### A. Configuration du Matériau Matcap

**Fichier :** `src/javascript/Materials/Matcap.js`

```javascript
/**
 * Création du matériau Matcap avec éclairage pré-calculé
 */
export default function()
{
    const uniforms = {
        // Texture Matcap principale (baking d'éclairage)
        matcap: { value: null },
        
        // Paramètres d'éclairage indirect
        uIndirectDistanceAmplitude: { value: null },
        uIndirectDistanceStrength: { value: null },
        uIndirectDistancePower: { value: null },
        uIndirectAngleStrength: { value: null },
        uIndirectAngleOffset: { value: null },
        uIndirectAnglePower: { value: null },
        uIndirectColor: { value: null }
    }

    return new THREE.ShaderMaterial({
        uniforms,
        vertexShader: shaderVertex,
        fragmentShader: shaderFragment,
        lights: false  // Pas d'éclairage standard (utilise le baking)
    })
}
```

#### B. Shader Fragment - Échantillonnage du Baking

**Fichier :** `src/shaders/matcap/fragment.glsl`

```glsl
// ============================================================================
// CALCUL DES COORDONNÉES MATCAP (Baking)
// ============================================================================

// Direction de vue normalisée (du fragment vers la caméra)
vec3 viewDir = normalize( vViewPosition );

// Création d'un système de coordonnées orthonormé basé sur la direction de vue
vec3 x = normalize( vec3( viewDir.z, 0.0, - viewDir.x ) );
vec3 y = cross( viewDir, x );

// Projection de la normale sur le plan tangent pour obtenir les coordonnées UV
// Le facteur 0.495 évite les artefacts causés par les disques Matcap sous-dimensionnés
vec2 uv = vec2( dot( x, normal ), dot( y, normal ) ) * 0.495 + 0.5;

// ============================================================================
// ÉCHANTILLONNAGE DE LA TEXTURE MATCAP (Baking)
// ============================================================================

#ifdef USE_MATCAP
    // Récupère la couleur de la texture Matcap aux coordonnées calculées
    // Cette texture contient l'éclairage pré-calculé (baked)
    vec4 matcapColor = texture2D( matcap, uv );
#else
    vec4 matcapColor = vec4( 1.0 );
#endif

// ============================================================================
// CALCUL DE LA LUMIÈRE DE BASE (Baking)
// ============================================================================

// Combine la couleur diffuse avec la couleur Matcap (éclairage baked)
vec3 outgoingLight = diffuseColor.rgb * matcapColor.rgb;
```

### 3. Gestion des Matériaux avec Baking

**Fichier :** `src/javascript/World/Materials.js`

```javascript
/**
 * Création des matériaux Matcap avec éclairage pré-calculé
 */
export default class Materials
{
    constructor()
    {
        // Création des matériaux Matcap avec baking
        this.shades = {
            white: new Matcap(),
            orange: new Matcap(),
            green: new Matcap(),
            brown: new Matcap(),
            gray: new Matcap(),
            beige: new Matcap(),
            red: new Matcap(),
            black: new Matcap(),
            emeraldGreen: new Matcap(),
            purple: new Matcap(),
            blue: new Matcap(),
            yellow: new Matcap(),
            metal: new Matcap()
        }

        // Uniformes partagés pour l'éclairage indirect
        this.shades.uniforms = {
            uRevealProgress: 0,
            uIndirectDistanceAmplitude: 1.75,
            uIndirectDistanceStrength: 0.5,
            uIndirectDistancePower: 2.0,
            uIndirectAngleStrength: 1.5,
            uIndirectAngleOffset: 0.6,
            uIndirectAnglePower: 1.0,
            uIndirectColor: null
        }
    }
}
```

## Système d'Ombres "Baked"

### 1. Principe de Fonctionnement

Le portfolio utilise un système d'ombres qui simule un baking en pré-calculant la position du soleil et les projections d'ombres.

**Fichier :** `src/javascript/World/Shadows.js`

```javascript
/**
 * Système d'ombres avec position du soleil pré-calculée
 */
export default class Shadows
{
    constructor()
    {
        // Position du soleil dans l'espace 3D (pré-calculée)
        this.sun.position = new THREE.Vector3(-2.5, -2.65, 3.75)

        // Calcul du vecteur de projection (baking de la direction)
        this.sun.vector.copy(this.sun.position)
            .multiplyScalar(1 / this.sun.position.z)
            .negate()
    }

    /**
     * Calcul des ombres basé sur la position pré-calculée du soleil
     */
    update(_shadow)
    {
        const z = Math.max(_shadow.reference.position.z + _shadow.offsetZ, 0)
        
        // Projection de l'ombre selon la position du soleil (baked)
        const sunOffset = this.sun.vector.clone().multiplyScalar(z)

        _shadow.mesh.position.x = _shadow.reference.position.x + sunOffset.x
        _shadow.mesh.position.y = _shadow.reference.position.y + sunOffset.y
    }
}
```

### 2. Matériau d'Ombre avec Baking

**Fichier :** `src/shaders/shadow/fragment.glsl`

```glsl
/**
 * Shader d'ombre avec dégradé aux coins (baking de la transparence)
 */
void main() {
    float strength = 0.0;
    
    // Dégradé aux coins (effet pré-calculé)
    if(vUv.x < uFadeRadius && vUv.y < uFadeRadius) {
        strength = clamp(1.0 - distance(vUv, vec2(uFadeRadius)) / uFadeRadius, 0.0, 1.0);
    }
    // ... autres coins
    
    // Application de la courbe de transparence (baking)
    strength = sineInOut(strength);
    strength *= uAlpha;
    
    gl_FragColor = vec4(uColor, strength);
}
```

## Éclairage Indirect en Complément

### 1. Effets Basés sur la Distance

En plus du baking Matcap, le système utilise un **éclairage indirect personnalisé** qui ajoute de la dynamique :

```glsl
// Calcul de l'effet selon la distance Z (profondeur)
float indirectDistanceStrength = clamp(1.0 - vWorldPosition.z / uIndirectDistanceAmplitude, 0.0, 1.0) * uIndirectDistanceStrength;
indirectDistanceStrength = pow(indirectDistanceStrength, uIndirectDistancePower);
```

**Paramètres configurables :**
- `uIndirectDistanceAmplitude` : Portée de l'effet (1.75 par défaut)
- `uIndirectDistanceStrength` : Intensité de l'effet (0.5 par défaut)
- `uIndirectDistancePower` : Courbe de décroissance (2.0 par défaut)

### 2. Effets Basés sur l'Angle

```glsl
// Calcul de l'effet selon l'angle de la normale
vec3 worldNormal = inverseTransformDirection(vNormal, viewMatrix);
float indirectAngleStrength = dot(normalize(worldNormal), vec3(0.0, 0.0, -1.0)) + uIndirectAngleOffset;
indirectAngleStrength = clamp(indirectAngleStrength * uIndirectAngleStrength, 0.0, 1.0);
indirectAngleStrength = pow(indirectAngleStrength, uIndirectAnglePower);
```

**Paramètres configurables :**
- `uIndirectAngleStrength` : Intensité de l'effet (1.5 par défaut)
- `uIndirectAngleOffset` : Décalage de l'orientation (0.6 par défaut)
- `uIndirectAnglePower` : Courbe de l'effet (1.0 par défaut)

### 3. Combinaison des Effets

```glsl
// Les deux effets sont multipliés pour créer l'effet final
float indirectStrength = indirectDistanceStrength * indirectAngleStrength;

// Mélange la lumière de base (baked) avec la couleur indirecte
gl_FragColor = vec4(mix(outgoingLight, uIndirectColor, indirectStrength), diffuseColor.a);
```

## Exemples Concrets du Projet

### 1. Voiture Interactive

**Fichier :** `src/javascript/World/Car.js`

La voiture utilise le système de baking Matcap pour un rendu photoréaliste :

```javascript
/**
 * Création de la voiture avec matériaux Matcap (baking)
 */
constructor()
{
    // Chargement du modèle 3D
    this.model = await this.resources.items.carModel.scene
    
    // Application des matériaux Matcap (éclairage baked)
    this.model.traverse((child) => {
        if(child.isMesh) {
            // Matériau métallique avec éclairage pré-calculé
            child.material = this.materials.shades.metal
        }
    })
}
```

### 2. Objets du Portfolio

**Fichier :** `src/javascript/World/Objects.js`

Tous les objets utilisent le système de baking :

```javascript
/**
 * Attribution automatique des matériaux Matcap (baking)
 */
parse(_mesh)
{
    if(_mesh.name.includes('shade')) {
        // Extraction du nom du matériau (ex: "shadeWhite", "shadeMetal")
        const shadeName = _mesh.name.replace('shade', '').toLowerCase()
        
        // Application du matériau Matcap correspondant (éclairage baked)
        _mesh.material = this.materials.shades[shadeName]
    }
}
```

### 3. Système de Sol avec Baking

**Fichier :** `src/shaders/floor/fragment.glsl`

Le sol utilise un système de baking pour le dégradé de couleurs :

```glsl
/**
 * Dégradé de couleurs pré-calculé (baking)
 */
void main() {
    // Interpolation des couleurs aux 4 coins (baking)
    vec3 color = mix(
        mix(uColorTopLeft, uColorTopRight, vUv.x),
        mix(uColorBottomLeft, uColorBottomRight, vUv.x),
        vUv.y
    );
    
    gl_FragColor = vec4(color, 1.0);
}
```

## Avantages du Système de Baking

### 1. Performance Optimale

- **Pas de calculs de lumière en temps réel** : L'éclairage est pré-calculé
- **Rendu fluide** : 60 FPS garantis même sur mobile
- **Réduction des draw calls** : Une seule texture par matériau

### 2. Qualité Photoréaliste

- **Rendu garanti** : L'éclairage est photographié, pas calculé
- **Cohérence visuelle** : Même éclairage sur tous les objets
- **Détails réalistes** : Reflets, ombres, et nuances préservés

### 3. Simplicité d'Utilisation

- **Une texture par matériau** : Gestion simplifiée
- **Paramètres configurables** : Ajustement facile des effets
- **Interface de debug** : Contrôles en temps réel

## Configuration et Personnalisation

### 1. Ajout de Nouveaux Matériaux Matcap

Pour ajouter un nouveau matériau avec baking :

1. **Créer la texture Matcap** : Photographier une sphère avec le matériau
2. **Ajouter dans le dossier** : `/static/models/matcaps/nouveauMateriau.png`
3. **Configurer le matériau** : Ajouter dans `Materials.js`

```javascript
// Ajout d'un nouveau matériau Matcap
this.shades.nouveauMateriau = new Matcap()
```

### 2. Ajustement des Paramètres d'Éclairage Indirect

Tous les paramètres sont configurables via l'interface de debug :

```javascript
// Configuration des paramètres d'éclairage indirect
this.shades.uniforms.uIndirectDistanceAmplitude = 1.75
this.shades.uniforms.uIndirectDistanceStrength = 0.5
this.shades.uniforms.uIndirectDistancePower = 2.0
```

### 3. Création de Textures Matcap Personnalisées

**Méthode 1 : Photographie**
1. Sphère blanche avec le matériau désiré
2. Éclairage uniforme
3. Photo de face
4. Traitement des couleurs et contrastes

**Méthode 2 : Logiciels 3D**
1. Blender : Créer une sphère avec le matériau
2. Rendu avec éclairage uniforme
3. Export en texture 2D
4. Optimisation pour le web

## Optimisations Web

### 1. Formats de Texture

```javascript
// Formats recommandés pour le baking
- WebP : Meilleure compression
- JPEG : Compatibilité maximale
- PNG : Transparence si nécessaire
- KTX2 : Compression GPU native
```

### 2. Tailles Optimales

```javascript
// Tailles recommandées pour les textures Matcap
- 256x256 : Mobile, performance
- 512x512 : Desktop, qualité
- 1024x1024 : Haute qualité
- 2048x2048 : Ultra qualité (attention au poids)
```

## Intégration avec les Autres Systèmes

### 1. Synchronisation Physique-Visuel

Le système de baking s'intègre parfaitement avec la physique :

```javascript
/**
 * Mise à jour des ombres avec la physique (baking)
 */
update()
{
    // Synchronisation des ombres avec les objets physiques
    this.shadows.update(this.car.shadow)
    
    // Mise à jour des matériaux (éclairage baked)
    this.materials.update()
}
```

### 2. Gestion des Sections

Chaque section peut avoir ses propres paramètres d'éclairage :

```javascript
/**
 * Configuration par section (baking adaptatif)
 */
configureSection(sectionName)
{
    switch(sectionName) {
        case 'projects':
            // Paramètres d'éclairage pour la section projets
            this.materials.shades.uniforms.uIndirectColor = new THREE.Color('#ffcfe0')
            break
        case 'intro':
            // Paramètres d'éclairage pour l'intro
            this.materials.shades.uniforms.uIndirectColor = new THREE.Color('#ffffff')
            break
    }
}
```

## Conclusion

Le système de baking d'éclairage du portfolio est un exemple parfait d'optimisation intelligente qui combine :

1. **Baking principal** : Textures Matcap avec éclairage pré-calculé
2. **Baking d'ombres** : Système d'ombres projetées pré-calculées
3. **Éclairage indirect** : Calculs optimisés basés sur la distance et l'angle

Ce système permet d'obtenir un rendu photoréaliste avec des performances optimales, tout en offrant une grande flexibilité pour la personnalisation et l'adaptation aux différentes plateformes.

L'utilisation du baking d'éclairage est particulièrement adaptée pour les applications web 3D où la performance est cruciale, tout en maintenant une qualité visuelle exceptionnelle.
