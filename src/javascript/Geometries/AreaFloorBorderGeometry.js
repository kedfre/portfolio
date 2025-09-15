/**
 * AREAFLOORBORDERGEOMETRY.JS - Géométrie de Bordure de Sol de Zone
 * 
 * Ce fichier définit une géométrie personnalisée pour créer des bordures de sol
 * dans l'environnement 3D du portfolio. Il génère une forme rectangulaire creuse
 * (cadre) avec une épaisseur personnalisable pour délimiter les zones interactives.
 * 
 * RESPONSABILITÉS :
 * - Création d'une géométrie de bordure rectangulaire creuse
 * - Définition des vertices et indices pour le rendu
 * - Gestion de l'épaisseur de bordure personnalisable
 * - Génération d'un BufferGeometry Three.js optimisé
 * 
 * STRUCTURE GÉOMÉTRIQUE :
 * - 8 vertices (4 coins intérieurs + 4 coins extérieurs)
 * - 8 triangles formant un cadre rectangulaire
 * - Rectangle creux avec épaisseur définie
 * - Géométrie 2D (z = 0) pour les bordures de sol
 * 
 * UTILISATION :
 * - Bordures de délimitation des zones interactives
 * - Cadres visuels pour les sols de sections
 * - Éléments de décoration et de structure
 * - Indicateurs visuels de zones
 * 
 * OPTIMISATIONS :
 * - BufferGeometry pour performance GPU
 * - Géométrie 2D simplifiée
 * - Indices de triangles efficaces
 * - Géométrie réutilisable
 */

import * as THREE from 'three'

/**
 * AreaFloorBorderGeometry - Classe de géométrie de bordure de sol
 * 
 * Crée une géométrie de bordure rectangulaire creuse avec des dimensions
 * et une épaisseur personnalisables. La géométrie forme un cadre rectangulaire
 * pour délimiter visuellement les zones interactives.
 */
class AreaFloorBorderGeometry
{
    /**
     * Constructor - Création de la géométrie de bordure de sol
     * 
     * @param {number} _width - Largeur totale de la bordure
     * @param {number} _height - Hauteur totale de la bordure
     * @param {number} _thickness - Épaisseur de la bordure
     * 
     * GÉNÈRE :
     * - 8 vertices (4 coins intérieurs + 4 coins extérieurs)
     * - 8 triangles formant un cadre rectangulaire
     * - Rectangle creux avec épaisseur définie
     * - BufferGeometry optimisée pour le rendu
     */
    constructor(_width, _height, _thickness)
    {
        // Stockage des paramètres de la géométrie
        this.parameters = {
            width: _width,
            height: _height,
            thickness: _thickness
        }

        // Type de géométrie (note: nom incorrect, devrait être 'AreaFloorBorderGeometry')
        this.type = 'AreaFloorGeometry'

        // Configuration des buffers de données
        const length = 8 // Nombre de vertices

        // Initialisation des buffers
        const vertices = new Float32Array(length * 3) // 3 coordonnées par vertex (x, y, z)
        const indices = new Uint32Array(length * 6)   // 6 indices par triangle (2 triangles par segment)

        // Calcul des dimensions intérieures et extérieures
        const outerWidth = _width      // Largeur extérieure
        const outerHeight = _height    // Hauteur extérieure

        const innerWidth = outerWidth - _thickness   // Largeur intérieure
        const innerHeight = outerHeight - _thickness // Hauteur intérieure

        // DÉFINITION DES VERTICES - 8 points du cadre rectangulaire
        // Rectangle intérieur (coins 0-3)
        vertices[0 * 3 + 0] = innerWidth * 0.5   // Coin supérieur droit intérieur
        vertices[0 * 3 + 1] = innerHeight * 0.5
        vertices[0 * 3 + 2] = 0

        vertices[1 * 3 + 0] = innerWidth * 0.5   // Coin inférieur droit intérieur
        vertices[1 * 3 + 1] = - innerHeight * 0.5
        vertices[1 * 3 + 2] = 0

        vertices[2 * 3 + 0] = - innerWidth * 0.5 // Coin inférieur gauche intérieur
        vertices[2 * 3 + 1] = - innerHeight * 0.5
        vertices[2 * 3 + 2] = 0

        vertices[3 * 3 + 0] = - innerWidth * 0.5 // Coin supérieur gauche intérieur
        vertices[3 * 3 + 1] = innerHeight * 0.5
        vertices[3 * 3 + 2] = 0

        // Rectangle extérieur (coins 4-7)
        vertices[4 * 3 + 0] = outerWidth * 0.5   // Coin supérieur droit extérieur
        vertices[4 * 3 + 1] = outerHeight * 0.5
        vertices[4 * 3 + 2] = 0

        vertices[5 * 3 + 0] = outerWidth * 0.5   // Coin inférieur droit extérieur
        vertices[5 * 3 + 1] = - outerHeight * 0.5
        vertices[5 * 3 + 2] = 0

        vertices[6 * 3 + 0] = - outerWidth * 0.5 // Coin inférieur gauche extérieur
        vertices[6 * 3 + 1] = - outerHeight * 0.5
        vertices[6 * 3 + 2] = 0

        vertices[7 * 3 + 0] = - outerWidth * 0.5 // Coin supérieur gauche extérieur
        vertices[7 * 3 + 1] = outerHeight * 0.5
        vertices[7 * 3 + 2] = 0

        // DÉFINITION DES INDICES - Triangles pour former le cadre rectangulaire
        // Segment supérieur (coins 4, 0, 1, 5)
        indices[0 * 3 + 0] = 4  // Triangle 1: 4-0-1
        indices[0 * 3 + 1] = 0
        indices[0 * 3 + 2] = 1

        indices[1 * 3 + 0] = 1  // Triangle 2: 1-5-4
        indices[1 * 3 + 1] = 5
        indices[1 * 3 + 2] = 4

        // Segment droit (coins 5, 1, 2, 6)
        indices[2 * 3 + 0] = 5  // Triangle 3: 5-1-2
        indices[2 * 3 + 1] = 1
        indices[2 * 3 + 2] = 2

        indices[3 * 3 + 0] = 2  // Triangle 4: 2-6-5
        indices[3 * 3 + 1] = 6
        indices[3 * 3 + 2] = 5

        // Segment inférieur (coins 6, 2, 3, 7)
        indices[4 * 3 + 0] = 6  // Triangle 5: 6-2-3
        indices[4 * 3 + 1] = 2
        indices[4 * 3 + 2] = 3

        indices[5 * 3 + 0] = 3  // Triangle 6: 3-7-6
        indices[5 * 3 + 1] = 7
        indices[5 * 3 + 2] = 6

        // Segment gauche (coins 7, 3, 0, 4)
        indices[6 * 3 + 0] = 7  // Triangle 7: 7-3-0
        indices[6 * 3 + 1] = 3
        indices[6 * 3 + 2] = 0

        indices[7 * 3 + 0] = 0  // Triangle 8: 0-4-7
        indices[7 * 3 + 1] = 4
        indices[7 * 3 + 2] = 7

        // CRÉATION DE LA BUFFERGEOMETRY THREE.JS
        const geometry = new THREE.BufferGeometry()

        // Configuration des indices de triangles
        geometry.setIndex(new THREE.BufferAttribute(indices, 1, false))

        // Configuration des attributs de géométrie
        geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3)) // Positions des vertices

        // Retour de la géométrie configurée
        return geometry
    }
}

export default AreaFloorBorderGeometry
