/**
 * WORLD/PHYSICS.JS - Système de Physique Cannon.js
 *
 * Ce fichier gère le système de physique complet de l'environnement 3D du portfolio.
 * Il utilise Cannon.js pour simuler la physique réaliste, incluant la voiture interactive,
 * les objets dynamiques, les collisions et les interactions physiques.
 *
 * RESPONSABILITÉS :
 * - Gestion du monde physique avec Cannon.js
 * - Système de voiture réaliste avec véhicule à roues
 * - Création et gestion des objets physiques
 * - Matériaux et contacts entre objets
 * - Modèles de debug pour visualisation
 * - Intégration avec les contrôles et sons
 *
 * SYSTÈMES GÉRÉS :
 * - Monde physique : Gravité, contacts, collisions
 * - Voiture : Chassis, roues, suspension, direction, accélération
 * - Objets : Création automatique depuis les meshes Three.js
 * - Matériaux : Sol, objets, roues avec propriétés spécifiques
 * - Contacts : Interactions entre différents matériaux
 * - Debug : Visualisation wireframe des objets physiques
 *
 * FONCTIONNALITÉS DE LA VOITURE :
 * - Véhicule à 4 roues avec suspension réaliste
 * - Direction progressive avec limite d'angle
 * - Accélération et freinage avec boost
 * - Détection de retournement automatique
 * - Sons de collision et d'impact
 * - Contrôles clavier et tactile
 * - Système de saut pour se retourner
 *
 * TYPES D'OBJETS SUPPORTÉS :
 * - Cubes/Boxes : Formes rectangulaires
 * - Cylindres : Formes cylindriques
 * - Sphères : Formes sphériques
 * - Centres : Points de référence pour le centrage
 *
 * ARCHITECTURE :
 * - Pattern de gestionnaire centralisé
 * - Intégration avec Three.js pour la synchronisation
 * - Système d'événements pour les interactions
 * - Interface de debug complète
 * - Gestion des états (sommeil, collision, etc.)
 *
 * OPTIMISATIONS :
 * - Objets endormis pour économiser les calculs
 * - Limites de vitesse et de sommeil
 * - Gestion intelligente des collisions
 * - Synchronisation efficace physique-visuel
 * - Debug conditionnel selon le mode
 */

import CANNON from 'cannon'
import * as THREE from 'three'

export default class Physics
{
    /**
     * Constructor - Initialisation du système de physique
     *
     * Initialise le système de physique complet avec Cannon.js, configure tous les
     * composants nécessaires et démarre la boucle de simulation physique.
     *
     * @param {Object} _options - Options de configuration
     * @param {Object} _options.config - Configuration générale de l'application
     * @param {Object} _options.debug - Interface de debug (dat.GUI)
     * @param {Object} _options.time - Gestionnaire du temps (Time.js)
     * @param {Object} _options.sizes - Gestionnaire des dimensions (Sizes.js)
     * @param {Object} _options.controls - Système de contrôles (Controls.js)
     * @param {Object} _options.sounds - Gestionnaire audio (Sounds.js)
     */
    constructor(_options)
    {
        // Stockage des options de configuration
        this.config = _options.config                                                      // Configuration générale
        this.debug = _options.debug                                                        // Interface de debug
        this.time = _options.time                                                          // Gestionnaire du temps
        this.sizes = _options.sizes                                                        // Gestionnaire des dimensions
        this.controls = _options.controls                                                  // Système de contrôles
        this.sounds = _options.sounds                                                      // Gestionnaire audio

        // Configuration de l'interface de debug
        if(this.debug)
        {
            this.debugFolder = this.debug.addFolder('physics')                            // Dossier de debug pour la physique
            // this.debugFolder.open()                                                     // Ouverture automatique (commentée)
        }

        // Initialisation des systèmes de physique
        this.setWorld()                                                                   // Configuration du monde physique
        this.setModels()                                                                  // Configuration des modèles de debug
        this.setMaterials()                                                               // Configuration des matériaux et contacts
        this.setFloor()                                                                   // Configuration du sol physique
        this.setCar()                                                                     // Configuration du système de voiture

        // Démarrage de la boucle de simulation physique
        this.time.on('tick', () =>
        {
            this.world.step(this.time.delta / 1000)                                      // Simulation physique avec delta time en secondes
        })
    }

    /**
     * SetWorld - Configuration du monde physique
     *
     * Configure le monde physique Cannon.js avec les paramètres de base :
     * gravité, sommeil des objets, matériaux de contact par défaut et
     * optimisations de performance.
     *
     * CONFIGURATION :
     * - Gravité : Vers le bas (axe Z négatif) avec intensité réaliste
     * - Sommeil : Activé pour économiser les calculs sur objets statiques
     * - Contacts : Friction et restitution par défaut
     * - Broadphase : Détection de collision optimisée (commentée)
     *
     * OPTIMISATIONS :
     * - Sommeil automatique des objets inactifs
     * - Paramètres de contact optimisés
     * - Interface de debug pour ajustements
     */
    setWorld()
    {
        // Création du monde physique Cannon.js
        this.world = new CANNON.World()
        
        // Configuration de la gravité (vers le bas, axe Z négatif)
        this.world.gravity.set(0, 0, - 3.25 * 4)                                        // Gravité réaliste (3.25 * 4 = 13 m/s²)
        
        // Activation du sommeil pour optimiser les performances
        this.world.allowSleep = true                                                     // Les objets inactifs s'endorment automatiquement
        
        // Configuration du broadphase pour la détection de collision (commentée)
        // this.world.broadphase = new CANNON.SAPBroadphase(this.world)                  // Sweep and Prune broadphase
        
        // Configuration des matériaux de contact par défaut
        this.world.defaultContactMaterial.friction = 0                                   // Pas de friction par défaut
        this.world.defaultContactMaterial.restitution = 0.2                             // Restitution (rebond) modérée

        // Interface de debug pour la gravité
        if(this.debug)
        {
            this.debugFolder.add(this.world.gravity, 'z').step(0.001).min(- 20).max(20).name('gravity')  // Contrôle de la gravité
        }
    }

    /**
     * SetModels - Configuration des modèles de debug
     *
     * Configure le système de visualisation des objets physiques pour le debug.
     * Crée des modèles wireframe colorés pour distinguer les différents types
     * d'objets physiques et leurs états.
     *
     * TYPES DE MODÈLES :
     * - Statique (bleu) : Objets avec masse 0, immobiles
     * - Dynamique (rouge) : Objets avec masse > 0, actifs
     * - Dynamique endormi (jaune) : Objets dynamiques en sommeil
     *
     * FONCTIONNALITÉS :
     * - Visualisation wireframe des formes physiques
     * - Couleurs distinctes selon le type et l'état
     * - Contrôle de visibilité via l'interface de debug
     * - Synchronisation avec les objets physiques
     */
    setModels()
    {
        // Configuration du conteneur des modèles de debug
        this.models = {}
        this.models.container = new THREE.Object3D()                                      // Conteneur pour tous les modèles de debug
        this.models.container.visible = false                                             // Masqués par défaut
        
        // Configuration des matériaux de debug
        this.models.materials = {}
        this.models.materials.static = new THREE.MeshBasicMaterial({ color: 0x0000ff, wireframe: true })        // Bleu pour objets statiques
        this.models.materials.dynamic = new THREE.MeshBasicMaterial({ color: 0xff0000, wireframe: true })       // Rouge pour objets dynamiques actifs
        this.models.materials.dynamicSleeping = new THREE.MeshBasicMaterial({ color: 0xffff00, wireframe: true }) // Jaune pour objets dynamiques endormis

        // Interface de debug pour la visibilité des modèles
        if(this.debug)
        {
            this.debugFolder.add(this.models.container, 'visible').name('modelsVisible')  // Contrôle de visibilité des modèles
        }
    }

    /**
     * SetMaterials - Configuration des matériaux et contacts
     *
     * Configure les matériaux physiques et leurs interactions (contacts) pour
     * définir les propriétés de collision entre différents types d'objets.
     * Chaque matériau a des propriétés spécifiques de friction et de restitution.
     *
     * MATÉRIAUX DÉFINIS :
     * - Floor : Matériau du sol avec propriétés de base
     * - Dummy : Matériau des objets génériques
     * - Wheel : Matériau des roues avec propriétés spécifiques
     *
     * CONTACTS CONFIGURÉS :
     * - Floor-Dummy : Sol avec objets (friction faible, restitution modérée)
     * - Dummy-Dummy : Objets entre eux (friction élevée, restitution modérée)
     * - Floor-Wheel : Sol avec roues (friction modérée, pas de restitution)
     *
     * PROPRIÉTÉS :
     * - Friction : Résistance au glissement (0 = glissant, 1 = adhérent)
     * - Restitution : Élasticité des collisions (0 = inélastique, 1 = parfaitement élastique)
     * - ContactEquationStiffness : Rigidité des contacts pour la stabilité
     */
    setMaterials()
    {
        // Configuration du conteneur des matériaux
        this.materials = {}

        // Création des matériaux physiques
        this.materials.items = {}
        this.materials.items.floor = new CANNON.Material('floorMaterial')                 // Matériau du sol
        this.materials.items.dummy = new CANNON.Material('dummyMaterial')                 // Matériau des objets génériques
        this.materials.items.wheel = new CANNON.Material('wheelMaterial')                 // Matériau des roues

        // Configuration des contacts entre matériaux
        this.materials.contacts = {}

        // Contact sol-objets : friction faible, restitution modérée
        this.materials.contacts.floorDummy = new CANNON.ContactMaterial(
            this.materials.items.floor, 
            this.materials.items.dummy, 
            { 
                friction: 0.05,                    // Friction faible (glissant)
                restitution: 0.3,                  // Restitution modérée (rebond léger)
                contactEquationStiffness: 1000     // Rigidité des contacts
            }
        )
        this.world.addContactMaterial(this.materials.contacts.floorDummy)

        // Contact objets-objets : friction élevée, restitution modérée
        this.materials.contacts.dummyDummy = new CANNON.ContactMaterial(
            this.materials.items.dummy, 
            this.materials.items.dummy, 
            { 
                friction: 0.5,                     // Friction élevée (adhérent)
                restitution: 0.3,                  // Restitution modérée (rebond léger)
                contactEquationStiffness: 1000     // Rigidité des contacts
            }
        )
        this.world.addContactMaterial(this.materials.contacts.dummyDummy)

        // Contact sol-roues : friction modérée, pas de restitution
        this.materials.contacts.floorWheel = new CANNON.ContactMaterial(
            this.materials.items.floor, 
            this.materials.items.wheel, 
            { 
                friction: 0.3,                     // Friction modérée (adhérence des roues)
                restitution: 0,                    // Pas de restitution (roues ne rebondissent pas)
                contactEquationStiffness: 1000     // Rigidité des contacts
            }
        )
        this.world.addContactMaterial(this.materials.contacts.floorWheel)
    }

    /**
     * SetFloor - Configuration du sol physique
     *
     * Crée le sol physique de l'environnement 3D. Le sol est un plan infini
     * avec une masse nulle (statique) qui sert de surface de collision
     * pour tous les objets dynamiques.
     *
     * CARACTÉRISTIQUES :
     * - Masse nulle : Objet statique, immobile
     * - Forme plane : Surface infinie pour les collisions
     * - Matériau floor : Propriétés de contact spécifiques
     * - Orientation : Par défaut, plan horizontal (XY)
     *
     * UTILISATION :
     * - Surface de collision pour la voiture et les objets
     * - Limite inférieure de l'environnement
     * - Base pour les interactions physiques
     */
    setFloor()
    {
        // Configuration du sol physique
        this.floor = {}
        this.floor.body = new CANNON.Body({
            mass: 0,                                                                    // Masse nulle = objet statique
            shape: new CANNON.Plane(),                                                  // Forme plane infinie
            material: this.materials.items.floor                                        // Matériau du sol
        })

        // Rotation du sol (commentée - utilise l'orientation par défaut)
        // this.floor.body.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), - Math.PI * 0.5)  // Rotation pour plan horizontal

        // Ajout du sol au monde physique
        this.world.addBody(this.floor.body)                                            // Intégration dans la simulation
    }

    /**
     * SetCar - Configuration du système de voiture complet
     *
     * Configure le système de voiture réaliste avec véhicule à roues, incluant
     * le chassis, les roues, la suspension, la direction, l'accélération et
     * tous les systèmes de contrôle et d'interaction.
     *
     * COMPOSANTS PRINCIPAUX :
     * - Chassis : Corps principal de la voiture avec masse et forme
     * - Roues : 4 roues avec suspension, friction et rotation
     * - Véhicule : Système RaycastVehicle de Cannon.js
     * - Contrôles : Direction, accélération, freinage
     * - États : Vitesse, direction, retournement
     *
     * FONCTIONNALITÉS :
     * - Véhicule à 4 roues avec suspension réaliste
     * - Direction progressive avec limite d'angle
     * - Accélération et freinage avec boost
     * - Détection de retournement automatique
     * - Sons de collision et d'impact
     * - Contrôles clavier et tactile
     * - Système de saut pour se retourner
     *
     * OPTIONS CONFIGURABLES :
     * - Dimensions du chassis (largeur, hauteur, profondeur)
     * - Propriétés des roues (rayon, suspension, friction)
     * - Paramètres de contrôle (vitesse, direction, freinage)
     * - Comportements (boost, quad, retournement)
     */
    setCar()
    {
        // Configuration du système de voiture
        this.car = {}

        // États de la voiture
        this.car.steering = 0                                                           // Angle de direction actuel
        this.car.accelerating = 0                                                       // Force d'accélération actuelle
        this.car.speed = 0                                                              // Vitesse actuelle de la voiture
        this.car.worldForward = new CANNON.Vec3()                                      // Direction avant dans le monde
        this.car.angle = 0                                                              // Angle de rotation de la voiture
        this.car.forwardSpeed = 0                                                       // Vitesse de déplacement avant/arrière
        this.car.oldPosition = new CANNON.Vec3()                                       // Position précédente pour calcul de vitesse
        this.car.goingForward = true                                                    // Direction de déplacement (avant/arrière)

        /**
         * Options de configuration de la voiture
         */
        this.car.options = {}
        
        // Dimensions du chassis
        this.car.options.chassisWidth = 1.02                                           // Largeur du chassis
        this.car.options.chassisHeight = 1.16                                          // Hauteur du chassis
        this.car.options.chassisDepth = 2.03                                           // Profondeur du chassis
        this.car.options.chassisOffset = new CANNON.Vec3(0, 0, 0.41)                  // Décalage du chassis
        this.car.options.chassisMass = 40                                              // Masse du chassis
        
        // Position des roues
        this.car.options.wheelFrontOffsetDepth = 0.635                                 // Décalage avant des roues
        this.car.options.wheelBackOffsetDepth = - 0.475                                // Décalage arrière des roues
        this.car.options.wheelOffsetWidth = 0.39                                       // Décalage latéral des roues
        
        // Propriétés des roues
        this.car.options.wheelRadius = 0.25                                            // Rayon des roues
        this.car.options.wheelHeight = 0.24                                            // Hauteur des roues
        this.car.options.wheelSuspensionStiffness = 50                                 // Rigidité de la suspension
        this.car.options.wheelSuspensionRestLength = 0.1                               // Longueur de repos de la suspension
        this.car.options.wheelFrictionSlip = 10                                        // Friction de glissement des roues
        this.car.options.wheelDampingRelaxation = 1.8                                  // Amortissement de relaxation
        this.car.options.wheelDampingCompression = 1.5                                 // Amortissement de compression
        this.car.options.wheelMaxSuspensionForce = 100000                              // Force maximale de suspension
        this.car.options.wheelRollInfluence =  0.01                                    // Influence du roulis
        this.car.options.wheelMaxSuspensionTravel = 0.3                                // Course maximale de suspension
        this.car.options.wheelCustomSlidingRotationalSpeed = - 30                      // Vitesse de rotation de glissement
        this.car.options.wheelMass = 5                                                 // Masse des roues
        
        // Paramètres de contrôle
        this.car.options.controlsSteeringSpeed = 0.005 * 3                             // Vitesse de direction
        this.car.options.controlsSteeringMax = Math.PI * 0.17                          // Angle maximum de direction
        this.car.options.controlsSteeringQuad = false                                  // Direction sur les 4 roues
        this.car.options.controlsAcceleratinMaxSpeed = 0.055 * 3 / 17                  // Vitesse maximale d'accélération
        this.car.options.controlsAcceleratinMaxSpeedBoost = 0.11 * 3 / 17              // Vitesse maximale avec boost
        this.car.options.controlsAcceleratingSpeed = 2 * 4 * 2                         // Force d'accélération
        this.car.options.controlsAcceleratingSpeedBoost = 3.5 * 4 * 2                  // Force d'accélération avec boost
        this.car.options.controlsAcceleratingQuad = true                               // Accélération sur les 4 roues
        this.car.options.controlsBrakeStrength = 0.45 * 3                              // Force de freinage

        /**
         * Système de détection de retournement
         */
        this.car.upsideDown = {}
        this.car.upsideDown.state = 'watching'                                           // État : 'watching' | 'pending' | 'turning'
        this.car.upsideDown.pendingTimeout = null                                        // Timeout pour l'état pending
        this.car.upsideDown.turningTimeout = null                                        // Timeout pour l'état turning

        /**
         * Fonction de saut pour retourner la voiture
         * 
         * @param {boolean} _toReturn - Si la voiture doit se retourner
         * @param {number} _strength - Force du saut
         */
        this.car.jump = (_toReturn = true, _strength = 150) =>
        {
            let worldPosition = this.car.chassis.body.position
            worldPosition = worldPosition.vadd(new CANNON.Vec3(_toReturn ? 0.1 : 0, 0, 0))  // Décalage pour le retournement
            this.car.chassis.body.applyImpulse(new CANNON.Vec3(0, 0, _strength), worldPosition)  // Application de l'impulsion
        }

        /**
         * Méthode de création de la voiture
         * 
         * Crée tous les composants de la voiture : chassis, roues, véhicule,
         * modèles de debug et configure les événements de collision.
         */
        this.car.create = () =>
        {
            /**
             * Création du chassis
             */
            this.car.chassis = {}

            // Forme du chassis (boîte)
            this.car.chassis.shape = new CANNON.Box(new CANNON.Vec3(
                this.car.options.chassisDepth * 0.5, 
                this.car.options.chassisWidth * 0.5, 
                this.car.options.chassisHeight * 0.5
            ))

            // Corps physique du chassis
            this.car.chassis.body = new CANNON.Body({ mass: this.car.options.chassisMass })
            this.car.chassis.body.allowSleep = false                                      // Pas de sommeil pour le chassis
            this.car.chassis.body.position.set(0, 0, 12)                                 // Position initiale
            this.car.chassis.body.sleep()                                                // Mise en sommeil initiale
            this.car.chassis.body.addShape(this.car.chassis.shape, this.car.options.chassisOffset)  // Ajout de la forme
            this.car.chassis.body.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 0, 1), - Math.PI * 0.5)  // Rotation initiale

            /**
             * Sons de collision du chassis
             */
            this.car.chassis.body.addEventListener('collide', (_event) =>
            {
                if(_event.body.mass === 0)                                               // Collision avec objet statique
                {
                    const relativeVelocity = _event.contact.getImpactVelocityAlongNormal()  // Vitesse relative de l'impact
                    this.sounds.play('carHit', relativeVelocity)                          // Lecture du son avec intensité
                }
            })

            /**
             * Création du véhicule RaycastVehicle
             */
            this.car.vehicle = new CANNON.RaycastVehicle({
                chassisBody: this.car.chassis.body                                        // Corps du chassis
            })

            /**
             * Configuration des roues
             */
            this.car.wheels = {}
            this.car.wheels.options = {
                radius: this.car.options.wheelRadius,                                     // Rayon des roues
                height: this.car.options.wheelHeight,                                     // Hauteur des roues
                suspensionStiffness: this.car.options.wheelSuspensionStiffness,          // Rigidité de la suspension
                suspensionRestLength: this.car.options.wheelSuspensionRestLength,        // Longueur de repos de la suspension
                frictionSlip: this.car.options.wheelFrictionSlip,                        // Friction de glissement
                dampingRelaxation: this.car.options.wheelDampingRelaxation,              // Amortissement de relaxation
                dampingCompression: this.car.options.wheelDampingCompression,            // Amortissement de compression
                maxSuspensionForce: this.car.options.wheelMaxSuspensionForce,            // Force maximale de suspension
                rollInfluence: this.car.options.wheelRollInfluence,                      // Influence du roulis
                maxSuspensionTravel: this.car.options.wheelMaxSuspensionTravel,          // Course maximale de suspension
                customSlidingRotationalSpeed: this.car.options.wheelCustomSlidingRotationalSpeed,  // Vitesse de rotation de glissement
                useCustomSlidingRotationalSpeed: true,                                   // Utilisation de la vitesse personnalisée
                directionLocal: new CANNON.Vec3(0, 0, - 1),                             // Direction locale (vers le bas)
                axleLocal: new CANNON.Vec3(0, 1, 0),                                     // Axe local (latéral)
                chassisConnectionPointLocal: new CANNON.Vec3(1, 1, 0)                   // Point de connexion (sera modifié pour chaque roue)
            }

            // Roue avant gauche
            this.car.wheels.options.chassisConnectionPointLocal.set(this.car.options.wheelFrontOffsetDepth, this.car.options.wheelOffsetWidth, 0)
            this.car.vehicle.addWheel(this.car.wheels.options)

            // Roue avant droite
            this.car.wheels.options.chassisConnectionPointLocal.set(this.car.options.wheelFrontOffsetDepth, - this.car.options.wheelOffsetWidth, 0)
            this.car.vehicle.addWheel(this.car.wheels.options)

            // Roue arrière gauche
            this.car.wheels.options.chassisConnectionPointLocal.set(this.car.options.wheelBackOffsetDepth, this.car.options.wheelOffsetWidth, 0)
            this.car.vehicle.addWheel(this.car.wheels.options)

            // Roue arrière droite
            this.car.wheels.options.chassisConnectionPointLocal.set(this.car.options.wheelBackOffsetDepth, - this.car.options.wheelOffsetWidth, 0)
            this.car.vehicle.addWheel(this.car.wheels.options)

            // Ajout du véhicule au monde physique
            this.car.vehicle.addToWorld(this.world)

            // Configuration des index des roues
            this.car.wheels.indexes = {}
            this.car.wheels.indexes.frontLeft = 0                                        // Index de la roue avant gauche
            this.car.wheels.indexes.frontRight = 1                                       // Index de la roue avant droite
            this.car.wheels.indexes.backLeft = 2                                         // Index de la roue arrière gauche
            this.car.wheels.indexes.backRight = 3                                        // Index de la roue arrière droite
            this.car.wheels.bodies = []                                                  // Corps physiques des roues

            // Création des corps physiques des roues
            for(const _wheelInfos of this.car.vehicle.wheelInfos)
            {
                const shape = new CANNON.Cylinder(_wheelInfos.radius, _wheelInfos.radius, this.car.wheels.options.height, 20)  // Forme cylindrique
                const body = new CANNON.Body({ mass: this.car.options.wheelMass, material: this.materials.items.wheel })        // Corps physique
                const quaternion = new CANNON.Quaternion()
                quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), Math.PI / 2)      // Rotation pour orientation horizontale

                body.type = CANNON.Body.KINEMATIC                                        // Type cinématique (contrôlé par le véhicule)

                body.addShape(shape, new CANNON.Vec3(), quaternion)                      // Ajout de la forme
                this.car.wheels.bodies.push(body)                                        // Ajout à la liste des corps
            }

            /**
             * Modèles de debug de la voiture
             */
            this.car.model = {}
            this.car.model.container = new THREE.Object3D()                              // Conteneur pour les modèles de debug
            this.models.container.add(this.car.model.container)                         // Ajout au conteneur des modèles

            // Matériau wireframe pour la visualisation
            this.car.model.material = new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: true })

            // Modèle du chassis
            this.car.model.chassis = new THREE.Mesh(
                new THREE.BoxGeometry(this.car.options.chassisDepth, this.car.options.chassisWidth, this.car.options.chassisHeight), 
                this.car.model.material
            )
            this.car.model.container.add(this.car.model.chassis)

            // Modèles des roues
            this.car.model.wheels = []
            const wheelGeometry = new THREE.CylinderGeometry(this.car.options.wheelRadius, this.car.options.wheelRadius, this.car.options.wheelHeight, 8, 1)

            // Création des 4 roues
            for(let i = 0; i < 4; i++)
            {
                const wheel = new THREE.Mesh(wheelGeometry, this.car.model.material)
                this.car.model.container.add(wheel)
                this.car.model.wheels.push(wheel)
            }
        }

        /**
         * Méthode de destruction de la voiture
         * 
         * Supprime la voiture du monde physique et retire les modèles de debug.
         */
        this.car.destroy = () =>
        {
            this.car.vehicle.removeFromWorld(this.world)                                // Suppression du véhicule du monde physique
            this.models.container.remove(this.car.model.container)                     // Suppression des modèles de debug
        }

        /**
         * Méthode de recréation de la voiture
         * 
         * Détruit et recrée la voiture, puis la réveille pour la rendre active.
         */
        this.car.recreate = () =>
        {
            this.car.destroy()                                                          // Destruction de la voiture existante
            this.car.create()                                                           // Création d'une nouvelle voiture
            this.car.chassis.body.wakeUp()                                             // Réveil de la voiture
        }

        /**
         * Méthode de freinage
         * 
         * Applique le freinage sur toutes les roues de la voiture.
         */
        this.car.brake = () =>
        {
            this.car.vehicle.setBrake(1, 0)                                            // Freinage roue avant gauche
            this.car.vehicle.setBrake(1, 1)                                            // Freinage roue avant droite
            this.car.vehicle.setBrake(1, 2)                                            // Freinage roue arrière gauche
            this.car.vehicle.setBrake(1, 3)                                            // Freinage roue arrière droite
        }

        /**
         * Méthode de relâchement des freins
         * 
         * Relâche le freinage sur toutes les roues de la voiture.
         */
        this.car.unbrake = () =>
        {
            this.car.vehicle.setBrake(0, 0)                                            // Relâchement frein roue avant gauche
            this.car.vehicle.setBrake(0, 1)                                            // Relâchement frein roue avant droite
            this.car.vehicle.setBrake(0, 2)                                            // Relâchement frein roue arrière gauche
            this.car.vehicle.setBrake(0, 3)                                            // Relâchement frein roue arrière droite
        }

        /**
         * Gestion des actions de contrôle
         */
        this.controls.on('action', (_name) =>
        {
            switch(_name)
            {
                case 'reset':
                    this.car.recreate()                                                  // Recréation de la voiture
                    break
            }
        })

        /**
         * Événement postStep - Logique de la voiture après chaque étape physique
         * 
         * Gère la mise à jour de la vitesse, de la direction, de la détection
         * de retournement et de la synchronisation des roues.
         */
        this.world.addEventListener('postStep', () =>
        {
            // Mise à jour de la vitesse
            let positionDelta = new CANNON.Vec3()
            positionDelta = positionDelta.copy(this.car.chassis.body.position)          // Position actuelle
            positionDelta = positionDelta.vsub(this.car.oldPosition)                   // Différence avec position précédente

            this.car.oldPosition.copy(this.car.chassis.body.position)                  // Sauvegarde de la position actuelle
            this.car.speed = positionDelta.length() / this.time.delta                   // Calcul de la vitesse

            // Mise à jour de la direction
            const localForward = new CANNON.Vec3(1, 0, 0)                              // Direction avant locale
            this.car.chassis.body.vectorToWorldFrame(localForward, this.car.worldForward)  // Conversion en coordonnées monde
            this.car.angle = Math.atan2(this.car.worldForward.y, this.car.worldForward.x)  // Calcul de l'angle

            this.car.forwardSpeed = this.car.worldForward.dot(positionDelta)            // Vitesse de déplacement avant/arrière
            this.car.goingForward = this.car.forwardSpeed > 0                          // Direction de déplacement

            // Détection de retournement
            const localUp = new CANNON.Vec3(0, 0, 1)                                   // Direction haut locale
            const worldUp = new CANNON.Vec3()
            this.car.chassis.body.vectorToWorldFrame(localUp, worldUp)                 // Conversion en coordonnées monde

            // Vérification si la voiture est retournée
            if(worldUp.dot(localUp) < 0.5)                                             // Si le haut local pointe vers le bas
            {
                if(this.car.upsideDown.state === 'watching')                           // État d'observation
                {
                    this.car.upsideDown.state = 'pending'                              // Passage en état d'attente
                    this.car.upsideDown.pendingTimeout = window.setTimeout(() =>
                    {
                        this.car.upsideDown.state = 'turning'                          // Passage en état de retournement
                        this.car.jump(true)                                            // Saut pour se retourner

                        this.car.upsideDown.turningTimeout = window.setTimeout(() =>
                        {
                            this.car.upsideDown.state = 'watching'                     // Retour à l'état d'observation
                        }, 1000)
                    }, 1000)
                }
            }
            else
            {
                if(this.car.upsideDown.state === 'pending')                            // Si en attente et plus retournée
                {
                    this.car.upsideDown.state = 'watching'                             // Retour à l'état d'observation
                    window.clearTimeout(this.car.upsideDown.pendingTimeout)            // Annulation du timeout
                }
            }

            // Mise à jour des corps des roues
            for(let i = 0; i < this.car.vehicle.wheelInfos.length; i++)
            {
                this.car.vehicle.updateWheelTransform(i)                                // Mise à jour de la transformation de la roue

                const transform = this.car.vehicle.wheelInfos[i].worldTransform         // Transformation monde de la roue
                this.car.wheels.bodies[i].position.copy(transform.position)            // Mise à jour de la position
                this.car.wheels.bodies[i].quaternion.copy(transform.quaternion)        // Mise à jour de la rotation

                // Rotation des roues de droite (pour symétrie visuelle)
                if(i === 1 || i === 3)                                                 // Roues avant droite et arrière droite
                {
                    const rotationQuaternion = new CANNON.Quaternion(0, 0, 0, 1)
                    rotationQuaternion.setFromAxisAngle(new CANNON.Vec3(0, 0, 1), Math.PI)  // Rotation de 180°
                    this.car.wheels.bodies[i].quaternion = this.car.wheels.bodies[i].quaternion.mult(rotationQuaternion)
                }
            }

            // Ralentissement automatique
            if(!this.controls.actions.up && !this.controls.actions.down)               // Si aucune touche d'accélération
            {
                let slowDownForce = this.car.worldForward.clone()                      // Force de ralentissement

                if(this.car.goingForward)                                              // Si la voiture va vers l'avant
                {
                    slowDownForce = slowDownForce.negate()                             // Inversion de la force
                }

                slowDownForce = slowDownForce.scale(this.car.chassis.body.velocity.length() * 0.1)  // Application du ralentissement

                this.car.chassis.body.applyImpulse(slowDownForce, this.car.chassis.body.position)  // Application de la force
            }
        })

        /**
         * Événement time tick - Mise à jour des modèles et des contrôles
         * 
         * Gère la synchronisation des modèles de debug avec les corps physiques
         * et traite tous les contrôles de la voiture (direction, accélération, freinage).
         */
        this.time.on('tick', () =>
        {
            /**
             * Synchronisation des modèles de debug
             */
            // Mise à jour du modèle du chassis
            this.car.model.chassis.position.copy(this.car.chassis.body.position).add(this.car.options.chassisOffset)  // Position avec décalage
            this.car.model.chassis.quaternion.copy(this.car.chassis.body.quaternion)                                // Rotation

            // Mise à jour des modèles des roues
            for(const _wheelKey in this.car.wheels.bodies)
            {
                const wheelBody = this.car.wheels.bodies[_wheelKey]                    // Corps physique de la roue
                const wheelMesh = this.car.model.wheels[_wheelKey]                     // Modèle de debug de la roue

                wheelMesh.position.copy(wheelBody.position)                            // Synchronisation de la position
                wheelMesh.quaternion.copy(wheelBody.quaternion)                        // Synchronisation de la rotation
            }

            /**
             * Gestion de la direction
             */
            if(this.controls.touch)                                                     // Contrôles tactiles
            {
                let deltaAngle = 0

                if(this.controls.touch.joystick.active)                                 // Joystick actif
                {
                    // Calcul de la différence entre l'angle du joystick et l'angle de la voiture
                    deltaAngle = (this.controls.touch.joystick.angle.value - this.car.angle + Math.PI) % (Math.PI * 2) - Math.PI
                    deltaAngle = deltaAngle < - Math.PI ? deltaAngle + Math.PI * 2 : deltaAngle
                }

                // Mise à jour directe de la direction
                const goingForward = Math.abs(this.car.forwardSpeed) < 0.01 ? true : this.car.goingForward  // Direction de déplacement
                this.car.steering = deltaAngle * (goingForward ? - 1 : 1)              // Application de la direction

                // Limitation de la direction
                if(Math.abs(this.car.steering) > this.car.options.controlsSteeringMax)
                {
                    this.car.steering = Math.sign(this.car.steering) * this.car.options.controlsSteeringMax
                }
            }

            if(!this.controls.touch || !this.controls.touch.joystick.active)            // Contrôles clavier
            {
                const steerStrength = this.time.delta * this.car.options.controlsSteeringSpeed  // Force de direction

                // Direction à droite
                if(this.controls.actions.right)
                {
                    this.car.steering += steerStrength
                }
                // Direction à gauche
                else if(this.controls.actions.left)
                {
                    this.car.steering -= steerStrength
                }
                // Retour au centre
                else
                {
                    if(Math.abs(this.car.steering) > steerStrength)
                    {
                        this.car.steering -= steerStrength * Math.sign(this.car.steering)
                    }
                    else
                    {
                        this.car.steering = 0
                    }
                }

                // Limitation de la direction
                if(Math.abs(this.car.steering) > this.car.options.controlsSteeringMax)
                {
                    this.car.steering = Math.sign(this.car.steering) * this.car.options.controlsSteeringMax
                }
            }

            // Application de la direction aux roues
            this.car.vehicle.setSteeringValue(- this.car.steering, this.car.wheels.indexes.frontLeft)    // Roue avant gauche
            this.car.vehicle.setSteeringValue(- this.car.steering, this.car.wheels.indexes.frontRight)   // Roue avant droite

            if(this.car.options.controlsSteeringQuad)                                   // Direction sur les 4 roues
            {
                this.car.vehicle.setSteeringValue(this.car.steering, this.car.wheels.indexes.backLeft)   // Roue arrière gauche
                this.car.vehicle.setSteeringValue(this.car.steering, this.car.wheels.indexes.backRight)  // Roue arrière droite
            }

            /**
             * Gestion de l'accélération
             */
            const accelerationSpeed = this.controls.actions.boost ? this.car.options.controlsAcceleratingSpeedBoost : this.car.options.controlsAcceleratingSpeed  // Vitesse d'accélération
            const accelerateStrength = 17 * accelerationSpeed                                                      // Force d'accélération
            const controlsAcceleratinMaxSpeed = this.controls.actions.boost ? this.car.options.controlsAcceleratinMaxSpeedBoost : this.car.options.controlsAcceleratinMaxSpeed  // Vitesse maximale

            // Accélération vers l'avant
            if(this.controls.actions.up)
            {
                if(this.car.speed < controlsAcceleratinMaxSpeed || !this.car.goingForward)                        // Si vitesse < max ou marche arrière
                {
                    this.car.accelerating = accelerateStrength
                }
                else
                {
                    this.car.accelerating = 0
                }
            }

            // Accélération vers l'arrière
            else if(this.controls.actions.down)
            {
                if(this.car.speed < controlsAcceleratinMaxSpeed || this.car.goingForward)                         // Si vitesse < max ou marche avant
                {
                    this.car.accelerating = - accelerateStrength
                }
                else
                {
                    this.car.accelerating = 0
                }
            }
            else
            {
                this.car.accelerating = 0
            }

            // Application de la force moteur aux roues arrière
            this.car.vehicle.applyEngineForce(- this.car.accelerating, this.car.wheels.indexes.backLeft)         // Roue arrière gauche
            this.car.vehicle.applyEngineForce(- this.car.accelerating, this.car.wheels.indexes.backRight)        // Roue arrière droite

            if(this.car.options.controlsAcceleratingQuad)                                                         // Accélération sur les 4 roues
            {
                this.car.vehicle.applyEngineForce(- this.car.accelerating, this.car.wheels.indexes.frontLeft)    // Roue avant gauche
                this.car.vehicle.applyEngineForce(- this.car.accelerating, this.car.wheels.indexes.frontRight)   // Roue avant droite
            }

            /**
             * Gestion du freinage
             */
            if(this.controls.actions.brake)                                                                       // Freinage activé
            {
                this.car.vehicle.setBrake(this.car.options.controlsBrakeStrength, 0)                              // Freinage roue avant gauche
                this.car.vehicle.setBrake(this.car.options.controlsBrakeStrength, 1)                              // Freinage roue avant droite
                this.car.vehicle.setBrake(this.car.options.controlsBrakeStrength, 2)                              // Freinage roue arrière gauche
                this.car.vehicle.setBrake(this.car.options.controlsBrakeStrength, 3)                              // Freinage roue arrière droite
            }
            else
            {
                this.car.vehicle.setBrake(0, 0)                                                                   // Relâchement frein roue avant gauche
                this.car.vehicle.setBrake(0, 1)                                                                   // Relâchement frein roue avant droite
                this.car.vehicle.setBrake(0, 2)                                                                   // Relâchement frein roue arrière gauche
                this.car.vehicle.setBrake(0, 3)                                                                   // Relâchement frein roue arrière droite
            }
        })

        // Création de la voiture initiale
        this.car.create()

        // Interface de debug pour la voiture
        if(this.debug)
        {
            this.car.debugFolder = this.debugFolder.addFolder('car')                                               // Dossier de debug pour la voiture
            this.car.debugFolder.open()                                                                           // Ouverture automatique

            // Contrôles de debug pour les dimensions du chassis
            this.car.debugFolder.add(this.car.options, 'chassisWidth').step(0.001).min(0).max(5).name('chassisWidth').onFinishChange(this.car.recreate)
            this.car.debugFolder.add(this.car.options, 'chassisHeight').step(0.001).min(0).max(5).name('chassisHeight').onFinishChange(this.car.recreate)
            this.car.debugFolder.add(this.car.options, 'chassisDepth').step(0.001).min(0).max(5).name('chassisDepth').onFinishChange(this.car.recreate)
            this.car.debugFolder.add(this.car.options.chassisOffset, 'z').step(0.001).min(0).max(5).name('chassisOffset').onFinishChange(this.car.recreate)
            this.car.debugFolder.add(this.car.options, 'chassisMass').step(0.001).min(0).max(1000).name('chassisMass').onFinishChange(this.car.recreate)
            
            // Contrôles de debug pour la position des roues
            this.car.debugFolder.add(this.car.options, 'wheelFrontOffsetDepth').step(0.001).min(0).max(5).name('wheelFrontOffsetDepth').onFinishChange(this.car.recreate)
            this.car.debugFolder.add(this.car.options, 'wheelBackOffsetDepth').step(0.001).min(- 5).max(0).name('wheelBackOffsetDepth').onFinishChange(this.car.recreate)
            this.car.debugFolder.add(this.car.options, 'wheelOffsetWidth').step(0.001).min(0).max(5).name('wheelOffsetWidth').onFinishChange(this.car.recreate)
            
            // Contrôles de debug pour les propriétés des roues
            this.car.debugFolder.add(this.car.options, 'wheelRadius').step(0.001).min(0).max(2).name('wheelRadius').onFinishChange(this.car.recreate)
            this.car.debugFolder.add(this.car.options, 'wheelHeight').step(0.001).min(0).max(2).name('wheelHeight').onFinishChange(this.car.recreate)
            this.car.debugFolder.add(this.car.options, 'wheelSuspensionStiffness').step(0.001).min(0).max(300).name('wheelSuspensionStiffness').onFinishChange(this.car.recreate)
            this.car.debugFolder.add(this.car.options, 'wheelSuspensionRestLength').step(0.001).min(0).max(5).name('wheelSuspensionRestLength').onFinishChange(this.car.recreate)
            this.car.debugFolder.add(this.car.options, 'wheelFrictionSlip').step(0.001).min(0).max(30).name('wheelFrictionSlip').onFinishChange(this.car.recreate)
            this.car.debugFolder.add(this.car.options, 'wheelDampingRelaxation').step(0.001).min(0).max(30).name('wheelDampingRelaxation').onFinishChange(this.car.recreate)
            this.car.debugFolder.add(this.car.options, 'wheelDampingCompression').step(0.001).min(0).max(30).name('wheelDampingCompression').onFinishChange(this.car.recreate)
            this.car.debugFolder.add(this.car.options, 'wheelMaxSuspensionForce').step(0.001).min(0).max(1000000).name('wheelMaxSuspensionForce').onFinishChange(this.car.recreate)
            this.car.debugFolder.add(this.car.options, 'wheelRollInfluence').step(0.001).min(0).max(1).name('wheelRollInfluence').onFinishChange(this.car.recreate)
            this.car.debugFolder.add(this.car.options, 'wheelMaxSuspensionTravel').step(0.001).min(0).max(5).name('wheelMaxSuspensionTravel').onFinishChange(this.car.recreate)
            this.car.debugFolder.add(this.car.options, 'wheelCustomSlidingRotationalSpeed').step(0.001).min(- 45).max(45).name('wheelCustomSlidingRotationalSpeed').onFinishChange(this.car.recreate)
            this.car.debugFolder.add(this.car.options, 'wheelMass').step(0.001).min(0).max(1000).name('wheelMass').onFinishChange(this.car.recreate)
            
            // Contrôles de debug pour les paramètres de contrôle
            this.car.debugFolder.add(this.car.options, 'controlsSteeringSpeed').step(0.001).min(0).max(0.1).name('controlsSteeringSpeed')
            this.car.debugFolder.add(this.car.options, 'controlsSteeringMax').step(0.001).min(0).max(Math.PI * 0.5).name('controlsSteeringMax')
            this.car.debugFolder.add(this.car.options, 'controlsSteeringQuad').name('controlsSteeringQuad')
            this.car.debugFolder.add(this.car.options, 'controlsAcceleratingSpeed').step(0.001).min(0).max(30).name('controlsAcceleratingSpeed')
            this.car.debugFolder.add(this.car.options, 'controlsAcceleratingSpeedBoost').step(0.001).min(0).max(30).name('controlsAcceleratingSpeedBoost')
            this.car.debugFolder.add(this.car.options, 'controlsAcceleratingQuad').name('controlsAcceleratingQuad')
            this.car.debugFolder.add(this.car.options, 'controlsBrakeStrength').step(0.001).min(0).max(5).name('controlsBrakeStrength')
            
            // Actions de debug
            this.car.debugFolder.add(this.car, 'recreate')                                                         // Bouton de recréation
            this.car.debugFolder.add(this.car, 'jump')                                                             // Bouton de saut
        }
    }

    /**
     * AddObjectFromThree - Création d'objets physiques depuis des meshes Three.js
     *
     * Crée des objets physiques automatiquement à partir de meshes Three.js.
     * Analyse les noms des meshes pour déterminer leur forme physique et
     * génère les corps de collision appropriés.
     *
     * TYPES D'OBJETS SUPPORTÉS :
     * - Cubes/Boxes : Formes rectangulaires (cube_*, box*)
     * - Cylindres : Formes cylindriques (cylinder_*)
     * - Sphères : Formes sphériques (sphere_*)
     * - Centres : Points de référence pour le centrage (center_*)
     *
     * FONCTIONNALITÉS :
     * - Détection automatique de la forme selon le nom
     * - Création de corps physiques avec masse configurable
     * - Gestion du centrage automatique
     * - Modèles de debug pour visualisation
     * - Synchronisation physique-visuel
     * - Gestion des états (sommeil, collision)
     *
     * @param {Object} _options - Options de création de l'objet
     * @param {Array} _options.meshes - Liste des meshes Three.js
     * @param {number} _options.mass - Masse de l'objet (0 = statique)
     * @param {THREE.Vector3} _options.offset - Décalage de position
     * @param {THREE.Euler} _options.rotation - Rotation de l'objet
     * @param {boolean} _options.sleep - Si l'objet doit commencer endormi
     * @returns {Object} Objet de collision créé
     */
    addObjectFromThree(_options)
    {
        // Configuration de l'objet de collision
        const collision = {}

        // Configuration des modèles de debug
        collision.model = {}
        collision.model.meshes = []                                                      // Liste des meshes de debug
        collision.model.container = new THREE.Object3D()                                // Conteneur pour les modèles
        this.models.container.add(collision.model.container)                           // Ajout au conteneur des modèles

        collision.children = []                                                         // Liste des enfants

        // Matériau physique
        const bodyMaterial = this.materials.items.dummy                                 // Matériau des objets génériques

        // Création du corps physique
        collision.body = new CANNON.Body({
            position: new CANNON.Vec3(_options.offset.x, _options.offset.y, _options.offset.z),  // Position initiale
            mass: _options.mass,                                                         // Masse de l'objet
            material: bodyMaterial                                                       // Matériau physique
        })
        collision.body.allowSleep = true                                                // Autorisation du sommeil
        collision.body.sleepSpeedLimit = 0.01                                          // Limite de vitesse pour le sommeil
        if(_options.sleep)                                                              // Sommeil initial si demandé
        {
            collision.body.sleep()
        }

        this.world.addBody(collision.body)                                             // Ajout au monde physique

        // Application de la rotation
        if(_options.rotation)
        {
            const rotationQuaternion = new CANNON.Quaternion()
            rotationQuaternion.setFromEuler(_options.rotation.x, _options.rotation.y, _options.rotation.z, _options.rotation.order)  // Conversion Euler vers Quaternion
            collision.body.quaternion = collision.body.quaternion.mult(rotationQuaternion)  // Application de la rotation
        }

        // Centre de l'objet (pour le centrage)
        collision.center = new CANNON.Vec3(0, 0, 0)

        // Liste des formes à créer
        const shapes = []

        // Traitement de chaque mesh
        for(let i = 0; i < _options.meshes.length; i++)
        {
            const mesh = _options.meshes[i]

            // Détermination de la forme selon le nom
            let shape = null

            if(mesh.name.match(/^cube_?[0-9]{0,3}?|box[0-9]{0,3}?$/i))                    // Cubes/Boxes
            {
                shape = 'box'
            }
            else if(mesh.name.match(/^cylinder_?[0-9]{0,3}?$/i))                         // Cylindres
            {
                shape = 'cylinder'
            }
            else if(mesh.name.match(/^sphere_?[0-9]{0,3}?$/i))                           // Sphères
            {
                shape = 'sphere'
            }
            else if(mesh.name.match(/^center_?[0-9]{0,3}?$/i))                           // Centres
            {
                shape = 'center'
            }

            // Si la forme est un centre, définir le centre de l'objet
            if(shape === 'center')
            {
                collision.center.set(mesh.position.x, mesh.position.y, mesh.position.z)  // Définition du centre
            }

            // Autres formes (non-centres)
            else if(shape)
            {
                // Création de la géométrie physique
                let shapeGeometry = null

                if(shape === 'cylinder')                                                 // Cylindre
                {
                    shapeGeometry = new CANNON.Cylinder(mesh.scale.x, mesh.scale.x, mesh.scale.z, 8)  // Cylindre avec 8 segments
                }
                else if(shape === 'box')                                                 // Boîte
                {
                    const halfExtents = new CANNON.Vec3(mesh.scale.x * 0.5, mesh.scale.y * 0.5, mesh.scale.z * 0.5)  // Demi-dimensions
                    shapeGeometry = new CANNON.Box(halfExtents)
                }
                else if(shape === 'sphere')                                              // Sphère
                {
                    shapeGeometry = new CANNON.Sphere(mesh.scale.x)                     // Sphère avec rayon
                }

                // Position de la forme
                const shapePosition = new CANNON.Vec3(mesh.position.x, mesh.position.y, mesh.position.z)

                // Rotation de la forme
                const shapeQuaternion = new CANNON.Quaternion(mesh.quaternion.x, mesh.quaternion.y, mesh.quaternion.z, mesh.quaternion.w)
                if(shape === 'cylinder')                                                 // Rotation spéciale pour cylindre (commentée)
                {
                    // Rotation du cylindre
                    // shapeQuaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), - Math.PI * 0.5)
                }

                // Sauvegarde de la forme
                shapes.push({ shapeGeometry, shapePosition, shapeQuaternion })

                // Création du modèle de debug
                let modelGeometry = null
                if(shape === 'cylinder')                                                 // Géométrie cylindre
                {
                    modelGeometry = new THREE.CylinderGeometry(1, 1, 1, 8, 1)          // Cylindre unitaire
                    modelGeometry.rotateX(Math.PI * 0.5)                                // Rotation pour orientation horizontale
                }
                else if(shape === 'box')                                                 // Géométrie boîte
                {
                    modelGeometry = new THREE.BoxGeometry(1, 1, 1)                      // Boîte unitaire
                }
                else if(shape === 'sphere')                                              // Géométrie sphère
                {
                    modelGeometry = new THREE.SphereGeometry(1, 8, 8)                   // Sphère unitaire
                }

                // Création du mesh de debug
                const modelMesh = new THREE.Mesh(modelGeometry, this.models.materials[_options.mass === 0 ? 'static' : 'dynamic'])  // Matériau selon le type
                modelMesh.position.copy(mesh.position)                                  // Position du mesh original
                modelMesh.scale.copy(mesh.scale)                                        // Échelle du mesh original
                modelMesh.quaternion.copy(mesh.quaternion)                              // Rotation du mesh original

                collision.model.meshes.push(modelMesh)                                  // Ajout à la liste des meshes
            }
        }

        // Ajustement des meshes de debug par rapport au centre
        for(const _mesh of collision.model.meshes)
        {
            _mesh.position.x -= collision.center.x                                      // Ajustement X
            _mesh.position.y -= collision.center.y                                      // Ajustement Y
            _mesh.position.z -= collision.center.z                                      // Ajustement Z

            collision.model.container.add(_mesh)                                        // Ajout au conteneur
        }

        // Ajustement des formes physiques par rapport au centre
        for(const _shape of shapes)
        {
            // Ajustement de la position de la forme
            _shape.shapePosition.x -= collision.center.x                                // Ajustement X
            _shape.shapePosition.y -= collision.center.y                                // Ajustement Y
            _shape.shapePosition.z -= collision.center.z                                // Ajustement Z

            collision.body.addShape(_shape.shapeGeometry, _shape.shapePosition, _shape.shapeQuaternion)  // Ajout de la forme au corps
        }

        // Ajustement de la position du corps par rapport au centre
        collision.body.position.x += collision.center.x                                // Ajustement X
        collision.body.position.y += collision.center.y                                // Ajustement Y
        collision.body.position.z += collision.center.z                                // Ajustement Z

        // Sauvegarde de l'état d'origine
        collision.origin = {}
        collision.origin.position = collision.body.position.clone()                    // Position d'origine
        collision.origin.quaternion = collision.body.quaternion.clone()                // Rotation d'origine
        collision.origin.sleep = _options.sleep                                         // État de sommeil d'origine

        // Synchronisation physique-visuel
        this.time.on('tick', () =>
        {
            collision.model.container.position.set(collision.body.position.x, collision.body.position.y, collision.body.position.z)  // Synchronisation position
            collision.model.container.quaternion.set(collision.body.quaternion.x, collision.body.quaternion.y, collision.body.quaternion.z, collision.body.quaternion.w)  // Synchronisation rotation

            if(this.models.container.visible && _options.mass > 0)                      // Si modèles visibles et objet dynamique
            {
                for(const _mesh of collision.model.container.children)
                {
                    _mesh.material = collision.body.sleepState === 2 ? this.models.materials.dynamicSleeping : this.models.materials.dynamic  // Matériau selon l'état
                }
            }
        })

        // Fonction de reset
        collision.reset = () =>
        {
            collision.body.position.copy(collision.origin.position)                     // Restauration position d'origine
            collision.body.quaternion.copy(collision.origin.quaternion)                 // Restauration rotation d'origine

            if(collision.origin.sleep)                                                  // Restauration état de sommeil
            {
                collision.body.sleep()
            }
        }

        return collision
    }
}
