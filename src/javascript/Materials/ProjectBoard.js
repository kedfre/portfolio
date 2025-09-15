/**
 * PROJECTBOARD.JS - Matériau de Tableau de Projet
 * 
 * Ce fichier définit un matériau shader personnalisé pour les tableaux de projet
 * dans l'environnement 3D du portfolio. Il utilise des shaders GLSL personnalisés
 * pour afficher des textures de projet avec transparence et couleurs configurables.
 * 
 * RESPONSABILITÉS :
 * - Création d'un matériau shader pour les tableaux de projet
 * - Gestion des textures de projet et de la transparence
 * - Configuration des couleurs et du rendu
 * - Intégration des shaders vertex et fragment
 * 
 * UNIFORMES :
 * - uTexture : Texture du projet à afficher
 * - uTextureAlpha : Transparence de la texture
 * - uColor : Couleur de base du matériau
 * 
 * CARACTÉRISTIQUES :
 * - Matériau opaque avec textures de projet
 * - Transparence de texture configurable
 * - Couleurs personnalisables
 * - Shaders personnalisés pour le rendu
 * 
 * UTILISATION :
 * - Tableaux de présentation des projets
 * - Affichage des textures de projet
 * - Éléments de galerie de projets
 * - Surfaces d'information visuelle
 */

import * as THREE from 'three'

import shaderFragment from '../../shaders/projectBoard/fragment.glsl'
import shaderVertex from '../../shaders/projectBoard/vertex.glsl'

/**
 * Fonction de création du matériau ProjectBoard
 * 
 * Crée un matériau shader personnalisé pour les tableaux de projet avec
 * support des textures et de la transparence.
 * 
 * @returns {THREE.ShaderMaterial} Matériau shader configuré
 */
export default function()
{
    // Définition des uniformes du shader
    const uniforms = {
        uTexture: { value: null },        // Texture du projet
        uTextureAlpha: { value: null },   // Transparence de la texture
        uColor: { value: null }           // Couleur de base
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
