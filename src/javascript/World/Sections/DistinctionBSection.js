/**
 * DISTINCTIONBSECTION.JS - Section de Distinction B
 * 
 * Ce fichier définit la section de distinction B dans l'environnement 3D du portfolio.
 * Cette section présente les récompenses et distinctions avec des cônes de signalisation
 * et un mur de briques représentant les prix FWA (Favourite Website Awards).
 * 
 * RESPONSABILITÉS :
 * - Création de la section de distinction B
 * - Gestion des objets statiques (base et collision)
 * - Configuration des cônes de signalisation (8 cônes)
 * - Création du mur de briques avec distinctions FWA
 * 
 * CARACTÉRISTIQUES :
 * - Section de présentation des récompenses FWA
 * - Cônes de signalisation interactifs (8 cônes)
 * - Mur de briques avec distinctions FWA
 * - Objets physiques avec collision et sons
 * 
 * UTILISATION :
 * - Présentation des distinctions FWA
 * - Zone interactive avec cônes
 * - Mur de briques avec prix
 * - Section de valorisation du portfolio
 */

import * as THREE from 'three'

export default class DistinctionBSection
{
    /**
     * Constructor - Initialisation de la section de distinction B
     * 
     * Initialise la section de distinction B avec les options fournies
     * et configure les objets statiques, les cônes et le mur de briques.
     * 
     * @param {Object} _options - Options de configuration
     * @param {Object} _options.time - Instance de gestion du temps
     * @param {Object} _options.resources - Gestionnaire de ressources
     * @param {Object} _options.objects - Gestionnaire d'objets 3D
     * @param {Object} _options.walls - Gestionnaire de murs de briques
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
        this.walls = _options.walls
        this.debug = _options.debug
        this.x = _options.x
        this.y = _options.y

        // Configuration du conteneur principal
        this.container = new THREE.Object3D()
        this.container.matrixAutoUpdate = false

        // Initialisation des composants
        this.setStatic()
        this.setCones()
        this.setWall()
    }

    /**
     * SetStatic - Configuration des objets statiques
     * 
     * Ajoute les objets statiques de la section de distinction B avec
     * leur géométrie de base, de collision et de texture d'ombre.
     */
    setStatic()
    {
        this.objects.add({
            base: this.resources.items.distinctionBStaticBase.scene,                    // Géométrie de base
            collision: this.resources.items.distinctionBStaticCollision.scene,         // Géométrie de collision
            floorShadowTexture: this.resources.items.distinctionBStaticFloorShadowTexture, // Texture d'ombre
            offset: new THREE.Vector3(this.x, this.y, 0),                             // Position de la section
            mass: 0                                                                   // Masse nulle (objet statique)
        })
    }

    /**
     * SetCones - Configuration des cônes de signalisation
     * 
     * Crée 8 cônes de signalisation interactifs avec physique
     * et sons, positionnés en deux colonnes dans la section.
     */
    setCones()
    {
        // Positions des cônes (x, y) par rapport à la section
        // Colonne droite (x = 3)
        const positions = [
            [3, 8],     // Cône supérieur droit
            [3, 4],     // Cône haut droit
            [3, 0],     // Cône centre droit
            [3, - 4],   // Cône bas droit

            // Colonne gauche (x = -3)
            [- 3, 8],   // Cône supérieur gauche
            [- 3, 4],   // Cône haut gauche
            [- 3, 0],   // Cône centre gauche
            [- 3, - 4]  // Cône bas gauche
        ]

        // Création de chaque cône
        for(const _position of positions)
        {
            this.objects.add({
                base: this.resources.items.coneBase.scene,                             // Géométrie de base du cône
                collision: this.resources.items.coneCollision.scene,                  // Géométrie de collision
                offset: new THREE.Vector3(this.x + _position[0], this.y + _position[1], 0), // Position
                rotation: new THREE.Euler(0, 0, 0),                                   // Rotation
                duplicated: true,                                                     // Objet dupliqué
                shadow: { sizeX: 2, sizeY: 2, offsetZ: - 0.5, alpha: 0.5 },          // Configuration de l'ombre
                mass: 0.6,                                                            // Masse pour la physique
                soundName: 'woodHit'                                                  // Son de collision
            })
        }
    }

    /**
     * SetWall - Configuration du mur de briques avec distinctions
     * 
     * Crée un mur de briques représentant les distinctions FWA
     * avec un arrangement en briques et des variations aléatoires.
     */
    setWall()
    {
        // Configuration du mur
        this.wall = {}
        this.wall.x = this.x + 0                                                      // Position X du mur
        this.wall.y = this.y - 18                                                     // Position Y du mur (plus bas que DistinctionA)
        this.wall.items = []                                                          // Liste des éléments du mur

        // Création du mur de briques
        this.walls.add({
            object:
            {
                base: this.resources.items.projectsDistinctionsFWABase.scene,          // Géométrie de base FWA
                collision: this.resources.items.projectsDistinctionsFWACollision.scene, // Géométrie de collision
                offset: new THREE.Vector3(0, 0, 0.1),                                // Décalage Z
                rotation: new THREE.Euler(0, 0, 0),                                   // Rotation
                duplicated: true,                                                     // Objet dupliqué
                shadow: { sizeX: 1.2, sizeY: 1.8, offsetZ: - 0.15, alpha: 0.35 },    // Configuration de l'ombre
                mass: 0.5,                                                            // Masse pour la physique
                soundName: 'brick'                                                    // Son de collision
            },
            shape:
            {
                type: 'brick',                                                        // Type de forme (brique)
                widthCount: 4,                                                        // Nombre de briques en largeur
                heightCount: 7,                                                       // Nombre de briques en hauteur
                position: new THREE.Vector3(this.wall.x, this.wall.y, 0),            // Position du mur
                offsetWidth: new THREE.Vector3(1.7, 0, 0),                           // Décalage entre briques (largeur)
                offsetHeight: new THREE.Vector3(0, 0, 0.45),                         // Décalage entre briques (hauteur)
                randomOffset: new THREE.Vector3(0, 0, 0),                            // Décalage aléatoire
                randomRotation: new THREE.Vector3(0, 0, 0.4)                         // Rotation aléatoire
            }
        })
    }
}
