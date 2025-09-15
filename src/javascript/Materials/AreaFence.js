/**
 * AREAFENCE.JS - Matériau de Clôture de Zone
 * 
 * Ce fichier définit un matériau shader personnalisé pour les clôtures de zone
 * dans l'environnement 3D du portfolio. Il utilise des shaders GLSL personnalisés
 * pour créer des effets visuels animés et transparents.
 * 
 * RESPONSABILITÉS :
 * - Création d'un matériau shader pour les clôtures
 * - Gestion des uniformes pour les animations
 * - Configuration de la transparence et du rendu
 * - Intégration des shaders vertex et fragment
 * 
 * UNIFORMES :
 * - uTime : Temps pour les animations
 * - uBorderAlpha : Transparence de la bordure
 * - uStrikeAlpha : Transparence des rayures
 * 
 * CARACTÉRISTIQUES :
 * - Matériau transparent avec double face
 * - Pas d'écriture en profondeur (depthWrite: false)
 * - Shaders personnalisés pour effets visuels
 * - Animations basées sur le temps
 * 
 * UTILISATION :
 * - Clôtures de délimitation des zones interactives
 * - Barrières visuelles animées
 * - Éléments de décoration avec effets
 */

import * as THREE from 'three'

import shaderFragment from '../../shaders/areaFence/fragment.glsl'
import shaderVertex from '../../shaders/areaFence/vertex.glsl'

/**
 * Fonction de création du matériau AreaFence
 * 
 * Crée un matériau shader personnalisé pour les clôtures de zone avec
 * des effets d'animation et de transparence configurables.
 * 
 * @returns {THREE.ShaderMaterial} Matériau shader configuré
 */
export default function()
{
    // Définition des uniformes du shader
    const uniforms = {
        uTime: { value: null },           // Temps pour les animations
        uBorderAlpha: { value: null },    // Transparence de la bordure
        uStrikeAlpha: { value: null }     // Transparence des rayures
    }

    // Création du matériau shader
    const material = new THREE.ShaderMaterial({
        wireframe: false,                 // Pas de mode filaire
        transparent: true,                // Matériau transparent
        side: THREE.DoubleSide,           // Rendu des deux faces
        depthTest: true,                  // Test de profondeur activé
        depthWrite: false,                // Pas d'écriture en profondeur
        uniforms,                         // Uniformes du shader
        vertexShader: shaderVertex,       // Shader vertex personnalisé
        fragmentShader: shaderFragment    // Shader fragment personnalisé
    })

    return material
}
