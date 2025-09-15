/**
 * SHADOW.JS - Matériau d'Ombre
 * 
 * Ce fichier définit un matériau shader personnalisé pour les ombres
 * dans l'environnement 3D du portfolio. Il utilise des shaders GLSL personnalisés
 * pour créer des effets d'ombre avec dégradé et rayon de fondu configurables.
 * 
 * RESPONSABILITÉS :
 * - Création d'un matériau shader pour les ombres
 * - Gestion des couleurs et de la transparence
 * - Configuration du rayon de fondu
 * - Intégration des shaders vertex et fragment
 * 
 * UNIFORMES :
 * - uColor : Couleur de l'ombre
 * - uAlpha : Transparence de l'ombre
 * - uFadeRadius : Rayon de fondu de l'ombre
 * 
 * CARACTÉRISTIQUES :
 * - Matériau transparent pour les ombres
 * - Dégradé radial configurable
 * - Couleurs d'ombre personnalisables
 * - Shaders personnalisés pour réalisme
 * 
 * UTILISATION :
 * - Ombres portées des objets
 * - Effets d'éclairage et d'ombre
 * - Amélioration du réalisme visuel
 * - Éléments de profondeur et de dimension
 */

import * as THREE from 'three'

import shaderFragment from '../../shaders/shadow/fragment.glsl'
import shaderVertex from '../../shaders/shadow/vertex.glsl'

/**
 * Fonction de création du matériau Shadow
 * 
 * Crée un matériau shader personnalisé pour les ombres avec
 * support des couleurs et du rayon de fondu.
 * 
 * @returns {THREE.ShaderMaterial} Matériau shader configuré
 */
export default function()
{
    // Définition des uniformes du shader
    const uniforms = {
        uColor: { value: null },          // Couleur de l'ombre
        uAlpha: { value: null },          // Transparence de l'ombre
        uFadeRadius: { value: null }      // Rayon de fondu de l'ombre
    }

    // Création du matériau shader
    const material = new THREE.ShaderMaterial({
        wireframe: false,                 // Pas de mode filaire
        transparent: true,                // Matériau transparent
        uniforms,                         // Uniformes du shader
        vertexShader: shaderVertex,       // Shader vertex personnalisé
        fragmentShader: shaderFragment    // Shader fragment personnalisé
    })

    return material
}
