/**
 * CAMERA.JS - Système de Caméra Avancé
 * 
 * Ce fichier gère un système de caméra sophistiqué avec :
 * - Contrôles personnalisés (zoom, pan, angles prédéfinis)
 * - Support tactile et clavier
 * - Transitions fluides avec GSAP
 * - Raycasting pour interactions précises
 * - Mode debug avec OrbitControls
 * 
 * FONCTIONNALITÉS PRINCIPALES :
 * - Angles prédéfinis : default, projects avec transitions
 * - Zoom intelligent : molette souris + pinch mobile
 * - Pan avancé : raycasting pour interactions précises
 * - Lissage : easing pour mouvements fluides
 * - Debug : OrbitControls pour développement
 * 
 * ARCHITECTURE :
 * - Container : Objet3D parent pour organisation
 * - Target : Cible de la caméra avec lissage
 * - Zoom : Système de zoom avec limites
 * - Pan : Système de pan avec raycasting
 * - OrbitControls : Mode debug
 * 
 * OPTIMISATIONS :
 * - Matrix auto-update désactivé
 * - Easing pour mouvements fluides
 * - Gestion intelligente des événements
 * - Support multi-plateforme (desktop/mobile)
 */

import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import gsap from 'gsap'

export default class Camera
{
    /**
     * Constructor - Initialisation du système de caméra
     * 
     * @param {Object} _options - Options de configuration
     * @param {Object} _options.time - Gestionnaire de temps
     * @param {Object} _options.sizes - Gestionnaire des dimensions
     * @param {Object} _options.renderer - Renderer WebGL
     * @param {Object} _options.debug - Interface de debug
     * @param {Object} _options.config - Configuration de l'application
     * 
     * SÉQUENCE D'INITIALISATION :
     * 1. Configuration des angles prédéfinis
     * 2. Création de l'instance de caméra
     * 3. Configuration du système de zoom
     * 4. Configuration du système de pan
     * 5. Configuration des contrôles OrbitControls
     */
    constructor(_options)
    {
        // Options de configuration
        this.time = _options.time
        this.sizes = _options.sizes
        this.renderer = _options.renderer
        this.debug = _options.debug
        this.config = _options.config

        // Container principal pour l'organisation
        this.container = new THREE.Object3D()
        this.container.matrixAutoUpdate = false // Optimisation : pas de mise à jour automatique

        // Système de cible avec lissage
        this.target = new THREE.Vector3(0, 0, 0)        // Cible directe
        this.targetEased = new THREE.Vector3(0, 0, 0)   // Cible lissée
        this.easing = 0.15                              // Facteur de lissage

        // Interface de debug
        if(this.debug)
        {
            this.debugFolder = this.debug.addFolder('camera')
            // this.debugFolder.open()
        }

        // Initialisation des composants
        this.setAngle()         // Angles prédéfinis
        this.setInstance()      // Instance de caméra
        this.setZoom()          // Système de zoom
        this.setPan()           // Système de pan
        this.setOrbitControls() // Contrôles de debug
    }

    /**
     * setAngle - Configuration des angles prédéfinis de la caméra
     * 
     * Définit des positions de caméra prédéfinies avec transitions fluides.
     * Utilise GSAP pour des animations smooth entre les angles.
     * 
     * ANGLES DISPONIBLES :
     * - default : Vue principale du portfolio
     * - projects : Vue optimisée pour la section projets
     * 
     * FONCTIONNALITÉS :
     * - Transitions fluides avec GSAP (2s, ease power1.inOut)
     * - Interface debug avec contrôles en temps réel
     * - Validation des angles existants
     */
    setAngle()
    {
        // Configuration des angles
        this.angle = {}

        // Angles prédéfinis (position relative à la cible)
        this.angle.items = {
            default: new THREE.Vector3(1.135, -1.45, 1.15),  // Vue principale
            projects: new THREE.Vector3(0.38, -1.4, 1.63)    // Vue projets
        }

        // Angle actuel (copie de l'angle par défaut)
        this.angle.value = new THREE.Vector3()
        this.angle.value.copy(this.angle.items.default)

        // Méthode pour changer d'angle avec transition
        this.angle.set = (_name) =>
        {
            const angle = this.angle.items[_name]
            if(typeof angle !== 'undefined')
            {
                // Transition fluide avec GSAP
                gsap.to(this.angle.value, { 
                    ...angle, 
                    duration: 2, 
                    ease: 'power1.inOut' 
                })
            }
        }

        // Interface de debug
        if(this.debug)
        {
            this.debugFolder.add(this, 'easing').step(0.0001).min(0).max(1).name('easing')
            this.debugFolder.add(this.angle.value, 'x').step(0.001).min(-2).max(2).name('invertDirectionX').listen()
            this.debugFolder.add(this.angle.value, 'y').step(0.001).min(-2).max(2).name('invertDirectionY').listen()
            this.debugFolder.add(this.angle.value, 'z').step(0.001).min(-2).max(2).name('invertDirectionZ').listen()
        }
    }

    /**
     * setInstance - Création et configuration de l'instance de caméra
     * 
     * Crée la caméra PerspectiveCamera avec :
     * - FOV de 40° pour un angle de vue naturel
     * - Planes near/far optimisés (1-80)
     * - Orientation Z-up pour le portfolio
     * - Gestion automatique du redimensionnement
     * - Boucle de mise à jour avec lissage
     */
    setInstance()
    {
        // Création de la caméra perspective
        this.instance = new THREE.PerspectiveCamera(
            40,                                                    // FOV (Field of View)
            this.sizes.viewport.width / this.sizes.viewport.height, // Aspect ratio
            1,                                                     // Near plane
            80                                                     // Far plane
        )
        
        // Configuration de l'orientation (Z-up pour le portfolio)
        this.instance.up.set(0, 0, 1)
        this.instance.position.copy(this.angle.value)
        this.instance.lookAt(new THREE.Vector3())
        this.container.add(this.instance)

        // Gestion du redimensionnement
        this.sizes.on('resize', () =>
        {
            this.instance.aspect = this.sizes.viewport.width / this.sizes.viewport.height
            this.instance.updateProjectionMatrix()
        })

        // Boucle de mise à jour principale
        this.time.on('tick', () =>
        {
            // Vérification que les OrbitControls ne sont pas actifs
            if(!this.orbitControls.enabled)
            {
                // Lissage de la cible (easing)
                this.targetEased.x += (this.target.x - this.targetEased.x) * this.easing
                this.targetEased.y += (this.target.y - this.targetEased.y) * this.easing
                this.targetEased.z += (this.target.z - this.targetEased.z) * this.easing

                // Application du zoom (distance depuis la cible)
                this.instance.position.copy(this.targetEased)
                    .add(this.angle.value.clone().normalize().multiplyScalar(this.zoom.distance))

                // Orientation vers la cible
                this.instance.lookAt(this.targetEased)

                // Application du pan (décalage horizontal/vertical)
                this.instance.position.x += this.pan.value.x
                this.instance.position.y += this.pan.value.y
            }
        })
    }

    /**
     * setZoom - Configuration du système de zoom
     * 
     * Gère le zoom de la caméra avec :
     * - Contrôle molette de souris (desktop)
     * - Pinch-to-zoom (mobile)
     * - Lissage des transitions
     * - Limites min/max
     * - Configuration différente pour CyberTruck
     * 
     * FONCTIONNALITÉS :
     * - Distance minimale : 14 unités
     * - Amplitude : 15 unités
     * - Valeur par défaut : 0.5 (0.3 pour CyberTruck)
     * - Easing : 0.1 pour transitions fluides
     */
    setZoom()
    {
        // Configuration du système de zoom
        this.zoom = {}
        this.zoom.easing = 0.1                    // Facteur de lissage
        this.zoom.minDistance = 14                // Distance minimale
        this.zoom.amplitude = 15                  // Amplitude du zoom
        this.zoom.value = this.config.cyberTruck ? 0.3 : 0.5 // Valeur initiale selon le mode
        this.zoom.targetValue = this.zoom.value   // Valeur cible
        this.zoom.distance = this.zoom.minDistance + this.zoom.amplitude * this.zoom.value

        // Contrôle molette de souris (desktop)
        document.addEventListener('mousewheel', (_event) =>
        {
            this.zoom.targetValue += _event.deltaY * 0.001
            this.zoom.targetValue = Math.min(Math.max(this.zoom.targetValue, 0), 1) // Limitation 0-1
        }, { passive: true })

        // Configuration du zoom tactile (mobile)
        this.zoom.touch = {}
        this.zoom.touch.startDistance = 0
        this.zoom.touch.startValue = 0

        // Détection du début du pinch
        this.renderer.domElement.addEventListener('touchstart', (_event) =>
        {
            if(_event.touches.length === 2)
            {
                // Calcul de la distance initiale entre les deux doigts
                this.zoom.touch.startDistance = Math.hypot(
                    _event.touches[0].clientX - _event.touches[1].clientX, 
                    _event.touches[0].clientY - _event.touches[1].clientY
                )
                this.zoom.touch.startValue = this.zoom.targetValue
            }
        })

        // Gestion du pinch en cours
        this.renderer.domElement.addEventListener('touchmove', (_event) =>
        {
            if(_event.touches.length === 2)
            {
                _event.preventDefault()

                // Calcul de la distance actuelle et du ratio
                const distance = Math.hypot(
                    _event.touches[0].clientX - _event.touches[1].clientX, 
                    _event.touches[0].clientY - _event.touches[1].clientY
                )
                const ratio = distance / this.zoom.touch.startDistance

                // Application du zoom selon le ratio
                this.zoom.targetValue = this.zoom.touch.startValue - (ratio - 1)
                this.zoom.targetValue = Math.min(Math.max(this.zoom.targetValue, 0), 1) // Limitation 0-1
            }
        })

        // Mise à jour du zoom avec lissage
        this.time.on('tick', () =>
        {
            this.zoom.value += (this.zoom.targetValue - this.zoom.value) * this.zoom.easing
            this.zoom.distance = this.zoom.minDistance + this.zoom.amplitude * this.zoom.value
        })
    }

    /**
     * setPan - Configuration du système de pan (déplacement de caméra)
     * 
     * Système avancé de pan utilisant le raycasting pour des interactions précises :
     * - Raycasting sur un plan invisible pour calculer les positions 3D
     * - Support souris et tactile
     * - Lissage des mouvements
     * - Gestion des curseurs (grab/grabbing)
     * - Plan de collision invisible pour les calculs
     * 
     * ARCHITECTURE :
     * - hitMesh : Plan invisible pour le raycasting
     * - raycaster : Calcul des intersections
     * - mouse : Position normalisée (-1 à 1)
     * - easing : Lissage des mouvements
     */
    setPan()
    {
        // Configuration du système de pan
        this.pan = {}
        this.pan.enabled = false    // Activation/désactivation
        this.pan.active = false     // État actif (en cours de pan)
        this.pan.easing = 0.1       // Facteur de lissage
        
        // Positions de référence
        this.pan.start = {}
        this.pan.start.x = 0
        this.pan.start.y = 0
        
        // Valeurs actuelles et cibles
        this.pan.value = {}
        this.pan.value.x = 0
        this.pan.value.y = 0
        this.pan.targetValue = {}
        this.pan.targetValue.x = this.pan.value.x
        this.pan.targetValue.y = this.pan.value.y
        
        // Système de raycasting
        this.pan.raycaster = new THREE.Raycaster()
        this.pan.mouse = new THREE.Vector2()
        this.pan.needsUpdate = false
        
        // Plan invisible pour les calculs de raycasting
        this.pan.hitMesh = new THREE.Mesh(
            new THREE.PlaneGeometry(500, 500, 1, 1),
            new THREE.MeshBasicMaterial({ 
                color: 0xff0000, 
                wireframe: true, 
                visible: false  // Invisible mais présent pour le raycasting
            })
        )
        this.container.add(this.pan.hitMesh)

        // Méthodes de contrôle du pan
        this.pan.reset = () =>
        {
            this.pan.targetValue.x = 0
            this.pan.targetValue.y = 0
        }

        this.pan.enable = () =>
        {
            this.pan.enabled = true
            // Mise à jour du curseur (grab)
            this.renderer.domElement.classList.add('has-cursor-grab')
        }

        this.pan.disable = () =>
        {
            this.pan.enabled = false
            // Suppression du curseur (grab)
            this.renderer.domElement.classList.remove('has-cursor-grab')
        }

        // Gestion du début du pan (clic/touch)
        this.pan.down = (_x, _y) =>
        {
            if(!this.pan.enabled)
            {
                return
            }

            // Mise à jour du curseur (grabbing)
            this.renderer.domElement.classList.add('has-cursor-grabbing')

            // Activation du pan
            this.pan.active = true

            // Conversion des coordonnées écran en coordonnées normalisées (-1 à 1)
            this.pan.mouse.x = (_x / this.sizes.viewport.width) * 2 - 1
            this.pan.mouse.y = - (_y / this.sizes.viewport.height) * 2 + 1

            // Calcul de la position de départ via raycasting
            this.pan.raycaster.setFromCamera(this.pan.mouse, this.instance)
            const intersects = this.pan.raycaster.intersectObjects([this.pan.hitMesh])

            if(intersects.length)
            {
                // Stockage de la position de départ sur le plan
                this.pan.start.x = intersects[0].point.x
                this.pan.start.y = intersects[0].point.y
            }
        }

        // Gestion du mouvement du pan
        this.pan.move = (_x, _y) =>
        {
            if(!this.pan.enabled || !this.pan.active)
            {
                return
            }

            // Mise à jour de la position de la souris
            this.pan.mouse.x = (_x / this.sizes.viewport.width) * 2 - 1
            this.pan.mouse.y = - (_y / this.sizes.viewport.height) * 2 + 1

            // Marquage pour mise à jour dans la boucle de rendu
            this.pan.needsUpdate = true
        }

        // Gestion de la fin du pan
        this.pan.up = () =>
        {
            // Désactivation du pan
            this.pan.active = false
            // Restauration du curseur normal
            this.renderer.domElement.classList.remove('has-cursor-grabbing')
        }

        // Événements souris (desktop)
        window.addEventListener('mousedown', (_event) =>
        {
            this.pan.down(_event.clientX, _event.clientY)
        })

        window.addEventListener('mousemove', (_event) =>
        {
            this.pan.move(_event.clientX, _event.clientY)
        })

        window.addEventListener('mouseup', () =>
        {
            this.pan.up()
        })

        // Événements tactiles (mobile)
        this.renderer.domElement.addEventListener('touchstart', (_event) =>
        {
            if(_event.touches.length === 1) // Un seul doigt pour le pan
            {
                this.pan.down(_event.touches[0].clientX, _event.touches[0].clientY)
            }
        })

        this.renderer.domElement.addEventListener('touchmove', (_event) =>
        {
            if(_event.touches.length === 1) // Un seul doigt pour le pan
            {
                this.pan.move(_event.touches[0].clientX, _event.touches[0].clientY)
            }
        })

        this.renderer.domElement.addEventListener('touchend', () =>
        {
            this.pan.up()
        })

        // Boucle de mise à jour du pan
        this.time.on('tick', () =>
        {
            // Calcul du pan si actif et mise à jour nécessaire
            if(this.pan.active && this.pan.needsUpdate)
            {
                // Calcul de la nouvelle position via raycasting
                this.pan.raycaster.setFromCamera(this.pan.mouse, this.instance)
                const intersects = this.pan.raycaster.intersectObjects([this.pan.hitMesh])

                if(intersects.length)
                {
                    // Calcul du décalage par rapport à la position de départ
                    this.pan.targetValue.x = - (intersects[0].point.x - this.pan.start.x)
                    this.pan.targetValue.y = - (intersects[0].point.y - this.pan.start.y)
                }

                // Marquage de la mise à jour comme terminée
                this.pan.needsUpdate = false
            }

            // Application du lissage (easing) aux valeurs du pan
            this.pan.value.x += (this.pan.targetValue.x - this.pan.value.x) * this.pan.easing
            this.pan.value.y += (this.pan.targetValue.y - this.pan.value.y) * this.pan.easing
        })
    }

    /**
     * setOrbitControls - Configuration des contrôles OrbitControls pour le debug
     * 
     * OrbitControls permet de naviguer librement dans la scène 3D en mode debug.
     * Ces contrôles sont désactivés par défaut et ne s'activent qu'en mode debug.
     * 
     * FONCTIONNALITÉS :
     * - Rotation libre de la caméra
     * - Zoom avec molette
     * - Pan avec clic droit
     * - Désactivé par défaut (système personnalisé prioritaire)
     * - Vitesse de zoom réduite (0.5)
     */
    setOrbitControls()
    {
        // Création des contrôles OrbitControls
        this.orbitControls = new OrbitControls(this.instance, this.renderer.domElement)
        this.orbitControls.enabled = false        // Désactivé par défaut
        this.orbitControls.enableKeys = false     // Pas de contrôles clavier
        this.orbitControls.zoomSpeed = 0.5        // Vitesse de zoom réduite

        // Interface de debug pour activer/désactiver OrbitControls
        if(this.debug)
        {
            this.debugFolder.add(this.orbitControls, 'enabled').name('orbitControlsEnabled')
        }
    }
}
