/**
 * CONTROLS.JS - Système de Contrôles
 *
 * Ce fichier définit le système de contrôles pour la voiture dans l'environnement 3D.
 * Il gère les contrôles clavier et tactile, avec des interfaces utilisateur
 * adaptatives selon le type d'appareil.
 *
 * RESPONSABILITÉS :
 * - Gestion des contrôles clavier (WASD, flèches)
 * - Interface tactile avec joystick et boutons
 * - Synchronisation avec le système de physique
 * - Gestion des événements de visibilité
 *
 * CARACTÉRISTIQUES :
 * - Contrôles clavier complets (mouvement, freinage, boost)
 * - Interface tactile avec joystick analogique
 * - Boutons tactiles (avancer, reculer, freiner, boost)
 * - Gestion des événements de visibilité
 * - Synchronisation avec la caméra et les sons
 *
 * UTILISATION :
 * - Contrôle de la voiture principale
 * - Interface utilisateur adaptative
 * - Gestion des entrées utilisateur
 * - Coordination avec les systèmes de physique et audio
 */

import mobileDoubleTriangle from '../../images/mobile/doubleTriangle.png'
import mobileTriangle from '../../images/mobile/triangle.png'
import mobileCross from '../../images/mobile/cross.png'
import EventEmitter from '../Utils/EventEmitter'

export default class Controls extends EventEmitter
{
    /**
     * Constructor - Initialisation du système de contrôles complet
     *
     * Initialise le système de contrôles avec les options fournies et configure
     * les contrôles clavier et tactiles. Le système gère les entrées utilisateur
     * pour la navigation de la voiture dans l'environnement 3D.
     *
     * @param {Object} _options - Options de configuration
     * @param {Object} _options.config - Configuration de l'application (config.js)
     * @param {Object} _options.sizes - Gestionnaire de tailles (Sizes.js)
     * @param {Object} _options.time - Instance de gestion du temps (Time.js)
     * @param {Object} _options.camera - Instance de caméra (Camera.js)
     * @param {Object} _options.sounds - Gestionnaire de sons (Sounds.js)
     */
    constructor(_options)
    {
        super()                                                                      // Appel du constructeur EventEmitter

        // Stockage des options de configuration pour accès global
        this.config = _options.config                                                // Configuration de l'application
        this.sizes = _options.sizes                                                  // Gestionnaire des dimensions viewport
        this.time = _options.time                                                    // Gestionnaire du temps et animations
        this.camera = _options.camera                                                // Instance de caméra pour synchronisation
        this.sounds = _options.sounds                                                // Gestionnaire des sons pour feedback audio

        // Initialisation séquentielle des composants de contrôle
        this.setActions()                                                            // Configuration des états d'actions
        this.setKeyboard()                                                           // Configuration des contrôles clavier
        // Note: setTouch() est appelé conditionnellement depuis l'extérieur selon le type d'appareil
    }

    /**
     * SetActions - Configuration des états d'actions et gestion de la visibilité
     * 
     * Initialise les états des actions de la voiture et configure la gestion
     * des événements de visibilité pour réinitialiser automatiquement les contrôles
     * lors du retour de focus sur l'application.
     *
     * ACTIONS GÉRÉES :
     * - up : Avancer (W, flèche haut)
     * - right : Tourner à droite (D, flèche droite)
     * - down : Reculer (S, flèche bas)
     * - left : Tourner à gauche (A, flèche gauche)
     * - brake : Freiner (Ctrl, Espace)
     * - boost : Boost (Shift)
     *
     * GESTION DE LA VISIBILITÉ :
     * - Réinitialisation automatique lors du retour de focus
     * - Évite les actions bloquées lors du changement d'onglet
     * - Améliore l'expérience utilisateur
     */
    setActions()
    {
        // Initialisation des états des actions de la voiture
        this.actions = {}
        this.actions.up = false                                                     // État d'avancement (W, flèche haut)
        this.actions.right = false                                                  // État de rotation droite (D, flèche droite)
        this.actions.down = false                                                   // État de recul (S, flèche bas)
        this.actions.left = false                                                   // État de rotation gauche (A, flèche gauche)
        this.actions.brake = false                                                  // État de freinage (Ctrl, Espace)
        this.actions.boost = false                                                  // État de boost (Shift)

        // Gestion des événements de visibilité de l'application
        document.addEventListener('visibilitychange', () =>
        {
            // Vérification si l'application redevient visible
            if(!document.hidden)
            {
                // Réinitialisation complète des actions lors du retour de visibilité
                // Évite les actions bloquées lors du changement d'onglet ou de focus
                this.actions.up = false                                             // Arrêt de l'avancement
                this.actions.right = false                                          // Arrêt de la rotation droite
                this.actions.down = false                                           // Arrêt du recul
                this.actions.left = false                                           // Arrêt de la rotation gauche
                this.actions.brake = false                                          // Arrêt du freinage
                this.actions.boost = false                                          // Arrêt du boost
            }
        })
    }

    /**
     * SetKeyboard - Configuration des contrôles clavier complets
     * 
     * Configure les événements clavier pour les contrôles de la voiture
     * avec support des touches WASD, flèches et touches spéciales.
     * Gère les événements keydown et keyup pour une expérience fluide.
     *
     * TOUCHES SUPPORTÉES :
     * - WASD : Contrôles de mouvement (W=avancer, A=gauche, S=reculer, D=droite)
     * - Flèches : Contrôles alternatifs (↑=avancer, ←=gauche, ↓=reculer, →=droite)
     * - Ctrl/Espace : Freinage
     * - Shift : Boost
     * - R : Reset (action spéciale)
     *
     * FONCTIONNALITÉS :
     * - Synchronisation avec la caméra (reset du pan)
     * - Gestion des événements keydown/keyup
     * - Support des touches multiples (gauche/droite)
     * - Actions spéciales (reset)
     */
    setKeyboard()
    {
        // Configuration des événements clavier
        this.keyboard = {}
        this.keyboard.events = {}                                                   // Stockage des fonctions d'événements

        // Gestion des touches pressées (keydown)
        this.keyboard.events.keyDown = (_event) =>
        {
            switch(_event.code)
            {
                case 'ArrowUp':
                case 'KeyW':
                    this.camera.pan.reset()                                         // Réinitialisation du pan de caméra
                    this.actions.up = true                                          // Activation de l'avancement
                    break

                case 'ArrowRight':
                case 'KeyD':
                    this.actions.right = true                                       // Activation de la rotation droite
                    break

                case 'ArrowDown':
                case 'KeyS':
                    this.camera.pan.reset()                                         // Réinitialisation du pan de caméra
                    this.actions.down = true                                        // Activation du recul
                    break

                case 'ArrowLeft':
                case 'KeyA':
                    this.actions.left = true                                        // Activation de la rotation gauche
                    break

                case 'ControlLeft':
                case 'ControlRight':
                case 'Space':
                    this.actions.brake = true                                       // Activation du freinage
                    break

                case 'ShiftLeft':
                case 'ShiftRight':
                    this.actions.boost = true                                       // Activation du boost
                    break

                // Fonctionnalité de saut commentée
                // case ' ':
                //     this.jump(true)
                //     break
            }
        }

        // Gestion des touches relâchées (keyup)
        this.keyboard.events.keyUp = (_event) =>
        {
            switch(_event.code)
            {
                case 'ArrowUp':
                case 'KeyW':
                    this.actions.up = false                                         // Désactivation de l'avancement
                    break

                case 'ArrowRight':
                case 'KeyD':
                    this.actions.right = false                                      // Désactivation de la rotation droite
                    break

                case 'ArrowDown':
                case 'KeyS':
                    this.actions.down = false                                       // Désactivation du recul
                    break

                case 'ArrowLeft':
                case 'KeyA':
                    this.actions.left = false                                       // Désactivation de la rotation gauche
                    break

                case 'ControlLeft':
                case 'ControlRight':
                case 'Space':
                    this.actions.brake = false                                      // Désactivation du freinage
                    break

                case 'ShiftLeft':
                case 'ShiftRight':
                    this.actions.boost = false                                      // Désactivation du boost
                    break

                case 'KeyR':
                    this.trigger('action', ['reset'])                               // Déclenchement de l'action de reset
                    break
            }
        }

        // Ajout des écouteurs d'événements au document
        document.addEventListener('keydown', this.keyboard.events.keyDown)          // Écoute des touches pressées
        document.addEventListener('keyup', this.keyboard.events.keyUp)              // Écoute des touches relâchées
    }

    /**
     * SetTouch - Configuration de l'interface tactile complète
     * 
     * Configure l'interface tactile complète avec joystick analogique et boutons
     * pour les appareils mobiles. Inclut la gestion des événements tactiles,
     * l'animation des éléments et la synchronisation avec les contrôles.
     *
     * COMPOSANTS TACTILES :
     * - Joystick analogique : Contrôle de direction et vitesse
     * - Bouton Boost : Avancement rapide avec boost
     * - Bouton Forward : Avancement normal
     * - Bouton Brake : Freinage
     * - Bouton Backward : Recul
     *
     * FONCTIONNALITÉS :
     * - Gestion multi-touch avec identifiants uniques
     * - Animations d'apparition avec délais échelonnés
     * - Feedback visuel avec changements d'opacité
     * - Synchronisation avec la caméra et les sons
     * - Optimisations GPU avec willChange
     */
    setTouch()
    {
        // Initialisation du conteneur tactile
        this.touch = {}

        /**
         * Configuration du Joystick Analogique
         * 
         * Le joystick analogique permet un contrôle précis de la direction
         * et de la vitesse de la voiture avec des calculs d'angle et de distance.
         */
        // Configuration du joystick analogique
        this.touch.joystick = {}
        this.touch.joystick.active = false                                          // État d'activation du joystick

        // Création de l'élément principal du joystick
        this.touch.joystick.$element = document.createElement('div')
        this.touch.joystick.$element.style.userSelect = 'none'                        // Désactivation de la sélection de texte
        this.touch.joystick.$element.style.position = 'fixed'                         // Position fixe sur l'écran
        this.touch.joystick.$element.style.bottom = '10px'                            // Position en bas à gauche
        this.touch.joystick.$element.style.left = '10px'
        this.touch.joystick.$element.style.width = '170px'                            // Taille du joystick
        this.touch.joystick.$element.style.height = '170px'
        this.touch.joystick.$element.style.borderRadius = '50%'                       // Forme circulaire
        this.touch.joystick.$element.style.transition = 'opacity 0.3s 0.0s'           // Animation d'apparition
        this.touch.joystick.$element.style.willChange = 'opacity'                     // Optimisation GPU
        this.touch.joystick.$element.style.opacity = '0'                              // Invisible par défaut
        // this.touch.joystick.$element.style.backgroundColor = '#ff0000'              // Debug (commenté)
        document.body.appendChild(this.touch.joystick.$element)

        // Création du curseur du joystick (point central)
        this.touch.joystick.$cursor = document.createElement('div')
        this.touch.joystick.$cursor.style.position = 'absolute'
        this.touch.joystick.$cursor.style.top = 'calc(50% - 30px)'                     // Centrage vertical
        this.touch.joystick.$cursor.style.left = 'calc(50% - 30px)'                    // Centrage horizontal
        this.touch.joystick.$cursor.style.width = '60px'                               // Taille du curseur
        this.touch.joystick.$cursor.style.height = '60px'
        this.touch.joystick.$cursor.style.border = '2px solid #ffffff'                 // Bordure blanche
        this.touch.joystick.$cursor.style.borderRadius = '50%'                         // Forme circulaire
        this.touch.joystick.$cursor.style.boxSizing = 'border-box'                     // Inclure la bordure dans la taille
        this.touch.joystick.$cursor.style.pointerEvents = 'none'                       // Pas d'interaction directe
        this.touch.joystick.$cursor.style.willChange = 'transform'                     // Optimisation GPU
        this.touch.joystick.$element.appendChild(this.touch.joystick.$cursor)

        // Création de la limite du joystick (zone de mouvement)
        this.touch.joystick.$limit = document.createElement('div')
        this.touch.joystick.$limit.style.position = 'absolute'
        this.touch.joystick.$limit.style.top = 'calc(50% - 75px)'                      // Centrage vertical
        this.touch.joystick.$limit.style.left = 'calc(50% - 75px)'                     // Centrage horizontal
        this.touch.joystick.$limit.style.width = '150px'                               // Taille de la zone
        this.touch.joystick.$limit.style.height = '150px'
        this.touch.joystick.$limit.style.border = '2px solid #ffffff'                  // Bordure blanche
        this.touch.joystick.$limit.style.borderRadius = '50%'                          // Forme circulaire
        this.touch.joystick.$limit.style.opacity = '0.25'                              // Transparence
        this.touch.joystick.$limit.style.pointerEvents = 'none'                        // Pas d'interaction directe
        this.touch.joystick.$limit.style.boxSizing = 'border-box'                      // Inclure la bordure dans la taille
        this.touch.joystick.$element.appendChild(this.touch.joystick.$limit)

        // Configuration des angles et positions du joystick
        this.touch.joystick.angle = {}

        this.touch.joystick.angle.offset = Math.PI * 0.18                             // Décalage d'angle pour l'orientation

        // Position du centre du joystick
        this.touch.joystick.angle.center = {}
        this.touch.joystick.angle.center.x = 0
        this.touch.joystick.angle.center.y = 0

        // Position actuelle du doigt
        this.touch.joystick.angle.current = {}
        this.touch.joystick.angle.current.x = 0
        this.touch.joystick.angle.current.y = 0

        // Valeurs d'angle calculées
        this.touch.joystick.angle.originalValue = 0                                   // Angle original
        this.touch.joystick.angle.value = - Math.PI * 0.5                            // Angle avec décalage

        // Fonction de redimensionnement pour recalculer le centre
        this.touch.joystick.resize = () =>
        {
            const boundings = this.touch.joystick.$element.getBoundingClientRect()

            // Mise à jour du centre du joystick
            this.touch.joystick.angle.center.x = boundings.left + boundings.width * 0.5
            this.touch.joystick.angle.center.y = boundings.top + boundings.height * 0.5
        }

        // Écoute des événements de redimensionnement
        this.sizes.on('resize', this.touch.joystick.resize)
        this.touch.joystick.resize()

        // Calcul et animation du joystick à chaque frame
        this.time.on('tick', () =>
        {
            // Mise à jour uniquement si le joystick est actif
            if(this.touch.joystick.active)
            {
                // Calcul de l'angle du joystick basé sur la position du doigt
                this.touch.joystick.angle.originalValue = - Math.atan2(
                    this.touch.joystick.angle.current.y - this.touch.joystick.angle.center.y,  // Différence Y
                    this.touch.joystick.angle.current.x - this.touch.joystick.angle.center.x   // Différence X
                )
                // Application du décalage d'angle pour l'orientation
                this.touch.joystick.angle.value = this.touch.joystick.angle.originalValue + this.touch.joystick.angle.offset

                // Calcul de la distance entre le centre et la position actuelle
                const distance = Math.hypot(
                    this.touch.joystick.angle.current.y - this.touch.joystick.angle.center.y,
                    this.touch.joystick.angle.current.x - this.touch.joystick.angle.center.x
                )
                let radius = distance
                
                // Limitation progressive du rayon pour un contrôle plus précis
                // Zone de contrôle fine jusqu'à 20px, puis limitation logarithmique
                if(radius > 20)
                {
                    radius = 20 + Math.log(distance - 20) * 5                          // Limitation logarithmique
                }
                // Limitation maximale du rayon
                if(radius > 43)
                {
                    radius = 43                                                         // Rayon maximum
                }
                
                // Calcul de la position du curseur avec rotation de 90° (Math.PI * 0.5)
                const cursorX = Math.sin(this.touch.joystick.angle.originalValue + Math.PI * 0.5) * radius
                const cursorY = Math.cos(this.touch.joystick.angle.originalValue + Math.PI * 0.5) * radius
                // Application de la transformation au curseur
                this.touch.joystick.$cursor.style.transform = `translateX(${cursorX}px) translateY(${cursorY}px)`
            }
        })

        // Configuration des événements tactiles du joystick
        this.touch.joystick.events = {}                                             // Stockage des fonctions d'événements
        this.touch.joystick.touchIdentifier = null                                  // Identifiant unique du contact tactile

        // Gestion du début de contact tactile (touchstart)
        this.touch.joystick.events.touchstart = (_event) =>
        {
            _event.preventDefault()                                                 // Empêche le comportement par défaut (scroll, zoom)

            const touch = _event.changedTouches[0]                                  // Récupération du premier contact

            if(touch)
            {
                // Activation du joystick
                this.touch.joystick.active = true

                // Sauvegarde de l'identifiant unique du contact pour le suivi multi-touch
                this.touch.joystick.touchIdentifier = touch.identifier

                // Mise à jour de la position actuelle du doigt
                this.touch.joystick.angle.current.x = touch.clientX
                this.touch.joystick.angle.current.y = touch.clientY

                // Augmentation de l'opacité de la limite pour feedback visuel
                this.touch.joystick.$limit.style.opacity = '0.5'

                // Ajout des écouteurs d'événements globaux pour le suivi du mouvement
                document.addEventListener('touchend', this.touch.joystick.events.touchend)
                document.addEventListener('touchmove', this.touch.joystick.events.touchmove, { passive: false })

                // Déclenchement de l'événement de début pour les autres systèmes
                this.trigger('joystickStart')
            }
        }

        // Gestion du mouvement tactile (touchmove)
        this.touch.joystick.events.touchmove = (_event) =>
        {
            _event.preventDefault()                                                 // Empêche le comportement par défaut

            const touches = [..._event.changedTouches]                              // Conversion en tableau
            const touch = touches.find((_touch) => _touch.identifier === this.touch.joystick.touchIdentifier)

            if(touch)
            {
                // Mise à jour de la position actuelle du doigt
                this.touch.joystick.angle.current.x = touch.clientX
                this.touch.joystick.angle.current.y = touch.clientY

                // Déclenchement de l'événement de mouvement pour les autres systèmes
                this.trigger('joystickMove')
            }
        }

        // Gestion de la fin de contact tactile (touchend)
        this.touch.joystick.events.touchend = (_event) =>
        {
            const touches = [..._event.changedTouches]                              // Conversion en tableau
            const touch = touches.find((_touch) => _touch.identifier === this.touch.joystick.touchIdentifier)

            if(touch)
            {
                // Désactivation du joystick
                this.touch.joystick.active = false

                // Restauration de l'opacité de la limite
                this.touch.joystick.$limit.style.opacity = '0.25'

                // Retour du curseur au centre avec animation
                this.touch.joystick.$cursor.style.transform = 'translateX(0px) translateY(0px)'

                // Suppression des écouteurs d'événements globaux
                document.removeEventListener('touchend', this.touch.joystick.events.touchend)

                // Déclenchement de l'événement de fin pour les autres systèmes
                this.trigger('joystickEnd')
            }
        }

        // Ajout de l'écouteur d'événement de début de contact sur l'élément joystick
        this.touch.joystick.$element.addEventListener('touchstart', this.touch.joystick.events.touchstart, { passive: false })

        /**
         * Configuration du Bouton Boost
         * 
         * Le bouton boost permet d'activer l'avancement rapide avec boost.
         * Il combine les actions up et boost pour une vitesse maximale.
         */
        this.touch.boost = {}

        // Création de l'élément principal du bouton boost
        this.touch.boost.$element = document.createElement('div')
        this.touch.boost.$element.style.userSelect = 'none'                            // Désactivation de la sélection de texte
        this.touch.boost.$element.style.position = 'fixed'                             // Position fixe sur l'écran
        this.touch.boost.$element.style.bottom = 'calc(70px * 3 + 15px)'              // Position en bas à droite (3ème bouton)
        this.touch.boost.$element.style.right = '0px'
        this.touch.boost.$element.style.width = '95px'                                 // Taille du bouton
        this.touch.boost.$element.style.height = '70px'
        this.touch.boost.$element.style.transition = 'opacity 0.3s 0.4s'              // Animation d'apparition avec délai (0.4s)
        this.touch.boost.$element.style.willChange = 'opacity'                         // Optimisation GPU
        this.touch.boost.$element.style.opacity = '0'                                  // Invisible par défaut
        // this.touch.boost.$element.style.backgroundColor = '#00ff00'                  // Debug (commenté)
        document.body.appendChild(this.touch.boost.$element)

        // Création de la bordure du bouton boost
        this.touch.boost.$border = document.createElement('div')
        this.touch.boost.$border.style.position = 'absolute'
        this.touch.boost.$border.style.top = 'calc(50% - 30px)'                        // Centrage vertical
        this.touch.boost.$border.style.left = 'calc(50% - 30px)'                       // Centrage horizontal
        this.touch.boost.$border.style.width = '60px'                                  // Taille de la bordure
        this.touch.boost.$border.style.height = '60px'
        this.touch.boost.$border.style.border = '2px solid #ffffff'                    // Bordure blanche
        this.touch.boost.$border.style.borderRadius = '10px'                           // Coins arrondis
        this.touch.boost.$border.style.boxSizing = 'border-box'                        // Inclure la bordure dans la taille
        this.touch.boost.$border.style.opacity = '0.25'                                // Transparence par défaut
        this.touch.boost.$border.style.willChange = 'opacity'                          // Optimisation GPU
        this.touch.boost.$element.appendChild(this.touch.boost.$border)

        // Création de l'icône du bouton boost (double triangle)
        this.touch.boost.$icon = document.createElement('div')
        this.touch.boost.$icon.style.position = 'absolute'
        this.touch.boost.$icon.style.top = 'calc(50% - 13px)'                          // Centrage vertical
        this.touch.boost.$icon.style.left = 'calc(50% - 11px)'                         // Centrage horizontal
        this.touch.boost.$icon.style.width = '22px'                                    // Taille de l'icône
        this.touch.boost.$icon.style.height = '26px'
        this.touch.boost.$icon.style.backgroundImage = `url(${mobileDoubleTriangle})`  // Image de l'icône
        this.touch.boost.$icon.style.backgroundSize = 'cover'                          // Ajustement de l'image
        this.touch.boost.$element.appendChild(this.touch.boost.$icon)

        // Configuration des événements tactiles du bouton boost
        this.touch.boost.events = {}
        this.touch.boost.touchIdentifier = null

        // Gestion du début de contact tactile sur le bouton boost
        this.touch.boost.events.touchstart = (_event) =>
        {
            _event.preventDefault()

            const touch = _event.changedTouches[0]

            if(touch)
            {
                // Réinitialisation du pan de caméra
                this.camera.pan.reset()

                // Sauvegarde de l'identifiant du contact
                this.touch.boost.touchIdentifier = touch.identifier

                // Activation des actions boost et avancer
                this.actions.up = true
                this.actions.boost = true

                // Augmentation de l'opacité de la bordure
                this.touch.boost.$border.style.opacity = '0.5'

                // Ajout de l'écouteur de fin de contact
                document.addEventListener('touchend', this.touch.boost.events.touchend)
            }
        }

        // Gestion de la fin de contact tactile sur le bouton boost
        this.touch.boost.events.touchend = (_event) =>
        {
            const touches = [..._event.changedTouches]
            const touch = touches.find((_touch) => _touch.identifier === this.touch.boost.touchIdentifier)

            if(touch)
            {
                // Désactivation des actions boost et avancer
                this.actions.up = false
                this.actions.boost = false

                // Restauration de l'opacité de la bordure
                this.touch.boost.$border.style.opacity = '0.25'

                // Suppression de l'écouteur de fin de contact
                document.removeEventListener('touchend', this.touch.boost.events.touchend)
            }
        }

        // Ajout de l'écouteur d'événement de début de contact
        this.touch.boost.$element.addEventListener('touchstart', this.touch.boost.events.touchstart)

        /**
         * Configuration du Bouton Forward (Avancer)
         */
        this.touch.forward = {}

        // Création de l'élément principal du bouton forward (2ème bouton en bas à droite)
        this.touch.forward.$element = document.createElement('div')
        this.touch.forward.$element.style.userSelect = 'none'
        this.touch.forward.$element.style.position = 'fixed'
        this.touch.forward.$element.style.bottom = 'calc(70px * 2 + 15px)'             // Position 2ème bouton
        this.touch.forward.$element.style.right = '0px'
        this.touch.forward.$element.style.width = '95px'
        this.touch.forward.$element.style.height = '70px'
        this.touch.forward.$element.style.transition = 'opacity 0.3s 0.3s'             // Animation avec délai
        this.touch.forward.$element.style.willChange = 'opacity'
        this.touch.forward.$element.style.opacity = '0'
        // this.touch.forward.$element.style.backgroundColor = '#00ff00'                 // Debug (commenté)
        document.body.appendChild(this.touch.forward.$element)

        this.touch.forward.$border = document.createElement('div')
        this.touch.forward.$border.style.position = 'absolute'
        this.touch.forward.$border.style.top = 'calc(50% - 30px)'
        this.touch.forward.$border.style.left = 'calc(50% - 30px)'
        this.touch.forward.$border.style.width = '60px'
        this.touch.forward.$border.style.height = '60px'
        this.touch.forward.$border.style.border = '2px solid #ffffff'
        this.touch.forward.$border.style.borderRadius = '10px'
        this.touch.forward.$border.style.boxSizing = 'border-box'
        this.touch.forward.$border.style.opacity = '0.25'
        this.touch.forward.$border.style.willChange = 'opacity'
        this.touch.forward.$element.appendChild(this.touch.forward.$border)

        this.touch.forward.$icon = document.createElement('div')
        this.touch.forward.$icon.style.position = 'absolute'
        this.touch.forward.$icon.style.top = 'calc(50% - 9px)'
        this.touch.forward.$icon.style.left = 'calc(50% - 11px)'
        this.touch.forward.$icon.style.width = '22px'
        this.touch.forward.$icon.style.height = '18px'
        this.touch.forward.$icon.style.backgroundImage = `url(${mobileTriangle})`
        this.touch.forward.$icon.style.backgroundSize = 'cover'
        this.touch.forward.$element.appendChild(this.touch.forward.$icon)

        // Events
        this.touch.forward.events = {}
        this.touch.forward.touchIdentifier = null
        this.touch.forward.events.touchstart = (_event) =>
        {
            _event.preventDefault()

            const touch = _event.changedTouches[0]

            if(touch)
            {
                this.camera.pan.reset()

                this.touch.forward.touchIdentifier = touch.identifier

                this.actions.up = true

                this.touch.forward.$border.style.opacity = '0.5'

                document.addEventListener('touchend', this.touch.forward.events.touchend)
            }
        }

        this.touch.forward.events.touchend = (_event) =>
        {
            const touches = [..._event.changedTouches]
            const touch = touches.find((_touch) => _touch.identifier === this.touch.forward.touchIdentifier)

            if(touch)
            {
                this.actions.up = false

                this.touch.forward.$border.style.opacity = '0.25'

                document.removeEventListener('touchend', this.touch.forward.events.touchend)
            }
        }

        this.touch.forward.$element.addEventListener('touchstart', this.touch.forward.events.touchstart)

        /**
         * Configuration du Bouton Brake (Frein)
         */
        this.touch.brake = {}

        // Element
        this.touch.brake.$element = document.createElement('div')
        this.touch.brake.$element.style.userSelect = 'none'
        this.touch.brake.$element.style.position = 'fixed'
        this.touch.brake.$element.style.bottom = 'calc(70px + 15px)'
        this.touch.brake.$element.style.right = '0px'
        this.touch.brake.$element.style.width = '95px'
        this.touch.brake.$element.style.height = '70px'
        this.touch.brake.$element.style.transition = 'opacity 0.3s 0.2s'
        this.touch.brake.$element.style.willChange = 'opacity'
        this.touch.brake.$element.style.opacity = '0'
        // this.touch.brake.$element.style.backgroundColor = '#ff0000'
        document.body.appendChild(this.touch.brake.$element)

        this.touch.brake.$border = document.createElement('div')
        this.touch.brake.$border.style.position = 'absolute'
        this.touch.brake.$border.style.top = 'calc(50% - 30px)'
        this.touch.brake.$border.style.left = 'calc(50% - 30px)'
        this.touch.brake.$border.style.width = '60px'
        this.touch.brake.$border.style.height = '60px'
        this.touch.brake.$border.style.border = '2px solid #ffffff'
        this.touch.brake.$border.style.borderRadius = '10px'
        this.touch.brake.$border.style.boxSizing = 'border-box'
        this.touch.brake.$border.style.opacity = '0.25'
        this.touch.brake.$border.style.willChange = 'opacity'
        this.touch.brake.$element.appendChild(this.touch.brake.$border)

        this.touch.brake.$icon = document.createElement('div')
        this.touch.brake.$icon.style.position = 'absolute'
        this.touch.brake.$icon.style.top = 'calc(50% - 7px)'
        this.touch.brake.$icon.style.left = 'calc(50% - 7px)'
        this.touch.brake.$icon.style.width = '15px'
        this.touch.brake.$icon.style.height = '15px'
        this.touch.brake.$icon.style.backgroundImage = `url(${mobileCross})`
        this.touch.brake.$icon.style.backgroundSize = 'cover'
        this.touch.brake.$icon.style.transform = 'rotate(180deg)'
        this.touch.brake.$element.appendChild(this.touch.brake.$icon)

        // Events
        this.touch.brake.events = {}
        this.touch.brake.touchIdentifier = null
        this.touch.brake.events.touchstart = (_event) =>
        {
            _event.preventDefault()

            const touch = _event.changedTouches[0]

            if(touch)
            {
                this.touch.brake.touchIdentifier = touch.identifier

                this.actions.brake = true

                this.touch.brake.$border.style.opacity = '0.5'

                document.addEventListener('touchend', this.touch.brake.events.touchend)
            }
        }

        this.touch.brake.events.touchend = (_event) =>
        {
            const touches = [..._event.changedTouches]
            const touch = touches.find((_touch) => _touch.identifier === this.touch.brake.touchIdentifier)

            if(touch)
            {
                this.actions.brake = false

                this.touch.brake.$border.style.opacity = '0.25'

                document.removeEventListener('touchend', this.touch.brake.events.touchend)
            }
        }

        this.touch.brake.$element.addEventListener('touchstart', this.touch.brake.events.touchstart)

        /**
         * Configuration du Bouton Backward (Reculer)
         */
        this.touch.backward = {}

        // Element
        this.touch.backward.$element = document.createElement('div')
        this.touch.backward.$element.style.userSelect = 'none'
        this.touch.backward.$element.style.position = 'fixed'
        this.touch.backward.$element.style.bottom = '15px'
        this.touch.backward.$element.style.right = '0px'
        this.touch.backward.$element.style.width = '95px'
        this.touch.backward.$element.style.height = '70px'
        this.touch.backward.$element.style.transition = 'opacity 0.3s 0.1s'
        this.touch.backward.$element.style.willChange = 'opacity'
        this.touch.backward.$element.style.opacity = '0'
        // this.touch.backward.$element.style.backgroundColor = '#0000ff'
        document.body.appendChild(this.touch.backward.$element)

        this.touch.backward.$border = document.createElement('div')
        this.touch.backward.$border.style.position = 'absolute'
        this.touch.backward.$border.style.top = 'calc(50% - 30px)'
        this.touch.backward.$border.style.left = 'calc(50% - 30px)'
        this.touch.backward.$border.style.width = '60px'
        this.touch.backward.$border.style.height = '60px'
        this.touch.backward.$border.style.border = '2px solid #ffffff'
        this.touch.backward.$border.style.borderRadius = '10px'
        this.touch.backward.$border.style.boxSizing = 'border-box'
        this.touch.backward.$border.style.opacity = '0.25'
        this.touch.backward.$border.style.willChange = 'opacity'
        this.touch.backward.$element.appendChild(this.touch.backward.$border)

        this.touch.backward.$icon = document.createElement('div')
        this.touch.backward.$icon.style.position = 'absolute'
        this.touch.backward.$icon.style.top = 'calc(50% - 9px)'
        this.touch.backward.$icon.style.left = 'calc(50% - 11px)'
        this.touch.backward.$icon.style.width = '22px'
        this.touch.backward.$icon.style.height = '18px'
        this.touch.backward.$icon.style.backgroundImage = `url(${mobileTriangle})`
        this.touch.backward.$icon.style.backgroundSize = 'cover'
        this.touch.backward.$icon.style.transform = 'rotate(180deg)'
        this.touch.backward.$element.appendChild(this.touch.backward.$icon)

        // Events
        this.touch.backward.events = {}
        this.touch.backward.touchIdentifier = null
        this.touch.backward.events.touchstart = (_event) =>
        {
            _event.preventDefault()

            const touch = _event.changedTouches[0]

            if(touch)
            {
                this.camera.pan.reset()

                this.touch.backward.touchIdentifier = touch.identifier

                this.actions.down = true

                this.touch.backward.$border.style.opacity = '0.5'

                document.addEventListener('touchend', this.touch.backward.events.touchend)
            }
        }

        this.touch.backward.events.touchend = (_event) =>
        {
            const touches = [..._event.changedTouches]
            const touch = touches.find((_touch) => _touch.identifier === this.touch.backward.touchIdentifier)

            if(touch)
            {
                this.actions.down = false

                this.touch.backward.$border.style.opacity = '0.25'

                document.removeEventListener('touchend', this.touch.backward.events.touchend)
            }
        }

        this.touch.backward.$element.addEventListener('touchstart', this.touch.backward.events.touchstart)

        // Fonction de révélation des contrôles tactiles
        this.touch.reveal = () =>
        {
            // Affichage de tous les éléments tactiles avec leurs animations d'apparition
            // Les délais d'animation sont définis dans les styles CSS de chaque élément
            this.touch.joystick.$element.style.opacity = 1                           // Joystick (délai 0.0s)
            this.touch.backward.$element.style.opacity = 1                           // Bouton recul (délai 0.1s)
            this.touch.brake.$element.style.opacity = 1                              // Bouton frein (délai 0.2s)
            this.touch.forward.$element.style.opacity = 1                            // Bouton avancer (délai 0.3s)
            this.touch.boost.$element.style.opacity = 1                              // Bouton boost (délai 0.4s)
        }
    }
}
