/**
 * AREAS.JS - Gestionnaire de Zones Interactives
 *
 * Ce fichier définit le gestionnaire de toutes les zones interactives
 * dans l'environnement 3D du portfolio. Il gère la détection de la souris,
 * les raycasting et les interactions avec les zones.
 *
 * RESPONSABILITÉS :
 * - Gestion de toutes les zones interactives
 * - Détection de la souris et raycasting
 * - Gestion des événements tactiles
 * - Coordination des interactions entre zones
 *
 * CARACTÉRISTIQUES :
 * - Système de raycasting pour la détection de la souris
 * - Support tactile et clavier
 * - Gestion des zones multiples
 * - Animation des transitions entre zones
 *
 * UTILISATION :
 * - Création et gestion des zones cliquables
 * - Détection des interactions utilisateur
 * - Coordination des effets visuels
 * - Gestion des événements d'entrée/sortie
 */

import * as THREE from 'three'

import Area from './Area.js'

export default class Areas
{
    /**
     * Constructor - Initialisation du gestionnaire de zones
     *
     * Initialise le gestionnaire de zones interactives avec les options fournies
     * et configure le système de détection de la souris.
     *
     * @param {Object} _options - Options de configuration
     * @param {Object} _options.config - Configuration de l'application
     * @param {Object} _options.resources - Gestionnaire de ressources
     * @param {Object} _options.car - Instance de la voiture
     * @param {Object} _options.sounds - Gestionnaire de sons
     * @param {Object} _options.renderer - Rendu Three.js
     * @param {Object} _options.camera - Instance de caméra
     * @param {Object} _options.time - Instance de gestion du temps
     * @param {Object} _options.debug - Interface de debug
     */
    constructor(_options)
    {
        // Stockage des options de configuration
        this.config = _options.config
        this.resources = _options.resources
        this.car = _options.car
        this.sounds = _options.sounds
        this.renderer = _options.renderer
        this.camera = _options.camera
        this.time = _options.time
        this.debug = _options.debug

        // Configuration des conteneurs
        this.items = []                                                             // Liste des zones
        this.container = new THREE.Object3D()
        this.container.matrixAutoUpdate = false

        // Initialisation du système de détection de la souris
        this.setMouse()
    }

    /**
     * SetMouse - Configuration du système de détection de la souris
     * 
     * Configure le système de raycasting pour détecter les interactions
     * avec les zones, incluant le support tactile et clavier.
     */
    setMouse()
    {
        // Configuration du système de détection
        this.mouse = {}
        this.mouse.raycaster = new THREE.Raycaster()                               // Raycaster pour la détection
        this.mouse.coordinates = new THREE.Vector2()                              // Coordonnées normalisées
        this.mouse.currentArea = null                                             // Zone actuellement survolée
        this.mouse.needsUpdate = false                                            // Flag de mise à jour

        // Gestion du mouvement de la souris
        window.addEventListener('mousemove', (_event) =>
        {
            // Conversion des coordonnées en coordonnées normalisées (-1 à 1)
            this.mouse.coordinates.x = (_event.clientX / window.innerWidth) * 2 - 1
            this.mouse.coordinates.y = - (_event.clientY / window.innerHeight) * 2 + 1

            this.mouse.needsUpdate = true
        })

        // Gestion du clic de la souris
        window.addEventListener('mousedown', () =>
        {
            if(this.mouse.currentArea)
            {
                this.mouse.currentArea.interact(false)                             // Interaction sans afficher la clé
            }
        })

        // Gestion des événements tactiles
        this.renderer.domElement.addEventListener('touchstart', (_event) =>
        {
            // Conversion des coordonnées tactiles en coordonnées normalisées
            this.mouse.coordinates.x = (_event.changedTouches[0].clientX / window.innerWidth) * 2 - 1
            this.mouse.coordinates.y = - (_event.changedTouches[0].clientY / window.innerHeight) * 2 + 1

            this.mouse.needsUpdate = true
        })

        // Boucle de détection des intersections
        this.time.on('tick', () =>
        {
            // Mise à jour uniquement si nécessaire
            if(this.mouse.needsUpdate)
            {
                this.mouse.needsUpdate = false

                // Configuration du raycasting
                this.mouse.raycaster.setFromCamera(this.mouse.coordinates, this.camera.instance)
                const objects = this.items.map((_area) => _area.mouseMesh)         // Récupération des meshes de détection
                const intersects = this.mouse.raycaster.intersectObjects(objects)  // Calcul des intersections

                // Intersections trouvées
                if(intersects.length)
                {
                    // Recherche de la zone correspondante
                    const area = this.items.find((_area) => _area.mouseMesh === intersects[0].object)

                    // Changement de zone
                    if(area !== this.mouse.currentArea)
                    {
                        // Sortie de la zone précédente
                        if(this.mouse.currentArea !== null)
                        {
                            this.mouse.currentArea.out()                           // Animation de sortie
                            this.mouse.currentArea.testCar = this.mouse.currentArea.initialTestCar // Restauration du test de voiture
                        }

                        // Entrée dans la nouvelle zone
                        this.mouse.currentArea = area
                        this.mouse.currentArea.in(false)                           // Animation d'entrée (sans clé)
                        this.mouse.currentArea.testCar = false                     // Désactivation du test de voiture
                    }
                }
                // Aucune intersection mais était précédemment sur une zone
                else if(this.mouse.currentArea !== null)
                {
                    // Sortie de la zone
                    this.mouse.currentArea.out()                                   // Animation de sortie
                    this.mouse.currentArea.testCar = this.mouse.currentArea.initialTestCar // Restauration du test de voiture
                    this.mouse.currentArea = null                                  // Réinitialisation de la zone actuelle
                }
            }
        })
    }

    /**
     * Add - Ajout d'une zone interactive
     * 
     * Crée une nouvelle zone interactive et l'ajoute au gestionnaire
     * avec les options par défaut et personnalisées.
     *
     * @param {Object} _options - Options de configuration de la zone
     * @returns {Area} Instance de la zone créée
     */
    add(_options)
    {
        // Création de la zone avec options par défaut et personnalisées
        const area = new Area({
            config: this.config,
            renderer: this.renderer,
            resources: this.resources,
            car: this.car,
            sounds: this.sounds,
            time: this.time,
            hasKey: true,                                                           // Clé d'interaction par défaut
            testCar: true,                                                          // Test de collision avec la voiture par défaut
            active: true,                                                           // Zone active par défaut
            ..._options                                                             // Options personnalisées
        })

        // Ajout de la zone au conteneur
        this.container.add(area.container)

        // Ajout de la zone à la liste
        this.items.push(area)

        // Retour de l'instance de la zone
        return area
    }
}
