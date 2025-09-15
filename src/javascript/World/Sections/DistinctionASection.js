/**
 * DISTINCTIONASECTION.JS - Section de Distinction A
 * 
 * Ce fichier définit la section de distinction A dans l'environnement 3D du portfolio.
 * Cette section présente les récompenses et distinctions avec des cônes de signalisation
 * et un mur de briques représentant les prix Awwwards.
 * 
 * RESPONSABILITÉS :
 * - Création de la section de distinction A
 * - Gestion des objets statiques (base et collision)
 * - Configuration des cônes de signalisation
 * - Création du mur de briques avec distinctions
 * 
 * CARACTÉRISTIQUES :
 * - Section de présentation des récompenses
 * - Cônes de signalisation interactifs
 * - Mur de briques avec distinctions Awwwards
 * - Objets physiques avec collision et sons
 * 
 * UTILISATION :
 * - Présentation des distinctions et récompenses
 * - Zone interactive avec cônes
 * - Mur de briques avec prix
 * - Section de valorisation du portfolio
 */

import * as THREE from 'three'

export default class DistinctionASection
{
    /**
     * Constructor - Initialisation de la section de distinction A
     * 
     * Initialise la section de distinction A avec les options fournies
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
     * Ajoute les objets statiques de la section de distinction A avec
     * leur géométrie de base, de collision et de texture d'ombre.
     */
    setStatic()
    {
        this.objects.add({
            base: this.resources.items.distinctionAStaticBase.scene,                    // Géométrie de base
            collision: this.resources.items.distinctionAStaticCollision.scene,         // Géométrie de collision
            floorShadowTexture: this.resources.items.distinctionAStaticFloorShadowTexture, // Texture d'ombre
            offset: new THREE.Vector3(this.x, this.y, 0),                             // Position de la section
            mass: 0                                                                   // Masse nulle (objet statique)
        })
    }

    /**
     * SetCones - Configuration des cônes de signalisation
     * 
     * Crée des cônes de signalisation interactifs avec physique
     * et sons, positionnés verticalement dans la section.
     */
    setCones()
    {
        // Positions des cônes (x, y) par rapport à la section
        const positions = [
            [0, 9],     // Cône supérieur
            [0, 3],     // Cône haut
            [0, - 3],   // Cône bas
            [0, - 9]    // Cône inférieur
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
     * Crée un mur de briques représentant les distinctions Awwwards
     * avec un arrangement en briques et des variations aléatoires.
     */
    setWall()
    {
        // Configuration du mur
        this.wall = {}
        this.wall.x = this.x + 0                                                      // Position X du mur
        this.wall.y = this.y - 13                                                     // Position Y du mur
        this.wall.items = []                                                          // Liste des éléments du mur

        // Création du mur de briques
        this.walls.add({
            object:
            {
                base: this.resources.items.projectsDistinctionsAwwwardsBase.scene,     // Géométrie de base
                collision: this.resources.items.projectsDistinctionsAwwwardsCollision.scene, // Géométrie de collision
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
                widthCount: 5,                                                        // Nombre de briques en largeur
                heightCount: 6,                                                       // Nombre de briques en hauteur
                position: new THREE.Vector3(this.wall.x, this.wall.y, 0),            // Position du mur
                offsetWidth: new THREE.Vector3(1.25, 0, 0),                          // Décalage entre briques (largeur)
                offsetHeight: new THREE.Vector3(0, 0, 0.6),                          // Décalage entre briques (hauteur)
                randomOffset: new THREE.Vector3(0, 0, 0),                            // Décalage aléatoire
                randomRotation: new THREE.Vector3(0, 0, 0.4)                         // Rotation aléatoire
            }
        })
    }
}
