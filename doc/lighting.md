# Système d'Éclairage du Portfolio 3D

## Vue d'ensemble

Le portfolio utilise un système d'éclairage innovant basé sur la technique **Matcap** (Material Capture) combinée à des effets d'éclairage indirect personnalisés. Contrairement aux systèmes d'éclairage traditionnels qui nécessitent de nombreuses lumières et calculs complexes, ce système offre un rendu photoréaliste avec des performances optimales.

## Architecture du Système d'Éclairage

### 1. Technique Matcap - Base de l'Éclairage

**Principe** : Au lieu de calculer la lumière en temps réel, on utilise une **image pré-calculée** qui contient déjà tous les effets de lumière.

#### Comment ça fonctionne
1. **Photographie** : Une sphère avec le matériau désiré est photographiée sous tous les angles
2. **Capture** : L'image résultante contient tous les effets d'éclairage "cuits" dans la texture
3. **Application** : L'objet 3D "lit" cette carte selon son orientation
4. **Résultat** : Matériau photoréaliste instantané

#### Avantages
- **Performance** : Pas de calculs de lumière en temps réel
- **Qualité** : Rendu photoréaliste garanti
- **Simplicité** : Une seule texture par matériau
- **Cohérence** : Éclairage uniforme sur tous les objets

### 2. Éclairage Indirect Personnalisé

En plus du Matcap, le système utilise un **éclairage indirect personnalisé** qui ajoute de la dynamique et de la profondeur à la scène.

#### Composants de l'Éclairage Indirect

**A. Éclairage Basé sur la Distance**
```glsl
// Calcul de l'effet selon la distance Z (profondeur)
float indirectDistanceStrength = clamp(1.0 - vWorldPosition.z / uIndirectDistanceAmplitude, 0.0, 1.0) * uIndirectDistanceStrength;
indirectDistanceStrength = pow(indirectDistanceStrength, uIndirectDistancePower);
```

**Paramètres** :
- `uIndirectDistanceAmplitude` : Portée de l'effet (1.75 par défaut)
- `uIndirectDistanceStrength` : Intensité de l'effet (0.5 par défaut)
- `uIndirectDistancePower` : Courbe de décroissance (2.0 par défaut)

**B. Éclairage Basé sur l'Angle**
```glsl
// Calcul de l'effet selon l'angle de la normale
vec3 worldNormal = inverseTransformDirection(vNormal, viewMatrix);
float indirectAngleStrength = dot(normalize(worldNormal), vec3(0.0, 0.0, -1.0)) + uIndirectAngleOffset;
indirectAngleStrength = clamp(indirectAngleStrength * uIndirectAngleStrength, 0.0, 1.0);
indirectAngleStrength = pow(indirectAngleStrength, uIndirectAnglePower);
```

**Paramètres** :
- `uIndirectAngleStrength` : Intensité de l'effet (1.5 par défaut)
- `uIndirectAngleOffset` : Décalage de l'orientation (0.6 par défaut)
- `uIndirectAnglePower` : Courbe de l'effet (1.0 par défaut)

**C. Combinaison des Effets**
```glsl
// Les deux effets sont multipliés pour créer l'effet final
float indirectStrength = indirectDistanceStrength * indirectAngleStrength;
gl_FragColor = vec4(mix(outgoingLight, uIndirectColor, indirectStrength), diffuseColor.a);
```

## Système d'Ombres Dynamiques

### 1. Principe de Fonctionnement

Le système d'ombres simule une **source lumineuse solaire** qui projette des ombres réalistes sur le sol.

#### Configuration du Soleil
```javascript
// Position du soleil dans l'espace 3D
this.sun.position = new THREE.Vector3(-2.5, -2.65, 3.75)

// Calcul du vecteur de projection
this.sun.vector.copy(this.sun.position).multiplyScalar(1 / this.sun.position.z).negate()
```

#### Calcul des Ombres
```javascript
// Projection de l'ombre selon la position du soleil
const z = Math.max(_shadow.reference.position.z + _shadow.offsetZ, 0)
const sunOffset = this.sun.vector.clone().multiplyScalar(z)

_shadow.mesh.position.x = _shadow.reference.position.x + sunOffset.x
_shadow.mesh.position.y = _shadow.reference.position.y + sunOffset.y
```

### 2. Caractéristiques des Ombres

**A. Transparence Progressive**
- L'ombre devient plus transparente avec la distance
- Fonction de puissance pour contrôler la courbe
- Évitement du z-fighting avec décalage

**B. Adaptation à la Rotation**
- L'ombre suit la rotation de l'objet
- Calcul de l'angle de projection
- Alpha d'orientation pour la visibilité

**C. Matériau d'Ombre Personnalisé**
```glsl
// Shader d'ombre avec dégradé aux coins
float strength = 0.0;
if(vUv.x < uFadeRadius && vUv.y < uFadeRadius) {
    strength = clamp(1.0 - distance(vUv, vec2(uFadeRadius)) / uFadeRadius, 0.0, 1.0);
}
// ... autres coins
strength = sineInOut(strength);
strength *= uAlpha;
gl_FragColor = vec4(uColor, strength);
```

## Effets de Post-Processing

### 1. Effets de Lueur (Glows)

Le système inclut des **effets de lueur radiale** appliqués en post-processing.

#### Configuration des Lueurs
```javascript
// Paramètres de l'effet de lueur
this.passes.glowsPass.color = '#ffcfe0'
this.passes.glowsPass.material.uniforms.uPosition.value = new THREE.Vector2(0, 0.25)
this.passes.glowsPass.material.uniforms.uRadius.value = 0.7
this.passes.glowsPass.material.uniforms.uAlpha.value = 0.55
```

#### Shader de Lueur
```glsl
// Calcul de la force de lueur selon la distance
float glowStrength = distance(vUv, uPosition) / uRadius;
glowStrength = 1.0 - glowStrength;
glowStrength *= uAlpha;
glowStrength = clamp(glowStrength, 0.0, 1.0);

// Mélange avec la couleur de base
vec3 color = mix(diffuseColor.rgb, uColor, glowStrength);
```

### 2. Effets de Flou

Le système inclut des **effets de flou** horizontal et vertical pour l'ambiance.

#### Configuration du Flou
```javascript
// Flou horizontal
this.passes.horizontalBlurPass.strength = this.config.touch ? 0 : 1
this.passes.horizontalBlurPass.material.uniforms.uStrength.value = new THREE.Vector2(strength, 0)

// Flou vertical
this.passes.verticalBlurPass.strength = this.config.touch ? 0 : 1
this.passes.verticalBlurPass.material.uniforms.uStrength.value = new THREE.Vector2(0, strength)
```

## Gestion des Matériaux

### 1. Matériaux Matcap

Le système gère **13 matériaux matcap** différents :

- **Couleurs de base** : white, orange, green, brown, gray, beige, red, black
- **Couleurs spéciales** : emeraldGreen, purple, blue, yellow, metal

#### Configuration des Matériaux
```javascript
// Uniformes partagés entre tous les matériaux matcap
this.shades.uniforms = {
    uRevealProgress: 0,                    // Progression de la révélation
    uIndirectDistanceAmplitude: 1.75,     // Amplitude de la distance
    uIndirectDistanceStrength: 0.5,       // Force de la distance
    uIndirectDistancePower: 2.0,          // Puissance de la distance
    uIndirectAngleStrength: 1.5,          // Force de l'angle
    uIndirectAngleOffset: 0.6,            // Décalage de l'angle
    uIndirectAnglePower: 1.0,             // Puissance de l'angle
    uIndirectColor: null                  // Couleur indirecte
}
```

### 2. Matériaux Purs

Pour les objets simples, le système utilise des **matériaux purs** avec des couleurs de base :

- **Rouge** : `0xff0000`
- **Blanc** : `0xffffff`
- **Jaune** : `0xffe889`

### 3. Matériaux d'Ombre

Les ombres utilisent un **matériau shader personnalisé** avec :
- Couleur configurable (`#d04500` par défaut)
- Transparence dynamique
- Dégradé aux coins pour un effet naturel

## Animations et Transitions

### 1. Révélation Progressive

Le système inclut une **animation de révélation** qui fait apparaître progressivement les objets.

#### Calcul de la Révélation
```glsl
// Distance au centre pour l'ordre de révélation
float distanceToCenter = length(worldPosition);

// Progrès de révélation basé sur la distance
float revealProgress = (uRevealProgress - distanceToCenter / 30.0) * 5.0;
revealProgress = 1.0 - clamp(revealProgress, -0.1, 1.0);
revealProgress = pow(revealProgress, 2.0);

// Effet de "plongée" pendant la révélation
worldPosition.z -= revealProgress * zAmplitude;
```

### 2. Transitions de Couleur

Les matériaux supportent des **transitions de couleur** fluides pour l'éclairage indirect.

## Optimisations de Performance

### 1. Rendu Optimisé

- **Pas de lumières dynamiques** : Utilisation du Matcap pour éviter les calculs
- **Shaders optimisés** : Code GLSL efficace
- **Uniforms partagés** : Réutilisation des paramètres entre matériaux

### 2. Gestion Mobile

- **Désactivation du flou** : Sur mobile pour les performances
- **Réduction des effets** : Adaptation selon les capacités de l'appareil
- **Détection automatique** : Adaptation selon le type d'appareil

### 3. Debug et Développement

- **Interface de debug** : Contrôles en temps réel avec dat.GUI
- **Visualisation wireframe** : Pour les ombres et objets physiques
- **Paramètres ajustables** : Tous les paramètres d'éclairage sont configurables

## Configuration et Personnalisation

### 1. Paramètres d'Éclairage Indirect

Tous les paramètres d'éclairage indirect sont configurables via l'interface de debug :

- **Distance** : Amplitude, force, puissance
- **Angle** : Force, décalage, puissance
- **Couleur** : Couleur de l'éclairage indirect

### 2. Paramètres d'Ombres

- **Position du soleil** : X, Y, Z
- **Intensité globale** : Alpha des ombres
- **Distance maximale** : Portée de projection
- **Puissance de distance** : Courbe de décroissance
- **Couleur** : Couleur des ombres

### 3. Effets de Post-Processing

- **Lueurs** : Position, rayon, couleur, transparence
- **Flou** : Force horizontale et verticale
- **Activation conditionnelle** : Selon le mode (desktop/mobile)

## Intégration avec les Autres Systèmes

### 1. Synchronisation avec la Physique

- Les ombres suivent automatiquement les objets physiques
- Mise à jour en temps réel des positions et rotations
- Gestion des états (sommeil, collision)

### 2. Intégration avec la Caméra

- L'éclairage indirect s'adapte à la position de la caméra
- Les ombres sont calculées selon la perspective
- Effets de post-processing appliqués à la vue finale

### 3. Gestion des Sections

- Chaque section peut avoir ses propres paramètres d'éclairage
- Transitions fluides entre les sections
- Adaptation selon le contenu affiché

Ce système d'éclairage innovant permet d'obtenir un rendu photoréaliste avec des performances optimales, tout en offrant une grande flexibilité pour la personnalisation et l'adaptation aux différentes plateformes.
