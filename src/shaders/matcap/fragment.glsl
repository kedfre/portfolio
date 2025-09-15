// ============================================================================
// DÉFINITIONS ET CONFIGURATION
// ============================================================================

// Définition pour le debug (peut être supprimée en production)
#define TOTO

// Activation du système Matcap
#define MATCAP
#define USE_MATCAP

// ============================================================================
// UNIFORMES STANDARD THREE.JS
// ============================================================================

// Couleur diffuse de base du matériau (RGB)
uniform vec3 diffuse;

// Opacité du matériau (0.0 = transparent, 1.0 = opaque)
uniform float opacity;

// Texture Matcap principale - contient l'image de la sphère avec le matériau
uniform sampler2D matcap;

// Position du fragment dans l'espace de vue (calculée dans le vertex shader)
varying vec3 vViewPosition;

// ============================================================================
// UNIFORMES PERSONNALISÉS POUR LES EFFETS AVANCÉS
// ============================================================================

// Matrice de transformation des normales (Three.js standard)
uniform mat3 normalMatrix;

// === ÉCLAIRAGE INDIRECT BASÉ SUR LA DISTANCE ===
// Amplitude maximale de l'effet de distance (en unités 3D)
uniform float uIndirectDistanceAmplitude;

// Force de l'effet de distance (0.0 = pas d'effet, 1.0 = effet maximum)
uniform float uIndirectDistanceStrength;

// Puissance de l'effet de distance (contrôle la courbe de l'effet)
uniform float uIndirectDistancePower;

// === ÉCLAIRAGE INDIRECT BASÉ SUR L'ANGLE ===
// Force de l'effet basé sur l'angle de la normale
uniform float uIndirectAngleStrength;

// Décalage de l'angle (permet d'ajuster l'orientation de l'effet)
uniform float uIndirectAngleOffset;

// Puissance de l'effet d'angle (contrôle la courbe de l'effet)
uniform float uIndirectAnglePower;

// Couleur de l'éclairage indirect (teinte appliquée aux zones affectées)
uniform vec3 uIndirectColor;

// Position du fragment dans l'espace monde (calculée dans le vertex shader)
varying vec3 vWorldPosition;

// ============================================================================
// VARIABLES VARYING (PASSÉES DU VERTEX SHADER)
// ============================================================================

// Si le shading n'est pas plat, on récupère la normale interpolée
#ifndef FLAT_SHADED
    // Normale du fragment (interpolée depuis les sommets)
    varying vec3 vNormal;
#endif

// ============================================================================
// INCLUDES THREE.JS (FONCTIONS ET DÉFINITIONS UTILITAIRES)
// ============================================================================

// Fonctions mathématiques communes (sin, cos, pow, etc.)
#include <common>

// Gestion des coordonnées UV pour les textures
#include <uv_pars_fragment>

// Gestion des textures de couleur (diffuse maps)
#include <map_pars_fragment>

// Gestion des textures d'alpha (transparence)
#include <alphamap_pars_fragment>

// Gestion du brouillard (fog)
#include <fog_pars_fragment>

// Gestion des bump maps (relief)
#include <bumpmap_pars_fragment>

// Gestion des normal maps (détails de surface)
#include <normalmap_pars_fragment>

// Gestion du buffer de profondeur logarithmique
#include <logdepthbuf_pars_fragment>

// Gestion des plans de découpage (clipping planes)
#include <clipping_planes_pars_fragment>

// ============================================================================
// FONCTION PRINCIPALE DU FRAGMENT SHADER
// ============================================================================

void main() {

    // ============================================================================
    // FILTRAGE GÉOMÉTRIQUE (CLIPPING CUSTOM)
    // ============================================================================
    
    // Supprime les fragments derrière l'origine (z < 0)
    // Ceci est un filtre personnalisé pour éviter le rendu des parties cachées
    if(vWorldPosition.z < 0.0)
    {
        discard; // Supprime ce fragment du rendu
    }

    // ============================================================================
    // CLIPPING PLANES STANDARD THREE.JS
    // ============================================================================
    
    // Applique les plans de découpage définis dans la scène
    #include <clipping_planes_fragment>

    // ============================================================================
    // INITIALISATION DE LA COULEUR DE BASE
    // ============================================================================
    
    // Crée la couleur diffuse de base à partir des uniformes
    vec4 diffuseColor = vec4( diffuse, opacity );

    // ============================================================================
    // TRAITEMENTS STANDARD THREE.JS
    // ============================================================================
    
    // Gestion du buffer de profondeur logarithmique (optimisation)
    #include <logdepthbuf_fragment>
    
    // Application des textures de couleur (diffuse maps)
    #include <map_fragment>
    
    // Application des textures d'alpha (transparence)
    #include <alphamap_fragment>
    
    // Test d'alpha (suppression des pixels transparents)
    #include <alphatest_fragment>
    
    // Calcul de la normale de base
    #include <normal_fragment_begin>
    
    // Application des normal maps et bump maps
    #include <normal_fragment_maps>

    // ============================================================================
    // CALCUL DES COORDONNÉES MATCAP
    // ============================================================================
    
    // Direction de vue normalisée (du fragment vers la caméra)
    vec3 viewDir = normalize( vViewPosition );
    
    // Création d'un système de coordonnées orthonormé basé sur la direction de vue
    // x : vecteur tangent horizontal (perpendiculaire à viewDir)
    vec3 x = normalize( vec3( viewDir.z, 0.0, - viewDir.x ) );
    
    // y : vecteur tangent vertical (produit vectoriel pour maintenir l'orthogonalité)
    vec3 y = cross( viewDir, x );
    
    // Projection de la normale sur le plan tangent pour obtenir les coordonnées UV
    // Le facteur 0.495 évite les artefacts causés par les disques Matcap sous-dimensionnés
    vec2 uv = vec2( dot( x, normal ), dot( y, normal ) ) * 0.495 + 0.5;

    // ============================================================================
    // ÉCHANTILLONNAGE DE LA TEXTURE MATCAP
    // ============================================================================
    
    #ifdef USE_MATCAP
        // Récupère la couleur de la texture Matcap aux coordonnées calculées
        vec4 matcapColor = texture2D( matcap, uv );
        
        // Conversion linéaire (commentée - peut être activée si nécessaire)
        // matcapColor = matcapTexelToLinear( matcapColor );
    #else
        // Si Matcap désactivé, utilise une couleur blanche neutre
        vec4 matcapColor = vec4( 1.0 );
    #endif

    // ============================================================================
    // CALCUL DE LA LUMIÈRE DE BASE
    // ============================================================================
    
    // Combine la couleur diffuse avec la couleur Matcap
    // C'est la base du rendu Matcap : couleur de base × texture Matcap
    vec3 outgoingLight = diffuseColor.rgb * matcapColor.rgb;

    // ============================================================================
    // ÉCLAIRAGE INDIRECT PERSONNALISÉ
    // ============================================================================
    
    // === CALCUL DE L'EFFET BASÉ SUR LA DISTANCE ===
    
    // Calcule la force de l'effet basée sur la distance Z (profondeur)
    // Plus l'objet est loin (z grand), plus l'effet est faible
    // clamp(1.0 - z/amplitude, 0, 1) : effet maximum à z=0, nul à z=amplitude
    float indirectDistanceStrength = clamp(1.0 - vWorldPosition.z / uIndirectDistanceAmplitude, 0.0, 1.0) * uIndirectDistanceStrength;
    
    // Applique la puissance pour contrôler la courbe de l'effet
    // Puissance > 1 : effet plus concentré près de z=0
    // Puissance < 1 : effet plus étalé
    indirectDistanceStrength = pow(indirectDistanceStrength, uIndirectDistancePower);
    
    // S'assure que la valeur reste dans la plage [0,1]
    indirectDistanceStrength = clamp(indirectDistanceStrength, 0.0, 1.0);

    // === CALCUL DE L'EFFET BASÉ SUR L'ANGLE ===
    
    // Transforme la normale de l'espace objet vers l'espace monde
    // inverseTransformDirection : fonction Three.js pour la transformation inverse
    vec3 worldNormal = inverseTransformDirection(vNormal, viewMatrix);

    // Calcule l'angle entre la normale et la direction vers le bas (0,0,-1)
    // dot(normal, down) : produit scalaire pour mesurer l'alignement
    // + offset : permet d'ajuster l'orientation de l'effet
    float indirectAngleStrength = dot(normalize(worldNormal), vec3(0.0, 0.0, - 1.0)) + uIndirectAngleOffset;
    
    // Applique la force de l'effet et s'assure qu'il reste positif
    indirectAngleStrength = clamp(indirectAngleStrength * uIndirectAngleStrength, 0.0, 1.0);
    
    // Applique la puissance pour contrôler la courbe de l'effet
    indirectAngleStrength = pow(indirectAngleStrength, uIndirectAnglePower);

    // === COMBINAISON DES EFFETS ===
    
    // Couleur indirecte en dur (exemple commenté)
    // vec3 uIndirectColor = vec3(208.0 / 255.0, 69.0 / 255.0, 0.0 / 255.0);
    
    // Combine les deux effets (distance ET angle)
    // Les deux doivent être présents pour que l'effet soit visible
    float indirectStrength = indirectDistanceStrength * indirectAngleStrength;
    
    // Alternative : utiliser seulement l'effet d'angle (pour debug)
    // float indirectStrength = indirectAngleStrength;

    // === LIGNES DE DEBUG (COMMENTÉES) ===
    // Affiche la normale monde (pour visualiser l'orientation)
    // gl_FragColor = vec4(vec3(worldNormal), 1.0);
    
    // Affiche la lumière de base (sans effets indirects)
    // gl_FragColor = vec4(outgoingLight, diffuseColor.a);
    
    // Affiche la force de l'effet indirect (pour debug)
    // gl_FragColor = vec4(vec3(indirectStrength), diffuseColor.a);
    
    // === RÉSULTAT FINAL ===
    
    // Mélange la lumière de base avec la couleur indirecte
    // mix(base, indirect, strength) : interpolation linéaire
    // Plus indirectStrength est élevé, plus la couleur indirecte domine
    gl_FragColor = vec4(mix(outgoingLight, uIndirectColor, indirectStrength), diffuseColor.a);

    // ============================================================================
    // POST-TRAITEMENTS FINAUX THREE.JS
    // ============================================================================
    
    // Gestion de l'opacité finale
    #include <opaque_fragment>
    
    // Application du tonemapping (ajustement des couleurs pour l'affichage)
    #include <tonemapping_fragment>
    
    // Conversion de l'espace colorimétrique (sRGB, etc.)
    #include <colorspace_fragment>
    
    // Application du brouillard (fog) si activé
    #include <fog_fragment>
    
    // Gestion de l'alpha pré-multiplié (optimisation de la transparence)
    #include <premultiplied_alpha_fragment>
    
    // Application du dithering (réduction du banding colorimétrique)
    #include <dithering_fragment>
}
