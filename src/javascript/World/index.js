/**
 * WORLD/INDEX.JS - Gestionnaire Principal de l'Environnement 3D
 *
 * Ce fichier est le gestionnaire principal de l'environnement 3D du portfolio.
 * Il orchestre tous les composants du monde virtuel et gère la séquence
 * d'initialisation, les animations de révélation et l'écran de démarrage.
 *
 * RESPONSABILITÉS :
 * - Orchestration de tous les composants 3D
 * - Gestion de la séquence d'initialisation
 * - Animations de révélation avec GSAP
 * - Écran de démarrage et de chargement
 * - Coordination entre tous les systèmes
 *
 * COMPOSANTS GÉRÉS :
 * - Materials : Gestionnaire des matériaux et shaders
 * - Floor : Système de sol avec dégradé de couleurs
 * - Shadows : Gestionnaire des ombres portées
 * - Physics : Système de physique Cannon.js
 * - Zones : Zones de caméra et navigation
 * - Objects : Gestionnaire des objets 3D
 * - Car : Voiture interactive principale
 * - Areas : Zones interactives cliquables
 * - Tiles : Tuiles de navigation
 * - Walls : Murs et obstacles
 * - Sections : Sections du portfolio (Intro, Projects, etc.)
 * - Controls : Système de contrôles
 * - Sounds : Gestionnaire audio
 * - EasterEggs : Fonctionnalités cachées
 *
 * ARCHITECTURE :
 * - Pattern de composition avec conteneurs Three.js
 * - Initialisation en deux phases (constructeur + start)
 * - Animations GSAP pour les transitions
 * - Gestion des événements de chargement
 * - Interface de debug intégrée
 *
 * SÉQUENCE D'INITIALISATION :
 * 1. Constructeur : Configuration de base et écran de démarrage
 * 2. start() : Initialisation complète de tous les composants
 * 3. setReveal() : Animations de révélation progressive
 * 4. setStartingScreen() : Interface de chargement interactive
 */

import * as THREE from 'three'
import Materials from './Materials.js'
import Floor from './Floor.js'
import Shadows from './Shadows.js'
import Physics from './Physics.js'
import Zones from './Zones.js'
import Objects from './Objects.js'
import CarFactory from './CarFactory.js'
import Areas from './Areas.js'
import Tiles from './Tiles.js'
import Walls from './Walls.js'
import IntroSection from './Sections/IntroSection.js'
import ProjectsSection from './Sections/ProjectsSection.js'
import CrossroadsSection from './Sections/CrossroadsSection.js'
import InformationSection from './Sections/InformationSection.js'
import PlaygroundSection from './Sections/PlaygroundSection.js'
// import DistinctionASection from './Sections/DistinctionASection.js'
// import DistinctionBSection from './Sections/DistinctionBSection.js'
// import DistinctionCSection from './Sections/DistinctionCSection.js'
// import DistinctionDSection from './Sections/DistinctionDSection.js'
import Controls from './Controls.js'
import Sounds from './Sounds.js'
import gsap from 'gsap'
import EasterEggs from './EasterEggs.js'

export default class World
{
    /**
     * Constructor - Initialisation du gestionnaire principal de l'environnement 3D
     *
     * Initialise le gestionnaire principal de l'environnement 3D avec les options
     * fournies et configure les composants de base nécessaires pour l'écran de
     * démarrage. L'initialisation complète se fait dans la méthode start().
     *
     * @param {Object} _options - Options de configuration
     * @param {Object} _options.config - Configuration de l'application (config.js)
     * @param {Object} _options.debug - Interface de debug (dat.GUI)
     * @param {Object} _options.resources - Gestionnaire de ressources (Resources.js)
     * @param {Object} _options.time - Instance de gestion du temps (Time.js)
     * @param {Object} _options.sizes - Gestionnaire de tailles (Sizes.js)
     * @param {Object} _options.camera - Instance de caméra (Camera.js)
     * @param {Object} _options.scene - Scène Three.js principale
     * @param {Object} _options.renderer - Rendu Three.js (Renderer.js)
     * @param {Object} _options.passes - Post-processing (Passes.js)
     */
    constructor(_options)
    {
        // Stockage des options de configuration pour accès global
        this.config = _options.config                                                // Configuration de l'application
        this.debug = _options.debug                                                  // Interface de debug
        this.resources = _options.resources                                          // Gestionnaire des assets 3D
        this.time = _options.time                                                    // Gestionnaire du temps et animations
        this.sizes = _options.sizes                                                  // Gestionnaire des dimensions viewport
        this.camera = _options.camera                                                // Instance de caméra
        this.scene = _options.scene                                                  // Scène Three.js principale
        this.renderer = _options.renderer                                            // Rendu Three.js
        this.passes = _options.passes                                                // Post-processing

        // Configuration de l'interface de debug
        if(this.debug)
        {
            this.debugFolder = this.debug.addFolder('world')                         // Dossier de debug pour le monde
            this.debugFolder.open()                                                  // Ouverture automatique du dossier
        }

        // Configuration du conteneur principal du monde
        this.container = new THREE.Object3D()                                       // Conteneur parent pour tous les éléments 3D
        this.container.matrixAutoUpdate = false                                     // Désactivation de la mise à jour automatique de la matrice

        // Initialisation des composants de base (phase 1)
        // this.setAxes()                                                             // Axes de debug (commenté)
        this.setSounds()                                                             // Gestionnaire audio
        this.setControls()                                                           // Système de contrôles
        this.setFloor()                                                              // Système de sol
        this.setAreas()                                                              // Zones interactives
        this.setStartingScreen()                                                     // Écran de démarrage et de chargement
    }

    /**
     * Start - Initialisation complète de l'environnement 3D
     *
     * Initialise tous les composants de l'environnement 3D après le chargement
     * des ressources. Cette méthode est appelée depuis l'écran de démarrage
     * une fois que l'utilisateur a interagi avec l'interface de chargement.
     *
     * SÉQUENCE D'INITIALISATION :
     * 1. Activation du pan de caméra (délai de 2s)
     * 2. Configuration des animations de révélation
     * 3. Initialisation des matériaux et shaders
     * 4. Configuration des ombres et de la physique
     * 5. Création des zones, objets et voiture
     * 6. Configuration des tuiles, murs et sections
     * 7. Initialisation des œufs de Pâques
     */
    start()
    {
        // Activation du pan de caméra avec délai pour laisser le temps à l'utilisateur
        window.setTimeout(() =>
        {
            this.camera.pan.enable()                                                 // Activation du pan de caméra
        }, 2000)

        // Initialisation séquentielle de tous les composants
        this.setReveal()                                                             // Configuration des animations de révélation
        this.setMaterials()                                                          // Gestionnaire des matériaux et shaders
        this.setShadows()                                                            // Système d'ombres portées
        this.setPhysics()                                                            // Système de physique Cannon.js
        this.setZones()                                                              // Zones de caméra et navigation
        this.setObjects()                                                            // Gestionnaire des objets 3D
        this.setCar()                                                                // Voiture interactive principale
        this.areas.car = this.car                                                    // Liaison de la voiture avec les zones interactives
        this.setTiles()                                                              // Tuiles de navigation
        this.setWalls()                                                              // Murs et obstacles
        this.setSections()                                                           // Sections du portfolio (Intro, Projects, etc.)
        this.setEasterEggs()                                                         // Fonctionnalités cachées et œufs de Pâques
    }

    /**
     * SetReveal - Configuration des animations de révélation
     *
     * Configure le système d'animations de révélation progressive de l'environnement 3D.
     * Gère les animations des matériaux matcap, des ombres de sol, des instructions,
     * de la voiture, des sons et des contrôles tactiles.
     *
     * ANIMATIONS GÉRÉES :
     * - Matcaps : Révélation progressive des matériaux
     * - Ombres de sol : Apparition des ombres portées
     * - Instructions : Affichage des instructions de contrôle
     * - Voiture : Positionnement et réveil de la physique
     * - Sons : Activation progressive du moteur
     * - Contrôles : Révélation de l'interface tactile
     */
    setReveal()
    {
        // Configuration des variables de révélation
        this.reveal = {}
        this.reveal.matcapsProgress = 0                                              // Progression de la révélation des matcaps
        this.reveal.floorShadowsProgress = 0                                         // Progression de la révélation des ombres de sol
        this.reveal.previousMatcapsProgress = null                                   // Valeur précédente pour détection de changement
        this.reveal.previousFloorShadowsProgress = null                              // Valeur précédente pour détection de changement

        // Méthode principale de révélation
        this.reveal.go = () =>
        {
            // Animation de révélation des matcaps (3 secondes)
            gsap.fromTo(this.reveal, { matcapsProgress: 0 }, { matcapsProgress: 1, duration: 3 })
            
            // Animation de révélation des ombres de sol (3 secondes, délai 0.5s)
            gsap.fromTo(this.reveal, { floorShadowsProgress: 0 }, { floorShadowsProgress: 1, duration: 3, delay: 0.5 })
            
            // Animation de révélation des ombres globales (3 secondes, délai 0.5s)
            gsap.fromTo(this.shadows, { alpha: 0 }, { alpha: 0.5, duration: 3, delay: 0.5 })

            // Animation des instructions de contrôle
            if(this.sections.intro)
            {
                // Révélation des instructions de flèches (délai 0.5s)
                gsap.fromTo(this.sections.intro.instructions.arrows.label.material, { opacity: 0 }, { opacity: 1, duration: 0.3, delay: 0.5 })
                
                // Révélation des autres instructions (délai 0.75s)
                if(this.sections.intro.otherInstructions)
                {
                    gsap.fromTo(this.sections.intro.otherInstructions.label.material, { opacity: 0 }, { opacity: 1, duration: 0.3, delay: 0.75 })
                }
            }

            // Configuration de la voiture
            this.physics.car.chassis.body.sleep()                                    // Mise en veille du corps physique
            
            // La position initiale est déjà gérée par Physics.js
            console.log(`🚗 ${this.getCarTypeName()} - Position physique initiale:`, this.physics.car.chassis.body.position)

            // Réveil de la voiture après un délai
            window.setTimeout(() =>
            {
                this.physics.car.chassis.body.wakeUp()                               // Réveil du corps physique
            }, 300)

            // Animation du son du moteur
            gsap.fromTo(this.sounds.engine.volume, { master: 0 }, { master: 0.7, duration: 0.5, delay: 0.3, ease: 'power2.in' })
            
            // Lecture du son de révélation
            window.setTimeout(() =>
            {
                this.sounds.play('reveal')                                           // Son de révélation
            }, 400)

            // Révélation des contrôles tactiles
            if(this.controls.touch)
            {
                window.setTimeout(() =>
                {
                    this.controls.touch.reveal()                                     // Révélation de l'interface tactile
                }, 400)
            }
        }

        // Boucle de mise à jour des animations de révélation
        this.time.on('tick',() =>
        {
            // Vérification du changement de progression des matcaps
            if(this.reveal.matcapsProgress !== this.reveal.previousMatcapsProgress)
            {
                // Mise à jour de chaque matériau matcap
                for(const _materialKey in this.materials.shades.items)
                {
                    const material = this.materials.shades.items[_materialKey]
                    material.uniforms.uRevealProgress.value = this.reveal.matcapsProgress  // Mise à jour de l'uniform de révélation
                }

                // Sauvegarde de la valeur précédente pour la prochaine comparaison
                this.reveal.previousMatcapsProgress = this.reveal.matcapsProgress
            }

            // Vérification du changement de progression des ombres de sol
            if(this.reveal.floorShadowsProgress !== this.reveal.previousFloorShadowsProgress)
            {
                // Mise à jour de chaque ombre de sol
                for(const _mesh of this.objects.floorShadows)
                {
                    _mesh.material.uniforms.uAlpha.value = this.reveal.floorShadowsProgress  // Mise à jour de l'alpha des ombres
                }

                // Sauvegarde de la valeur précédente pour la prochaine comparaison
                this.reveal.previousFloorShadowsProgress = this.reveal.floorShadowsProgress
            }
        })

        // Configuration de l'interface de debug
        if(this.debug)
        {
            // Contrôles de debug pour les animations de révélation
            this.debugFolder.add(this.reveal, 'matcapsProgress').step(0.0001).min(0).max(1).name('matcapsProgress')
            this.debugFolder.add(this.reveal, 'floorShadowsProgress').step(0.0001).min(0).max(1).name('floorShadowsProgress')
            this.debugFolder.add(this.reveal, 'go').name('reveal')                    // Bouton pour déclencher la révélation
        }
    }

    /**
     * SetStartingScreen - Configuration de l'écran de démarrage et de chargement
     *
     * Configure l'écran de démarrage interactif avec zone de clic, labels de chargement
     * et de démarrage, et gestion des événements de progression et de prêt.
     * L'utilisateur doit cliquer sur la zone pour démarrer l'expérience.
     *
     * COMPOSANTS :
     * - Zone interactive : Zone cliquable pour démarrer
     * - Label de chargement : Affichage pendant le chargement des ressources
     * - Label de démarrage : Affichage une fois le chargement terminé
     * - Barre de progression : Progression du chargement des assets
     * - Animations : Transitions fluides entre les états
     */
    setStartingScreen()
    {
        // Initialisation du conteneur de l'écran de démarrage
        this.startingScreen = {}

        // Configuration de la zone interactive de démarrage
        this.startingScreen.area = this.areas.add({
            position: new THREE.Vector2(0, 0),                                       // Position centrale
            halfExtents: new THREE.Vector2(2.35, 1.5),                              // Dimensions de la zone (4.7 x 3)
            hasKey: false,                                                           // Pas de clé d'interaction
            testCar: false,                                                          // Pas de test de collision avec la voiture
            active: false                                                            // Inactive par défaut
        })

        // Loading label
        this.startingScreen.loadingLabel = {}
        this.startingScreen.loadingLabel.geometry = new THREE.PlaneGeometry(2.5, 2.5 / 4)
        this.startingScreen.loadingLabel.image = new Image()
        this.startingScreen.loadingLabel.image.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAQAAAABABAMAAAAHc7SNAAAAMFBMVEUAAAD///9ra2ucnJzR0dH09PQmJiaNjY24uLjp6end3d1CQkLFxcVYWFiqqqp9fX3nQ5qrAAAEVUlEQVRo3u3YT08TQRQA8JEtW6CATGnDdvljaTwYE2IBI/HGRrwSetGTsZh4MPFQYiQe229gE++WePFY9Oqh1cRzieEDYIgXLxjPJu5M33vbZQszW+fgoS+B7ewO836znRl2lg1jGMP4P2Okw0yFvaKsklr3I99Tvl3iPPelGbQhKqxB4eN6N/7gVcsvbEAz1F4RLn67zzl/v6/oLvejGBQ9LsNphio4UFjmEAsVJuOK/zkDtc6w+gyTcZ3LyP6IAzjBDA+pj6LkEgAjW4kANsMAC6vmOvqAMU5RgVOTskQACicCmCcA9AXjkT5gj1MswqlxWcoTgKJ6HuAQAD5guNoAu8QpMnBul1ONMGD2PCBbRgDAKYq6AEtmXvtdj3S6GhRyW1t1DvkAgM0ggG7mu1t3xWFHFzAqv3wYCi0mY1UCGgiQPU+1oWIY8LoXcAA3qeYfr+kClvHW14PJ5OfCAgHYNAoDAORBQIrDvHjqH5c0ANTbORzBacbAQgUC2IAKAzI9gCSHlWEMLmgBPJxMvyARpIICALDm4nkAbwIA71EZx5UOgO48JnLoOhQIAN9sOgKoBoAE5r0aB8ARcNhtFzrg0VQmwCp8CAMeAADGc44S5GMBsF1aCEU2LcAcAPDCvwFytBDehCaUgJxRAKeF8BNUUQJ43iiAUlqwFKoBrTCAHjiagwEgU0YM5IYWYD4KoIgPwIXQwUbVgCXzgLpIBJNeDciWTQNskVsq1ADX/6kYBdCTjse5owbMiX+IpgGWOCPSuWpA2vN/TAMm5QTYg5IC4FdbMA0YF5Nb5s2rAaLyhzBgektGZWDArrgqi0U1QHxf38OABDwUDgTAjGfyPlTVgJT/67FBACbqyGYaaoBctQwD2vI4DecVAPkgZRhQlxPQks2rAePGAbZsRlaa1QBYEQBUHRCAmaXD0QDYxgFWdye05R9cDQCrmQYkeBA6gGXTgNEeQF4DMG4S4MLjOUZRA5A0CcjADgmjqgGwSwSg9wK1GIBS74KTgTxv/EHoiaVQsTOS5RoCJuiZyosB8EIrHpyowFiYofO0i4wCjhCQwL0hq2sCaFNM22S4JXloLk0AuLDTBzCBAAt3xykeA7CHe/mDbgdTvQ9GswSAwdbqA0giYASHjQUJnhQKhQ6z/d8rDA4hAG2Dsk042ejubHMM2nV6AMf93pCkaRjhh0WsWuz+6aasl2FwiAImReEts1/CSaFfwFouAJxC4RW+I4oCThBQE1X2WbKkBFDkqYDtJ0SHaYKq3pJJwCECjjiFPoC1w+2P0gumurgeBjT6AhIIGKOelGIAngWlFnRnMZjMIYBb7gtIIsAuYU+8GICpEhYyZVgIZ2g9rYYAX1lfAKvjnxzjnWrHALDn9K1h2k2aoI1ewGd2AWAVAVMHcKdW4wDYje739pNufJXhkJohgLu9zy4CHCKAJYUge4ddCojGyPrp9kaHmYjUi9N7+2wYwxjGZfEXMKxGE0GkkfIAAAAASUVORK5CYII='
        this.startingScreen.loadingLabel.texture = new THREE.Texture(this.startingScreen.loadingLabel.image)
        this.startingScreen.loadingLabel.texture.magFilter = THREE.NearestFilter
        this.startingScreen.loadingLabel.texture.minFilter = THREE.LinearFilter
        this.startingScreen.loadingLabel.texture.needsUpdate = true
        this.startingScreen.loadingLabel.material = new THREE.MeshBasicMaterial({ transparent: true, depthWrite: false, color: 0xffffff, alphaMap: this.startingScreen.loadingLabel.texture })
        this.startingScreen.loadingLabel.mesh = new THREE.Mesh(this.startingScreen.loadingLabel.geometry, this.startingScreen.loadingLabel.material)
        this.startingScreen.loadingLabel.mesh.matrixAutoUpdate = false
        this.container.add(this.startingScreen.loadingLabel.mesh)

        // Start label
        this.startingScreen.startLabel = {}
        this.startingScreen.startLabel.geometry = new THREE.PlaneGeometry(2.5, 2.5 / 4)
        this.startingScreen.startLabel.image = new Image()
        this.startingScreen.startLabel.image.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAQAAAABABAMAAAAHc7SNAAAAMFBMVEUAAAD///+cnJxra2vR0dHd3d0mJib09PRYWFjp6em4uLhCQkKqqqqNjY19fX3FxcV3XeRgAAADsklEQVRo3u3YsU9TQRwH8KNgLSDQg9ZCAak1IdE4PKPu1NTEsSzOMDl3I3GpcXAxBhLjXFxNjJgQJ2ON0Rnj4uAAEyv8B/L7tV++5/VN+CM69Ldwfa+534d7d793VzeIQQzi/49c4v5lPF/1vvhFm++rjIpcyErrmrSCuz+cxng1iL/If8drPJD2Lc/Iy4VhaZWlFd4tLPfuMc6e/5LvRilJA2SkVSQA8c0OsI0uNtIAU9rsB8y1rAAZjyimAUa1mQDAeGwF+MA+9lIA69qs9AMKVoDP8vhf35A+NiMAc7YJKFSrX7tcI8BW9+k/O/kz6zSunjSnncMHiQYBcmdXrh3xCVbc2WO8N/YZZI0AxxwMArKivmwAwFKSPmV0UwBbCpj5E+C+yzUbQAaJVwUSA9SFjwFgHQ0jAMrBWgzAPCtHgFFbQAlpEwKC2zWUQgJGbAH+naSdu/fTxQAthPL5/ADD6OCpQwCAsb6LsbEGcBluOAYBmG2fkMIawHVWXEsDIGUGpZCAIRsAS93DPgDbhUmUQgKe2NUB90hfhK0YwEJYHkYpJGDbqBKiB86CGLAlzd6/S8CEvh8sACiBvrSXCshKblWEgNy2vkAMAHwGfjECcJHOu5qUQgDm6vXulshZAXJNL9GJAeg+LxeKPQBj1gzgdlnuCWAhbOi7LwaU9u0A2VWPpUgAC+GR5k0iwBtnB3Bj3qMaRYB17X0IOQhYcjYA7guxxyIAGfd1HNqchPfly7aACQUshAA2W1r5G1yG415YpgB3qIIkAHBH2D075QnQ10fHDsCl+CoGSKpiN8kMAVqIN00BsitnVgKyPIBMB4ADKU92AA5BKQIgszjKBGBLagpwB5xZBGS6pbcuizQAXMA6NAK86OCQ3okAI55BQPe7VoDxXzU/iwPASgS4GAASAiYxWgYAzvAa1loA2AkAFQIU2zEELCJtDDgIAG0CFLvp7LblC2kAtF6eTEJJ2CBAr88bAXKY4WkASbzXmwt5AvTvohHA4WSUBmj2Jt+IThQChrAOLQC13vPFMAOAQwuyTAeAKVQto3OBDOdESh2YxNZPbpYBQNbEAoBfod7e1i1BiwB0voSZWgwAOWgtAGPhD18E8ASIiRIAXNPwXJBtcqMbAFAIr5weIJMAcIx1aAAIqk0lAuycompyFwBMHAsAZlj/lgw0rsy2AkhbsgK4Q+70CUBjxeFXsUb0G1HJDJC9rketZRcCWCJwHM8DgJm7b7ch+XizXm25QQxiEOcXvwGCWOhbCZC0qAAAAABJRU5ErkJggg=='
        this.startingScreen.startLabel.texture = new THREE.Texture(this.startingScreen.startLabel.image)
        this.startingScreen.startLabel.texture.magFilter = THREE.NearestFilter
        this.startingScreen.startLabel.texture.minFilter = THREE.LinearFilter
        this.startingScreen.startLabel.texture.needsUpdate = true
        this.startingScreen.startLabel.material = new THREE.MeshBasicMaterial({ transparent: true, depthWrite: false, color: 0xffffff, alphaMap: this.startingScreen.startLabel.texture })
        this.startingScreen.startLabel.material.opacity = 0
        this.startingScreen.startLabel.mesh = new THREE.Mesh(this.startingScreen.startLabel.geometry, this.startingScreen.startLabel.material)
        this.startingScreen.startLabel.mesh.matrixAutoUpdate = false
        this.container.add(this.startingScreen.startLabel.mesh)

        // Gestion de la progression du chargement des ressources
        this.resources.on('progress', (_progress) =>
        {
            // Mise à jour de la zone de progression
            this.startingScreen.area.floorBorder.material.uniforms.uAlpha.value = 1                    // Activation de l'alpha de la bordure
            this.startingScreen.area.floorBorder.material.uniforms.uLoadProgress.value = _progress     // Mise à jour de la progression
        })

        // Gestion de la fin du chargement des ressources
        this.resources.on('ready', () =>
        {
            window.requestAnimationFrame(() =>
            {
                this.startingScreen.area.activate()                                                    // Activation de la zone interactive

                // Animations de transition vers l'état prêt
                gsap.to(this.startingScreen.area.floorBorder.material.uniforms.uAlpha, { value: 0.3, duration: 0.3 })
                gsap.to(this.startingScreen.loadingLabel.material, { opacity: 0, duration: 0.3 })      // Disparition du label de chargement
                gsap.to(this.startingScreen.startLabel.material, { opacity: 1, duration: 0.3, delay: 0.3 })  // Apparition du label de démarrage
            })
        })

        // Gestion de l'interaction avec la zone de démarrage
        this.startingScreen.area.on('interact', () =>
        {
            this.startingScreen.area.deactivate()                                                      // Désactivation de la zone
            gsap.to(this.startingScreen.area.floorBorder.material.uniforms.uProgress, { value: 0, duration: 0.3, delay: 0.4 })

            gsap.to(this.startingScreen.startLabel.material, { opacity: 0, duration: 0.3, delay: 0.4 })  // Disparition du label de démarrage

            this.start()                                                                               // Démarrage de l'expérience

            // Déclenchement de la révélation après un délai
            window.setTimeout(() =>
            {
                this.reveal.go()                                                                       // Démarrage des animations de révélation
            }, 600)
        })
    }

    /**
     * SetSounds - Configuration du gestionnaire audio
     */
    setSounds()
    {
        this.sounds = new Sounds({
            debug: this.debugFolder,                                                      // Interface de debug
            time: this.time                                                               // Gestionnaire du temps
        })
    }

    /**
     * SetAxes - Configuration des axes de debug (commenté)
     */
    setAxes()
    {
        this.axis = new THREE.AxesHelper()                                               // Création des axes de debug
        this.container.add(this.axis)                                                    // Ajout au conteneur
    }

    /**
     * SetControls - Configuration du système de contrôles
     */
    setControls()
    {
        this.controls = new Controls({
            config: this.config,                                                          // Configuration de l'application
            sizes: this.sizes,                                                            // Gestionnaire des dimensions
            time: this.time,                                                              // Gestionnaire du temps
            camera: this.camera,                                                          // Instance de caméra
            sounds: this.sounds                                                           // Gestionnaire audio
        })
    }

    /**
     * SetMaterials - Configuration du gestionnaire de matériaux
     */
    setMaterials()
    {
        this.materials = new Materials({
            resources: this.resources,                                                    // Gestionnaire des ressources
            debug: this.debugFolder                                                       // Interface de debug
        })
    }

    /**
     * SetFloor - Configuration du système de sol
     */
    setFloor()
    {
        this.floor = new Floor({
            debug: this.debugFolder                                                       // Interface de debug
        })

        this.container.add(this.floor.container)                                         // Ajout du sol au conteneur
    }

    /**
     * SetShadows - Configuration du système d'ombres
     */
    setShadows()
    {
        this.shadows = new Shadows({
            time: this.time,                                                              // Gestionnaire du temps
            debug: this.debugFolder,                                                      // Interface de debug
            renderer: this.renderer,                                                      // Rendu Three.js
            camera: this.camera                                                           // Instance de caméra
        })
        this.container.add(this.shadows.container)                                       // Ajout des ombres au conteneur
    }

    /**
     * SetPhysics - Configuration du système de physique
     */
    setPhysics()
    {
        this.physics = new Physics({
            config: this.config,                                                          // Configuration de l'application
            debug: this.debug,                                                            // Interface de debug
            scene: this.scene,                                                            // Scène Three.js
            time: this.time,                                                              // Gestionnaire du temps
            sizes: this.sizes,                                                            // Gestionnaire des dimensions
            controls: this.controls,                                                      // Système de contrôles
            sounds: this.sounds                                                           // Gestionnaire audio
        })

        this.container.add(this.physics.models.container)                                // Ajout des modèles physiques au conteneur
    }

    /**
     * SetZones - Configuration des zones de caméra
     */
    setZones()
    {
        this.zones = new Zones({
            time: this.time,                                                              // Gestionnaire du temps
            physics: this.physics,                                                        // Système de physique
            debug: this.debugFolder                                                       // Interface de debug
        })
        this.container.add(this.zones.container)                                         // Ajout des zones au conteneur
    }

    /**
     * SetAreas - Configuration des zones interactives
     */
    setAreas()
    {
        this.areas = new Areas({
            config: this.config,                                                          // Configuration de l'application
            resources: this.resources,                                                    // Gestionnaire des ressources
            debug: this.debug,                                                            // Interface de debug
            renderer: this.renderer,                                                      // Rendu Three.js
            camera: this.camera,                                                          // Instance de caméra
            car: this.car,                                                                // Voiture (sera définie plus tard)
            sounds: this.sounds,                                                          // Gestionnaire audio
            time: this.time                                                               // Gestionnaire du temps
        })

        this.container.add(this.areas.container)                                         // Ajout des zones au conteneur
    }

    /**
     * SetTiles - Configuration des tuiles de navigation
     */
    setTiles()
    {
        this.tiles = new Tiles({
            resources: this.resources,                                                    // Gestionnaire des ressources
            objects: this.objects,                                                        // Gestionnaire des objets
            debug: this.debug                                                             // Interface de debug
        })
    }

    /**
     * SetWalls - Configuration des murs et obstacles
     */
    setWalls()
    {
        this.walls = new Walls({
            resources: this.resources,                                                    // Gestionnaire des ressources
            objects: this.objects                                                         // Gestionnaire des objets
        })
    }

    /**
     * SetObjects - Configuration du gestionnaire d'objets 3D
     */
    setObjects()
    {
        this.objects = new Objects({
            time: this.time,                                                              // Gestionnaire du temps
            resources: this.resources,                                                    // Gestionnaire des ressources
            materials: this.materials,                                                    // Gestionnaire des matériaux
            physics: this.physics,                                                        // Système de physique
            shadows: this.shadows,                                                        // Système d'ombres
            sounds: this.sounds,                                                          // Gestionnaire audio
            debug: this.debugFolder                                                       // Interface de debug
        })
        this.container.add(this.objects.container)                                       // Ajout des objets au conteneur

        // Optimisation de fusion des géométries (commentée)
        // window.requestAnimationFrame(() =>
        // {
        //     this.objects.merge.update()
        // })
    }

    /**
     * GetCarTypeName - Obtient le nom du type de voiture actuel
     * 
     * @returns {string} Nom du type de voiture
     */
    getCarTypeName()
    {
        if(this.config && this.config.dukeHazzard) return 'Duke Hazzard'
        if(this.config && this.config.cyberTruck) return 'CyberTruck'
        return 'Voiture par défaut'
    }

    /**
     * GetCarInitialPosition - Obtient la position initiale selon le type de voiture
     * 
     * @returns {Object} Position initiale {x, y, z}
     */
    getCarInitialPosition()
    {
        // Configuration des positions initiales par type de voiture
        const carPositions = {
            'dukehazzard': { x: 0, y: 0, z: 0 },        // Duke Hazzard au sol
            'cybertruck': { x: 0, y: 0, z: 12 },        // CyberTruck en hauteur
            'default': { x: 0, y: 0, z: 12 }            // Voiture par défaut en hauteur
        }

        // Détermination du type de voiture
        let carType = 'default'
        if(this.config && this.config.dukeHazzard) carType = 'dukehazzard'
        else if(this.config && this.config.cyberTruck) carType = 'cybertruck'

        return carPositions[carType]
    }

    /**
     * SetCar - Configuration de la voiture interactive
     */
    setCar()
    {
        // Utilisation de la factory pour créer la bonne voiture selon la configuration
        this.carFactory = new CarFactory({
            time: this.time,                                                              // Gestionnaire du temps
            resources: this.resources,                                                    // Gestionnaire des ressources
            objects: this.objects,                                                        // Gestionnaire des objets
            physics: this.physics,                                                        // Système de physique
            shadows: this.shadows,                                                        // Système d'ombres
            materials: this.materials,                                                    // Gestionnaire des matériaux
            controls: this.controls,                                                      // Système de contrôles
            sounds: this.sounds,                                                          // Gestionnaire audio
            renderer: this.renderer,                                                      // Rendu Three.js
            camera: this.camera,                                                          // Instance de caméra
            debug: this.debugFolder,                                                      // Interface de debug
            config: this.config                                                           // Configuration de l'application
        })

        // Récupération de l'instance de voiture créée par la factory
        this.car = this.carFactory.getCar()
        this.container.add(this.car.container)                                           // Ajout de la voiture au conteneur
        
        // Exposer le factory pour l'application
        this.carFactory = this.carFactory
    }

    /**
     * SetSections - Configuration des sections du portfolio
     *
     * Configure toutes les sections du portfolio avec leurs positions
     * et options communes. Chaque section représente une zone thématique
     * avec ses propres éléments interactifs et visuels.
     */
    setSections()
    {
        this.sections = {}

        // Options communes pour toutes les sections
        const options = {
            config: this.config,                                                          // Configuration de l'application
            time: this.time,                                                              // Gestionnaire du temps
            resources: this.resources,                                                    // Gestionnaire des ressources
            camera: this.camera,                                                          // Instance de caméra
            passes: this.passes,                                                          // Post-processing
            objects: this.objects,                                                        // Gestionnaire des objets
            areas: this.areas,                                                            // Zones interactives
            zones: this.zones,                                                            // Zones de caméra
            walls: this.walls,                                                            // Murs et obstacles
            tiles: this.tiles,                                                            // Tuiles de navigation
            debug: this.debugFolder                                                       // Interface de debug
        }

        // // Distinction A
        // this.sections.distinctionA = new DistinctionASection({
        //     ...options,
        //     x: 0,
        //     y: - 15
        // })
        // this.container.add(this.sections.distinctionA.container)

        // // Distinction B
        // this.sections.distinctionB = new DistinctionBSection({
        //     ...options,
        //     x: 0,
        //     y: - 15
        // })
        // this.container.add(this.sections.distinctionB.container)

        // // Distinction C
        // this.sections.distinctionC = new DistinctionCSection({
        //     ...options,
        //     x: 0,
        //     y: 0
        // })
        // this.container.add(this.sections.distinctionC.container)

        // // Distinction D
        // this.sections.distinctionD = new DistinctionDSection({
        //     ...options,
        //     x: 0,
        //     y: 0
        // })
        // this.container.add(this.sections.distinctionD.container)

        // Section d'introduction (position centrale)
        this.sections.intro = new IntroSection({
            ...options,
            x: 0,                                                                        // Position X centrale
            y: 0                                                                         // Position Y centrale
        })
        this.container.add(this.sections.intro.container)

        // Section des carrefours (navigation)
        this.sections.crossroads = new CrossroadsSection({
            ...options,
            x: 0,                                                                        // Position X
            y: - 30                                                                      // Position Y (au sud)
        })
        this.container.add(this.sections.crossroads.container)

        // Section des projets (principale)
        this.sections.projects = new ProjectsSection({
            ...options,
            x: 30,                                                                       // Position X (à l'est)
            y: - 30                                                                      // Position Y (au sud)
            // Positions de debug (commentées)
            // x: 0,
            // y: 0
        })
        this.container.add(this.sections.projects.container)

        // Section d'information (contact)
        this.sections.information = new InformationSection({
            ...options,
            x: 1.2,                                                                      // Position X (légèrement à l'est)
            y: - 55                                                                      // Position Y (plus au sud)
            // Positions de debug (commentées)
            // x: 0,
            // y: - 10
        })
        this.container.add(this.sections.information.container)

        // Section de playground (jeux)
        this.sections.playground = new PlaygroundSection({
            ...options,
            x: - 38,                                                                     // Position X (à l'ouest)
            y: - 34                                                                      // Position Y (au sud)
            // Positions de debug (commentées)
            // x: - 15,
            // y: - 4
        })
        this.container.add(this.sections.playground.container)
    }

    /**
     * SetEasterEggs - Configuration des œufs de Pâques et fonctionnalités cachées
     */
    setEasterEggs()
    {
        this.easterEggs = new EasterEggs({
            resources: this.resources,                                                    // Gestionnaire des ressources
            car: this.car,                                                                // Voiture interactive
            walls: this.walls,                                                            // Murs et obstacles
            objects: this.objects,                                                        // Gestionnaire des objets
            materials: this.materials,                                                    // Gestionnaire des matériaux
            areas: this.areas,                                                            // Zones interactives
            config: this.config,                                                          // Configuration de l'application
            physics: this.physics                                                         // Système de physique
        })
        this.container.add(this.easterEggs.container)                                    // Ajout des œufs de Pâques au conteneur
    }
}
