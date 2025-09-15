/**
 * CAR.JS - Voiture Interactive
 *
 * Ce fichier définit la voiture interactive dans l'environnement 3D du portfolio.
 * Cette voiture peut être contrôlée par l'utilisateur et inclut des fonctionnalités
 * avancées comme la physique, les sons, les effets visuels et les contrôles de debug.
 *
 * RESPONSABILITÉS :
 * - Gestion de la voiture 3D interactive
 * - Intégration avec le système de physique
 * - Gestion des mouvements et contrôles
 * - Effets visuels (feux, antenne, roues)
 *
 * CARACTÉRISTIQUES :
 * - Modèles 3D (voiture par défaut et CyberTruck)
 * - Physique réaliste avec Cannon.js
 * - Contrôles clavier et tactile
 * - Effets visuels (feux de freinage, marche arrière)
 * - Antenne avec simulation physique
 * - Contrôles de debug (TransformControls)
 * - Fonctionnalités spéciales (tir de boules, klaxon)
 *
 * UTILISATION :
 * - Véhicule principal de navigation
 * - Interaction avec l'environnement 3D
 * - Démonstration des capacités techniques
 * - Élément central du portfolio
 */

import * as THREE from 'three'
import CANNON from 'cannon'
import { TransformControls } from 'three/examples/jsm/controls/TransformControls.js'

export default class Car
{
    /**
     * Constructor - Initialisation de la voiture interactive
     *
     * Initialise la voiture interactive avec tous ses composants :
     * modèles 3D, physique Cannon.js, contrôles, effets visuels et fonctionnalités spéciales.
     * La voiture est le véhicule principal de navigation dans l'environnement 3D du portfolio.
     *
     * @param {Object} _options - Options de configuration
     * @param {Object} _options.time - Instance de gestion du temps (Time.js)
     * @param {Object} _options.resources - Gestionnaire de ressources (Resources.js)
     * @param {Object} _options.objects - Gestionnaire d'objets 3D (Objects.js)
     * @param {Object} _options.physics - Système de physique (Physics.js avec Cannon.js)
     * @param {Object} _options.shadows - Gestionnaire d'ombres (Shadows.js)
     * @param {Object} _options.materials - Gestionnaire de matériaux (Materials.js)
     * @param {Object} _options.controls - Système de contrôles (Controls.js)
     * @param {Object} _options.sounds - Gestionnaire de sons (Sounds.js)
     * @param {Object} _options.renderer - Rendu Three.js (Renderer.js)
     * @param {Object} _options.camera - Instance de caméra (Camera.js)
     * @param {Object} _options.debug - Interface de debug (dat.GUI)
     * @param {Object} _options.config - Configuration de l'application
     */
    constructor(_options)
    {
        // Stockage des options de configuration pour accès global
        this.time = _options.time                                                      // Gestion du temps et animations
        this.resources = _options.resources                                            // Gestionnaire des assets 3D
        this.objects = _options.objects                                                // Gestionnaire des objets 3D
        this.physics = _options.physics                                                // Système de physique Cannon.js
        this.shadows = _options.shadows                                                // Gestionnaire des ombres
        this.materials = _options.materials                                            // Gestionnaire des matériaux
        this.controls = _options.controls                                              // Système de contrôles
        this.sounds = _options.sounds                                                  // Gestionnaire des sons
        this.renderer = _options.renderer                                              // Rendu Three.js
        this.camera = _options.camera                                                  // Instance de caméra
        this.debug = _options.debug                                                    // Interface de debug
        this.config = _options.config                                                  // Configuration de l'application

        // Configuration du conteneur principal de la voiture
        this.container = new THREE.Object3D()                                          // Conteneur parent pour tous les éléments
        this.position = new THREE.Vector3()                                            // Position globale de la voiture

        // Configuration de l'interface de debug
        if(this.debug)
        {
            this.debugFolder = this.debug.addFolder('car')                             // Dossier de debug pour la voiture
            // this.debugFolder.open()                                                  // Décommenter pour ouvrir automatiquement
        }

        // Initialisation séquentielle des composants de la voiture
        this.setModels()                                                               // Sélection des modèles 3D (voiture/CyberTruck)
        this.setMovement()                                                             // Configuration du système de mouvement
        this.setChassis()                                                              // Configuration du châssis principal
        this.setAntena()                                                               // Configuration de l'antenne avec simulation physique
        this.setBackLights()                                                           // Configuration des feux arrière
        this.setWheels()                                                               // Configuration des 4 roues
        this.setTransformControls()                                                    // Configuration des contrôles de debug
        this.setShootingBall()                                                         // Configuration du tir de boules (CyberTruck)
        this.setKlaxon()                                                               // Configuration du klaxon et effets spéciaux
    }

    /**
     * SetModels - Configuration des modèles 3D de la voiture
     * 
     * Sélectionne les modèles 3D appropriés selon la configuration de l'application.
     * Supporte deux types de véhicules : la voiture par défaut et le CyberTruck.
     * Chaque modèle inclut le châssis, l'antenne, les feux arrière et les roues.
     *
     * MODÈLES DISPONIBLES :
     * - Voiture par défaut : Modèle standard avec oreilles de lapin (commentées)
     * - CyberTruck : Modèle futuriste avec fonctionnalités spéciales
     *
     * COMPOSANTS GÉRÉS :
     * - Châssis : Corps principal du véhicule
     * - Antenne : Élément avec simulation physique
     * - Feux de freinage : Éclairage rouge pour le freinage
     * - Feux de marche arrière : Éclairage jaune pour la marche arrière
     * - Roues : 4 roues identiques pour la locomotion
     */
    setModels()
    {
        // Initialisation du conteneur des modèles
        this.models = {}

        // Configuration CyberTruck (mode futuriste)
        if(this.config.cyberTruck)
        {
            this.models.chassis = this.resources.items.carCyberTruckChassis              // Châssis du CyberTruck
            this.models.antena = this.resources.items.carCyberTruckAntena                // Antenne du CyberTruck
            this.models.backLightsBrake = this.resources.items.carCyberTruckBackLightsBrake    // Feux de freinage
            this.models.backLightsReverse = this.resources.items.carCyberTruckBackLightsReverse // Feux de marche arrière
            this.models.wheel = this.resources.items.carCyberTruckWheel                   // Roues du CyberTruck
        }

        // Configuration par défaut (voiture standard)
        else
        {
            this.models.chassis = this.resources.items.carDefaultChassis                 // Châssis de la voiture par défaut
            this.models.antena = this.resources.items.carDefaultAntena                   // Antenne de la voiture par défaut
            // this.models.bunnyEarLeft = this.resources.items.carDefaultBunnyEarLeft    // Oreille de lapin gauche (commentée)
            // this.models.bunnyEarRight = this.resources.items.carDefaultBunnyEarRight  // Oreille de lapin droite (commentée)
            this.models.backLightsBrake = this.resources.items.carDefaultBackLightsBrake // Feux de freinage par défaut
            this.models.backLightsReverse = this.resources.items.carDefaultBackLightsReverse // Feux de marche arrière par défaut
            this.models.wheel = this.resources.items.carDefaultWheel                     // Roues par défaut
        }
    }

    /**
     * SetMovement - Configuration du système de mouvement et de calcul de vitesse
     * 
     * Configure le système de calcul de vitesse et d'accélération pour la synchronisation
     * avec les sons et effets visuels. Calcule les vitesses globales et locales,
     * gère l'accélération et déclenche les sons de moteur et de crissement.
     *
     * CALCULS EFFECTUÉS :
     * - Vitesse globale : Mouvement dans l'espace 3D
     * - Vitesse locale : Mouvement par rapport à l'orientation de la voiture
     * - Accélération : Dérivée de la vitesse pour les effets
     * - Conversion de coordonnées : Global vers local avec rotation
     *
     * SYNCHRONISATIONS :
     * - Sons de moteur : Vitesse et accélération
     * - Son de crissement : Accélération avec limitation de fréquence
     * - Effets visuels : Basés sur les données de mouvement
     */
    setMovement()
    {
        // Configuration des variables de mouvement
        this.movement = {}
        this.movement.speed = new THREE.Vector3()                                   // Vitesse globale dans l'espace 3D
        this.movement.localSpeed = new THREE.Vector3()                              // Vitesse locale (par rapport à l'orientation de la voiture)
        this.movement.acceleration = new THREE.Vector3()                            // Accélération globale (dérivée de la vitesse)
        this.movement.localAcceleration = new THREE.Vector3()                       // Accélération locale (par rapport à la voiture)
        this.movement.lastScreech = 0                                               // Timestamp du dernier son de crissement

        // Calcul du mouvement à chaque frame (boucle de rendu)
        this.time.on('tick', () =>
        {
            // Calcul de la vitesse de mouvement basée sur le changement de position
            const movementSpeed = new THREE.Vector3()
            movementSpeed.copy(this.chassis.object.position).sub(this.chassis.oldPosition)  // Différence de position
            movementSpeed.multiplyScalar(1 / this.time.delta * 17)                          // Normalisation par le delta time (17 = facteur d'échelle)
            
            // Calcul de l'accélération (différence entre vitesse actuelle et précédente)
            this.movement.acceleration = movementSpeed.clone().sub(this.movement.speed)
            this.movement.speed.copy(movementSpeed)                                          // Mise à jour de la vitesse

            // Conversion en coordonnées locales (par rapport à l'orientation de la voiture)
            this.movement.localSpeed = this.movement.speed.clone().applyAxisAngle(new THREE.Vector3(0, 0, 1), - this.chassis.object.rotation.z)
            this.movement.localAcceleration = this.movement.acceleration.clone().applyAxisAngle(new THREE.Vector3(0, 0, 1), - this.chassis.object.rotation.z)

            // Synchronisation avec les sons de moteur
            this.sounds.engine.speed = this.movement.localSpeed.x                           // Vitesse du moteur (avancement)
            this.sounds.engine.acceleration = this.controls.actions.up ? (this.controls.actions.boost ? 1 : 0.5) : 0 // Accélération du moteur (boost = 1, normal = 0.5, arrêt = 0)

            // Déclenchement du son de crissement (accélération forte avec limitation de fréquence)
            if(this.movement.localAcceleration.x > 0.03 && this.time.elapsed - this.movement.lastScreech > 5000)
            {
                this.movement.lastScreech = this.time.elapsed                               // Mise à jour du timestamp
                this.sounds.play('screech')                                                // Lecture du son de crissement
            }
        })
    }

    /**
     * SetChassis - Configuration du châssis principal de la voiture
     * 
     * Configure le châssis de la voiture avec synchronisation bidirectionnelle
     * entre la physique Cannon.js et l'affichage 3D Three.js. Le châssis est
     * l'élément central qui détermine la position et l'orientation de la voiture.
     *
     * FONCTIONNALITÉS :
     * - Synchronisation physique : Position et rotation depuis Cannon.js
     * - Gestion des ombres : Ombre portée du châssis
     * - Calcul de mouvement : Sauvegarde des positions pour les calculs
     * - Mode debug : Désactivation de la physique pour les contrôles manuels
     * - Position globale : Mise à jour de la position de référence
     */
    setChassis()
    {
        // Configuration du châssis principal
        this.chassis = {}
        this.chassis.offset = new THREE.Vector3(0, 0, - 0.28)                      // Décalage de position pour ajustement visuel

        // Création de l'objet 3D du châssis à partir du modèle
        this.chassis.object = this.objects.getConvertedMesh(this.models.chassis.scene.children)
        this.chassis.object.position.copy(this.physics.car.chassis.body.position)  // Synchronisation initiale avec la physique
        this.chassis.oldPosition = this.chassis.object.position.clone()            // Sauvegarde pour le calcul de mouvement
        this.container.add(this.chassis.object)                                    // Ajout au conteneur principal

        // Configuration de l'ombre portée du châssis
        this.shadows.add(this.chassis.object, { 
            sizeX: 3,                                                              // Taille X de l'ombre
            sizeY: 2,                                                              // Taille Y de l'ombre
            offsetZ: 0.2                                                           // Décalage vertical de l'ombre
        })

        // Synchronisation continue avec la physique à chaque frame
        this.time.on('tick', () =>
        {
            // Sauvegarde de l'ancienne position pour le calcul de mouvement (utilisé dans setMovement)
            this.chassis.oldPosition = this.chassis.object.position.clone()

            // Mise à jour de la position et rotation si le mode physique est activé
            if(!this.transformControls.enabled)
            {
                // Synchronisation de la position avec la physique + décalage
                this.chassis.object.position.copy(this.physics.car.chassis.body.position).add(this.chassis.offset)
                // Synchronisation de la rotation avec la physique
                this.chassis.object.quaternion.copy(this.physics.car.chassis.body.quaternion)
            }

            // Mise à jour de la position globale de la voiture (utilisée par d'autres systèmes)
            this.position.copy(this.chassis.object.position)
        })
    }

    /**
     * SetAntena - Configuration de l'antenne avec simulation physique réaliste
     * 
     * Configure l'antenne de la voiture avec une simulation physique avancée
     * qui réagit de manière réaliste aux accélérations et mouvements de la voiture.
     * L'antenne utilise un système de forces avec amortissement et retour élastique.
     *
     * SIMULATION PHYSIQUE :
     * - Force d'accélération : Réaction aux mouvements de la voiture
     * - Amortissement : Réduction progressive des oscillations
     * - Force de retour : Retour élastique vers la position neutre
     * - Limitation : Évite les oscillations excessives
     *
     * COORDONNÉES :
     * - Position absolue : Dans l'espace 3D global
     * - Position locale : Par rapport à l'orientation de la voiture
     * - Conversion : Rotation pour synchronisation avec le châssis
     */
    setAntena()
    {
        // Configuration de l'antenne
        this.antena = {}

        // Paramètres de simulation physique (ajustables via debug)
        this.antena.speedStrength = 10                                              // Force de réaction à l'accélération (sensibilité)
        this.antena.damping = 0.035                                                 // Amortissement des oscillations (frottement)
        this.antena.pullBackStrength = 0.02                                         // Force de retour à la position neutre (élasticité)

        // Création de l'objet 3D de l'antenne à partir du modèle
        this.antena.object = this.objects.getConvertedMesh(this.models.antena.scene.children)
        this.chassis.object.add(this.antena.object)                                 // Attachement au châssis

        // Configuration des oreilles de lapin (fonctionnalité commentée)
        // this.antena.bunnyEarLeft = this.objects.getConvertedMesh(this.models.bunnyEarLeft.scene.children)
        // this.chassis.object.add(this.antena.bunnyEarLeft)

        // this.antena.bunnyEarRight = this.objects.getConvertedMesh(this.models.bunnyEarRight.scene.children)
        // this.chassis.object.add(this.antena.bunnyEarRight)

        // Variables de simulation physique
        this.antena.speed = new THREE.Vector2()                                     // Vitesse de l'antenne (vx, vy)
        this.antena.absolutePosition = new THREE.Vector2()                          // Position absolue dans l'espace 3D
        this.antena.localPosition = new THREE.Vector2()                             // Position locale par rapport à la voiture

        // Simulation physique de l'antenne à chaque frame
        this.time.on('tick', () =>
        {
            const max = 1
            // Limitation de l'accélération pour éviter les oscillations excessives
            const accelerationX = Math.min(Math.max(this.movement.acceleration.x, - max), max)
            const accelerationY = Math.min(Math.max(this.movement.acceleration.y, - max), max)

            // Application de la force d'accélération (loi de Newton : F = ma)
            this.antena.speed.x -= accelerationX * this.antena.speedStrength        // Force proportionnelle à l'accélération
            this.antena.speed.y -= accelerationY * this.antena.speedStrength

            // Force de retour à la position neutre (ressort élastique)
            const position = this.antena.absolutePosition.clone()
            const pullBack = position.negate().multiplyScalar(position.length() * this.antena.pullBackStrength)
            this.antena.speed.add(pullBack)                                         // Force de rappel vers le centre

            // Application de l'amortissement (frottement visqueux)
            this.antena.speed.x *= 1 - this.antena.damping                          // Réduction progressive de la vitesse
            this.antena.speed.y *= 1 - this.antena.damping

            // Mise à jour de la position (intégration de la vitesse)
            this.antena.absolutePosition.add(this.antena.speed)

            // Conversion en coordonnées locales (rotation pour synchronisation avec le châssis)
            this.antena.localPosition.copy(this.antena.absolutePosition)
            this.antena.localPosition.rotateAround(new THREE.Vector2(), - this.chassis.object.rotation.z)

            // Application de la rotation à l'antenne (facteur d'amplification 0.1)
            this.antena.object.rotation.y = this.antena.localPosition.x * 0.1       // Rotation autour de l'axe Y
            this.antena.object.rotation.x = this.antena.localPosition.y * 0.1       // Rotation autour de l'axe X

            // Application de la rotation aux oreilles de lapin (fonctionnalité commentée)
            // this.antena.bunnyEarLeft.rotation.y = this.antena.localPosition.x * 0.1
            // this.antena.bunnyEarLeft.rotation.x = this.antena.localPosition.y * 0.1

            // this.antena.bunnyEarRight.rotation.y = this.antena.localPosition.x * 0.1
            // this.antena.bunnyEarRight.rotation.x = this.antena.localPosition.y * 0.1
        })

        // Configuration de l'interface de debug
        if(this.debug)
        {
            const folder = this.debugFolder.addFolder('antena')
            folder.open()                                                           // Ouverture automatique du dossier

            // Contrôles de debug pour les paramètres de simulation physique
            folder.add(this.antena, 'speedStrength').step(0.001).min(0).max(50)     // Force de réaction
            folder.add(this.antena, 'damping').step(0.0001).min(0).max(0.1)         // Amortissement
            folder.add(this.antena, 'pullBackStrength').step(0.0001).min(0).max(0.1) // Force de retour
        }
    }

    /**
     * SetBackLights - Configuration des feux arrière
     * 
     * Configure les feux arrière de la voiture avec des matériaux colorés
     * qui s'activent selon les actions du conducteur (freinage, marche arrière).
     */
    setBackLights()
    {
        // Configuration des feux de freinage
        this.backLightsBrake = {}

        // Matériau rouge pour les feux de freinage
        this.backLightsBrake.material = this.materials.pures.items.red.clone()
        this.backLightsBrake.material.transparent = true
        this.backLightsBrake.material.opacity = 0.5

        // Création de l'objet 3D des feux de freinage
        this.backLightsBrake.object = this.objects.getConvertedMesh(this.models.backLightsBrake.scene.children)
        for(const _child of this.backLightsBrake.object.children)
        {
            _child.material = this.backLightsBrake.material
        }

        this.chassis.object.add(this.backLightsBrake.object)

        // Configuration des feux de marche arrière
        this.backLightsReverse = {}

        // Matériau jaune pour les feux de marche arrière
        this.backLightsReverse.material = this.materials.pures.items.yellow.clone()
        this.backLightsReverse.material.transparent = true
        this.backLightsReverse.material.opacity = 0.5

        // Création de l'objet 3D des feux de marche arrière
        this.backLightsReverse.object = this.objects.getConvertedMesh(this.models.backLightsReverse.scene.children)
        for(const _child of this.backLightsReverse.object.children)
        {
            _child.material = this.backLightsReverse.material
        }

        this.chassis.object.add(this.backLightsReverse.object)

        // Animation des feux selon les actions
        this.time.on('tick', () =>
        {
            // Activation des feux de freinage
            this.backLightsBrake.material.opacity = this.physics.controls.actions.brake ? 1 : 0.5
            // Activation des feux de marche arrière
            this.backLightsReverse.material.opacity = this.physics.controls.actions.down ? 1 : 0.5
        })
    }

    /**
     * SetWheels - Configuration des roues
     * 
     * Configure les 4 roues de la voiture avec synchronisation
     * entre la physique et l'affichage 3D.
     */
    setWheels()
    {
        // Configuration des roues
        this.wheels = {}
        this.wheels.object = this.objects.getConvertedMesh(this.models.wheel.scene.children)
        this.wheels.items = []

        // Création des 4 roues
        for(let i = 0; i < 4; i++)
        {
            const object = this.wheels.object.clone()

            this.wheels.items.push(object)
            this.container.add(object)
        }

        // Synchronisation avec la physique
        this.time.on('tick', () =>
        {
            if(!this.transformControls.enabled)
            {
                // Mise à jour de chaque roue avec la physique
                for(const _wheelKey in this.physics.car.wheels.bodies)
                {
                    const wheelBody = this.physics.car.wheels.bodies[_wheelKey]
                    const wheelObject = this.wheels.items[_wheelKey]

                    // Synchronisation de la position et de la rotation
                    wheelObject.position.copy(wheelBody.position)
                    wheelObject.quaternion.copy(wheelBody.quaternion)
                }
            }
        })
    }

    /**
     * SetTransformControls - Configuration des contrôles de transformation
     * 
     * Configure les contrôles de transformation pour le mode debug,
     * permettant de manipuler manuellement la position et rotation de la voiture.
     */
    setTransformControls()
    {
        // Création des contrôles de transformation
        this.transformControls = new TransformControls(this.camera.instance, this.renderer.domElement)
        this.transformControls.size = 0.5
        this.transformControls.attach(this.chassis.object)
        this.transformControls.enabled = false
        this.transformControls.visible = this.transformControls.enabled

        // Gestion des raccourcis clavier pour les modes
        document.addEventListener('keydown', (_event) =>
        {
            if(this.mode === 'transformControls')
            {
                if(_event.key === 'r')
                {
                    this.transformControls.setMode('rotate')                         // Mode rotation
                }
                else if(_event.key === 'g')
                {
                    this.transformControls.setMode('translate')                     // Mode translation
                }
            }
        })

        // Désactivation des contrôles de caméra pendant la manipulation
        this.transformControls.addEventListener('dragging-changed', (_event) =>
        {
            this.camera.orbitControls.enabled = !_event.value
        })

        this.container.add(this.transformControls)

        // Configuration de l'interface de debug
        if(this.debug)
        {
            const folder = this.debugFolder.addFolder('controls')
            folder.open()

            // Contrôle d'activation des contrôles de transformation
            folder.add(this.transformControls, 'enabled').onChange(() =>
            {
                this.transformControls.visible = this.transformControls.enabled
            })
        }
    }

    /**
     * SetShootingBall - Configuration du tir de boules (CyberTruck uniquement)
     * 
     * Configure la fonctionnalité de tir de boules de bowling
     * disponible uniquement avec le CyberTruck.
     */
    setShootingBall()
    {
        // Vérification de la configuration CyberTruck
        if(!this.config.cyberTruck)
        {
            return
        }

        // Gestion du tir de boules avec la touche B
        window.addEventListener('keydown', (_event) =>
        {
            if(_event.key === 'b')
            {
                // Calcul de la position aléatoire autour de la voiture
                const angle = Math.random() * Math.PI * 2
                const distance = 10
                const x = this.position.x + Math.cos(angle) * distance
                const y = this.position.y + Math.sin(angle) * distance
                const z = 2 + 2 * Math.random()

                // Création de la boule de bowling
                const bowlingBall = this.objects.add({
                    base: this.resources.items.bowlingBallBase.scene,
                    collision: this.resources.items.bowlingBallCollision.scene,
                    offset: new THREE.Vector3(x, y, z),
                    rotation: new THREE.Euler(Math.PI * 0.5, 0, 0),
                    duplicated: true,
                    shadow: { sizeX: 1.5, sizeY: 1.5, offsetZ: - 0.15, alpha: 0.35 },
                    mass: 5,
                    soundName: 'bowlingBall',
                    sleep: false
                })

                // Calcul de la direction et application de l'impulsion
                const carPosition = new CANNON.Vec3(this.position.x, this.position.y, this.position.z + 1)
                let direction = carPosition.vsub(bowlingBall.collision.body.position)
                direction.normalize()
                direction = direction.scale(100)
                bowlingBall.collision.body.applyImpulse(direction, bowlingBall.collision.body.position)
            }
        })
    }

    /**
     * SetKlaxon - Configuration du klaxon et effets spéciaux
     * 
     * Configure le système de klaxon avec sons et effets visuels,
     * incluant la pluie de klaxons avec la touche K.
     */
    setKlaxon()
    {
        // Configuration du klaxon
        this.klaxon = {}
        this.klaxon.lastTime = this.time.elapsed

        // Gestion des événements clavier
        window.addEventListener('keydown', (_event) =>
        {
            // Klaxon avec la touche H
            if(_event.code === 'KeyH')
            {
                // Saut de la voiture avec limitation de fréquence
                if(this.time.elapsed - this.klaxon.lastTime > 400)
                {
                    this.physics.car.jump(false, 150)
                    this.klaxon.lastTime = this.time.elapsed
                }

                // Lecture du son de klaxon (aléatoire entre 2 variantes)
                this.sounds.play(Math.random() < 0.002 ? 'carHorn2' : 'carHorn1')
            }

            // Pluie de klaxons avec la touche K
            if(_event.key === 'k')
            {
                // Calcul de la position aléatoire autour de la voiture
                const x = this.position.x + (Math.random() - 0.5) * 3
                const y = this.position.y + (Math.random() - 0.5) * 3
                const z = 6 + 2 * Math.random()

                // Création d'un klaxon qui tombe
                this.objects.add({
                    base: this.resources.items.hornBase.scene,
                    collision: this.resources.items.hornCollision.scene,
                    offset: new THREE.Vector3(x, y, z),
                    rotation: new THREE.Euler(Math.random() * Math.PI * 2, Math.random() * Math.PI * 2, Math.random() * Math.PI * 2),
                    duplicated: true,
                    shadow: { sizeX: 1.5, sizeY: 1.5, offsetZ: - 0.15, alpha: 0.35 },
                    mass: 5,
                    soundName: 'horn',
                    sleep: false
                })
            }
        })
    }
}
