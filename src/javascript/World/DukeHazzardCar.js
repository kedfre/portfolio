/**
 * DUKEHAZZARDCAR.JS - Voiture Duke Hazzard Interactive
 *
 * Ce fichier définit la voiture Duke Hazzard interactive dans l'environnement 3D du portfolio.
 * Cette voiture a des caractéristiques uniques : roues avant/arrière séparées, paramètres de conduite
 * différents, et pas de feux de marche arrière.
 *
 * RESPONSABILITÉS :
 * - Gestion de la voiture Duke Hazzard 3D interactive
 * - Intégration avec le système de physique
 * - Gestion des mouvements et contrôles spécifiques
 * - Effets visuels (feux de freinage uniquement, antenne, roues avant/arrière)
 *
 * CARACTÉRISTIQUES UNIQUES :
 * - Roues avant et arrière séparées avec propriétés différentes
 * - Paramètres de conduite spécifiques (vitesse, accélération, freinage)
 * - Pas de feux de marche arrière (backLightsReverse)
 * - Comportement de conduite unique
 * - Antenne avec simulation physique
 * - Contrôles de debug (TransformControls)
 *
 * UTILISATION :
 * - Véhicule alternatif de navigation
 * - Démonstration des capacités techniques avancées
 * - Élément spécial du portfolio
 */

import * as THREE from 'three'
import CANNON from 'cannon'
import { TransformControls } from 'three/examples/jsm/controls/TransformControls.js'

export default class DukeHazzardCar
{
    /**
     * Constructor - Initialisation de la voiture Duke Hazzard interactive
     *
     * Initialise la voiture Duke Hazzard avec tous ses composants spécifiques :
     * modèles 3D, physique Cannon.js, contrôles, effets visuels et fonctionnalités spéciales.
     * La voiture Duke Hazzard est un véhicule alternatif avec des caractéristiques uniques.
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

        // Configuration du conteneur principal de la voiture Duke Hazzard
        this.container = new THREE.Object3D()                                          // Conteneur parent pour tous les éléments
        this.position = new THREE.Vector3()                                            // Position globale de la voiture
        

        // Configuration de l'interface de debug
        if(this.debug)
        {
            this.debugFolder = this.debug.addFolder('dukeHazzardCar')                   // Dossier de debug pour Duke Hazzard
            // this.debugFolder.open()                                                  // Décommenter pour ouvrir automatiquement
        }

        // Initialisation séquentielle des composants de la voiture Duke Hazzard
        this.setModels()                                                               // Sélection des modèles 3D Duke Hazzard
        this.setMovement()                                                             // Configuration du système de mouvement
        this.setChassis()                                                             // Configuration du châssis principal
        this.setAntena()                                                              // Configuration de l'antenne avec simulation physique
        this.setBackLights()                                                          // Configuration des feux de freinage uniquement
        this.setWheels()                                                              // Configuration des roues avant/arrière séparées
        this.setTransformControls()                                                   // Configuration des contrôles de debug
        this.setKlaxon()                                                              // Configuration du klaxon et effets spéciaux
        this.setDukeHazzardPhysics()                                                  // Configuration de la physique spécifique Duke Hazzard
        
        // Ajout du châssis au conteneur principal après configuration de tous les composants enfants
        this.container.add(this.chassis.object)
    }

    /**
     * SetModels - Configuration des modèles 3D de la voiture Duke Hazzard
     * 
     * Sélectionne les modèles 3D spécifiques à Duke Hazzard.
     * Cette voiture a des caractéristiques uniques : roues avant/arrière séparées
     * et pas de feux de marche arrière.
     *
     * COMPOSANTS GÉRÉS :
     * - Châssis : Corps principal du véhicule Duke Hazzard
     * - Antenne : Élément avec simulation physique
     * - Feux de freinage : Éclairage rouge pour le freinage uniquement
     * - Roues avant : Roues avant avec propriétés spécifiques
     * - Roues arrière : Roues arrière avec propriétés spécifiques
     */
    setModels()
    {
        // Initialisation du conteneur des modèles Duke Hazzard
        this.models = {}

        // Sélection des modèles 3D Duke Hazzard
        this.models.chassis = this.resources.items.carDukeHazzardChassis
        this.models.antenna = this.resources.items.carDukeHazzardAntenna
        this.models.backLightsBrake = this.resources.items.carDukeHazzardBackLightsBrake
        this.models.wheelFront = this.resources.items.carDukeHazzardWheelFront
        this.models.wheelRear = this.resources.items.carDukeHazzardWheelRear

    }

    /**
     * SetMovement - Configuration du système de mouvement
     * 
     * Configure les variables de mouvement et calcule la vitesse, l'accélération
     * et les sons de moteur en temps réel. Système identique à Car.js.
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
     * SetChassis - Configuration du châssis principal de la voiture Duke Hazzard
     * 
     * Configure le châssis de la voiture Duke Hazzard avec synchronisation bidirectionnelle
     * entre la physique Cannon.js et l'affichage 3D Three.js. Le châssis est
     * l'élément central qui détermine la position et l'orientation de la voiture.
     *
     * FONCTIONNALITÉS :
     * - Synchronisation physique : Position et rotation depuis Cannon.js
     * - Gestion des ombres : Ombre portée du châssis
     * - Calcul de mouvement : Sauvegarde des positions pour les calculs
     * - Décalage de position : Ajustement pour l'alignement visuel
     */
    setChassis()
    {
        // Configuration du châssis Duke Hazzard
        this.chassis = {}

        // Création de l'objet 3D du châssis à partir du modèle Duke Hazzard
        this.chassis.object = this.objects.getConvertedMesh(this.models.chassis.scene.children)
        this.chassis.object.position.copy(this.physics.car.chassis.body.position)  // Synchronisation initiale avec la physique
        this.chassis.oldPosition = this.chassis.object.position.clone()            // Sauvegarde pour le calcul de mouvement
        // Note: L'ajout au conteneur principal se fait après la configuration de tous les composants enfants

        // Configuration de l'ombre portée du châssis
        this.shadows.add(this.chassis.object, { 
            receive: false, 
            cast: true 
        })

        // Décalage de position pour l'alignement visuel (identique à Car.js)
        this.chassis.offset = new THREE.Vector3(0, 0, 0.41)

        // Synchronisation continue avec la physique (identique à Car.js)
        this.time.on('tick', () =>
        {
            // Sauvegarde de l'ancienne position pour le calcul de mouvement (utilisé dans setMovement)
            this.chassis.oldPosition = this.chassis.object.position.clone()

            // Mise à jour de la position et rotation si le mode physique est activé
            if(!this.transformControls || !this.transformControls.enabled)
            {
                // Synchronisation de la position avec la physique + décalage
                this.chassis.object.position.copy(this.physics.car.chassis.body.position).add(this.chassis.offset)
                // Synchronisation de la rotation avec la physique
                this.chassis.object.quaternion.copy(this.physics.car.chassis.body.quaternion)
            }
        })

        // Mise à jour de la position globale de la voiture (utilisée par d'autres systèmes)
        this.position.copy(this.chassis.object.position)
    }

    /**
     * SetAntena - Configuration de l'antenne Duke Hazzard avec simulation physique réaliste
     * 
     * Configure l'antenne de la voiture Duke Hazzard avec une simulation physique avancée
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
        // Configuration de l'antenne Duke Hazzard
        this.antena = {}

        // Paramètres de simulation physique (ajustables via debug)
        this.antena.speedStrength = 10                                              // Force de réaction à l'accélération (sensibilité)
        this.antena.damping = 0.035                                                 // Amortissement des oscillations (frottement)
        this.antena.pullBackStrength = 0.02                                         // Force de retour à la position neutre (élasticité)

        // Création de l'objet 3D de l'antenne à partir du modèle Duke Hazzard
        this.antena.object = this.objects.getConvertedMesh(this.models.antenna.scene.children)
        this.chassis.object.add(this.antena.object)                                 // Attachement au châssis

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
        })

        // Configuration des ombres pour l'antenne
        this.shadows.add(this.antena.object, { 
            receive: false, 
            cast: true 
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
     * SetBackLights - Configuration des feux arrière Duke Hazzard
     * 
     * Configure les feux arrière de la voiture Duke Hazzard.
     * Duke Hazzard n'a que des feux de freinage, pas de feux de marche arrière.
     */
    setBackLights()
    {
        // Configuration des feux arrière Duke Hazzard (freinage uniquement)
        this.backLights = {}

        // Feux de freinage uniquement
        this.backLights.brake = {}
        
        // Matériau rouge pour les feux de freinage
        this.backLights.brake.material = this.materials.pures.items.red.clone()
        this.backLights.brake.material.transparent = true
        this.backLights.brake.material.opacity = 0.6
        
        // Création de l'objet 3D des feux de freinage
        this.backLights.brake.object = this.objects.getConvertedMesh(this.models.backLightsBrake.scene.children)
        for(const _child of this.backLights.brake.object.children)
        {
            _child.material = this.backLights.brake.material
        }
        
        this.backLights.brake.object.position.z -= 0
        this.chassis.object.add(this.backLights.brake.object)
        

        // Configuration des ombres pour les feux de freinage
        this.shadows.add(this.backLights.brake.object, {
            receive: false,
            cast: true
        })

        // Synchronisation des feux avec la physique
        this.time.on('tick', () =>
        {
            // Activation des feux de freinage (freinage OU marche arrière)
            this.backLights.brake.material.opacity = (this.physics.controls.actions.brake || this.physics.controls.actions.down) ? 1 : 0.6
        })
    }

    /**
     * SetWheels - Configuration des roues Duke Hazzard
     * 
     * Configure les roues de la voiture Duke Hazzard.
     * Duke Hazzard a des roues avant et arrière séparées, dupliquées pour avoir 4 roues.
     */
    setWheels()
    {
        // Configuration des roues Duke Hazzard
        this.wheels = {}
        
        // Modèles de base pour les roues
        this.wheels.frontObject = this.objects.getConvertedMesh(this.models.wheelFront.scene.children)
        this.wheels.rearObject = this.objects.getConvertedMesh(this.models.wheelRear.scene.children)
        
        // Tableau pour stocker les 4 roues
        this.wheels.items = []

        // Création des 4 roues (2 avant + 2 arrière)
        const wheelPositions = [
            { type: 'front', x: 0.93, y: 0.52, rotation: 0 },   // Roue avant gauche
            { type: 'front', x: 0.93, y: -0.52, rotation: Math.PI },  // Roue avant droite (retournée)
            { type: 'rear', x: -0.7, y: 0.52, rotation: 0 },   // Roue arrière gauche
            { type: 'rear', x: -0.7, y: -0.52, rotation: Math.PI }   // Roue arrière droite (retournée)
        ]

        for(let i = 0; i < 4; i++)
        {
            const wheelConfig = wheelPositions[i]
            let wheelObject
            
            if(wheelConfig.type === 'front')
            {
                wheelObject = this.wheels.frontObject.clone()
            }
            else
            {
                wheelObject = this.wheels.rearObject.clone()
            }
            
            // Position de la roue
            wheelObject.position.x = wheelConfig.x
            wheelObject.position.y = wheelConfig.y
            
            // Rotation de la roue (pour la symétrie droite/gauche)
            wheelObject.rotation.z = wheelConfig.rotation
            
            this.wheels.items.push(wheelObject)
            this.chassis.object.add(wheelObject)
        }

        // Configuration des ombres pour toutes les roues
        this.wheels.items.forEach(wheel => {
            this.shadows.add(wheel, {
                receive: false,
                cast: true
            })
        })

        // Les roues suivent automatiquement le châssis car elles sont attachées
        // Pas besoin de synchronisation individuelle
    }

    /**
     * SetTransformControls - Configuration des contrôles de debug Duke Hazzard
     * 
     * Configure les contrôles de transformation pour le debug de la voiture Duke Hazzard.
     */
    setTransformControls()
    {
        // Configuration des contrôles de debug Duke Hazzard
        if(this.debug)
        {
            this.transformControls = new TransformControls(this.camera.instance, this.renderer.domElement)
            this.transformControls.attach(this.chassis.object)
            this.transformControls.setMode('translate')
            this.transformControls.setSize(0.5)
            this.transformControls.enabled = false
            this.container.add(this.transformControls)

            // Configuration de l'interface de debug
            this.debugFolder.add(this.transformControls, 'enabled').name('Transform Controls')
        }
    }

    /**
     * SetKlaxon - Configuration du klaxon Duke Hazzard
     * 
     * Configure le klaxon et les effets spéciaux de la voiture Duke Hazzard.
     * Identique à Car.js avec la logique complète.
     */
    setKlaxon()
    {
        // Configuration du klaxon Duke Hazzard
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

        // Configuration de l'interface de debug
        if(this.debug)
        {
            this.debugFolder.add(this.klaxon, 'enabled').name('Klaxon')
        }
    }

    /**
     * SetDukeHazzardPhysics - Configuration de la physique spécifique Duke Hazzard
     * 
     * Configure les paramètres de physique spécifiques à Duke Hazzard :
     * - Accélération et freinage différents
     * - Paramètres de roues avant/arrière distincts
     * - Comportement de conduite unique
     * 
     * CARACTÉRISTIQUES DUKE HAZZARD :
     * - Accélération plus agressive
     * - Freinage plus puissant
     * - Roues avant et arrière avec propriétés différentes
     * - Comportement de conduite sportif
     */
    setDukeHazzardPhysics()
    {
        
        // Modification des paramètres de physique pour Duke Hazzard
        if(this.physics && this.physics.car && this.physics.car.options)
        {
            // Paramètres d'accélération plus agressifs
            this.physics.car.options.controlsAcceleratinMaxSpeed = 0.08 * 3 / 17        // Vitesse max plus élevée
            this.physics.car.options.controlsAcceleratinMaxSpeedBoost = 0.15 * 3 / 17   // Boost plus puissant
            this.physics.car.options.controlsAcceleratingSpeed = 3 * 4 * 2               // Force d'accélération plus forte
            this.physics.car.options.controlsAcceleratingSpeedBoost = 5 * 4 * 2         // Boost d'accélération plus fort
            
            // Freinage plus puissant
            this.physics.car.options.controlsBrakeStrength = 0.7 * 3                     // Force de freinage augmentée
            
            // Direction plus réactive
            this.physics.car.options.controlsSteeringSpeed = 0.008 * 3                   // Direction plus rapide
            this.physics.car.options.controlsSteeringMax = Math.PI * 0.2                 // Angle de direction plus large
            
            // Masse du châssis différente (plus lourd pour Duke Hazzard)
            this.physics.car.options.chassisMass = 60                                    // Masse augmentée
            
            // Propriétés des roues avant (plus réactives)
            this.physics.car.options.wheelSuspensionStiffness = 60                       // Suspension plus rigide
            this.physics.car.options.wheelFrictionSlip = 12                              // Friction avant augmentée
            
        }
    }

    /**
     * Update - Mise à jour de la voiture Duke Hazzard
     * 
     * Met à jour tous les composants de la voiture Duke Hazzard à chaque frame.
     * Gère la synchronisation avec la physique, les animations et les effets visuels.
     */
    update()
    {
        // Mise à jour des contrôles de debug
        if(this.debug && this.transformControls)
        {
            this.transformControls.update()
        }

        // Direction des roues avant uniquement
        if(this.wheels && this.wheels.items)
        {
            
            // Utilisation de l'angle de direction de la physique si disponible
            let steeringAngle = 0
            if(this.physics && this.physics.car && this.physics.car.steering !== undefined)
            {
                steeringAngle = this.physics.car.steering
            }
            
            // Application de la direction aux roues avant uniquement (indices 0 et 1)
            for(let i = 0; i < 2; i++)
            {
                if(this.wheels.items[i])
                {
                    // Rotation de direction (axe Z pour la direction)
                    // Les deux roues avant doivent tourner dans le même sens
                    if(i === 0)
                    {
                        // Roue avant gauche : direction normale
                        this.wheels.items[i].rotation.z = -steeringAngle
                    }
                    else if(i === 1)
                    {
                        // Roue avant droite : direction + symétrie de base (Math.PI)
                        this.wheels.items[i].rotation.z = Math.PI - steeringAngle
                    }
                }
            }
        }
    }

    /**
     * Destroy - Destruction de la voiture Duke Hazzard
     * 
     * Nettoie tous les composants de la voiture Duke Hazzard et libère les ressources.
     */
    destroy()
    {
        // Nettoyage des contrôles de debug
        if(this.transformControls)
        {
            this.transformControls.dispose()
        }

        // Nettoyage du conteneur principal
        this.container.clear()
    }
}