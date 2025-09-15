/**
 * FLOORSHADOW.JS - Matériau d'Ombre de Sol
 * 
 * Ce fichier définit un matériau shader personnalisé pour les ombres de sol
 * dans l'environnement 3D du portfolio. Il utilise des shaders GLSL personnalisés
 * pour créer des effets d'ombre réalistes et configurables.
 * 
 * RESPONSABILITÉS :
 * - Création d'un matériau shader pour les ombres de sol
 * - Gestion des textures d'ombre et des couleurs
 * - Configuration de la transparence et du rendu
 * - Intégration des shaders vertex et fragment
 * 
 * UNIFORMES :
 * - tShadow : Texture d'ombre à appliquer
 * - uShadowColor : Couleur de l'ombre
 * - uAlpha : Transparence de l'ombre
 * 
 * CARACTÉRISTIQUES :
 * - Matériau transparent pour les ombres
 * - Utilisation de textures d'ombre
 * - Couleurs d'ombre configurables
 * - Shaders personnalisés pour réalisme
 * 
 * UTILISATION :
 * - Ombres portées des objets sur le sol
 * - Effets d'éclairage et d'ombre
 * - Amélioration du réalisme visuel
 * - Éléments de profondeur et de dimension
 */

import * as THREE from 'three'

import shaderFragment from '../../shaders/floorShadow/fragment.glsl'
import shaderVertex from '../../shaders/floorShadow/vertex.glsl'

/**
 * Fonction de création du matériau FloorShadow
 * 
 * Crée un matériau shader personnalisé pour les ombres de sol avec
 * support des textures d'ombre et des couleurs configurables.
 * 
 * @returns {THREE.ShaderMaterial} Matériau shader configuré
 */
export default function()
{
    // Définition des uniformes du shader
    const uniforms = {
        tShadow: { value: null },         // Texture d'ombre
        uShadowColor: { value: null },    // Couleur de l'ombre
        uAlpha: { value: null }           // Transparence de l'ombre
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
