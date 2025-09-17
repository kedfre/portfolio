# Système d'Ombres de Sol - Portfolio 3D

## Vue d'ensemble

Le système d'ombres de sol du Portfolio 3D utilise une approche hybride combinant **ombres dynamiques** et **ombres précalculées (bakées)** pour créer un rendu réaliste et performant. Ce système gère les ombres projetées par les objets sur les surfaces de sol avec une grande précision visuelle.

## Architecture du Système

### 1. **Ombres Dynamiques (Shadows.js)**

**Principe de fonctionnement :**
- **Source lumineuse** : Un "soleil" virtuel avec position et direction configurables
- **Projection mathématique** : Les ombres sont calculées en temps réel selon la position du soleil
- **Adaptation automatique** : Les ombres s'adaptent à la position, rotation et distance des objets

**Calculs de projection :**
```javascript
// Position de l'ombre projetée
const z = Math.max(_shadow.reference.position.z + _shadow.offsetZ, 0)
const sunOffset = this.sun.vector.clone().multiplyScalar(z)
_shadow.mesh.position.x = _shadow.reference.position.x + sunOffset.x
_shadow.mesh.position.y = _shadow.reference.position.y + sunOffset.y
```

**Transparence intelligente :**
- **Distance** : Plus l'objet est haut, plus l'ombre est transparente
- **Orientation** : L'angle de l'objet influence la visibilité de l'ombre
- **Fonction de puissance** : `alpha = (maxDistance - z) / maxDistance`

### 2. **Ombres de Sol Statiques (FloorShadow.js)**

**Principe de fonctionnement :**
- **Textures d'ombre** : Utilise des textures pré-calculées (images PNG)
- **Matériau shader** : Shader personnalisé pour appliquer les textures
- **Révélation progressive** : Les ombres apparaissent progressivement lors de l'animation de démarrage

**Shader d'ombre de sol :**
```glsl
// Fragment shader - Application de la texture d'ombre
float shadowAlpha = 1.0 - texture2D(tShadow, vUv).r;
shadowAlpha *= uAlpha;
gl_FragColor = vec4(uShadowColor, shadowAlpha);
```

## Liste Complète des Ombres Bakées

### **Ombres Actives (Utilisées)**

#### 1. **Zone d'Introduction (Intro)**
- **Fichier :** `static/models/intro/static/floorShadow.png`
- **Ressource :** `introStaticFloorShadow`
- **Utilisation :** `IntroSection.js` - Ombres des lettres "BRUNO" et éléments d'introduction
- **Statut :** ✅ **ACTIVE**

#### 2. **Zone Crossroads (Carrefour)**
- **Fichier :** `static/models/crossroads/static/floorShadow.png`
- **Ressource :** `crossroadsStaticFloorShadow`
- **Utilisation :** `CrossroadsSection.js` - Ombres de la zone centrale de navigation
- **Statut :** ✅ **ACTIVE**

#### 3. **Zone Information**
- **Fichier :** `static/models/information/static/floorShadow.png`
- **Ressource :** `informationStaticFloorShadow`
- **Utilisation :** `InformationSection.js` - Ombres des éléments d'information
- **Statut :** ✅ **ACTIVE**

#### 4. **Zone Playground**
- **Fichier :** `static/models/playground/static/floorShadow.png`
- **Ressource :** `playgroundStaticFloorShadow`
- **Utilisation :** `PlaygroundSection.js` - Ombres de la zone de jeu
- **Statut :** ✅ **ACTIVE**

#### 5. **Tableau de Projets**
- **Fichier :** `static/models/projects/board/floorShadow.png`
- **Ressource :** `projectsBoardStructureFloorShadow`
- **Utilisation :** `Project.js` - Ombres du tableau principal des projets
- **Statut :** ✅ **ACTIVE**

### **Ombres Commentées (Inactives)**

#### 6. **Zone Distinction A**
- **Fichier :** `static/models/distinctionA/static/floorShadow.png`
- **Ressource :** `distinctionAStaticFloorShadow` (commentée)
- **Utilisation :** `DistinctionASection.js` - Référencée mais ressource commentée
- **Statut :** ❌ **COMMENTÉE** dans Resources.js

#### 7. **Zone Distinction B**
- **Fichier :** `static/models/distinctionB/static/floorShadow.png`
- **Ressource :** `distinctionBStaticFloorShadow` (commentée)
- **Utilisation :** `DistinctionBSection.js` - Référencée mais ressource commentée
- **Statut :** ❌ **COMMENTÉE** dans Resources.js

#### 8. **Zone Distinction C**
- **Fichier :** `static/models/distinctionC/static/floorShadow.png`
- **Ressource :** `distinctionCStaticFloorShadow` (commentée)
- **Utilisation :** `DistinctionDSection.js` - Référencée mais ressource commentée
- **Statut :** ❌ **COMMENTÉE** dans Resources.js

## Structure d'Organisation

```
static/models/
├── intro/static/floorShadow.png ✅
├── crossroads/static/floorShadow.png ✅
├── information/static/floorShadow.png ✅
├── playground/static/floorShadow.png ✅
├── projects/board/floorShadow.png ✅
├── distinctionA/static/floorShadow.png ❌
├── distinctionB/static/floorShadow.png ❌
└── distinctionC/static/floorShadow.png ❌
```

## Résumé Statistique

| Statut | Nombre | Pourcentage |
|--------|--------|-------------|
| **Actives** | 5 | 62.5% |
| **Commentées** | 3 | 37.5% |
| **Total** | 8 | 100% |

## Flux de Données

### 1. **Chargement des Ressources**
```javascript
// Dans Resources.js
{ name: 'introStaticFloorShadow', source: './models/intro/static/floorShadow.png', type: 'texture' }
```

### 2. **Application dans les Sections**
```javascript
// Dans IntroSection.js
floorShadowTexture: this.resources.items.introStaticFloorShadowTexture
```

### 3. **Parsing et Création**
```javascript
// Dans Objects.js
material.uniforms.tShadow.value = _options.floorShadowTexture
```

### 4. **Rendu avec Shader**
```glsl
// Dans floorShadow/fragment.glsl
float shadowAlpha = 1.0 - texture2D(tShadow, vUv).r;
shadowAlpha *= uAlpha;
gl_FragColor = vec4(uShadowColor, shadowAlpha);
```

## Optimisations Techniques

### **Performance**
- **Géométrie partagée** : Toutes les ombres utilisent la même géométrie plane
- **Matériau cloné** : Évite la duplication des shaders
- **DepthWrite désactivé** : Évite les conflits de profondeur
- **Z-fighting** : Décalage de 0.001 unité pour éviter les scintillements

### **Rendu**
- **Transparence progressive** : Les ombres apparaissent avec l'animation de révélation
- **Couleur personnalisable** : Couleur d'ombre par défaut `#d04500` (orange)
- **Alpha dynamique** : Contrôle de la visibilité en temps réel

## Debug et Contrôles

### **Interface de Debug**
- Contrôles pour ajuster la position du soleil
- Mode wireframe pour visualiser les ombres
- Contrôles de transformation interactifs
- Ajustement de la couleur et de l'intensité

### **Paramètres Configurables**
- `alpha` : Intensité globale des ombres
- `maxDistance` : Distance maximale de projection (3 unités)
- `distancePower` : Puissance de la fonction de distance (2)
- `color` : Couleur des ombres (`#d04500`)

## Problèmes Identifiés

### **Incohérence des Ressources**
Les sections Distinction A, B et C référencent des textures d'ombres dans leur code, mais ces ressources sont **commentées** dans `Resources.js`. Cela peut causer des erreurs lors du chargement de ces sections.

### **Recommandations**
1. **Décommenter les ressources** des zones Distinction si elles sont utilisées
2. **Vérifier la cohérence** entre les fichiers PNG existants et les références dans le code
3. **Optimiser le chargement** en ne chargeant que les ombres des zones actives

## Fichiers Impliqués

### **Code Source**
- `src/javascript/World/Shadows.js` - Gestionnaire principal des ombres dynamiques
- `src/javascript/Materials/Shadow.js` - Matériau pour les ombres projetées
- `src/javascript/Materials/FloorShadow.js` - Matériau pour les ombres de sol
- `src/javascript/World/Objects.js` - Parser qui détecte les objets "floor*"
- `src/javascript/Resources.js` - Déclaration des ressources d'ombres

### **Shaders**
- `src/shaders/shadow/fragment.glsl` - Shader fragment pour ombres dynamiques
- `src/shaders/shadow/vertex.glsl` - Shader vertex pour ombres dynamiques
- `src/shaders/floorShadow/fragment.glsl` - Shader fragment pour ombres de sol
- `src/shaders/floorShadow/vertex.glsl` - Shader vertex pour ombres de sol

### **Assets**
- `static/models/*/static/floorShadow.png` - Textures d'ombres précalculées
- `static/models/projects/board/floorShadow.png` - Texture d'ombre du tableau

## Conclusion

Le système d'ombres de sol du Portfolio 3D est un système sophistiqué qui combine le meilleur des deux approches : les ombres dynamiques pour les objets en mouvement et les ombres précalculées pour les éléments statiques. Cette approche hybride permet d'obtenir un rendu réaliste tout en maintenant de bonnes performances.

Le système est bien documenté et modulaire, facilitant la maintenance et l'évolution future. Les optimisations techniques mises en place garantissent une expérience utilisateur fluide sur différents types d'appareils.

---

*Documentation créée le : $(date)*  
*Dernière mise à jour : $(date)*
