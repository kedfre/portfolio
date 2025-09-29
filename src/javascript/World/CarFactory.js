/**
 * CARFACTORY.JS - Factory pour la Sélection des Voitures
 *
 * Ce fichier gère la création et la sélection des différentes voitures disponibles
 * dans le portfolio. Il utilise le pattern Factory pour instancier la bonne classe
 * de voiture selon la configuration.
 *
 * RESPONSABILITÉS :
 * - Détection du type de voiture demandé
 * - Instanciation de la bonne classe de voiture
 * - Gestion de la configuration des voitures
 * - Interface unifiée pour toutes les voitures
 *
 * VOITURES SUPPORTÉES :
 * - Car : Voiture par défaut et CyberTruck
 * - DukeHazzardCar : Voiture Duke Hazzard avec caractéristiques uniques
 *
 * UTILISATION :
 * - Factory pattern pour la sélection des voitures
 * - Configuration via URL hash ou paramètres
 * - Interface unifiée pour toutes les voitures
 */

import Car from './Car.js'
import DukeHazzardCar from './DukeHazzardCar.js'

export default class CarFactory
{
    /**
     * Constructor - Initialisation de la factory de voitures
     *
     * Initialise la factory qui gère la création et la sélection des différentes
     * voitures disponibles dans le portfolio.
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
        // Stockage des options de configuration
        this.options = _options
        this.car = null
        this.carType = null

        // Création de la voiture selon la configuration
        this.createCar()
    }

    /**
     * CreateCar - Création de la voiture selon la configuration
     *
     * Détermine le type de voiture à créer selon la configuration et instancie
     * la bonne classe de voiture.
     *
     * TYPES DE VOITURES SUPPORTÉES :
     * - 'dukehazzard' : Voiture Duke Hazzard avec caractéristiques uniques
     * - 'cybertruck' : CyberTruck (mode futuriste)
     * - 'default' : Voiture par défaut
     */
    createCar()
    {
        // Détection du type de voiture demandé
        if(this.options.config.dukeHazzard)
        {
            // Voiture Duke Hazzard
            this.carType = 'dukehazzard'
            console.log('🏭 CarFactory - Création de Duke Hazzard Car')
            this.car = new DukeHazzardCar(this.options)
        }
        else if(this.options.config.cyberTruck)
        {
            // CyberTruck (mode futuriste)
            this.carType = 'cybertruck'
            this.car = new Car(this.options)
        }
        else
        {
            // Voiture par défaut
            this.carType = 'default'
            this.car = new Car(this.options)
        }

        // Log de la voiture créée
        console.log(`🚗 Voiture créée : ${this.carType}`)
    }

    /**
     * GetCar - Récupération de l'instance de voiture
     *
     * Retourne l'instance de la voiture créée.
     *
     * @returns {Object} Instance de la voiture (Car ou DukeHazzardCar)
     */
    getCar()
    {
        return this.car
    }

    /**
     * GetCarType - Récupération du type de voiture
     *
     * Retourne le type de voiture actuellement utilisé.
     *
     * @returns {string} Type de voiture ('dukehazzard', 'cybertruck', 'default')
     */
    getCarType()
    {
        return this.carType
    }

    /**
     * Update - Mise à jour de la voiture
     *
     * Met à jour la voiture actuelle. Délègue l'appel à la méthode update
     * de la voiture instanciée.
     */
    update()
    {
        if(this.car)
        {
            this.car.update()
        }
    }

    /**
     * Destroy - Destruction de la voiture
     *
     * Nettoie la voiture actuelle. Délègue l'appel à la méthode destroy
     * de la voiture instanciée.
     */
    destroy()
    {
        if(this.car)
        {
            this.car.destroy()
        }
    }

    /**
     * GetContainer - Récupération du conteneur de la voiture
     *
     * Retourne le conteneur Three.js de la voiture pour l'intégration
     * dans la scène 3D.
     *
     * @returns {THREE.Object3D} Conteneur de la voiture
     */
    getContainer()
    {
        if(this.car)
        {
            return this.car.container
        }
        return null
    }

    /**
     * GetPosition - Récupération de la position de la voiture
     *
     * Retourne la position actuelle de la voiture.
     *
     * @returns {THREE.Vector3} Position de la voiture
     */
    getPosition()
    {
        if(this.car)
        {
            return this.car.position
        }
        return null
    }
}
