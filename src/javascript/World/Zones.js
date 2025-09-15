/**
 * WORLD/ZONES.JS - Gestionnaire de Zones Interactives
 *
 * Ce fichier gère le système de zones interactives du portfolio, orchestrant
 * la détection de collision entre la voiture et les zones, et déclenchant
 * les événements appropriés (entrée/sortie de zone).
 *
 * RESPONSABILITÉS :
 * - Gestion centralisée de toutes les zones interactives
 * - Détection de collision entre voiture et zones
 * - Déclenchement d'événements d'entrée/sortie
 * - Suivi de l'état de chaque zone
 * - Interface de debug pour visualisation
 *
 * SYSTÈMES GÉRÉS :
 * - Zones : Liste de toutes les zones interactives
 * - Détection : Collision entre voiture et zones
 * - Événements : Déclenchement d'événements 'in' et 'out'
 * - État : Suivi de l'état d'entrée/sortie
 * - Debug : Visualisation des zones en mode debug
 *
 * FONCTIONNALITÉS :
 * - Détection de collision en temps réel
 * - Événements d'entrée et de sortie de zone
 * - Suivi de l'état de chaque zone
 * - Interface de debug avec visibilité
 * - Gestion centralisée des zones
 *
 * ARCHITECTURE :
 * - Pattern de gestionnaire centralisé
 * - Boucle de détection en temps réel
 * - Système d'événements pour interactions
 * - Interface de debug intégrée
 * - Optimisations de performance
 *
 * DÉTECTION DE COLLISION :
 * - Test de collision rectangulaire simple
 * - Vérification de position X et Y
 * - Comparaison avec demi-dimensions
 * - Déclenchement d'événements selon l'état
 *
 * OPTIMISATIONS :
 * - Détection de collision optimisée
 * - Gestion d'état efficace
 * - Événements conditionnels
 * - Debug conditionnel
 */

import * as THREE from 'three'
import Zone from './Zone.js'

export default class Zones
{
    /**
     * Constructor - Initialisation du gestionnaire de zones
     *
     * Initialise le système de gestion des zones interactives avec détection
     * de collision et interface de debug.
     *
     * @param {Object} _options - Options de configuration
     * @param {Object} _options.time - Gestionnaire du temps (Time.js)
     * @param {Object} _options.sizes - Gestionnaire des dimensions (Sizes.js)
     * @param {Object} _options.physics - Système de physique (Physics.js)
     * @param {Object} _options.debug - Interface de debug (dat.GUI)
     */
    constructor(_options)
    {
        // Stockage des options de configuration
        this.time = _options.time                                                          // Gestionnaire du temps
        this.sizes = _options.sizes                                                        // Gestionnaire des dimensions
        this.physics = _options.physics                                                    // Système de physique
        this.debug = _options.debug                                                        // Interface de debug

        // Configuration du conteneur
        this.container = new THREE.Object3D()                                             // Conteneur pour les zones
        this.container.visible = false                                                     // Masqué par défaut
        this.container.matrixAutoUpdate = false                                            // Désactivation de la mise à jour automatique

        // Interface de debug
        if(this.debug)
        {
            this.debugFolder = this.debug.addFolder('zones')                              // Dossier de debug pour les zones
            this.debugFolder.open()                                                        // Ouverture automatique

            this.debugFolder.add(this.container, 'visible').name('visible')               // Contrôle de visibilité
        }

        // Initialisation des systèmes
        this.setTester()                                                                  // Configuration du détecteur de position
        this.setItems()                                                                   // Configuration de la gestion des zones
    }

    /**
     * SetTester - Configuration du détecteur de position
     *
     * Configure le système de détection de position de la voiture pour
     * les tests de collision avec les zones. Met à jour la position
     * en temps réel depuis le système de physique.
     *
     * FONCTIONNALITÉS :
     * - Suivi de la position de la voiture en temps réel
     * - Mise à jour des coordonnées X et Y
     * - Synchronisation avec le système de physique
     * - Optimisation pour les tests de collision
     */
    setTester()
    {
        // Configuration du détecteur
        this.tester = {}
        this.tester.x = 0                                                                  // Position X initiale
        this.tester.y = 0                                                                  // Position Y initiale

        // Boucle de mise à jour de la position
        this.time.on('tick', () =>
        {
            // Mise à jour de la position depuis le système de physique
            this.tester.x = this.physics.car.chassis.body.position.x                       // Position X de la voiture
            this.tester.y = this.physics.car.chassis.body.position.y                       // Position Y de la voiture
        })
    }

    /**
     * SetItems - Configuration de la gestion des zones et événements
     *
     * Configure le système de détection de collision et de gestion des événements
     * pour toutes les zones. Teste en temps réel si la voiture est dans chaque zone
     * et déclenche les événements appropriés.
     *
     * LOGIQUE DE DÉTECTION :
     * 1. Test de collision rectangulaire simple
     * 2. Vérification des limites X et Y de la zone
     * 3. Comparaison avec la position de la voiture
     * 4. Déclenchement d'événements selon l'état précédent
     * 5. Mise à jour de l'état de la zone
     *
     * ÉVÉNEMENTS DÉCLENCHÉS :
     * - 'in' : Quand la voiture entre dans une zone
     * - 'out' : Quand la voiture sort d'une zone
     * - Données : Passage des données associées à la zone
     */
    setItems()
    {
        // Configuration de la liste des zones
        this.items = []                                                                   // Liste des zones interactives

        // Boucle de détection de collision en temps réel
        this.time.on('tick', () =>
        {
            // Parcours de toutes les zones
            for(const _zone of this.items)
            {
                // Test de collision rectangulaire
                const isIn = this.tester.x < _zone.position.x + _zone.halfExtents.x &&     // Limite droite de la zone
                            this.tester.x > _zone.position.x - _zone.halfExtents.x &&     // Limite gauche de la zone
                            this.tester.y < _zone.position.y + _zone.halfExtents.y &&     // Limite haute de la zone
                            this.tester.y > _zone.position.y - _zone.halfExtents.y        // Limite basse de la zone

                // Déclenchement des événements selon l'état
                if(isIn && !_zone.isIn)                                                    // Entrée dans la zone
                {
                    _zone.trigger('in', [_zone.data])                                      // Événement d'entrée avec données
                }
                else if(!isIn && _zone.isIn)                                               // Sortie de la zone
                {
                    _zone.trigger('out', [_zone.data])                                     // Événement de sortie avec données
                }

                // Mise à jour de l'état de la zone
                _zone.isIn = isIn                                                          // Sauvegarde du nouvel état
            }
        })
    }

    /**
     * Add - Ajout d'une nouvelle zone interactive
     *
     * Crée une nouvelle zone interactive et l'ajoute au système de gestion.
     * La zone sera automatiquement testée pour les collisions et pourra
     * déclencher des événements.
     *
     * @param {Object} _settings - Configuration de la zone
     * @param {THREE.Vector3} _settings.position - Position de la zone
     * @param {THREE.Vector3} _settings.halfExtents - Demi-dimensions de la zone
     * @param {Object} _settings.data - Données associées à la zone
     * @returns {Zone} Instance de la zone créée
     */
    add(_settings)
    {
        // Création de la zone
        const zone = new Zone(_settings)                                                   // Création de l'instance Zone
        this.container.add(zone.mesh)                                                      // Ajout du mesh au conteneur

        // Sauvegarde de la zone
        this.items.push(zone)                                                              // Ajout à la liste des zones

        return zone                                                                        // Retour de l'instance créée
    }
}
