/**
 * CROSSROADSSECTION.JS - Section de Carrefour
 * 
 * Ce fichier définit la section de carrefour dans l'environnement 3D du portfolio.
 * Cette section sert de point central de navigation entre les différentes zones
 * du portfolio, avec des tuiles de navigation vers l'intro et les projets.
 * 
 * RESPONSABILITÉS :
 * - Création de la section de carrefour central
 * - Gestion des objets statiques (base et collision)
 * - Configuration des tuiles de navigation
 * - Intégration avec le système d'objets et de tuiles
 * 
 * CARACTÉRISTIQUES :
 * - Section de navigation centrale
 * - Objets statiques avec collision
 * - Tuiles de navigation vers autres sections
 * - Position configurable (x, y)
 * 
 * UTILISATION :
 * - Point central de navigation du portfolio
 * - Connexion entre l'intro et les projets
 * - Zone de transition entre sections
 * - Hub de navigation principal
 */

import * as THREE from 'three'

export default class CrossroadsSection
{
    /**
     * Constructor - Initialisation de la section de carrefour
     * 
     * Initialise la section de carrefour avec les options fournies
     * et configure les objets statiques et les tuiles de navigation.
     * 
     * @param {Object} _options - Options de configuration
     * @param {Object} _options.time - Instance de gestion du temps
     * @param {Object} _options.resources - Gestionnaire de ressources
     * @param {Object} _options.objects - Gestionnaire d'objets 3D
     * @param {Object} _options.areas - Gestionnaire de zones interactives
     * @param {Object} _options.tiles - Gestionnaire de tuiles de navigation
     * @param {Object} _options.debug - Interface de debug
     * @param {number} _options.x - Position X de la section
     * @param {number} _options.y - Position Y de la section
     */
    constructor(_options)
    {
        // Stockage des options de configuration
        this.time = _options.time
        this.resources = _options.resources
        this.objects = _options.objects
        this.areas = _options.areas
        this.tiles = _options.tiles
        this.debug = _options.debug
        this.x = _options.x
        this.y = _options.y

        // Configuration du conteneur principal
        this.container = new THREE.Object3D()
        this.container.matrixAutoUpdate = false

        // Initialisation des composants
        this.setStatic()
        this.setTiles()
    }

    /**
     * SetStatic - Configuration des objets statiques
     * 
     * Ajoute les objets statiques de la section de carrefour avec
     * leur géométrie de base, de collision et de texture d'ombre.
     */
    setStatic()
    {
        this.objects.add({
            base: this.resources.items.crossroadsStaticBase.scene,                    // Géométrie de base
            collision: this.resources.items.crossroadsStaticCollision.scene,         // Géométrie de collision
            floorShadowTexture: this.resources.items.crossroadsStaticFloorShadowTexture, // Texture d'ombre
            offset: new THREE.Vector3(this.x, this.y, 0),                           // Position de la section
            mass: 0                                                                  // Masse nulle (objet statique)
        })
    }

    /**
     * SetTiles - Configuration des tuiles de navigation
     * 
     * Configure les tuiles de navigation qui permettent de se déplacer
     * entre les différentes sections du portfolio.
     */
    setTiles()
    {
        // Tuile vers l'intro (section d'introduction)
        this.tiles.add({
            start: new THREE.Vector2(this.x, - 10),                                  // Point de départ
            delta: new THREE.Vector2(0, this.y + 14)                                // Direction et distance
        })

        // Tuile vers les projets (côté droit)
        this.tiles.add({
            start: new THREE.Vector2(this.x + 12.5, this.y),                        // Point de départ
            delta: new THREE.Vector2(7.5, 0)                                        // Direction et distance
        })

        // Tuile vers les projets (côté gauche)
        this.tiles.add({
            start: new THREE.Vector2(this.x - 13, this.y),                          // Point de départ
            delta: new THREE.Vector2(- 6, 0)                                        // Direction et distance
        })
    }
}
