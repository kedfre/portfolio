/**
 * AREA.JS - Zone Interactive
 *
 * Ce fichier définit une zone interactive dans l'environnement 3D du portfolio.
 * Cette zone permet l'interaction avec des éléments cliquables, avec des effets
 * visuels animés et des contrôles clavier/tactile.
 *
 * RESPONSABILITÉS :
 * - Création de zones interactives rectangulaires
 * - Gestion des effets visuels (clôture, bordure de sol)
 * - Détection d'interaction (souris, clavier, tactile)
 * - Animation des éléments visuels
 *
 * CARACTÉRISTIQUES :
 * - Zone rectangulaire interactive
 * - Clôture animée avec shader personnalisé
 * - Bordure de sol avec progression
 * - Clé d'interaction optionnelle
 * - Détection de collision avec la voiture
 *
 * UTILISATION :
 * - Zones cliquables dans le portfolio
 * - Navigation entre sections
 * - Accès aux projets et informations
 * - Zones de contrôle et interaction
 */

import * as THREE from 'three'
import gsap from 'gsap'

import EventEmitter from '../Utils/EventEmitter.js'
import AreaFloorBorderGeometry from '../Geometries/AreaFloorBorderGeometry.js'
import AreaFenceGeometry from '../Geometries/AreaFenceGeometry.js'
import AreaFenceMaterial from '../Materials/AreaFence.js'
import AreaFloorBordereMaterial from '../Materials/AreaFloorBorder.js'

export default class Area extends EventEmitter
{
    /**
     * Constructor - Initialisation de la zone interactive
     *
     * Initialise une zone interactive avec les options fournies
     * et configure les éléments visuels et les interactions.
     *
     * @param {Object} _options - Options de configuration
     * @param {Object} _options.config - Configuration de l'application
     * @param {Object} _options.renderer - Rendu Three.js
     * @param {Object} _options.resources - Gestionnaire de ressources
     * @param {Object} _options.car - Instance de la voiture
     * @param {Object} _options.sounds - Gestionnaire de sons
     * @param {Object} _options.time - Instance de gestion du temps
     * @param {Object} _options.position - Position de la zone (Vector2)
     * @param {Object} _options.halfExtents - Demi-dimensions de la zone (Vector2)
     * @param {boolean} _options.hasKey - Afficher la clé d'interaction
     * @param {boolean} _options.testCar - Tester la collision avec la voiture
     * @param {boolean} _options.active - Zone active par défaut
     */
    constructor(_options)
    {
        super()

        // Stockage des options de configuration
        this.config = _options.config
        this.renderer = _options.renderer
        this.resources = _options.resources
        this.car = _options.car
        this.sounds = _options.sounds
        this.time = _options.time
        this.position = _options.position
        this.halfExtents = _options.halfExtents
        this.hasKey = _options.hasKey
        this.testCar = _options.testCar
        this.active = _options.active

        // Configuration du conteneur principal
        this.container = new THREE.Object3D()
        this.container.position.x = this.position.x
        this.container.position.y = this.position.y
        this.container.matrixAutoUpdate = false
        this.container.updateMatrix()

        // Configuration des états
        this.initialTestCar = this.testCar
        this.isIn = false

        // Initialisation des composants
        this.setFloorBorder()
        this.setFence()
        this.setInteractions()

        // Configuration de la clé d'interaction si nécessaire
        if(this.hasKey)
        {
            this.setKey()
        }
    }

    /**
     * Activate - Activation de la zone
     * 
     * Active la zone et déclenche l'animation d'entrée si nécessaire.
     */
    activate()
    {
        this.active = true

        if(this.isIn)
        {
            this.in()
        }
    }

    /**
     * Deactivate - Désactivation de la zone
     * 
     * Désactive la zone et déclenche l'animation de sortie si nécessaire.
     */
    deactivate()
    {
        this.active = false

        if(this.isIn)
        {
            this.out()
        }
    }

    /**
     * SetFloorBorder - Configuration de la bordure de sol
     * 
     * Crée la bordure de sol avec géométrie personnalisée et matériau shader
     * pour afficher les effets de progression et de chargement.
     */
    setFloorBorder()
    {
        this.floorBorder = {}

        // Création de la géométrie de bordure de sol
        this.floorBorder.geometry = new AreaFloorBorderGeometry(this.halfExtents.x * 2, this.halfExtents.y * 2, 0.25)

        // Création du matériau shader personnalisé
        this.floorBorder.material = new AreaFloorBordereMaterial()
        this.floorBorder.material.uniforms.uColor.value = new THREE.Color(0xffffff)  // Couleur blanche
        this.floorBorder.material.uniforms.uAlpha.value = 0.5                       // Transparence
        this.floorBorder.material.uniforms.uLoadProgress.value = 1                   // Progression de chargement
        this.floorBorder.material.uniforms.uProgress.value = 1                      // Progression générale

        // Création du mesh
        this.floorBorder.mesh = new THREE.Mesh(this.floorBorder.geometry, this.floorBorder.material)
        this.floorBorder.mesh.matrixAutoUpdate = false

        this.container.add(this.floorBorder.mesh)
    }

    /**
     * SetFence - Configuration de la clôture
     * 
     * Crée la clôture animée avec géométrie personnalisée et matériau shader
     * pour afficher les effets de bordure et de frappe animés.
     */
    setFence()
    {
        // Configuration de la clôture
        this.fence = {}
        this.fence.depth = 0.5                                                      // Profondeur de la clôture
        this.fence.offset = 0.5                                                     // Décalage d'animation

        // Création de la géométrie de clôture
        this.fence.geometry = new AreaFenceGeometry(this.halfExtents.x * 2, this.halfExtents.y * 2, this.fence.depth)

        // Création du matériau shader personnalisé
        this.fence.material = new AreaFenceMaterial()
        this.fence.material.uniforms.uBorderAlpha.value = 0.5                       // Transparence de la bordure
        this.fence.material.uniforms.uStrikeAlpha.value = 0.25                      // Transparence de la frappe

        // Création du mesh
        this.fence.mesh = new THREE.Mesh(this.fence.geometry, this.fence.material)
        this.fence.mesh.position.z = - this.fence.depth                            // Position en profondeur
        this.container.add(this.fence.mesh)

        // Animation temporelle du shader
        this.time.on('tick', () =>
        {
            this.fence.material.uniforms.uTime.value = this.time.elapsed            // Mise à jour du temps pour l'animation
        })
    }

    /**
     * SetKey - Configuration de la clé d'interaction
     * 
     * Crée la clé d'interaction avec les textures "ENTER" et l'icône,
     * positionnée verticalement au-dessus de la zone.
     */
    setKey()
    {
        // Configuration de la clé
        this.key = {}
        this.key.hiddenZ = 1.5                                                      // Position cachée
        this.key.shownZ = 2.5                                                       // Position visible

        // Conteneur de la clé
        this.key.container = new THREE.Object3D()
        this.key.container.position.z = this.key.hiddenZ
        this.container.add(this.key.container)

        // Configuration du texte "ENTER"
        this.key.enter = {}
        this.key.enter.size = 1.4                                                   // Taille du texte
        this.key.enter.geometry = new THREE.PlaneGeometry(this.key.enter.size, this.key.enter.size / 4, 1, 1)

        // Configuration de la texture "ENTER"
        this.key.enter.texture = this.resources.items.areaEnterTexture
        this.key.enter.texture.magFilter = THREE.NearestFilter
        this.key.enter.texture.minFilter = THREE.LinearFilter

        // Matériau transparent pour le texte
        this.key.enter.material = new THREE.MeshBasicMaterial({ 
            color: 0xffffff, 
            alphaMap: this.key.enter.texture, 
            transparent: true, 
            opacity: 0, 
            depthWrite: false 
        })

        // Création du mesh du texte
        this.key.enter.mesh = new THREE.Mesh(this.key.enter.geometry, this.key.enter.material)
        this.key.enter.mesh.rotation.x = Math.PI * 0.5                             // Rotation verticale
        this.key.enter.mesh.position.x = this.key.enter.size * 0.75                // Position X
        this.key.enter.mesh.matrixAutoUpdate = false
        this.key.enter.mesh.updateMatrix()
        this.key.container.add(this.key.enter.mesh)

        // Configuration de l'icône
        this.key.icon = {}
        this.key.icon.size = 0.75                                                   // Taille de l'icône
        this.key.icon.geometry = new THREE.PlaneGeometry(this.key.icon.size, this.key.icon.size, 1, 1)

        // Configuration de la texture de l'icône
        this.key.icon.texture = this.resources.items.areaKeyEnterTexture
        this.key.icon.texture.magFilter = THREE.NearestFilter
        this.key.icon.texture.minFilter = THREE.LinearFilter

        // Matériau transparent pour l'icône
        this.key.icon.material = new THREE.MeshBasicMaterial({ 
            color: 0xffffff, 
            alphaMap: this.key.icon.texture, 
            transparent: true, 
            opacity: 0, 
            depthWrite: false 
        })

        // Création du mesh de l'icône
        this.key.icon.mesh = new THREE.Mesh(this.key.icon.geometry, this.key.icon.material)
        this.key.icon.mesh.rotation.x = Math.PI * 0.5                              // Rotation verticale
        this.key.icon.mesh.position.x = - this.key.enter.size * 0.15               // Position X (gauche)
        this.key.icon.mesh.matrixAutoUpdate = false
        this.key.icon.mesh.updateMatrix()
        this.key.container.add(this.key.icon.mesh)
    }

    /**
     * Interact - Interaction avec la zone
     * 
     * Déclenche l'interaction avec la zone, animant les éléments visuels
     * et jouant le son d'interaction.
     *
     * @param {boolean} _showKey - Afficher la clé d'interaction
     */
    interact(_showKey = true)
    {
        // Vérification de l'état actif
        if(!this.active)
        {
            return
        }

        // Arrêt des animations en cours
        gsap.killTweensOf(this.fence.mesh.position)
        gsap.killTweensOf(this.floorBorder.material.uniforms.uAlpha)
        gsap.killTweensOf(this.fence.material.uniforms.uBorderAlpha)

        if(this.hasKey)
        {
            gsap.killTweensOf(this.key.container.position)
            gsap.killTweensOf(this.key.icon.material)
            gsap.killTweensOf(this.key.enter.material)
        }

        // Animation de la clôture avec effet de rebond
        gsap.to(this.fence.mesh.position, { z: 0, duration: 0.05, onComplete: () =>
        {
            gsap.to(this.fence.mesh.position, { z: 0.5, duration: 0.25, ease: 'back.out(2)' })
            gsap.fromTo(this.floorBorder.material.uniforms.uAlpha, { value: 1 }, { value: 0.5, duration: 1.5 })
            gsap.fromTo(this.fence.material.uniforms.uBorderAlpha, { value: 1 }, { value: 0.5, duration: 1.5 })
        } })

        // Animation de la clé d'interaction
        if(this.hasKey && _showKey)
        {
            this.key.container.position.z = this.key.shownZ
            gsap.fromTo(this.key.icon.material, { opacity: 1 }, { opacity: 0.5, duration: 1.5 })
            gsap.fromTo(this.key.enter.material, { opacity: 1 }, { opacity: 0.5, duration: 1.5 })
        }

        // Lecture du son d'interaction
        this.sounds.play('uiArea')

        // Déclenchement de l'événement d'interaction
        this.trigger('interact')
    }

    /**
     * In - Entrée dans la zone
     * 
     * Déclenche l'animation d'entrée dans la zone avec élévation de la clôture
     * et affichage de la clé d'interaction.
     *
     * @param {boolean} _showKey - Afficher la clé d'interaction
     */
    in(_showKey = true)
    {
        this.isIn = true

        // Vérification de l'état actif
        if(!this.active)
        {
            return
        }

        // Animation de la clôture (élévation)
        gsap.killTweensOf(this.fence.mesh.position)
        gsap.to(this.fence.mesh.position, { z: this.fence.offset, duration: 0.35, ease: 'back.out(3)' })

        // Animation de la clé d'interaction
        if(this.hasKey)
        {
            gsap.killTweensOf(this.key.container.position)
            gsap.killTweensOf(this.key.icon.material)
            gsap.killTweensOf(this.key.enter.material)

            // Animation de la clé si demandée
            if(_showKey)
            {
                gsap.to(this.key.container.position, { z: this.key.shownZ, duration: 0.35, ease: 'back.out(3)', delay: 0.1 })
                gsap.to(this.key.icon.material, { opacity: 0.5, duration: 0.35, ease: 'back.out(3)', delay: 0.1 })
                gsap.to(this.key.enter.material, { opacity: 0.5, duration: 0.35, ease: 'back.out(3)', delay: 0.1 })
            }
        }

        // Changement du curseur (non-tactile)
        if(!this.config.touch)
        {
            this.renderer.domElement.classList.add('has-cursor-pointer')
        }

        // Déclenchement de l'événement d'entrée
        this.trigger('in')
    }

    /**
     * Out - Sortie de la zone
     * 
     * Déclenche l'animation de sortie de la zone avec abaissement de la clôture
     * et masquage de la clé d'interaction.
     */
    out()
    {
        this.isIn = false

        // Animation de la clôture (abaissement)
        gsap.killTweensOf(this.fence.mesh.position)
        gsap.to(this.fence.mesh.position, { z: - this.fence.depth, duration: 0.35, ease: 'back.in(4)' })

        // Animation de la clé d'interaction
        if(this.hasKey)
        {
            gsap.killTweensOf(this.key.container.position)
            gsap.killTweensOf(this.key.icon.material)
            gsap.killTweensOf(this.key.enter.material)
            gsap.to(this.key.container.position, { z: this.key.hiddenZ, duration: 0.35, ease: 'back.in(4)', delay: 0.1 })
            gsap.to(this.key.icon.material, { opacity: 0, duration: 0.35, ease: 'back.in(4)', delay: 0.1 })
            gsap.to(this.key.enter.material, { opacity: 0, duration: 0.35, ease: 'back.in(4)', delay: 0.1 })
        }

        // Changement du curseur (non-tactile)
        if(!this.config.touch)
        {
            this.renderer.domElement.classList.remove('has-cursor-pointer')
        }

        // Déclenchement de l'événement de sortie
        this.trigger('out')
    }

    /**
     * SetInteractions - Configuration des interactions
     * 
     * Configure les interactions avec la zone : détection de la souris,
     * collision avec la voiture et contrôles clavier.
     */
    setInteractions()
    {
        // Création du mesh invisible pour la détection de la souris
        this.mouseMesh = new THREE.Mesh(
            new THREE.PlaneGeometry(this.halfExtents.x * 2, this.halfExtents.y * 2, 1, 1),
            new THREE.MeshBasicMaterial({ transparent: true, opacity: 0 })
        )
        this.mouseMesh.position.z = - 0.01                                          // Légère élévation pour éviter les conflits
        this.mouseMesh.matrixAutoUpdate = false
        this.mouseMesh.updateMatrix()
        this.container.add(this.mouseMesh)

        // Détection de collision avec la voiture
        this.time.on('tick', () =>
        {
            if(this.testCar)
            {
                // Calcul de la collision avec la voiture
                const isIn = Math.abs(this.car.position.x - this.position.x) < Math.abs(this.halfExtents.x) && 
                           Math.abs(this.car.position.y - this.position.y) < Math.abs(this.halfExtents.y)

                // Déclenchement des animations d'entrée/sortie
                if(isIn !== this.isIn)
                {
                    if(isIn)
                    {
                        this.in(!this.config.touch)                                 // Entrée (sans clé sur tactile)
                    }
                    else
                    {
                        this.out()                                                  // Sortie
                    }
                }
            }
        })

        // Gestion des contrôles clavier
        window.addEventListener('keydown', (_event) =>
        {
            if((_event.key === 'f' || _event.key === 'e' || _event.key === 'Enter') && this.isIn)
            {
                this.interact()                                                     // Interaction avec les touches F, E ou Enter
            }
        })
    }
}
