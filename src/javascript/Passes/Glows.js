/**
 * GLOWS.JS - Passe de Post-Processing Glows
 * 
 * Ce fichier définit une passe de post-processing pour les effets de lueur
 * dans l'environnement 3D du portfolio. Il utilise des shaders GLSL personnalisés
 * pour créer des effets de glow avec position, rayon, couleur et transparence configurables.
 * 
 * RESPONSABILITÉS :
 * - Définition d'une passe de post-processing pour les lueurs
 * - Gestion des uniformes pour position, rayon et couleur
 * - Configuration des shaders vertex et fragment
 * - Intégration avec le système de post-processing
 * 
 * UNIFORMES :
 * - tDiffuse : Texture diffuse à traiter (type: 't')
 * - uPosition : Position de la lueur (type: 'v2')
 * - uRadius : Rayon de la lueur (type: 'f')
 * - uColor : Couleur de la lueur (type: 'v3')
 * - uAlpha : Transparence de la lueur (type: 'f')
 * 
 * CARACTÉRISTIQUES :
 * - Passe de post-processing pour effets de lueur
 * - Shaders GLSL personnalisés
 * - Uniformes typés pour performance
 * - Intégration avec EffectComposer
 * 
 * UTILISATION :
 * - Effets de lueur et de halo
 * - Post-processing de l'image finale
 * - Amélioration visuelle et artistique
 * - Effets d'éclairage et d'ambiance
 */

import shaderFragment from '../../shaders/glows/fragment.glsl'
import shaderVertex from '../../shaders/glows/vertex.glsl'

/**
 * Configuration de la passe Glows
 * 
 * Définit les uniformes et shaders pour l'effet de lueur
 * dans le pipeline de post-processing.
 * 
 * @returns {Object} Configuration de la passe Glows
 */
export default {
    // Définition des uniformes du shader
    uniforms:
    {
        tDiffuse: { type: 't', value: null },      // Texture diffuse à traiter
        uPosition: { type: 'v2', value: null },    // Position de la lueur
        uRadius: { type: 'f', value: null },       // Rayon de la lueur
        uColor: { type: 'v3', value: null },       // Couleur de la lueur
        uAlpha: { type: 'f', value: null }         // Transparence de la lueur
    },
    vertexShader: shaderVertex,                    // Shader vertex personnalisé
    fragmentShader: shaderFragment                 // Shader fragment personnalisé
}
