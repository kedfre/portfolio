/**
 * PROJECT.JS - Classe de Projet
 * 
 * Ce fichier définit une classe Project pour représenter un projet individuel
 * dans l'environnement 3D du portfolio. Chaque projet contient des panneaux
 * d'affichage avec des images, un sol avec texture, et des distinctions.
 * 
 * RESPONSABILITÉS :
 * - Création d'un projet individuel
 * - Gestion des panneaux d'affichage avec images
 * - Configuration du sol avec texture personnalisée
 * - Affichage des distinctions et récompenses
 * - Zone interactive pour accéder au projet
 * 
 * CARACTÉRISTIQUES :
 * - Panneaux d'affichage multiples avec images
 * - Sol avec texture personnalisée
 * - Distinctions (Awwwards, FWA, CSSDA)
 * - Zone interactive avec lien externe
 * - Animation de chargement des images
 * 
 * UTILISATION :
 * - Représentation d'un projet de portfolio
 * - Affichage des images et informations
 * - Navigation vers le projet externe
 * - Présentation des récompenses
 */

import * as THREE from 'three'

import ProjectBoardMaterial from '../../Materials/ProjectBoard.js'
import gsap from 'gsap'

export default class Project
{
    /**
     * Constructor - Initialisation d'un projet
     * 
     * Initialise un projet avec les options fournies et configure
     * les panneaux d'affichage, le sol et les distinctions.
     * 
     * @param {Object} _options - Options de configuration
     * @param {Object} _options.time - Instance de gestion du temps
     * @param {Object} _options.resources - Gestionnaire de ressources
     * @param {Object} _options.objects - Gestionnaire d'objets 3D
     * @param {Object} _options.areas - Gestionnaire de zones interactives
     * @param {string} _options.name - Nom du projet
     * @param {Object} _options.geometries - Géométries disponibles
     * @param {Object} _options.meshes - Meshes disponibles
     * @param {Object} _options.debug - Interface de debug
     * @param {number} _options.x - Position X du projet
     * @param {number} _options.y - Position Y du projet
     * @param {Array} _options.imageSources - Sources des images du projet
     * @param {Object} _options.floorTexture - Texture du sol
     * @param {Object} _options.link - Informations du lien externe
     * @param {Array} _options.distinctions - Distinctions du projet
     */
    constructor(_options)
    {
        // Stockage des options de configuration
        this.time = _options.time
        this.resources = _options.resources
        this.objects = _options.objects
        this.areas = _options.areas
        this.name = _options.name
        this.geometries = _options.geometries
        this.meshes = _options.meshes
        this.debug = _options.debug
        this.x = _options.x
        this.y = _options.y
        this.imageSources = _options.imageSources
        this.floorTexture = _options.floorTexture
        this.link = _options.link
        this.distinctions = _options.distinctions

        // Configuration du conteneur principal
        this.container = new THREE.Object3D()
        this.container.matrixAutoUpdate = false
        // this.container.updateMatrix()                                                // Décommentez si nécessaire

        // Initialisation des composants
        this.setBoards()
        this.setFloor()
    }

    /**
     * SetBoards - Configuration des panneaux d'affichage
     * 
     * Crée des panneaux d'affichage pour chaque image du projet avec
     * des structures de support, des textures et des animations de chargement.
     */
    setBoards()
    {
        // Configuration des panneaux
        this.boards = {}
        this.boards.items = []                                                        // Liste des panneaux
        this.boards.xStart = - 5                                                      // Position X de départ
        this.boards.xInter = 5                                                        // Intervalle entre panneaux
        this.boards.y = 5                                                             // Position Y des panneaux
        this.boards.color = '#8e7161'                                                 // Couleur des panneaux
        this.boards.threeColor = new THREE.Color(this.boards.color)                   // Couleur Three.js

        // Interface de debug pour la couleur
        if(this.debug)
        {
            this.debug.addColor(this.boards, 'color').name('boardColor').onChange(() =>
            {
                this.boards.threeColor.set(this.boards.color)                        // Mise à jour de la couleur
            })
        }

        // Création de chaque panneau
        let i = 0
        for(const _imageSource of this.imageSources)
        {
            // Configuration du panneau
            const board = {}
            board.x = this.x + this.boards.xStart + i * this.boards.xInter            // Position X du panneau
            board.y = this.y + this.boards.y                                          // Position Y du panneau

            // Création de la structure de support avec collision
            this.objects.add({
                base: this.resources.items.projectsBoardStructure.scene,              // Géométrie de base de la structure
                collision: this.resources.items.projectsBoardCollision.scene,         // Géométrie de collision
                floorShadowTexture: this.resources.items.projectsBoardStructureFloorShadowTexture, // Texture d'ombre
                offset: new THREE.Vector3(board.x, board.y, 0),                      // Position de la structure
                rotation: new THREE.Euler(0, 0, 0),                                  // Rotation
                duplicated: true,                                                     // Objet dupliqué
                mass: 0                                                              // Masse nulle (objet statique)
            })

            // Chargement de l'image
            const image = new Image()
            image.addEventListener('load', () =>
            {
                // Création de la texture Three.js
                board.texture = new THREE.Texture(image)
                // board.texture.magFilter = THREE.NearestFilter                      // Décommentez pour un filtrage pixelisé
                // board.texture.minFilter = THREE.LinearFilter                       // Décommentez pour un filtrage linéaire
                board.texture.anisotropy = 4                                          // Anisotropie pour la qualité
                // board.texture.colorSpace = THREE.SRGBColorSpace                    // Décommentez pour l'espace couleur sRGB
                board.texture.needsUpdate = true                                      // Mise à jour de la texture

                // Application de la texture au matériau
                board.planeMesh.material.uniforms.uTexture.value = board.texture

                // Animation d'apparition de la texture
                gsap.to(board.planeMesh.material.uniforms.uTextureAlpha, { 
                    value: 1, 
                    duration: 1, 
                    ease: 'power4.inOut' 
                })
            })

            image.src = _imageSource                                                  // Démarrage du chargement

            // Création du mesh du panneau
            board.planeMesh = this.meshes.boardPlane.clone()                         // Clonage du mesh de base
            board.planeMesh.position.x = board.x
            board.planeMesh.position.y = board.y
            board.planeMesh.matrixAutoUpdate = false
            board.planeMesh.updateMatrix()
            board.planeMesh.material = new ProjectBoardMaterial()                    // Matériau personnalisé
            board.planeMesh.material.uniforms.uColor.value = this.boards.threeColor  // Couleur du panneau
            board.planeMesh.material.uniforms.uTextureAlpha.value = 0                // Transparence initiale
            this.container.add(board.planeMesh)

            // Sauvegarde du panneau
            this.boards.items.push(board)

            i++
        }
    }

    /**
     * SetFloor - Configuration du sol et des distinctions
     * 
     * Crée le sol avec texture personnalisée, affiche les distinctions
     * et configure la zone interactive pour accéder au projet.
     */
    setFloor()
    {
        // Configuration du sol
        this.floor = {}
        this.floor.x = 0                                                              // Position X du sol
        this.floor.y = - 2                                                            // Position Y du sol

        // Conteneur du sol
        this.floor.container = new THREE.Object3D()
        this.floor.container.position.x = this.x + this.floor.x
        this.floor.container.position.y = this.y + this.floor.y
        this.floor.container.matrixAutoUpdate = false
        this.floor.container.updateMatrix()
        this.container.add(this.floor.container)

        // Configuration de la texture du sol
        this.floor.texture = this.floorTexture
        this.floor.texture.magFilter = THREE.NearestFilter                            // Filtrage de la texture
        this.floor.texture.minFilter = THREE.LinearFilter

        // Géométrie du sol
        this.floor.geometry = this.geometries.floor

        // Matériau transparent avec texture
        this.floor.material = new THREE.MeshBasicMaterial({ 
            transparent: true, 
            depthWrite: false, 
            alphaMap: this.floor.texture 
        })

        // Mesh du sol
        this.floor.mesh = new THREE.Mesh(this.floor.geometry, this.floor.material)
        this.floor.mesh.matrixAutoUpdate = false
        this.floor.container.add(this.floor.mesh)

        // Affichage des distinctions
        if(this.distinctions)
        {
            for(const _distinction of this.distinctions)
            {
                let base = null
                let collision = null
                let shadowSizeX = null
                let shadowSizeY = null

                // Configuration selon le type de distinction
                switch(_distinction.type)
                {
                    case 'awwwards':
                        base = this.resources.items.projectsDistinctionsAwwwardsBase.scene
                        collision = this.resources.items.projectsDistinctionsAwwwardsCollision.scene
                        shadowSizeX = 1.5
                        shadowSizeY = 1.5
                        break

                    case 'fwa':
                        base = this.resources.items.projectsDistinctionsFWABase.scene
                        collision = this.resources.items.projectsDistinctionsFWACollision.scene
                        shadowSizeX = 2
                        shadowSizeY = 1
                        break

                    case 'cssda':
                        base = this.resources.items.projectsDistinctionsCSSDABase.scene
                        collision = this.resources.items.projectsDistinctionsCSSDACollision.scene
                        shadowSizeX = 1.2
                        shadowSizeY = 1.2
                        break
                }

                // Création de l'objet distinction
                this.objects.add({
                    base: base,                                                        // Géométrie de base
                    collision: collision,                                             // Géométrie de collision
                    offset: new THREE.Vector3(this.x + this.floor.x + _distinction.x, this.y + this.floor.y + _distinction.y, 0), // Position
                    rotation: new THREE.Euler(0, 0, 0),                              // Rotation
                    duplicated: true,                                                 // Objet dupliqué
                    shadow: { sizeX: shadowSizeX, sizeY: shadowSizeY, offsetZ: - 0.1, alpha: 0.5 }, // Configuration de l'ombre
                    mass: 1.5,                                                        // Masse pour la physique
                    soundName: 'woodHit'                                              // Son de collision
                })
            }
        }

        // Zone interactive pour accéder au projet
        this.floor.area = this.areas.add({
            position: new THREE.Vector2(this.x + this.link.x, this.y + this.floor.y + this.link.y), // Position de la zone
            halfExtents: new THREE.Vector2(this.link.halfExtents.x, this.link.halfExtents.y) // Taille de la zone
        })
        this.floor.area.on('interact', () =>
        {
            window.open(this.link.href, '_blank')                                     // Ouverture du lien externe
        })

        // Label de la zone interactive
        this.floor.areaLabel = this.meshes.areaLabel.clone()                          // Clonage du label
        this.floor.areaLabel.position.x = this.link.x
        this.floor.areaLabel.position.y = this.link.y
        this.floor.areaLabel.position.z = 0.001                                      // Légère élévation
        this.floor.areaLabel.matrixAutoUpdate = false
        this.floor.areaLabel.updateMatrix()
        this.floor.container.add(this.floor.areaLabel)
    }
}
