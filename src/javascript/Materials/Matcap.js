/**
 * MATCAP.JS - Matériau Matcap Avancé
 * 
 * Ce fichier définit un matériau shader personnalisé basé sur la technique Matcap
 * (Material Capture) pour l'environnement 3D du portfolio. Il utilise des shaders
 * GLSL personnalisés avec des effets d'éclairage indirect et d'animation de révélation.
 * 
 * RESPONSABILITÉS :
 * - Création d'un matériau Matcap personnalisé
 * - Gestion des uniformes d'éclairage indirect
 * - Configuration des extensions et définitions
 * - Intégration des shaders vertex et fragment
 * 
 * UNIFORMES :
 * - UniformsLib : Bibliothèques standard Three.js (common, bumpmap, normalmap, etc.)
 * - matcap : Texture Matcap principale
 * - uRevealProgress : Progression de l'animation de révélation
 * - uIndirectDistance* : Paramètres d'éclairage indirect basé sur la distance
 * - uIndirectAngle* : Paramètres d'éclairage indirect basé sur l'angle
 * - uIndirectColor : Couleur de l'éclairage indirect
 * 
 * CARACTÉRISTIQUES :
 * - Matériau opaque avec éclairage indirect
 * - Support des textures Matcap
 * - Animations de révélation
 * - Éclairage basé sur la distance et l'angle
 * - Extensions WebGL configurées
 * 
 * UTILISATION :
 * - Matériaux pour tous les objets 3D du portfolio
 * - Effets d'éclairage réalistes sans lumières
 * - Animations de révélation des objets
 * - Rendu optimisé avec Matcap
 */

import * as THREE from 'three'

import shaderFragment from '../../shaders/matcap/fragment.glsl'
import shaderVertex from '../../shaders/matcap/vertex.glsl'

/**
 * Fonction de création du matériau Matcap
 * 
 * Crée un matériau shader personnalisé basé sur la technique Matcap avec
 * des effets d'éclairage indirect et d'animation de révélation.
 * 
 * @returns {THREE.ShaderMaterial} Matériau shader configuré
 */
export default function()
{
    // Définition des uniformes du shader
    const uniforms = {
        // Bibliothèques d'uniformes standard Three.js
        ...THREE.UniformsLib.common,        // Uniformes communs
        ...THREE.UniformsLib.bumpmap,       // Support des bump maps
        ...THREE.UniformsLib.normalmap,     // Support des normal maps
        ...THREE.UniformsLib.displacementmap, // Support des displacement maps
        ...THREE.UniformsLib.fog,           // Support du brouillard
        
        // Uniformes personnalisés
        matcap: { value: null },                    // Texture Matcap principale
        uRevealProgress: { value: null },           // Progression de l'animation de révélation
        
        // Paramètres d'éclairage indirect basé sur la distance
        uIndirectDistanceAmplitude: { value: null }, // Amplitude de l'effet de distance
        uIndirectDistanceStrength: { value: null },  // Force de l'effet de distance
        uIndirectDistancePower: { value: null },     // Puissance de l'effet de distance
        
        // Paramètres d'éclairage indirect basé sur l'angle
        uIndirectAngleStrength: { value: null },     // Force de l'effet d'angle
        uIndirectAngleOffset: { value: null },       // Décalage de l'effet d'angle
        uIndirectAnglePower: { value: null },        // Puissance de l'effet d'angle
        
        uIndirectColor: { value: null }              // Couleur de l'éclairage indirect
    }

    // Configuration des extensions WebGL
    const extensions = {
        derivatives: false,           // Pas de dérivées
        fragDepth: false,            // Pas de profondeur de fragment
        drawBuffers: false,          // Pas de draw buffers
        shaderTextureLOD: false      // Pas de LOD de texture
    }

    // Définitions du shader
    const defines = {
        MATCAP: ''                   // Définition Matcap activée
    }

    // Création du matériau shader
    const material = new THREE.ShaderMaterial({
        wireframe: false,            // Pas de mode filaire
        transparent: false,          // Matériau opaque
        uniforms,                    // Uniformes du shader
        extensions,                  // Extensions WebGL
        defines,                     // Définitions du shader
        lights: false,               // Pas d'éclairage standard
        vertexShader: shaderVertex,  // Shader vertex personnalisé
        fragmentShader: shaderFragment // Shader fragment personnalisé
    })

    return material
}
