/**
 * BLUR.JS - Passe de Post-Processing Blur
 * 
 * Ce fichier définit une passe de post-processing pour l'effet de flou
 * dans l'environnement 3D du portfolio. Il utilise des shaders GLSL personnalisés
 * pour créer des effets de flou gaussien avec résolution et force configurables.
 * 
 * RESPONSABILITÉS :
 * - Définition d'une passe de post-processing pour le flou
 * - Gestion des uniformes pour la résolution et la force
 * - Configuration des shaders vertex et fragment
 * - Intégration avec le système de post-processing
 * 
 * UNIFORMES :
 * - tDiffuse : Texture diffuse à traiter (type: 't')
 * - uResolution : Résolution de l'écran (type: 'v2')
 * - uStrength : Force du flou (type: 'v2')
 * 
 * CARACTÉRISTIQUES :
 * - Passe de post-processing pour effets de flou
 * - Shaders GLSL personnalisés
 * - Uniformes typés pour performance
 * - Intégration avec EffectComposer
 * 
 * UTILISATION :
 * - Effets de flou gaussien
 * - Post-processing de l'image finale
 * - Amélioration visuelle et artistique
 * - Effets de profondeur de champ
 */

import shaderFragment from '../../shaders/blur/fragment.glsl'
import shaderVertex from '../../shaders/blur/vertex.glsl'

/**
 * Configuration de la passe Blur
 * 
 * Définit les uniformes et shaders pour l'effet de flou gaussien
 * dans le pipeline de post-processing.
 * 
 * @returns {Object} Configuration de la passe Blur
 */
export default {
    // Définition des uniformes du shader
    uniforms:
    {
        tDiffuse: { type: 't', value: null },      // Texture diffuse à traiter
        uResolution: { type: 'v2', value: null },  // Résolution de l'écran
        uStrength: { type: 'v2', value: null }     // Force du flou
    },
    vertexShader: shaderVertex,                    // Shader vertex personnalisé
    fragmentShader: shaderFragment                 // Shader fragment personnalisé
}
