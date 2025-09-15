/**
 * INTROSECTION.JS - Section d'Introduction
 * 
 * Ce fichier définit la section d'introduction dans l'environnement 3D du portfolio.
 * Cette section présente le titre "BRUNO SIMON" avec des instructions de contrôle,
 * des touches fléchées interactives, et des murs de briques décoratifs.
 * 
 * RESPONSABILITÉS :
 * - Création de la section d'introduction
 * - Gestion des objets statiques (base et collision)
 * - Configuration des instructions de contrôle (touches/clavier)
 * - Création du titre "BRUNO SIMON" avec lettres individuelles
 * - Configuration des murs de briques décoratifs
 * 
 * CARACTÉRISTIQUES :
 * - Section d'accueil du portfolio
 * - Instructions de contrôle adaptatives (tactile/clavier)
 * - Titre avec lettres interactives
 * - Murs de briques avec arrangements complexes
 * - Zone de navigation vers autres sections
 * 
 * UTILISATION :
 * - Point d'entrée du portfolio
 * - Présentation du développeur
 * - Instructions d'utilisation
 * - Navigation vers le contenu principal
 */

import * as THREE from 'three'

export default class IntroSection
{
    /**
     * Constructor - Initialisation de la section d'introduction
     * 
     * Initialise la section d'introduction avec les options fournies
     * et configure tous les éléments visuels et interactifs.
     * 
     * @param {Object} _options - Options de configuration
     * @param {Object} _options.config - Configuration de l'application
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
        this.config = _options.config
        this.time = _options.time
        this.resources = _options.resources
        this.objects = _options.objects
        this.areas = _options.areas
        this.walls = _options.walls
        this.tiles = _options.tiles
        this.debug = _options.debug
        this.x = _options.x
        this.y = _options.y

        // Configuration du conteneur principal
        this.container = new THREE.Object3D()
        this.container.matrixAutoUpdate = false
        this.container.updateMatrix()

        // Initialisation des composants
        this.setStatic()
        this.setInstructions()
        this.setOtherInstructions()
        this.setTitles()
        this.setTiles()
        this.setDikes()
    }

    /**
     * SetStatic - Configuration des objets statiques
     * 
     * Ajoute les objets statiques de la section d'introduction avec
     * leur géométrie de base, de collision et de texture d'ombre.
     */
    setStatic()
    {
        this.objects.add({
            base: this.resources.items.introStaticBase.scene,                          // Géométrie de base
            collision: this.resources.items.introStaticCollision.scene,               // Géométrie de collision
            floorShadowTexture: this.resources.items.introStaticFloorShadowTexture,  // Texture d'ombre
            offset: new THREE.Vector3(0, 0, 0),                                      // Position (origine)
            mass: 0                                                                  // Masse nulle (objet statique)
        })
    }

    /**
     * SetInstructions - Configuration des instructions de contrôle
     * 
     * Crée les instructions de contrôle adaptatives selon le type d'appareil
     * (tactile ou clavier) avec des touches fléchées interactives.
     */
    setInstructions()
    {
        // Configuration des instructions
        this.instructions = {}
        this.instructions.arrows = {}

        // Configuration du label d'instructions
        this.instructions.arrows.label = {}

        // Sélection de la texture selon le type d'appareil
        this.instructions.arrows.label.texture = this.config.touch ? 
            this.resources.items.introInstructionsControlsTexture :                    // Texture tactile
            this.resources.items.introInstructionsArrowsTexture                        // Texture clavier
        this.instructions.arrows.label.texture.magFilter = THREE.NearestFilter
        this.instructions.arrows.label.texture.minFilter = THREE.LinearFilter

        // Matériau transparent pour le label
        this.instructions.arrows.label.material = new THREE.MeshBasicMaterial({ 
            transparent: true, 
            alphaMap: this.instructions.arrows.label.texture, 
            color: 0xffffff, 
            depthWrite: false, 
            opacity: 0 
        })

        // Géométrie du label (récupérée depuis les ressources)
        this.instructions.arrows.label.geometry = this.resources.items.introInstructionsLabels.scene.children.find((_mesh) => _mesh.name === 'arrows').geometry

        // Création du mesh du label
        this.instructions.arrows.label.mesh = new THREE.Mesh(this.instructions.arrows.label.geometry, this.instructions.arrows.label.material)
        this.container.add(this.instructions.arrows.label.mesh)

        // Création des touches fléchées (uniquement pour non-tactile)
        if(!this.config.touch)
        {
            // Touche flèche haut
            this.instructions.arrows.up = this.objects.add({
                base: this.resources.items.introArrowKeyBase.scene,                    // Géométrie de base
                collision: this.resources.items.introArrowKeyCollision.scene,         // Géométrie de collision
                offset: new THREE.Vector3(0, 0, 0),                                  // Position
                rotation: new THREE.Euler(0, 0, 0),                                  // Rotation
                duplicated: true,                                                     // Objet dupliqué
                shadow: { sizeX: 1, sizeY: 1, offsetZ: - 0.2, alpha: 0.5 },          // Configuration de l'ombre
                mass: 1.5,                                                            // Masse pour la physique
                soundName: 'brick'                                                    // Son de collision
            })

            // Touche flèche bas
            this.instructions.arrows.down = this.objects.add({
                base: this.resources.items.introArrowKeyBase.scene,                    // Géométrie de base
                collision: this.resources.items.introArrowKeyCollision.scene,         // Géométrie de collision
                offset: new THREE.Vector3(0, - 0.8, 0),                              // Position (décalée vers le bas)
                rotation: new THREE.Euler(0, 0, Math.PI),                            // Rotation 180°
                duplicated: true,                                                     // Objet dupliqué
                shadow: { sizeX: 1, sizeY: 1, offsetZ: - 0.2, alpha: 0.5 },          // Configuration de l'ombre
                mass: 1.5,                                                            // Masse pour la physique
                soundName: 'brick'                                                    // Son de collision
            })

            // Touche flèche gauche
            this.instructions.arrows.left = this.objects.add({
                base: this.resources.items.introArrowKeyBase.scene,                    // Géométrie de base
                collision: this.resources.items.introArrowKeyCollision.scene,         // Géométrie de collision
                offset: new THREE.Vector3(- 0.8, - 0.8, 0),                          // Position (gauche-bas)
                rotation: new THREE.Euler(0, 0, Math.PI * 0.5),                      // Rotation 90°
                duplicated: true,                                                     // Objet dupliqué
                shadow: { sizeX: 1, sizeY: 1, offsetZ: - 0.2, alpha: 0.5 },          // Configuration de l'ombre
                mass: 1.5,                                                            // Masse pour la physique
                soundName: 'brick'                                                    // Son de collision
            })

            // Touche flèche droite
            this.instructions.arrows.right = this.objects.add({
                base: this.resources.items.introArrowKeyBase.scene,                    // Géométrie de base
                collision: this.resources.items.introArrowKeyCollision.scene,         // Géométrie de collision
                offset: new THREE.Vector3(0.8, - 0.8, 0),                            // Position (droite-bas)
                rotation: new THREE.Euler(0, 0, - Math.PI * 0.5),                    // Rotation -90°
                duplicated: true,                                                     // Objet dupliqué
                shadow: { sizeX: 1, sizeY: 1, offsetZ: - 0.2, alpha: 0.5 },          // Configuration de l'ombre
                mass: 1.5,                                                            // Masse pour la physique
                soundName: 'brick'                                                    // Son de collision
            })
        }
    }

    /**
     * SetOtherInstructions - Configuration des instructions supplémentaires
     * 
     * Crée les instructions supplémentaires pour les contrôles avancés
     * (uniquement pour les appareils non-tactiles) avec un klaxon interactif.
     */
    setOtherInstructions()
    {
        // Pas d'instructions supplémentaires pour les appareils tactiles
        if(this.config.touch)
        {
            return
        }

        // Configuration des instructions supplémentaires
        this.otherInstructions = {}
        this.otherInstructions.x = 16                                                      // Position X
        this.otherInstructions.y = - 2                                                     // Position Y

        // Conteneur pour les instructions supplémentaires
        this.otherInstructions.container = new THREE.Object3D()
        this.otherInstructions.container.position.x = this.otherInstructions.x
        this.otherInstructions.container.position.y = this.otherInstructions.y
        this.otherInstructions.container.matrixAutoUpdate = false
        this.otherInstructions.container.updateMatrix()
        this.container.add(this.otherInstructions.container)

        // Configuration du label d'instructions supplémentaires
        this.otherInstructions.label = {}

        // Géométrie du label
        this.otherInstructions.label.geometry = new THREE.PlaneGeometry(6, 6, 1, 1)

        // Texture du label
        this.otherInstructions.label.texture = this.resources.items.introInstructionsOtherTexture
        this.otherInstructions.label.texture.magFilter = THREE.NearestFilter
        this.otherInstructions.label.texture.minFilter = THREE.LinearFilter

        // Matériau transparent pour le label
        this.otherInstructions.label.material = new THREE.MeshBasicMaterial({ 
            transparent: true, 
            alphaMap: this.otherInstructions.label.texture, 
            color: 0xffffff, 
            depthWrite: false, 
            opacity: 0 
        })

        // Création du mesh du label
        this.otherInstructions.label.mesh = new THREE.Mesh(this.otherInstructions.label.geometry, this.otherInstructions.label.material)
        this.otherInstructions.label.mesh.matrixAutoUpdate = false
        this.otherInstructions.container.add(this.otherInstructions.label.mesh)

        // Création du klaxon interactif
        this.otherInstructions.horn = this.objects.add({
            base: this.resources.items.hornBase.scene,                                    // Géométrie de base du klaxon
            collision: this.resources.items.hornCollision.scene,                         // Géométrie de collision
            offset: new THREE.Vector3(this.otherInstructions.x + 1.25, this.otherInstructions.y - 2.75, 0.2), // Position
            rotation: new THREE.Euler(0, 0, 0.5),                                        // Rotation légère
            duplicated: true,                                                             // Objet dupliqué
            shadow: { sizeX: 1.65, sizeY: 0.75, offsetZ: - 0.1, alpha: 0.4 },            // Configuration de l'ombre
            mass: 1.5,                                                                    // Masse pour la physique
            soundName: 'horn',                                                            // Son de klaxon
            sleep: false                                                                 // Pas de mise en veille
        })
    }

    /**
     * SetTitles - Configuration du titre "BRUNO SIMON"
     * 
     * Crée le titre principal avec chaque lettre comme objet interactif
     * séparé, plus les mots "CREATIVE" et "DEV" avec des ombres personnalisées.
     */
    setTitles()
    {
        // Création de chaque lettre du titre "BRUNO SIMON"
        
        // Lettre B
        this.objects.add({
            base: this.resources.items.introBBase.scene,                                // Géométrie de base
            collision: this.resources.items.introBCollision.scene,                     // Géométrie de collision
            offset: new THREE.Vector3(0, 0, 0),                                      // Position
            rotation: new THREE.Euler(0, 0, 0),                                      // Rotation
            shadow: { sizeX: 1.5, sizeY: 1.5, offsetZ: - 0.6, alpha: 0.4 },          // Configuration de l'ombre
            mass: 1.5,                                                                // Masse pour la physique
            soundName: 'brick'                                                        // Son de collision
        })

        // Lettre R
        this.objects.add({
            base: this.resources.items.introRBase.scene,                                // Géométrie de base
            collision: this.resources.items.introRCollision.scene,                     // Géométrie de collision
            offset: new THREE.Vector3(0, 0, 0),                                      // Position
            rotation: new THREE.Euler(0, 0, 0),                                      // Rotation
            shadow: { sizeX: 1.5, sizeY: 1.5, offsetZ: - 0.6, alpha: 0.4 },          // Configuration de l'ombre
            mass: 1.5,                                                                // Masse pour la physique
            soundName: 'brick'                                                        // Son de collision
        })

        // Lettre U
        this.objects.add({
            base: this.resources.items.introUBase.scene,                                // Géométrie de base
            collision: this.resources.items.introUCollision.scene,                     // Géométrie de collision
            offset: new THREE.Vector3(0, 0, 0),                                      // Position
            rotation: new THREE.Euler(0, 0, 0),                                      // Rotation
            shadow: { sizeX: 1.5, sizeY: 1.5, offsetZ: - 0.6, alpha: 0.4 },          // Configuration de l'ombre
            mass: 1.5,                                                                // Masse pour la physique
            soundName: 'brick'                                                        // Son de collision
        })

        // Lettre N
        this.objects.add({
            base: this.resources.items.introNBase.scene,                                // Géométrie de base
            collision: this.resources.items.introNCollision.scene,                     // Géométrie de collision
            offset: new THREE.Vector3(0, 0, 0),                                      // Position
            rotation: new THREE.Euler(0, 0, 0),                                      // Rotation
            duplicated: true,                                                         // Objet dupliqué
            shadow: { sizeX: 1.5, sizeY: 1.5, offsetZ: - 0.6, alpha: 0.4 },          // Configuration de l'ombre
            mass: 1.5,                                                                // Masse pour la physique
            soundName: 'brick'                                                        // Son de collision
        })

        // Lettre O
        this.objects.add({
            base: this.resources.items.introOBase.scene,                                // Géométrie de base
            collision: this.resources.items.introOCollision.scene,                     // Géométrie de collision
            offset: new THREE.Vector3(0, 0, 0),                                      // Position
            rotation: new THREE.Euler(0, 0, 0),                                      // Rotation
            duplicated: true,                                                         // Objet dupliqué
            shadow: { sizeX: 1.5, sizeY: 1.5, offsetZ: - 0.6, alpha: 0.4 },          // Configuration de l'ombre
            mass: 1.5,                                                                // Masse pour la physique
            soundName: 'brick'                                                        // Son de collision
        })

        // Lettre S
        this.objects.add({
            base: this.resources.items.introSBase.scene,                                // Géométrie de base
            collision: this.resources.items.introSCollision.scene,                     // Géométrie de collision
            offset: new THREE.Vector3(0, 0, 0),                                      // Position
            rotation: new THREE.Euler(0, 0, 0),                                      // Rotation
            shadow: { sizeX: 1.5, sizeY: 1.5, offsetZ: - 0.6, alpha: 0.4 },          // Configuration de l'ombre
            mass: 1.5,                                                                // Masse pour la physique
            soundName: 'brick'                                                        // Son de collision
        })

        // Lettre I
        this.objects.add({
            base: this.resources.items.introIBase.scene,                                // Géométrie de base
            collision: this.resources.items.introICollision.scene,                     // Géométrie de collision
            offset: new THREE.Vector3(0, 0, 0),                                      // Position
            rotation: new THREE.Euler(0, 0, 0),                                      // Rotation
            shadow: { sizeX: 1.5, sizeY: 1.5, offsetZ: - 0.6, alpha: 0.4 },          // Configuration de l'ombre
            mass: 1.5,                                                                // Masse pour la physique
            soundName: 'brick'                                                        // Son de collision
        })

        // Lettre M
        this.objects.add({
            base: this.resources.items.introMBase.scene,                                // Géométrie de base
            collision: this.resources.items.introMCollision.scene,                     // Géométrie de collision
            offset: new THREE.Vector3(0, 0, 0),                                      // Position
            rotation: new THREE.Euler(0, 0, 0),                                      // Rotation
            shadow: { sizeX: 1.5, sizeY: 1.5, offsetZ: - 0.6, alpha: 0.4 },          // Configuration de l'ombre
            mass: 1.5,                                                                // Masse pour la physique
            soundName: 'brick'                                                        // Son de collision
        })

        // Deuxième O (dans "SIMON")
        this.objects.add({
            base: this.resources.items.introOBase.scene,                                // Géométrie de base
            collision: this.resources.items.introOCollision.scene,                     // Géométrie de collision
            offset: new THREE.Vector3(3.95, 0, 0),                                   // Position décalée
            rotation: new THREE.Euler(0, 0, 0),                                      // Rotation
            duplicated: true,                                                         // Objet dupliqué
            shadow: { sizeX: 1.5, sizeY: 1.5, offsetZ: - 0.6, alpha: 0.4 },          // Configuration de l'ombre
            mass: 1.5,                                                                // Masse pour la physique
            soundName: 'brick'                                                        // Son de collision
        })

        // Deuxième N (dans "SIMON")
        this.objects.add({
            base: this.resources.items.introNBase.scene,                                // Géométrie de base
            collision: this.resources.items.introNCollision.scene,                     // Géométrie de collision
            offset: new THREE.Vector3(5.85, 0, 0),                                   // Position décalée
            rotation: new THREE.Euler(0, 0, 0),                                      // Rotation
            duplicated: true,                                                         // Objet dupliqué
            shadow: { sizeX: 1.5, sizeY: 1.5, offsetZ: - 0.6, alpha: 0.4 },          // Configuration de l'ombre
            mass: 1.5,                                                                // Masse pour la physique
            soundName: 'brick'                                                        // Son de collision
        })

        // Mot "CREATIVE"
        this.objects.add({
            base: this.resources.items.introCreativeBase.scene,                        // Géométrie de base
            collision: this.resources.items.introCreativeCollision.scene,             // Géométrie de collision
            offset: new THREE.Vector3(0, 0, 0),                                      // Position
            rotation: new THREE.Euler(0, 0, 0.25),                                   // Rotation légère
            shadow: { sizeX: 5, sizeY: 1.5, offsetZ: - 0.6, alpha: 0.3 },            // Ombre étendue
            mass: 1.5,                                                                // Masse pour la physique
            sleep: false,                                                             // Pas de mise en veille
            soundName: 'brick'                                                        // Son de collision
        })

        // Mot "DEV"
        this.objects.add({
            base: this.resources.items.introDevBase.scene,                             // Géométrie de base
            collision: this.resources.items.introDevCollision.scene,                  // Géométrie de collision
            offset: new THREE.Vector3(0, 0, 0),                                      // Position
            rotation: new THREE.Euler(0, 0, 0),                                      // Rotation
            shadow: { sizeX: 2.5, sizeY: 1.5, offsetZ: - 0.6, alpha: 0.3 },          // Configuration de l'ombre
            mass: 1.5,                                                                // Masse pour la physique
            soundName: 'brick'                                                        // Son de collision
        })
    }

    /**
     * SetTiles - Configuration des tuiles de navigation
     * 
     * Configure les tuiles de navigation qui permettent de se déplacer
     * vers d'autres sections du portfolio.
     */
    setTiles()
    {
        this.tiles.add({
            start: new THREE.Vector2(0, - 4.5),                                        // Point de départ
            delta: new THREE.Vector2(0, - 4.5)                                         // Direction et distance
        })
    }

    /**
     * SetDikes - Configuration des murs de briques décoratifs
     * 
     * Crée des murs de briques décoratifs avec des arrangements complexes
     * et des variations aléatoires pour créer un environnement visuel riche.
     */
    setDikes()
    {
        // Configuration des options de briques
        this.dikes = {}
        this.dikes.brickOptions = {
            base: this.resources.items.brickBase.scene,                                // Géométrie de base des briques
            collision: this.resources.items.brickCollision.scene,                     // Géométrie de collision
            offset: new THREE.Vector3(0, 0, 0.1),                                    // Décalage Z
            rotation: new THREE.Euler(0, 0, 0),                                      // Rotation
            duplicated: true,                                                         // Objet dupliqué
            shadow: { sizeX: 1.2, sizeY: 1.8, offsetZ: - 0.15, alpha: 0.35 },        // Configuration de l'ombre
            mass: 0.5,                                                                // Masse pour la physique
            soundName: 'brick'                                                        // Son de collision
        }

        // Mur de briques vertical (gauche)
        this.walls.add({
            object: this.dikes.brickOptions,
            shape:
            {
                type: 'brick',                                                        // Type de forme (brique)
                equilibrateLastLine: true,                                            // Équilibrage de la dernière ligne
                widthCount: 5,                                                        // Nombre de briques en largeur
                heightCount: 2,                                                       // Nombre de briques en hauteur
                position: new THREE.Vector3(this.x - 12, this.y - 13, 0),            // Position du mur
                offsetWidth: new THREE.Vector3(0, 1.05, 0),                          // Décalage entre briques (largeur)
                offsetHeight: new THREE.Vector3(0, 0, 0.45),                         // Décalage entre briques (hauteur)
                randomOffset: new THREE.Vector3(0, 0, 0),                            // Décalage aléatoire
                randomRotation: new THREE.Vector3(0, 0, 0.2)                         // Rotation aléatoire
            }
        })

        // Mur de briques horizontal (droite)
        this.walls.add({
            object:
            {
                ...this.dikes.brickOptions,
                rotation: new THREE.Euler(0, 0, Math.PI * 0.5)                       // Rotation 90°
            },
            shape:
            {
                type: 'brick',                                                        // Type de forme (brique)
                equilibrateLastLine: true,                                            // Équilibrage de la dernière ligne
                widthCount: 3,                                                        // Nombre de briques en largeur
                heightCount: 2,                                                       // Nombre de briques en hauteur
                position: new THREE.Vector3(this.x + 8, this.y + 6, 0),              // Position du mur
                offsetWidth: new THREE.Vector3(1.05, 0, 0),                          // Décalage entre briques (largeur)
                offsetHeight: new THREE.Vector3(0, 0, 0.45),                         // Décalage entre briques (hauteur)
                randomOffset: new THREE.Vector3(0, 0, 0),                            // Décalage aléatoire
                randomRotation: new THREE.Vector3(0, 0, 0.2)                         // Rotation aléatoire
            }
        })

        // Mur de briques vertical (droite)
        this.walls.add({
            object: this.dikes.brickOptions,
            shape:
            {
                type: 'brick',                                                        // Type de forme (brique)
                equilibrateLastLine: false,                                           // Pas d'équilibrage de la dernière ligne
                widthCount: 3,                                                        // Nombre de briques en largeur
                heightCount: 2,                                                       // Nombre de briques en hauteur
                position: new THREE.Vector3(this.x + 9.9, this.y + 4.7, 0),          // Position du mur
                offsetWidth: new THREE.Vector3(0, - 1.05, 0),                        // Décalage entre briques (largeur)
                offsetHeight: new THREE.Vector3(0, 0, 0.45),                         // Décalage entre briques (hauteur)
                randomOffset: new THREE.Vector3(0, 0, 0),                            // Décalage aléatoire
                randomRotation: new THREE.Vector3(0, 0, 0.2)                         // Rotation aléatoire
            }
        })

        // Mur de briques horizontal (gauche)
        this.walls.add({
            object:
            {
                ...this.dikes.brickOptions,
                rotation: new THREE.Euler(0, 0, Math.PI * 0.5)                       // Rotation 90°
            },
            shape:
            {
                type: 'brick',                                                        // Type de forme (brique)
                equilibrateLastLine: true,                                            // Équilibrage de la dernière ligne
                widthCount: 3,                                                        // Nombre de briques en largeur
                heightCount: 2,                                                       // Nombre de briques en hauteur
                position: new THREE.Vector3(this.x - 14, this.y + 2, 0),             // Position du mur
                offsetWidth: new THREE.Vector3(1.05, 0, 0),                          // Décalage entre briques (largeur)
                offsetHeight: new THREE.Vector3(0, 0, 0.45),                         // Décalage entre briques (hauteur)
                randomOffset: new THREE.Vector3(0, 0, 0),                            // Décalage aléatoire
                randomRotation: new THREE.Vector3(0, 0, 0.2)                         // Rotation aléatoire
            }
        })

        // Mur de briques vertical (gauche-bas)
        this.walls.add({
            object: this.dikes.brickOptions,
            shape:
            {
                type: 'brick',                                                        // Type de forme (brique)
                equilibrateLastLine: false,                                           // Pas d'équilibrage de la dernière ligne
                widthCount: 3,                                                        // Nombre de briques en largeur
                heightCount: 2,                                                       // Nombre de briques en hauteur
                position: new THREE.Vector3(this.x - 14.8, this.y + 0.7, 0),         // Position du mur
                offsetWidth: new THREE.Vector3(0, - 1.05, 0),                        // Décalage entre briques (largeur)
                offsetHeight: new THREE.Vector3(0, 0, 0.45),                         // Décalage entre briques (hauteur)
                randomOffset: new THREE.Vector3(0, 0, 0),                            // Décalage aléatoire
                randomRotation: new THREE.Vector3(0, 0, 0.2)                         // Rotation aléatoire
            }
        })

        // Mur de briques vertical (gauche-bas)
        this.walls.add({
            object: this.dikes.brickOptions,
            shape:
            {
                type: 'brick',                                                        // Type de forme (brique)
                equilibrateLastLine: true,                                            // Équilibrage de la dernière ligne
                widthCount: 3,                                                        // Nombre de briques en largeur
                heightCount: 2,                                                       // Nombre de briques en hauteur
                position: new THREE.Vector3(this.x - 14.8, this.y - 3.5, 0),         // Position du mur
                offsetWidth: new THREE.Vector3(0, - 1.05, 0),                        // Décalage entre briques (largeur)
                offsetHeight: new THREE.Vector3(0, 0, 0.45),                         // Décalage entre briques (hauteur)
                randomOffset: new THREE.Vector3(0, 0, 0),                            // Décalage aléatoire
                randomRotation: new THREE.Vector3(0, 0, 0.2)                         // Rotation aléatoire
            }
        })

        // Murs supplémentaires pour les appareils non-tactiles
        if(!this.config.touch)
        {
            // Mur de briques horizontal (droite)
            this.walls.add({
                object:
                {
                    ...this.dikes.brickOptions,
                    rotation: new THREE.Euler(0, 0, Math.PI * 0.5)                   // Rotation 90°
                },
                shape:
                {
                    type: 'brick',                                                    // Type de forme (brique)
                    equilibrateLastLine: true,                                        // Équilibrage de la dernière ligne
                    widthCount: 2,                                                    // Nombre de briques en largeur
                    heightCount: 2,                                                   // Nombre de briques en hauteur
                    position: new THREE.Vector3(this.x + 18.5, this.y + 3, 0),       // Position du mur
                    offsetWidth: new THREE.Vector3(1.05, 0, 0),                      // Décalage entre briques (largeur)
                    offsetHeight: new THREE.Vector3(0, 0, 0.45),                     // Décalage entre briques (hauteur)
                    randomOffset: new THREE.Vector3(0, 0, 0),                        // Décalage aléatoire
                    randomRotation: new THREE.Vector3(0, 0, 0.2)                     // Rotation aléatoire
                }
            })

            // Mur de briques vertical (droite)
            this.walls.add({
                object: this.dikes.brickOptions,
                shape:
                {
                    type: 'brick',                                                    // Type de forme (brique)
                    equilibrateLastLine: false,                                       // Pas d'équilibrage de la dernière ligne
                    widthCount: 2,                                                    // Nombre de briques en largeur
                    heightCount: 2,                                                   // Nombre de briques en hauteur
                    position: new THREE.Vector3(this.x + 19.9, this.y + 2.2, 0),     // Position du mur
                    offsetWidth: new THREE.Vector3(0, - 1.05, 0),                    // Décalage entre briques (largeur)
                    offsetHeight: new THREE.Vector3(0, 0, 0.45),                     // Décalage entre briques (hauteur)
                    randomOffset: new THREE.Vector3(0, 0, 0),                        // Décalage aléatoire
                    randomRotation: new THREE.Vector3(0, 0, 0.2)                     // Rotation aléatoire
                }
            })
        }
    }
}
