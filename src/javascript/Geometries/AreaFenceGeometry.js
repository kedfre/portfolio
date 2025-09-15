/**
 * AREAFENCEGEOMETRY.JS - Géométrie de Clôture de Zone
 * 
 * Ce fichier définit une géométrie personnalisée pour créer des clôtures de zone
 * dans l'environnement 3D du portfolio. Il génère un parallélépipède avec des
 * coordonnées UV optimisées pour le mapping de textures.
 * 
 * RESPONSABILITÉS :
 * - Création d'une géométrie de clôture rectangulaire
 * - Définition des vertices, UVs et indices pour le rendu
 * - Optimisation des coordonnées de texture
 * - Génération d'un BufferGeometry Three.js
 * 
 * STRUCTURE GÉOMÉTRIQUE :
 * - 8 vertices (4 en bas, 4 en haut)
 * - 12 triangles (2 par face latérale)
 * - Coordonnées UV pour mapping de texture
 * - Parallélépipède avec dimensions personnalisables
 * 
 * UTILISATION :
 * - Clôtures de délimitation des zones interactives
 * - Barrières visuelles dans l'environnement 3D
 * - Éléments de décoration et de structure
 * 
 * OPTIMISATIONS :
 * - BufferGeometry pour performance GPU
 * - Coordonnées UV optimisées
 * - Indices de triangles efficaces
 * - Géométrie réutilisable
 */

import * as THREE from 'three'

/**
 * AreaFenceGeometry - Classe de géométrie de clôture
 * 
 * Crée une géométrie de clôture rectangulaire avec des dimensions personnalisables.
 * La géométrie est générée sous forme de parallélépipède avec des coordonnées UV
 * optimisées pour le mapping de textures.
 */
class AreaFenceGeometry
{
    /**
     * Constructor - Création de la géométrie de clôture
     * 
     * @param {number} _width - Largeur de la clôture
     * @param {number} _height - Hauteur de la clôture  
     * @param {number} _depth - Profondeur/épaisseur de la clôture
     * 
     * GÉNÈRE :
     * - 8 vertices (4 coins inférieurs + 4 coins supérieurs)
     * - 12 triangles (2 par face latérale)
     * - Coordonnées UV pour mapping de texture
     * - BufferGeometry optimisée pour le rendu
     */
    constructor(_width, _height, _depth,)
    {
        // Stockage des paramètres de la géométrie
        this.parameters = {
            width: _width,
            height: _height,
            depth: _depth
        }

        // Type de géométrie (note: nom incorrect, devrait être 'AreaFenceGeometry')
        this.type = 'AreaFloorGeometry'

        // Configuration des buffers de données
        const length = 8 // Nombre de vertices

        // Initialisation des buffers
        const vertices = new Float32Array(length * 3) // 3 coordonnées par vertex (x, y, z)
        const uvs = new Uint32Array(length * 2)       // 2 coordonnées par vertex (u, v)
        const indices = new Uint32Array(length * 6)   // 6 indices par triangle (2 triangles par face)

        // DÉFINITION DES VERTICES - 8 points du parallélépipède
        // Face inférieure (z = 0)
        vertices[0 * 3 + 0] = _width * 0.5   // Coin supérieur droit
        vertices[0 * 3 + 1] = _height * 0.5
        vertices[0 * 3 + 2] = 0

        vertices[1 * 3 + 0] = _width * 0.5   // Coin inférieur droit
        vertices[1 * 3 + 1] = - _height * 0.5
        vertices[1 * 3 + 2] = 0

        vertices[2 * 3 + 0] = - _width * 0.5 // Coin inférieur gauche
        vertices[2 * 3 + 1] = - _height * 0.5
        vertices[2 * 3 + 2] = 0

        vertices[3 * 3 + 0] = - _width * 0.5 // Coin supérieur gauche
        vertices[3 * 3 + 1] = _height * 0.5
        vertices[3 * 3 + 2] = 0

        // Face supérieure (z = _depth)
        vertices[4 * 3 + 0] = _width * 0.5   // Coin supérieur droit
        vertices[4 * 3 + 1] = _height * 0.5
        vertices[4 * 3 + 2] = _depth

        vertices[5 * 3 + 0] = _width * 0.5   // Coin inférieur droit
        vertices[5 * 3 + 1] = - _height * 0.5
        vertices[5 * 3 + 2] = _depth

        vertices[6 * 3 + 0] = - _width * 0.5 // Coin inférieur gauche
        vertices[6 * 3 + 1] = - _height * 0.5
        vertices[6 * 3 + 2] = _depth

        vertices[7 * 3 + 0] = - _width * 0.5 // Coin supérieur gauche
        vertices[7 * 3 + 1] = _height * 0.5
        vertices[7 * 3 + 2] = _depth

        // DÉFINITION DES COORDONNÉES UV - Mapping de texture
        // Face inférieure (v = 0)
        uvs[0 * 2 + 0] = 0        // Coin supérieur droit
        uvs[0 * 2 + 1] = 0

        uvs[1 * 2 + 0] = 1 / 3    // Coin inférieur droit
        uvs[1 * 2 + 1] = 0

        uvs[2 * 2 + 0] = 1 / 3 * 2 // Coin inférieur gauche
        uvs[2 * 2 + 1] = 0

        uvs[3 * 2 + 0] = 1        // Coin supérieur gauche
        uvs[3 * 2 + 1] = 0

        // Face supérieure (v = 1)
        uvs[4 * 2 + 0] = 0        // Coin supérieur droit
        uvs[4 * 2 + 1] = 1

        uvs[5 * 2 + 0] = 1 / 3    // Coin inférieur droit
        uvs[5 * 2 + 1] = 1

        uvs[6 * 2 + 0] = 1 / 3 * 2 // Coin inférieur gauche
        uvs[6 * 2 + 1] = 1

        uvs[7 * 2 + 0] = 1        // Coin supérieur gauche
        uvs[7 * 2 + 1] = 1

        // DÉFINITION DES INDICES - Triangles pour les faces latérales
        // Face droite (vertices 0, 1, 4, 5)
        indices[0 * 3 + 0] = 0  // Triangle 1: 0-4-1
        indices[0 * 3 + 1] = 4
        indices[0 * 3 + 2] = 1

        indices[1 * 3 + 0] = 5  // Triangle 2: 5-1-4
        indices[1 * 3 + 1] = 1
        indices[1 * 3 + 2] = 4

        // Face inférieure (vertices 1, 2, 5, 6)
        indices[2 * 3 + 0] = 1  // Triangle 3: 1-5-2
        indices[2 * 3 + 1] = 5
        indices[2 * 3 + 2] = 2

        indices[3 * 3 + 0] = 6  // Triangle 4: 6-2-5
        indices[3 * 3 + 1] = 2
        indices[3 * 3 + 2] = 5

        // Face gauche (vertices 2, 3, 6, 7)
        indices[4 * 3 + 0] = 2  // Triangle 5: 2-6-3
        indices[4 * 3 + 1] = 6
        indices[4 * 3 + 2] = 3

        indices[5 * 3 + 0] = 7  // Triangle 6: 7-3-6
        indices[5 * 3 + 1] = 3
        indices[5 * 3 + 2] = 6

        // Face supérieure (vertices 3, 0, 7, 4)
        indices[6 * 3 + 0] = 3  // Triangle 7: 3-7-0
        indices[6 * 3 + 1] = 7
        indices[6 * 3 + 2] = 0

        indices[7 * 3 + 0] = 4  // Triangle 8: 4-0-7
        indices[7 * 3 + 1] = 0
        indices[7 * 3 + 2] = 7

        // CRÉATION DE LA BUFFERGEOMETRY THREE.JS
        const geometry = new THREE.BufferGeometry()

        // Configuration des indices de triangles
        geometry.setIndex(new THREE.BufferAttribute(indices, 1, false))

        // Configuration des attributs de géométrie
        geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3)) // Positions des vertices
        geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2))             // Coordonnées UV

        // Retour de la géométrie configurée
        return geometry
    }
}

export default AreaFenceGeometry
