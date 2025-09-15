/**
 * WORLD/SOUNDS.JS - Système Audio Complet
 *
 * Ce fichier gère le système audio complet du portfolio, utilisant Howler.js
 * pour la lecture des sons. Il inclut les effets sonores, le moteur de voiture
 * dynamique, la gestion du volume et du mute, ainsi que des optimisations
 * de performance.
 *
 * RESPONSABILITÉS :
 * - Gestion de tous les effets sonores du portfolio
 * - Système de moteur de voiture dynamique
 * - Contrôle du volume principal et du mute
 * - Gestion des événements clavier et de visibilité
 * - Optimisations de performance audio
 * - Interface de debug complète
 *
 * SYSTÈMES GÉRÉS :
 * - Effets sonores : Collisions, interactions, UI
 * - Moteur de voiture : Son dynamique selon vitesse/accélération
 * - Volume : Contrôle global et individuel
 * - Mute : Gestion automatique et manuelle
 * - Performance : Limitation de fréquence et optimisation
 *
 * TYPES DE SONS :
 * - Reveal : Sons de révélation d'objets
 * - Brick : Sons de collision avec briques
 * - Bowling : Sons de bowling (quilles et boule)
 * - CarHit : Sons de collision de voiture
 * - WoodHit : Sons de collision avec bois
 * - Screech : Sons de crissement de pneus
 * - UI : Sons d'interface utilisateur
 * - Horn : Sons de klaxon
 * - Engine : Son de moteur de voiture
 *
 * FONCTIONNALITÉS AVANCÉES :
 * - Sons basés sur la vélocité avec variation
 * - Limitation de fréquence pour éviter le spam
 * - Variation aléatoire de pitch et volume
 * - Moteur dynamique avec easing
 * - Gestion automatique du mute en arrière-plan
 * - Raccourci clavier pour mute (M)
 *
 * ARCHITECTURE :
 * - Pattern de gestionnaire centralisé
 * - Configuration déclarative des sons
 * - Système d'événements pour les mises à jour
 * - Interface de debug complète
 * - Optimisations de performance
 *
 * OPTIMISATIONS :
 * - Sons préchargés avec Howler.js
 * - Limitation de fréquence de lecture
 * - Gestion intelligente du mute
 * - Variation aléatoire pour éviter la répétition
 * - Easing pour transitions fluides
 */

import { Howl, Howler } from 'howler'

export default class Sounds
{
    /**
     * Constructor - Initialisation du système audio
     *
     * Initialise le système audio complet avec Howler.js, configure tous les
     * sons, le volume, le mute et le moteur de voiture.
     *
     * @param {Object} _options - Options de configuration
     * @param {Object} _options.time - Gestionnaire du temps (Time.js)
     * @param {Object} _options.debug - Interface de debug (dat.GUI)
     */
    constructor(_options)
    {
        // Stockage des options de configuration
        this.time = _options.time                                                          // Gestionnaire du temps
        this.debug = _options.debug                                                        // Interface de debug

        // Configuration de l'interface de debug
        if(this.debug)
        {
            this.debugFolder = this.debug.addFolder('sounds')                             // Dossier de debug pour les sons
            // this.debugFolder.open()                                                     // Ouverture automatique (commentée)
        }

        // Configuration du système
        this.items = []                                                                   // Liste des sons configurés

        // Initialisation des systèmes
        this.setSettings()                                                                // Configuration des sons
        this.setMasterVolume()                                                            // Configuration du volume principal
        this.setMute()                                                                    // Configuration du mute
        this.setEngine()                                                                  // Configuration du moteur de voiture
    }

    /**
     * SetSettings - Configuration de tous les sons
     *
     * Définit la configuration complète de tous les sons utilisés dans le portfolio.
     * Chaque son a des paramètres spécifiques pour la vélocité, le volume, le pitch
     * et la fréquence de lecture.
     *
     * PARAMÈTRES DE CONFIGURATION :
     * - name : Nom unique du son
     * - sounds : Liste des fichiers audio (pour variation)
     * - minDelta : Délai minimum entre deux lectures (ms)
     * - velocityMin : Vélocité minimum pour déclencher le son
     * - velocityMultiplier : Multiplicateur de vélocité pour le volume
     * - volumeMin/Max : Plage de volume
     * - rateMin/Max : Plage de pitch (vitesse de lecture)
     */
    setSettings()
    {
        this.settings = [
            // Son de révélation d'objets
            {
                name: 'reveal',
                sounds: ['./sounds/reveal/reveal-1.mp3'],
                minDelta: 100,                                                           // Délai minimum entre lectures
                velocityMin: 0,                                                          // Pas de vélocité minimum
                velocityMultiplier: 1,                                                   // Multiplicateur de vélocité
                volumeMin: 1,                                                            // Volume minimum
                volumeMax: 1,                                                            // Volume maximum
                rateMin: 1,                                                              // Pitch minimum
                rateMax: 1                                                               // Pitch maximum
            },
            // Sons de collision avec briques (multiple variantes)
            {
                name: 'brick',
                sounds: ['./sounds/bricks/brick-1.mp3', './sounds/bricks/brick-2.mp3', './sounds/bricks/brick-4.mp3', './sounds/bricks/brick-6.mp3', './sounds/bricks/brick-7.mp3', './sounds/bricks/brick-8.mp3'],
                minDelta: 100,                                                           // Délai minimum entre lectures
                velocityMin: 1,                                                          // Vélocité minimum requise
                velocityMultiplier: 0.75,                                                // Multiplicateur de vélocité
                volumeMin: 0.2,                                                          // Volume minimum
                volumeMax: 0.85,                                                         // Volume maximum
                rateMin: 0.5,                                                            // Pitch minimum
                rateMax: 0.75                                                            // Pitch maximum
            },
            // Son de quille de bowling
            {
                name: 'bowlingPin',
                sounds: ['./sounds/bowling/pin-1.mp3'],
                minDelta: 0,                                                              // Pas de délai minimum
                velocityMin: 1,                                                          // Vélocité minimum requise
                velocityMultiplier: 0.5,                                                 // Multiplicateur de vélocité
                volumeMin: 0.35,                                                         // Volume minimum
                volumeMax: 1,                                                            // Volume maximum
                rateMin: 0.1,                                                            // Pitch minimum
                rateMax: 0.85                                                            // Pitch maximum
            },
            // Son de boule de bowling
            {
                name: 'bowlingBall',
                sounds: ['./sounds/bowling/pin-1.mp3', './sounds/bowling/pin-1.mp3', './sounds/bowling/pin-1.mp3'],
                minDelta: 0,                                                              // Pas de délai minimum
                velocityMin: 1,                                                          // Vélocité minimum requise
                velocityMultiplier: 0.5,                                                 // Multiplicateur de vélocité
                volumeMin: 0.35,                                                         // Volume minimum
                volumeMax: 1,                                                            // Volume maximum
                rateMin: 0.1,                                                            // Pitch minimum
                rateMax: 0.2                                                             // Pitch maximum
            },
            // Sons de collision de voiture (multiple variantes)
            {
                name: 'carHit',
                sounds: ['./sounds/car-hits/car-hit-1.mp3', './sounds/car-hits/car-hit-3.mp3', './sounds/car-hits/car-hit-4.mp3', './sounds/car-hits/car-hit-5.mp3'],
                minDelta: 100,                                                           // Délai minimum entre lectures
                velocityMin: 2,                                                          // Vélocité minimum requise
                velocityMultiplier: 1,                                                   // Multiplicateur de vélocité
                volumeMin: 0.2,                                                          // Volume minimum
                volumeMax: 0.6,                                                          // Volume maximum
                rateMin: 0.35,                                                           // Pitch minimum
                rateMax: 0.55                                                            // Pitch maximum
            },
            // Son de collision avec bois
            {
                name: 'woodHit',
                sounds: ['./sounds/wood-hits/wood-hit-1.mp3'],
                minDelta: 30,                                                            // Délai minimum entre lectures
                velocityMin: 1,                                                          // Vélocité minimum requise
                velocityMultiplier: 1,                                                   // Multiplicateur de vélocité
                volumeMin: 0.5,                                                          // Volume minimum
                volumeMax: 1,                                                            // Volume maximum
                rateMin: 0.75,                                                           // Pitch minimum
                rateMax: 1.5                                                             // Pitch maximum
            },
            // Son de crissement de pneus
            {
                name: 'screech',
                sounds: ['./sounds/screeches/screech-1.mp3'],
                minDelta: 1000,                                                          // Délai minimum entre lectures
                velocityMin: 0,                                                          // Pas de vélocité minimum
                velocityMultiplier: 1,                                                   // Multiplicateur de vélocité
                volumeMin: 0.75,                                                         // Volume minimum
                volumeMax: 1,                                                            // Volume maximum
                rateMin: 0.9,                                                            // Pitch minimum
                rateMax: 1.1                                                             // Pitch maximum
            },
            // Son d'interface utilisateur (zone)
            {
                name: 'uiArea',
                sounds: ['./sounds/ui/area-1.mp3'],
                minDelta: 100,                                                           // Délai minimum entre lectures
                velocityMin: 0,                                                          // Pas de vélocité minimum
                velocityMultiplier: 1,                                                   // Multiplicateur de vélocité
                volumeMin: 0.75,                                                         // Volume minimum
                volumeMax: 1,                                                            // Volume maximum
                rateMin: 0.95,                                                           // Pitch minimum
                rateMax: 1.05                                                            // Pitch maximum
            },
            // Premier klaxon de voiture
            {
                name: 'carHorn1',
                sounds: ['./sounds/car-horns/car-horn-1.mp3'],
                minDelta: 0,                                                              // Pas de délai minimum
                velocityMin: 0,                                                          // Pas de vélocité minimum
                velocityMultiplier: 1,                                                   // Multiplicateur de vélocité
                volumeMin: 0.95,                                                         // Volume minimum
                volumeMax: 1,                                                            // Volume maximum
                rateMin: 1,                                                              // Pitch minimum
                rateMax: 1                                                               // Pitch maximum
            },
            // Deuxième klaxon de voiture
            {
                name: 'carHorn2',
                sounds: ['./sounds/car-horns/car-horn-2.mp3'],
                minDelta: 0,                                                              // Pas de délai minimum
                velocityMin: 0,                                                          // Pas de vélocité minimum
                velocityMultiplier: 1,                                                   // Multiplicateur de vélocité
                volumeMin: 0.95,                                                         // Volume minimum
                volumeMax: 1,                                                            // Volume maximum
                rateMin: 1,                                                              // Pitch minimum
                rateMax: 1                                                               // Pitch maximum
            },
            // Sons de klaxon génériques (multiple variantes)
            {
                name: 'horn',
                sounds: ['./sounds/horns/horn-1.mp3', './sounds/horns/horn-2.mp3', './sounds/horns/horn-3.mp3'],
                minDelta: 100,                                                           // Délai minimum entre lectures
                velocityMin: 1,                                                          // Vélocité minimum requise
                velocityMultiplier: 0.75,                                                // Multiplicateur de vélocité
                volumeMin: 0.5,                                                          // Volume minimum
                volumeMax: 1,                                                            // Volume maximum
                rateMin: 0.75,                                                           // Pitch minimum
                rateMax: 1                                                               // Pitch maximum
            }
        ]

        // Création de tous les sons configurés
        for(const _settings of this.settings)
        {
            this.add(_settings)                                                           // Ajout de chaque son à la liste
        }
    }

    /**
     * SetMasterVolume - Configuration du volume principal
     *
     * Configure le volume principal de tous les sons et fournit
     * une interface de debug pour l'ajuster en temps réel.
     *
     * FONCTIONNALITÉS :
     * - Volume principal global pour tous les sons
     * - Application via Howler.js
     * - Double application pour assurer la prise en compte
     * - Interface de debug pour ajustement
     */
    setMasterVolume()
    {
        // Configuration du volume principal
        this.masterVolume = 0.5                                                          // Volume par défaut (50%)
        Howler.volume(this.masterVolume)                                                 // Application du volume

        // Double application pour assurer la prise en compte
        window.requestAnimationFrame(() =>
        {
            Howler.volume(this.masterVolume)                                             // Réapplication du volume
        })

        // Interface de debug pour le volume
        if(this.debug)
        {
            this.debugFolder.add(this, 'masterVolume').step(0.001).min(0).max(1).onChange(() =>
            {
                Howler.volume(this.masterVolume)                                         // Mise à jour du volume lors du changement
            })
        }
    }

    /**
     * SetMute - Configuration du système de mute
     *
     * Configure le système de mute avec gestion automatique et manuelle.
     * Inclut un raccourci clavier, une gestion de la visibilité de la page
     * et une interface de debug.
     *
     * FONCTIONNALITÉS :
     * - Mute automatique en mode debug
     * - Raccourci clavier (M) pour basculer le mute
     * - Mute automatique quand la page est en arrière-plan
     * - Interface de debug pour contrôler le mute
     * - Gestion de la visibilité de la page
     */
    setMute()
    {
        // Configuration du mute
        this.muted = typeof this.debug !== 'undefined'                                   // Mute automatique en mode debug
        Howler.mute(this.muted)                                                          // Application du mute

        // Raccourci clavier pour basculer le mute
        window.addEventListener('keydown', (_event) =>
        {
            if(_event.key === 'm')                                                       // Touche M
            {
                this.muted = !this.muted                                                 // Basculement du mute
                Howler.mute(this.muted)                                                  // Application du nouveau état
            }
        })

        // Gestion de la visibilité de la page
        document.addEventListener('visibilitychange', () =>
        {
            if(document.hidden)                                                          // Page en arrière-plan
            {
                Howler.mute(true)                                                        // Mute automatique
            }
            else
            {
                Howler.mute(this.muted)                                                  // Restauration de l'état précédent
            }
        })

        // Interface de debug pour le mute
        if(this.debug)
        {
            this.debugFolder.add(this, 'muted').listen().onChange(() =>
            {
                Howler.mute(this.muted)                                                  // Mise à jour du mute lors du changement
            })
        }
    }

    /**
     * SetEngine - Configuration du système de moteur de voiture
     *
     * Configure le système de moteur de voiture avec son dynamique qui s'adapte
     * à la vitesse et à l'accélération. Utilise un easing pour des transitions
     * fluides et des paramètres configurables.
     *
     * FONCTIONNALITÉS :
     * - Son de moteur en boucle continue
     * - Adaptation dynamique selon vitesse et accélération
     * - Easing différencié pour montée et descente
     * - Contrôle du pitch et du volume
     * - Interface de debug complète
     *
     * PARAMÈTRES :
     * - Progress : Progression du moteur (0-1)
     * - Speed/Acceleration : Valeurs d'entrée du système de physique
     * - Rate : Plage de pitch du son
     * - Volume : Plage de volume du son
     * - Easing : Vitesse de transition
     */
    setEngine()
    {
        // Configuration du moteur
        this.engine = {}

        // Paramètres de progression
        this.engine.progress = 0                                                         // Progression actuelle (0-1)
        this.engine.progressEasingUp = 0.3                                               // Vitesse de montée
        this.engine.progressEasingDown = 0.15                                            // Vitesse de descente

        // Paramètres d'entrée
        this.engine.speed = 0                                                            // Vitesse de la voiture
        this.engine.speedMultiplier = 2.5                                                // Multiplicateur de vitesse
        this.engine.acceleration = 0                                                     // Accélération de la voiture
        this.engine.accelerationMultiplier = 0.4                                         // Multiplicateur d'accélération

        // Paramètres de pitch
        this.engine.rate = {}
        this.engine.rate.min = 0.4                                                       // Pitch minimum
        this.engine.rate.max = 1.4                                                       // Pitch maximum

        // Paramètres de volume
        this.engine.volume = {}
        this.engine.volume.min = 0.4                                                     // Volume minimum
        this.engine.volume.max = 1                                                       // Volume maximum
        this.engine.volume.master = 0                                                    // Volume maître (contrôlé par le système)

        // Création du son de moteur
        this.engine.sound = new Howl({
            src: ['./sounds/engines/1/low_off.mp3'],                                     // Fichier audio du moteur
            loop: true                                                                   // Lecture en boucle
        })

        this.engine.sound.play()                                                         // Démarrage du son

        // Boucle de mise à jour du moteur
        this.time.on('tick', () =>
        {
            // Calcul de la progression cible
            let progress = Math.abs(this.engine.speed) * this.engine.speedMultiplier + Math.max(this.engine.acceleration, 0) * this.engine.accelerationMultiplier
            progress = Math.min(Math.max(progress, 0), 1)                                // Clamp entre 0 et 1

            // Application de l'easing différencié
            this.engine.progress += (progress - this.engine.progress) * this.engine[progress > this.engine.progress ? 'progressEasingUp' : 'progressEasingDown']

            // Mise à jour du pitch
            const rateAmplitude = this.engine.rate.max - this.engine.rate.min
            this.engine.sound.rate(this.engine.rate.min + rateAmplitude * this.engine.progress)

            // Mise à jour du volume
            const volumeAmplitude = this.engine.volume.max - this.engine.volume.min
            this.engine.sound.volume((this.engine.volume.min + volumeAmplitude * this.engine.progress) * this.engine.volume.master)
        })

        // Interface de debug pour le moteur
        if(this.debug)
        {
            const folder = this.debugFolder.addFolder('engine')                          // Dossier de debug pour le moteur
            folder.open()                                                                // Ouverture automatique

            // Contrôles des paramètres d'easing
            folder.add(this.engine, 'progressEasingUp').step(0.001).min(0).max(1).name('progressEasingUp')
            folder.add(this.engine, 'progressEasingDown').step(0.001).min(0).max(1).name('progressEasingDown')
            
            // Contrôles des paramètres de pitch
            folder.add(this.engine.rate, 'min').step(0.001).min(0).max(4).name('rateMin')
            folder.add(this.engine.rate, 'max').step(0.001).min(0).max(4).name('rateMax')
            
            // Contrôles des multiplicateurs
            folder.add(this.engine, 'speedMultiplier').step(0.01).min(0).max(5).name('speedMultiplier')
            folder.add(this.engine, 'accelerationMultiplier').step(0.01).min(0).max(100).name('accelerationMultiplier')
            
            // Contrôle de la progression (lecture seule)
            folder.add(this.engine, 'progress').step(0.01).min(0).max(1).name('progress').listen()
        }
    }

    /**
     * Add - Ajout d'un son à la liste
     *
     * Crée un objet son avec tous ses paramètres et précharge les fichiers
     * audio avec Howler.js pour une lecture optimisée.
     *
     * @param {Object} _options - Configuration du son
     * @param {string} _options.name - Nom unique du son
     * @param {Array} _options.sounds - Liste des fichiers audio
     * @param {number} _options.minDelta - Délai minimum entre lectures
     * @param {number} _options.velocityMin - Vélocité minimum requise
     * @param {number} _options.velocityMultiplier - Multiplicateur de vélocité
     * @param {number} _options.volumeMin - Volume minimum
     * @param {number} _options.volumeMax - Volume maximum
     * @param {number} _options.rateMin - Pitch minimum
     * @param {number} _options.rateMax - Pitch maximum
     */
    add(_options)
    {
        // Création de l'objet son
        const item = {
            name: _options.name,                                                          // Nom unique du son
            minDelta: _options.minDelta,                                                  // Délai minimum entre lectures
            velocityMin: _options.velocityMin,                                            // Vélocité minimum requise
            velocityMultiplier: _options.velocityMultiplier,                              // Multiplicateur de vélocité
            volumeMin: _options.volumeMin,                                                // Volume minimum
            volumeMax: _options.volumeMax,                                                // Volume maximum
            rateMin: _options.rateMin,                                                    // Pitch minimum
            rateMax: _options.rateMax,                                                    // Pitch maximum
            lastTime: 0,                                                                  // Dernière lecture
            sounds: []                                                                    // Liste des instances Howl
        }

        // Préchargement des fichiers audio
        for(const _sound of _options.sounds)
        {
            const sound = new Howl({ src: [_sound] })                                     // Création de l'instance Howl

            item.sounds.push(sound)                                                       // Ajout à la liste
        }

        this.items.push(item)                                                             // Ajout à la liste globale
    }

    /**
     * Play - Lecture d'un son avec paramètres dynamiques
     *
     * Joue un son avec des paramètres dynamiques basés sur la vélocité.
     * Inclut des vérifications de fréquence, de vélocité minimum et des
     * variations aléatoires pour éviter la répétition.
     *
     * @param {string} _name - Nom du son à jouer
     * @param {number} _velocity - Vélocité pour calculer volume et pitch
     *
     * LOGIQUE DE LECTURE :
     * 1. Vérification de l'existence du son
     * 2. Vérification du délai minimum (anti-spam)
     * 3. Vérification de la vélocité minimum
     * 4. Sélection aléatoire d'une variante
     * 5. Calcul du volume basé sur la vélocité
     * 6. Calcul du pitch avec variation aléatoire
     * 7. Lecture du son
     * 8. Sauvegarde du temps de lecture
     */
    play(_name, _velocity)
    {
        // Recherche du son dans la liste
        const item = this.items.find((_item) => _item.name === _name)
        const time = Date.now()                                                           // Temps actuel
        const velocity = typeof _velocity === 'undefined' ? 0 : _velocity                 // Vélocité par défaut

        // Vérifications avant lecture
        if(item && time > item.lastTime + item.minDelta && (item.velocityMin === 0 || velocity > item.velocityMin))
        {
            // Sélection aléatoire d'une variante du son
            const sound = item.sounds[Math.floor(Math.random() * item.sounds.length)]

            // Calcul du volume basé sur la vélocité
            let volume = Math.min(Math.max((velocity - item.velocityMin) * item.velocityMultiplier, item.volumeMin), item.volumeMax)
            volume = Math.pow(volume, 2)                                                  // Application d'une courbe quadratique
            sound.volume(volume)                                                          // Application du volume

            // Calcul du pitch avec variation aléatoire
            const rateAmplitude = item.rateMax - item.rateMin
            sound.rate(item.rateMin + Math.random() * rateAmplitude)                      // Pitch aléatoire dans la plage

            // Lecture du son
            sound.play()

            // Sauvegarde du temps de lecture pour éviter le spam
            item.lastTime = time
        }
    }
}
