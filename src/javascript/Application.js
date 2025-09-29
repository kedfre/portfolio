/**
 * APPLICATION.JS - Contrôleur Principal du Portfolio 3D
 * 
 * Ce fichier est le cœur de l'application qui orchestre tous les composants.
 * Il suit le pattern MVC en tant que contrôleur central.
 * 
 * RESPONSABILITÉS :
 * - Initialisation et coordination de tous les composants
 * - Configuration intelligente (debug, touch, cyberTruck)
 * - Gestion du rendu avec post-processing
 * - Animation du titre de la page
 * - Interface promotionnelle Three.js Journey
 * 
 * ARCHITECTURE :
 * - Pattern MVC : Application = Contrôleur
 * - Event-driven : Communication via événements
 * - Modularité : Chaque composant est autonome
 * - Configuration : Support debug et modes spéciaux
 * 
 * COMPOSANTS GÉRÉS :
 * - Time : Gestion du temps et animations
 * - Sizes : Gestion des dimensions viewport
 * - Resources : Chargement des assets (225+ fichiers)
 * - Camera : Système de caméra avancé
 * - World : Environnement 3D principal
 * - Post-processing : Effets visuels (blur, glows)
 * 
 * OPTIMISATIONS :
 * - Matrix auto-update désactivé sur les objets statiques
 * - Post-processing conditionnel selon le mode tactile
 * - Gestion intelligente des événements de redimensionnement
 */

import * as THREE from 'three'
import * as dat from 'dat.gui'

import Sizes from './Utils/Sizes.js'
import Time from './Utils/Time.js'
import World from './World/index.js'
import Resources from './Resources.js'
import Camera from './Camera.js'
import ThreejsJourney from './ThreejsJourney.js'

import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import BlurPass from './Passes/Blur.js'
import GlowsPass from './Passes/Glows.js'

export default class Application
{
    /**
     * Constructor - Initialisation de l'application
     * 
     * @param {Object} _options - Options de configuration
     * @param {HTMLElement} _options.$canvas - Élément canvas pour le rendu WebGL
     * 
     * SÉQUENCE D'INITIALISATION :
     * 1. Configuration intelligente (debug, touch, cyberTruck)
     * 2. Interface de debug (dat.GUI)
     * 3. Renderer WebGL et scène Three.js
     * 4. Système de caméra avancé
     * 5. Post-processing (blur, glows)
     * 6. Monde 3D principal
     * 7. Animation du titre
     * 8. Interface promotionnelle
     */
    constructor(_options)
    {
        // Options
        this.$canvas = _options.$canvas

        // Initialisation des utilitaires de base
        this.time = new Time()           // Gestion du temps et animations (60 FPS)
        this.sizes = new Sizes()         // Gestion des dimensions viewport
        this.resources = new Resources() // Chargement des 225+ assets

        // Configuration et setup des composants
        this.setConfig()        // Configuration intelligente (debug, touch, etc.)
        this.setDebug()         // Interface de debug avec dat.GUI
        this.setRenderer()      // WebGL Renderer et Scene Three.js
        this.setCamera()        // Caméra et contrôles de navigation
        this.setPasses()        // Post-processing (blur, glows)
        this.setWorld()         // Monde 3D principal
        this.setTitle()         // Animation du titre de la page
        this.setThreejsJourney() // Interface promotionnelle
    }

    /**
     * setConfig - Configuration intelligente de l'application
     * 
     * Détecte automatiquement le mode de fonctionnement :
     * - Mode debug : URL avec #debug
     * - Mode CyberTruck : URL avec #cybertruck
     * - Mode tactile : Détection automatique au premier touch
     * 
     * OPTIMISATIONS MOBILE :
     * - Désactive les effets de flou sur mobile (performance)
     * - Active les contrôles tactiles adaptés
     */
    setConfig()
    {
        this.config = {}
        
        // Détection des modes spéciaux via URL hash
        this.config.debug = window.location.hash === '#debug'        // Mode debug avec dat.GUI
        this.config.cyberTruck = window.location.hash === '#cybertruck' // Mode véhicule alternatif
        this.config.dukeHazzard = window.location.hash === '#dukehazzard' // Mode véhicule Duke Hazzard
        this.config.touch = false                                    // Détection tactile

        // Détection tactile avec adaptation automatique
        window.addEventListener('touchstart', () =>
        {
            this.config.touch = true
            this.world.controls.setTouch() // Active les contrôles tactiles

            // Optimisation mobile : désactive les effets de flou
            this.passes.horizontalBlurPass.strength = 1
            this.passes.horizontalBlurPass.material.uniforms.uStrength.value = new THREE.Vector2(this.passes.horizontalBlurPass.strength, 0)
            this.passes.verticalBlurPass.strength = 1
            this.passes.verticalBlurPass.material.uniforms.uStrength.value = new THREE.Vector2(0, this.passes.verticalBlurPass.strength)
        }, { once: true }) // Une seule fois pour éviter les répétitions
    }

    /**
     * setDebug - Initialisation de l'interface de debug
     * 
     * Crée l'interface dat.GUI pour le debug en mode développement.
     * L'interface permet de contrôler les paramètres en temps réel.
     * 
     * @note Ne s'active que si config.debug = true (URL avec #debug)
     */
    setDebug()
    {
        if(this.config.debug)
        {
            this.debug = new dat.GUI({ width: 420 })
        }
    }

    /**
     * setRenderer - Configuration du renderer WebGL et de la scène
     * 
     * Initialise le renderer WebGL avec optimisations de performance :
     * - Pixel ratio fixe à 2 pour la qualité
     * - Fond noir pour l'effet de révélation
     * - Auto-clear désactivé pour le post-processing
     * - Gestion automatique du redimensionnement
     */
    setRenderer()
    {
        // Scène Three.js principale
        this.scene = new THREE.Scene()

        // Renderer WebGL optimisé
        this.renderer = new THREE.WebGLRenderer({
            canvas: this.$canvas,
            alpha: true,                    // Transparence pour l'effet de révélation
            powerPreference: 'high-performance' // Optimisation GPU
        })
        
        // Configuration visuelle
        // this.renderer.setClearColor(0x414141, 1) // Couleur alternative (commentée)
        this.renderer.setClearColor(0x000000, 1)    // Fond noir pour l'effet de révélation
        // this.renderer.setPixelRatio(Math.min(Math.max(window.devicePixelRatio, 1.5), 2)) // Ratio adaptatif (commenté)
        this.renderer.setPixelRatio(2)               // Ratio fixe pour la qualité
        this.renderer.setSize(this.sizes.viewport.width, this.sizes.viewport.height)
        this.renderer.autoClear = false              // Désactivé pour le post-processing

        // Gestion du redimensionnement
        this.sizes.on('resize', () =>
        {
            this.renderer.setSize(this.sizes.viewport.width, this.sizes.viewport.height)
        })
    }

    /**
     * setCamera - Initialisation du système de caméra
     * 
     * Crée et configure la caméra avec suivi automatique de la voiture.
     * La caméra suit la position de la voiture en temps réel pour un effet
     * de caméra dynamique et immersive.
     */
    setCamera()
    {
        // Création de la caméra avec toutes les dépendances
        this.camera = new Camera({
            time: this.time,
            sizes: this.sizes,
            renderer: this.renderer,
            debug: this.debug,
            config: this.config
        })

        // Ajout de la caméra à la scène
        this.scene.add(this.camera.container)

        // Suivi automatique de la voiture
        this.time.on('tick', () =>
        {
            if(this.world && this.world.car)
            {
                // Mise à jour de la cible de la caméra selon la position de la voiture
                this.camera.target.x = this.world.car.chassis.object.position.x
                this.camera.target.y = this.world.car.chassis.object.position.y
            }
        })
    }

    /**
     * setPasses - Configuration du post-processing
     * 
     * Configure la chaîne de rendu avec des effets visuels :
     * - RenderPass : Rendu de base de la scène
     * - BlurPass : Effets de flou horizontal et vertical
     * - GlowsPass : Effets de lueur radiale
     * 
     * OPTIMISATIONS MOBILE :
     * - Désactive les effets de flou sur mobile (performance)
     * - Interface de debug pour ajuster les paramètres
     */
    setPasses()
    {
        this.passes = {}

        // Interface de debug pour le post-processing
        if(this.debug)
        {
            this.passes.debugFolder = this.debug.addFolder('postprocess')
            // this.passes.debugFolder.open()
        }

        // EffectComposer pour la chaîne de rendu
        this.passes.composer = new EffectComposer(this.renderer)

        // Passes de rendu
        this.passes.renderPass = new RenderPass(this.scene, this.camera.instance)

        // Passes de flou horizontal
        this.passes.horizontalBlurPass = new ShaderPass(BlurPass)
        this.passes.horizontalBlurPass.strength = this.config.touch ? 0 : 1 // Désactivé sur mobile
        this.passes.horizontalBlurPass.material.uniforms.uResolution.value = new THREE.Vector2(this.sizes.viewport.width, this.sizes.viewport.height)
        this.passes.horizontalBlurPass.material.uniforms.uStrength.value = new THREE.Vector2(this.passes.horizontalBlurPass.strength, 0)

        // Passes de flou vertical
        this.passes.verticalBlurPass = new ShaderPass(BlurPass)
        this.passes.verticalBlurPass.strength = this.config.touch ? 0 : 1 // Désactivé sur mobile
        this.passes.verticalBlurPass.material.uniforms.uResolution.value = new THREE.Vector2(this.sizes.viewport.width, this.sizes.viewport.height)
        this.passes.verticalBlurPass.material.uniforms.uStrength.value = new THREE.Vector2(0, this.passes.verticalBlurPass.strength)

        // Interface de debug pour les effets de flou
        if(this.debug)
        {
            const folder = this.passes.debugFolder.addFolder('blur')
            folder.open()

            folder.add(this.passes.horizontalBlurPass.material.uniforms.uStrength.value, 'x').step(0.001).min(0).max(10)
            folder.add(this.passes.verticalBlurPass.material.uniforms.uStrength.value, 'y').step(0.001).min(0).max(10)
        }

        // Configuration des effets de lueur
        this.passes.glowsPass = new ShaderPass(GlowsPass)
        this.passes.glowsPass.color = '#ffcfe0'
        this.passes.glowsPass.material.uniforms.uPosition.value = new THREE.Vector2(0, 0.25)
        this.passes.glowsPass.material.uniforms.uRadius.value = 0.7
        this.passes.glowsPass.material.uniforms.uColor.value = new THREE.Color(this.passes.glowsPass.color)
        this.passes.glowsPass.material.uniforms.uColor.value.convertLinearToSRGB()
        this.passes.glowsPass.material.uniforms.uAlpha.value = 0.55

        // Interface de debug pour les effets de lueur
        if(this.debug)
        {
            const folder = this.passes.debugFolder.addFolder('glows')
            folder.open()

            folder.add(this.passes.glowsPass.material.uniforms.uPosition.value, 'x').step(0.001).min(- 1).max(2).name('positionX')
            folder.add(this.passes.glowsPass.material.uniforms.uPosition.value, 'y').step(0.001).min(- 1).max(2).name('positionY')
            folder.add(this.passes.glowsPass.material.uniforms.uRadius, 'value').step(0.001).min(0).max(2).name('radius')
            folder.addColor(this.passes.glowsPass, 'color').name('color').onChange(() =>
            {
                this.passes.glowsPass.material.uniforms.uColor.value = new THREE.Color(this.passes.glowsPass.color)
            })
            folder.add(this.passes.glowsPass.material.uniforms.uAlpha, 'value').step(0.001).min(0).max(1).name('alpha')
        }

        // Assemblage de la chaîne de rendu (ordre important)
        this.passes.composer.addPass(this.passes.renderPass)        // 1. Rendu de base
        this.passes.composer.addPass(this.passes.horizontalBlurPass) // 2. Flou horizontal
        this.passes.composer.addPass(this.passes.verticalBlurPass)   // 3. Flou vertical
        this.passes.composer.addPass(this.passes.glowsPass)          // 4. Effets de lueur

        // Boucle de rendu principale
        this.time.on('tick', () =>
        {
            // Mise à jour de la voiture si elle existe
            if(this.world && this.world.car)
            {
                this.world.car.update()
            }

            // Activation conditionnelle des passes de flou
            this.passes.horizontalBlurPass.enabled = this.passes.horizontalBlurPass.material.uniforms.uStrength.value.x > 0
            this.passes.verticalBlurPass.enabled = this.passes.verticalBlurPass.material.uniforms.uStrength.value.y > 0

            // Rendu final avec post-processing
            this.passes.composer.render()
            // this.renderer.domElement.style.background = 'black' // Alternative (commentée)
            // this.renderer.render(this.scene, this.camera.instance) // Rendu direct (commenté)
        })

        // Gestion du redimensionnement pour le post-processing
        this.sizes.on('resize', () =>
        {
            // Mise à jour des dimensions du renderer et du composer
            this.renderer.setSize(this.sizes.viewport.width, this.sizes.viewport.height)
            this.passes.composer.setSize(this.sizes.viewport.width, this.sizes.viewport.height)
            
            // Mise à jour des résolutions des shaders de flou
            this.passes.horizontalBlurPass.material.uniforms.uResolution.value.x = this.sizes.viewport.width
            this.passes.horizontalBlurPass.material.uniforms.uResolution.value.y = this.sizes.viewport.height
            this.passes.verticalBlurPass.material.uniforms.uResolution.value.x = this.sizes.viewport.width
            this.passes.verticalBlurPass.material.uniforms.uResolution.value.y = this.sizes.viewport.height
        })
    }

    /**
     * setWorld - Initialisation du monde 3D principal
     * 
     * Crée l'environnement 3D complet avec tous les objets, la physique,
     * les contrôles et les sections interactives. Le monde contient :
     * - La voiture et ses contrôles
     * - Les sections (Intro, Crossroads, Projects, Information, Playground)
     * - La physique avec Cannon.js
     * - Les sons et effets
     */
    setWorld()
    {
        // Création du monde avec toutes les dépendances
        this.world = new World({
            config: this.config,
            debug: this.debug,
            resources: this.resources,
            time: this.time,
            sizes: this.sizes,
            camera: this.camera,
            scene: this.scene,
            renderer: this.renderer,
            passes: this.passes
        })
        
        // Ajout du monde à la scène
        this.scene.add(this.world.container)
    }

    /**
     * setTitle - Animation du titre de la page
     * 
     * Crée une animation du titre avec une voiture qui suit la position réelle
     * de la voiture dans le monde 3D. Le titre affiche une barre de progression
     * avec une voiture qui se déplace selon la vitesse de la voiture.
     * 
     * FONCTIONNALITÉS :
     * - Suit la vitesse de la voiture en temps réel
     * - Animation fluide avec mise à jour toutes les 300ms
     * - Barre de progression visuelle dans le titre
     * - Emoji de voiture qui se déplace
     */
    setTitle()
    {
        this.title = {}
        this.title.frequency = 300        // Fréquence de mise à jour (ms)
        this.title.width = 20            // Largeur de la barre de progression
        this.title.position = 0          // Position actuelle de la voiture
        this.title.$element = document.querySelector('title')
        this.title.absolutePosition = Math.round(this.title.width * 0.25) // Position initiale

        // Mise à jour de la position selon la vitesse de la voiture
        this.time.on('tick', () =>
        {
            if(this.world.physics)
            {
                // Accumulation de la position selon la vitesse
                this.title.absolutePosition += this.world.physics.car.forwardSpeed

                // Limitation de la position minimale
                if(this.title.absolutePosition < 0)
                {
                    this.title.absolutePosition = 0
                }
            }
        })

        // Mise à jour périodique du titre
        window.setInterval(() =>
        {
            // Calcul de la position relative dans la barre
            this.title.position = Math.round(this.title.absolutePosition % this.title.width)

            // Création du titre avec barre de progression
            document.title = `${'_'.repeat(this.title.width - this.title.position)}🚗${'_'.repeat(this.title.position)}`
        }, this.title.frequency)
    }

    /**
     * setThreejsJourney - Initialisation de l'interface promotionnelle
     * 
     * Crée l'interface promotionnelle qui apparaît après une certaine distance
     * parcourue par la voiture. Cette interface propose d'en savoir plus sur
     * Three.js Journey, le cours de Bruno Simon.
     */
    setThreejsJourney()
    {
        this.threejsJourney = new ThreejsJourney({
            config: this.config,
            time: this.time,
            world: this.world
        })
    }

    /**
     * destructor - Nettoyage des ressources
     * 
     * Libère toutes les ressources utilisées par l'application :
     * - Désabonnement des événements
     * - Libération des contrôles de caméra
     * - Nettoyage du renderer WebGL
     * - Destruction de l'interface de debug
     */
    destructor()
    {
        // Désabonnement des événements
        this.time.off('tick')
        this.sizes.off('resize')

        // Libération des ressources
        this.camera.orbitControls.dispose()
        this.renderer.dispose()
        this.debug.destroy()
    }
}
