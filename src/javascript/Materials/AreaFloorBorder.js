/**
 * AREAFLOORBORDER.JS - Matériau de Bordure de Sol de Zone
 * 
 * Ce fichier définit un matériau shader personnalisé pour les bordures de sol
 * dans l'environnement 3D du portfolio. Il utilise des shaders GLSL personnalisés
 * pour créer des effets de progression et de chargement animés.
 * 
 * RESPONSABILITÉS :
 * - Création d'un matériau shader pour les bordures de sol
 * - Gestion des uniformes pour les animations de progression
 * - Configuration de la transparence et du rendu
 * - Intégration des shaders vertex et fragment
 * 
 * UNIFORMES :
 * - uColor : Couleur de la bordure
 * - uAlpha : Transparence globale
 * - uLoadProgress : Progression du chargement
 * - uProgress : Progression générale
 * 
 * CARACTÉRISTIQUES :
 * - Matériau transparent avec effets de progression
 * - Pas d'écriture en profondeur (depthWrite: false)
 * - Shaders personnalisés pour animations
 * - Effets de chargement et de progression
 * 
 * UTILISATION :
 * - Bordures de délimitation des zones interactives
 * - Indicateurs de progression de chargement
 * - Cadres visuels avec animations
 * - Éléments de feedback utilisateur
 */

import * as THREE from 'three'

import shaderFragment from '../../shaders/areaFloorBorder/fragment.glsl'
import shaderVertex from '../../shaders/areaFloorBorder/vertex.glsl'

/**
 * Fonction de création du matériau AreaFloorBorder
 * 
 * Crée un matériau shader personnalisé pour les bordures de sol avec
 * des effets de progression et de chargement configurables.
 * 
 * @returns {THREE.ShaderMaterial} Matériau shader configuré
 */
export default function()
{
    // Définition des uniformes du shader
    const uniforms = {
        uColor: { value: null },          // Couleur de la bordure
        uAlpha: { value: null },          // Transparence globale
        uLoadProgress: { value: null },   // Progression du chargement
        uProgress: { value: null }        // Progression générale
    }

    // Création du matériau shader
    const material = new THREE.ShaderMaterial({
        wireframe: false,                 // Pas de mode filaire
        transparent: true,                // Matériau transparent
        depthTest: true,                  // Test de profondeur activé
        depthWrite: false,                // Pas d'écriture en profondeur
        uniforms,                         // Uniformes du shader
        vertexShader: shaderVertex,       // Shader vertex personnalisé
        fragmentShader: shaderFragment    // Shader fragment personnalisé
    })

    return material
}
