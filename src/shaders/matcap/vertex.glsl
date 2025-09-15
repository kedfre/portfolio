// ============================================================================
// DÉFINITIONS ET CONFIGURATION
// ============================================================================

// Définition pour le debug (peut être supprimée en production)
#define TOTO

// Activation du système Matcap
#define MATCAP
#define USE_MATCAP

// ============================================================================
// VARIABLES VARYING (PASSÉES AU FRAGMENT SHADER)
// ============================================================================

// Position du vertex dans l'espace de vue (calculée et passée au fragment shader)
varying vec3 vViewPosition;

// Si le shading n'est pas plat, on passe la normale au fragment shader
#ifndef FLAT_SHADED
    // Normale du vertex (interpolée vers le fragment shader)
    varying vec3 vNormal;
#endif

// ============================================================================
// INCLUDES THREE.JS (FONCTIONS ET DÉFINITIONS UTILITAIRES)
// ============================================================================

// Fonctions mathématiques communes (sin, cos, pow, etc.)
#include <common>

// Gestion des coordonnées UV pour les textures
#include <uv_pars_vertex>

// Gestion des displacement maps (textures de déformation)
#include <displacementmap_pars_vertex>

// Gestion du brouillard (fog)
#include <fog_pars_vertex>

// Gestion des morph targets (animation de forme)
#include <morphtarget_pars_vertex>

// Gestion du skinning (animation de squelette)
#include <skinning_pars_vertex>

// Gestion du buffer de profondeur logarithmique
#include <logdepthbuf_pars_vertex>

// Gestion des plans de découpage (clipping planes)
#include <clipping_planes_pars_vertex>

// ============================================================================
// UNIFORMES ET VARIABLES PERSONNALISÉS
// ============================================================================

// Uniforme pour l'animation de révélation (0.0 = caché, 1.0 = visible)
uniform float uRevealProgress;

// Position du vertex dans l'espace monde (calculée et passée au fragment shader)
varying vec3 vWorldPosition;

// Inclusion de la fonction d'easing sinusoïdale personnalisée
#include ../partials/easeSin.glsl

// ============================================================================
// FONCTION PRINCIPALE DU VERTEX SHADER
// ============================================================================

void main() {

    // ============================================================================
    // TRAITEMENTS STANDARD THREE.JS
    // ============================================================================
    
    // Calcul des coordonnées UV pour les textures
    #include <uv_vertex>

    // === CALCUL DE LA NORMALE ===
    
    // Initialisation de la normale
    #include <beginnormal_vertex>
    
    // Application des morph targets sur la normale
    #include <morphnormal_vertex>
    
    // Application du skinning de base sur la normale
    #include <skinbase_vertex>
    
    // Application du skinning complet sur la normale
    #include <skinnormal_vertex>
    
    // Calcul de la normale finale transformée
    #include <defaultnormal_vertex>

    // Si le shading n'est pas plat, on normalise et passe la normale au fragment shader
    // Note : Quand FLAT_SHADED est activé, la normale est calculée avec les dérivées
    #ifndef FLAT_SHADED
        // Normalise la normale transformée et la passe au fragment shader
        vNormal = normalize( transformedNormal );
    #endif

    // === CALCUL DE LA POSITION ===
    
    // Initialisation de la position du vertex
    #include <begin_vertex>
    
    // Application des morph targets sur la position
    #include <morphtarget_vertex>
    
    // Application du skinning sur la position
    #include <skinning_vertex>
    
    // Application des displacement maps (déformation par texture)
    #include <displacementmap_vertex>

    // ============================================================================
    // TRANSFORMATIONS PERSONNALISÉES
    // ============================================================================
    
    // === TRANSFORMATION VERS L'ESPACE MONDE ===
    
    // Transforme la normale de l'espace objet vers l'espace monde
    // modelMatrix : matrice de transformation de l'objet (position, rotation, échelle)
    vec4 worldNormal = modelMatrix * vec4(normal, 1.0);

    // Transforme la position du vertex de l'espace objet vers l'espace monde
    // transformed : position du vertex après application des morph targets, skinning, etc.
    vec4 worldPosition = modelMatrix * vec4(transformed, 1.0);

    // ============================================================================
    // SYSTÈME DE RÉVÉLATION PROGRESSIVE
    // ============================================================================
    
    // === CALCUL DE LA DISTANCE AU CENTRE ===
    
    // Calcule la distance du vertex au centre de l'origine (0,0,0)
    // Cette distance détermine l'ordre de révélation des objets
    float distanceToCenter = length(worldPosition);
    
    // === PARAMÈTRES DE L'ANIMATION DE RÉVÉLATION ===
    
    // Amplitude de l'effet de révélation en Z (profondeur)
    // Plus cette valeur est grande, plus l'effet de "plongée" est prononcé
    float zAmplitude = 3.2;
    
    // === CALCUL DU PROGRÈS DE RÉVÉLATION ===
    
    // Calcule le progrès de révélation basé sur :
    // - uRevealProgress : progrès global de l'animation (0.0 à 1.0)
    // - distanceToCenter / 30.0 : normalise la distance (divise par 30 unités)
    // - * 5.0 : accélère l'effet de révélation
    float revealProgress = (uRevealProgress - distanceToCenter / 30.0) * 5.0;
    
    // Inverse et clamp le progrès pour créer un effet de "vague"
    // 1.0 - clamp(..., -0.1, 1.0) : inverse l'effet et permet des valeurs négatives
    revealProgress = 1.0 - clamp(revealProgress, - 0.1, 1.0);
    
    // Applique une courbe de puissance pour adoucir l'animation
    // pow(..., 2.0) : crée une courbe quadratique (plus douce)
    revealProgress = pow(revealProgress, 2.0);
    
    // === CONDITION SPÉCIALE POUR LA FIN D'ANIMATION ===
    
    // Quand l'animation est presque terminée (90%), on supprime l'effet
    // Ceci évite que l'effet reste visible à la fin de l'animation
    if(uRevealProgress > 0.9)
    {
        revealProgress = 0.0;
    }
    
    // === APPLICATION DE L'EFFET DE RÉVÉLATION ===
    
    // Déplace le vertex vers le bas (Z négatif) selon le progrès de révélation
    // Plus revealProgress est élevé, plus le vertex est déplacé vers le bas
    // Cela crée un effet de "plongée" pendant la révélation
    worldPosition.z -= revealProgress * zAmplitude;

    // ============================================================================
    // MISE À JOUR DES VARIABLES VARYING
    // ============================================================================
    
    // Passe la position monde au fragment shader pour les calculs d'éclairage indirect
    vWorldPosition = worldPosition.xyz;

    // ============================================================================
    // CALCUL DE LA POSITION FINALE
    // ============================================================================
    
    // Transforme la position monde vers l'espace de vue (caméra)
    vec4 mvPosition = viewMatrix * worldPosition;
    
    // Transforme la position de vue vers l'espace de projection (écran)
    // gl_Position : position finale du vertex sur l'écran
    gl_Position = projectionMatrix * mvPosition;

    // ============================================================================
    // POST-TRAITEMENTS FINAUX THREE.JS
    // ============================================================================
    
    // Note : <project_vertex> est commenté car on calcule manuellement la projection
    // pour avoir plus de contrôle sur le processus de transformation
    // #include <project_vertex>

    // Gestion du buffer de profondeur logarithmique (optimisation)
    #include <logdepthbuf_vertex>
    
    // Application des plans de découpage (clipping planes)
    #include <clipping_planes_vertex>
    
    // Application du brouillard (fog) si activé
    #include <fog_vertex>

    // ============================================================================
    // CALCUL DE LA POSITION DE VUE
    // ============================================================================
    
    // Calcule la position de vue (direction du vertex vers la caméra)
    // mvPosition.xyz est la position en espace de vue
    // Le signe négatif donne la direction du vertex vers la caméra
    vViewPosition = - mvPosition.xyz;

}
