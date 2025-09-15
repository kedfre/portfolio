/**
 * PLAYGROUNDSECTION.JS - Section de Terrain de Jeu
 * 
 * Ce fichier définit la section de terrain de jeu dans l'environnement 3D du portfolio.
 * Cette section présente des activités interactives avec des murs de briques destructibles
 * et un jeu de bowling avec des quilles et une boule.
 * 
 * RESPONSABILITÉS :
 * - Création de la section de terrain de jeu
 * - Gestion des objets statiques (base et collision)
 * - Configuration des murs de briques destructibles
 * - Création du jeu de bowling avec quilles et boule
 * - Zones de réinitialisation interactives
 * 
 * CARACTÉRISTIQUES :
 * - Section de jeu et d'interaction
 * - Murs de briques avec formes variées (rectangle, brique, triangle)
 * - Jeu de bowling avec quilles en triangle
 * - Zones de réinitialisation avec labels
 * - Interface de debug pour les contrôles
 * 
 * UTILISATION :
 * - Zone de divertissement et d'interaction
 * - Démonstration des capacités physiques
 * - Jeu de bowling interactif
 * - Murs de briques destructibles
 */

import * as THREE from 'three'

export default class PlaygroundSection
{
    /**
     * Constructor - Initialisation de la section de terrain de jeu
     * 
     * Initialise la section de terrain de jeu avec les options fournies
     * et configure les objets statiques, les murs de briques et le bowling.
     * 
     * @param {Object} _options - Options de configuration
     * @param {Object} _options.time - Instance de gestion du temps
     * @param {Object} _options.resources - Gestionnaire de ressources
     * @param {Object} _options.objects - Gestionnaire d'objets 3D
     * @param {Object} _options.areas - Gestionnaire de zones interactives
     * @param {Object} _options.walls - Gestionnaire de murs de briques
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
        this.walls = _options.walls
        this.tiles = _options.tiles
        this.debug = _options.debug
        this.x = _options.x
        this.y = _options.y

        // Configuration de l'interface de debug
        if(this.debug)
        {
            this.debugFolder = this.debug.addFolder('playgroundSection')
            // this.debugFolder.open()                                                    // Décommentez pour ouvrir automatiquement
        }

        // Configuration du conteneur principal
        this.container = new THREE.Object3D()
        this.container.matrixAutoUpdate = false

        // Configuration de la texture de réinitialisation
        this.resources.items.areaResetTexture.magFilter = THREE.NearestFilter
        this.resources.items.areaResetTexture.minFilter = THREE.LinearFilter

        // Initialisation des composants
        this.setStatic()
        this.setBricksWalls()
        this.setBowling()
    }

    /**
     * SetStatic - Configuration des objets statiques
     * 
     * Ajoute les objets statiques de la section de terrain de jeu avec
     * leur géométrie de base, de collision et de texture d'ombre.
     */
    setStatic()
    {
        this.objects.add({
            base: this.resources.items.playgroundStaticBase.scene,                     // Géométrie de base
            collision: this.resources.items.playgroundStaticCollision.scene,          // Géométrie de collision
            floorShadowTexture: this.resources.items.playgroundStaticFloorShadowTexture, // Texture d'ombre
            offset: new THREE.Vector3(this.x, this.y, 0),                            // Position de la section
            mass: 0                                                                  // Masse nulle (objet statique)
        })
    }

    /**
     * SetBricksWalls - Configuration des murs de briques destructibles
     * 
     * Crée des murs de briques destructibles avec différentes formes
     * (rectangle, brique, triangle) et une zone de réinitialisation.
     */
    setBricksWalls()
    {
        // Configuration des murs de briques
        this.brickWalls = {}
        this.brickWalls.x = this.x + 15                                               // Position X des murs
        this.brickWalls.y = this.y + 14                                               // Position Y des murs
        this.brickWalls.items = []                                                    // Liste des murs

        // Options de configuration des briques
        this.brickWalls.brickOptions = {
            base: this.resources.items.brickBase.scene,                                // Géométrie de base des briques
            collision: this.resources.items.brickCollision.scene,                     // Géométrie de collision
            offset: new THREE.Vector3(0, 0, 0.1),                                    // Décalage Z
            rotation: new THREE.Euler(0, 0, 0),                                      // Rotation
            duplicated: true,                                                         // Objet dupliqué
            shadow: { sizeX: 1.2, sizeY: 1.8, offsetZ: - 0.15, alpha: 0.35 },        // Configuration de l'ombre
            mass: 0.5,                                                                // Masse pour la physique
            soundName: 'brick'                                                        // Son de collision
        }

        // Création des trois murs avec différentes formes
        this.brickWalls.items.push(
            // Mur rectangulaire
            this.walls.add({
                object: this.brickWalls.brickOptions,
                shape:
                {
                    type: 'rectangle',                                                // Type de forme (rectangle)
                    widthCount: 5,                                                    // Nombre de briques en largeur
                    heightCount: 6,                                                   // Nombre de briques en hauteur
                    position: new THREE.Vector3(this.brickWalls.x - 6, this.brickWalls.y, 0), // Position du mur
                    offsetWidth: new THREE.Vector3(0, 1.05, 0),                      // Décalage entre briques (largeur)
                    offsetHeight: new THREE.Vector3(0, 0, 0.45),                     // Décalage entre briques (hauteur)
                    randomOffset: new THREE.Vector3(0, 0, 0),                        // Décalage aléatoire
                    randomRotation: new THREE.Vector3(0, 0, 0.4)                     // Rotation aléatoire
                }
            }),
            // Mur en briques
            this.walls.add({
                object: this.brickWalls.brickOptions,
                shape:
                {
                    type: 'brick',                                                    // Type de forme (brique)
                    widthCount: 5,                                                    // Nombre de briques en largeur
                    heightCount: 6,                                                   // Nombre de briques en hauteur
                    position: new THREE.Vector3(this.brickWalls.x - 12, this.brickWalls.y, 0), // Position du mur
                    offsetWidth: new THREE.Vector3(0, 1.05, 0),                      // Décalage entre briques (largeur)
                    offsetHeight: new THREE.Vector3(0, 0, 0.45),                     // Décalage entre briques (hauteur)
                    randomOffset: new THREE.Vector3(0, 0, 0),                        // Décalage aléatoire
                    randomRotation: new THREE.Vector3(0, 0, 0.4)                     // Rotation aléatoire
                }
            }),
            // Mur triangulaire
            this.walls.add({
                object: this.brickWalls.brickOptions,
                shape:
                {
                    type: 'triangle',                                                 // Type de forme (triangle)
                    widthCount: 6,                                                    // Nombre de briques en largeur
                    position: new THREE.Vector3(this.brickWalls.x - 18, this.brickWalls.y, 0), // Position du mur
                    offsetWidth: new THREE.Vector3(0, 1.05, 0),                      // Décalage entre briques (largeur)
                    offsetHeight: new THREE.Vector3(0, 0, 0.45),                     // Décalage entre briques (hauteur)
                    randomOffset: new THREE.Vector3(0, 0, 0),                        // Décalage aléatoire
                    randomRotation: new THREE.Vector3(0, 0, 0.4)                     // Rotation aléatoire
                }
            })
        )

        // Fonction de réinitialisation des murs
        this.brickWalls.reset = () =>
        {
            for(const _wall of this.brickWalls.items)
            {
                for(const _brick of _wall.items)
                {
                    _brick.collision.reset()                                          // Réinitialisation de la physique
                }
            }
        }

        // Zone de réinitialisation des murs
        this.brickWalls.resetArea = this.areas.add({
            position: new THREE.Vector2(this.brickWalls.x, this.brickWalls.y),       // Position de la zone
            halfExtents: new THREE.Vector2(2, 2)                                     // Taille de la zone
        })
        this.brickWalls.resetArea.on('interact', () =>
        {
            this.brickWalls.reset()                                                  // Réinitialisation lors de l'interaction
        })

        // Label de réinitialisation
        this.brickWalls.areaLabelMesh = new THREE.Mesh(
            new THREE.PlaneGeometry(2, 0.5), 
            new THREE.MeshBasicMaterial({ 
                transparent: true, 
                depthWrite: false, 
                color: 0xffffff, 
                alphaMap: this.resources.items.areaResetTexture 
            })
        )
        this.brickWalls.areaLabelMesh.position.x = this.brickWalls.x
        this.brickWalls.areaLabelMesh.position.y = this.brickWalls.y
        this.brickWalls.areaLabelMesh.matrixAutoUpdate = false
        this.brickWalls.areaLabelMesh.updateMatrix()
        this.container.add(this.brickWalls.areaLabelMesh)

        // Interface de debug
        if(this.debugFolder)
        {
            this.debugFolder.add(this.brickWalls, 'reset').name('brickWalls reset')  // Bouton de réinitialisation
        }
    }

    /**
     * SetBowling - Configuration du jeu de bowling
     * 
     * Crée un jeu de bowling interactif avec des quilles en formation triangulaire
     * et une boule de bowling, plus une zone de réinitialisation.
     */
    setBowling()
    {
        // Configuration du bowling
        this.bowling = {}
        this.bowling.x = this.x + 15                                                  // Position X du bowling
        this.bowling.y = this.y + 4                                                   // Position Y du bowling

        // Création des quilles en formation triangulaire
        this.bowling.pins = this.walls.add({
            object:
            {
                base: this.resources.items.bowlingPinBase.scene,                       // Géométrie de base des quilles
                collision: this.resources.items.bowlingPinCollision.scene,            // Géométrie de collision
                offset: new THREE.Vector3(0, 0, 0.1),                                // Décalage Z
                rotation: new THREE.Euler(0, 0, 0),                                  // Rotation
                duplicated: true,                                                     // Objet dupliqué
                shadow: { sizeX: 1.4, sizeY: 1.4, offsetZ: - 0.15, alpha: 0.35 },    // Configuration de l'ombre
                mass: 0.1,                                                            // Masse légère pour les quilles
                soundName: 'bowlingPin'                                               // Son de collision des quilles
                // sleep: false                                                        // Décommentez pour éviter la mise en veille
            },
            shape:
            {
                type: 'triangle',                                                     // Type de forme (triangle)
                widthCount: 4,                                                        // Nombre de quilles en largeur
                position: new THREE.Vector3(this.bowling.x - 25, this.bowling.y, 0), // Position des quilles
                offsetWidth: new THREE.Vector3(0, 1, 0),                             // Décalage entre quilles (largeur)
                offsetHeight: new THREE.Vector3(0.65, 0, 0),                         // Décalage entre quilles (hauteur)
                randomOffset: new THREE.Vector3(0, 0, 0),                            // Décalage aléatoire
                randomRotation: new THREE.Vector3(0, 0, 0)                           // Rotation aléatoire
            }
        })

        // Création de la boule de bowling
        this.bowling.ball = this.objects.add({
            base: this.resources.items.bowlingBallBase.scene,                          // Géométrie de base de la boule
            collision: this.resources.items.bowlingBallCollision.scene,               // Géométrie de collision
            offset: new THREE.Vector3(this.bowling.x - 5, this.bowling.y, 0),        // Position de la boule
            rotation: new THREE.Euler(Math.PI * 0.5, 0, 0),                          // Rotation 90° sur l'axe X
            duplicated: true,                                                         // Objet dupliqué
            shadow: { sizeX: 1.5, sizeY: 1.5, offsetZ: - 0.15, alpha: 0.35 },        // Configuration de l'ombre
            mass: 1,                                                                  // Masse pour la physique
            soundName: 'bowlingBall'                                                  // Son de collision de la boule
            // sleep: false                                                            // Décommentez pour éviter la mise en veille
        })

        // Fonction de réinitialisation du bowling
        this.bowling.reset = () =>
        {
            // Réinitialisation des quilles
            for(const _pin of this.bowling.pins.items)
            {
                _pin.collision.reset()                                                // Réinitialisation de la physique
            }

            // Réinitialisation de la boule
            this.bowling.ball.collision.reset()                                      // Réinitialisation de la physique
        }

        // Zone de réinitialisation du bowling
        this.bowling.resetArea = this.areas.add({
            position: new THREE.Vector2(this.bowling.x, this.bowling.y),             // Position de la zone
            halfExtents: new THREE.Vector2(2, 2)                                     // Taille de la zone
        })
        this.bowling.resetArea.on('interact', () =>
        {
            this.bowling.reset()                                                     // Réinitialisation lors de l'interaction
        })

        // Label de réinitialisation du bowling
        this.bowling.areaLabelMesh = new THREE.Mesh(
            new THREE.PlaneGeometry(2, 0.5), 
            new THREE.MeshBasicMaterial({ 
                transparent: true, 
                depthWrite: false, 
                color: 0xffffff, 
                alphaMap: this.resources.items.areaResetTexture 
            })
        )
        this.bowling.areaLabelMesh.position.x = this.bowling.x
        this.bowling.areaLabelMesh.position.y = this.bowling.y
        this.bowling.areaLabelMesh.matrixAutoUpdate = false
        this.bowling.areaLabelMesh.updateMatrix()
        this.container.add(this.bowling.areaLabelMesh)

        // Interface de debug
        if(this.debugFolder)
        {
            this.debugFolder.add(this.bowling, 'reset').name('bowling reset')        // Bouton de réinitialisation
        }
    }
}
