/**
 * FLOOR.JS - Matériau de Sol
 * 
 * Ce fichier définit un matériau shader personnalisé pour les sols
 * dans l'environnement 3D du portfolio. Il utilise des shaders GLSL personnalisés
 * pour afficher des textures de fond sur les surfaces de sol.
 * 
 * RESPONSABILITÉS :
 * - Création d'un matériau shader pour les sols
 * - Gestion des textures de fond
 * - Configuration du rendu opaque
 * - Intégration des shaders vertex et fragment
 * 
 * UNIFORMES :
 * - tBackground : Texture de fond à afficher
 * 
 * CARACTÉRISTIQUES :
 * - Matériau opaque (transparent: false)
 * - Utilisation de textures de fond
 * - Shaders personnalisés pour le rendu
 * - Optimisé pour les surfaces de sol
 * 
 * UTILISATION :
 * - Sols des différentes sections du portfolio
 * - Surfaces de base pour les zones interactives
 * - Textures de fond pour les projets
 * - Éléments de décoration de sol
 */

import * as THREE from 'three'

import shaderFragment from '../../shaders/floor/fragment.glsl'
import shaderVertex from '../../shaders/floor/vertex.glsl'

/**
 * Fonction de création du matériau Floor
 * 
 * Crée un matériau shader personnalisé pour les sols avec
 * support des textures de fond.
 * 
 * @returns {THREE.ShaderMaterial} Matériau shader configuré
 */
export default function()
{
    // Définition des uniformes du shader
    const uniforms = {
        tBackground: { value: null }       // Texture de fond
    }

    // Création du matériau shader
    const material = new THREE.ShaderMaterial({
        wireframe: false,                 // Pas de mode filaire
        transparent: false,               // Matériau opaque
        uniforms,                         // Uniformes du shader
        vertexShader: shaderVertex,       // Shader vertex personnalisé
        fragmentShader: shaderFragment    // Shader fragment personnalisé
    })

    return material
}
