/**
 * WORLD/ZONE.JS - Zone Interactive de Détection
 *
 * Ce fichier gère les zones interactives du portfolio, créant des volumes
 * de détection invisibles pour déclencher des événements quand des objets
 * (comme la voiture) entrent ou sortent de la zone.
 *
 * RESPONSABILITÉS :
 * - Création de zones de détection rectangulaires
 * - Gestion de l'état d'entrée/sortie de zone
 * - Émission d'événements pour les interactions
 * - Visualisation debug avec mesh wireframe
 * - Stockage de données associées à la zone
 *
 * SYSTÈMES GÉRÉS :
 * - Détection : Volume de collision invisible
 * - État : Suivi de l'entrée/sortie de zone
 * - Événements : Émission d'événements personnalisés
 * - Debug : Visualisation wireframe pour développement
 * - Données : Stockage d'informations associées
 *
 * FONCTIONNALITÉS :
 * - Zone rectangulaire avec dimensions configurables
 * - Détection d'entrée et de sortie
 * - Événements émis pour les interactions
 * - Mesh de debug avec couleur magenta
 * - Position et dimensions configurables
 *
 * ARCHITECTURE :
 * - Hérite d'EventEmitter pour les événements
 * - Mesh Three.js pour visualisation debug
 * - Géométrie BoxGeometry pour forme rectangulaire
 * - Matériau wireframe pour visibilité debug
 * - Position et dimensions configurables
 *
 * UTILISATION :
 * - Zones de déclenchement d'événements
 * - Détection de proximité d'objets
 * - Déclenchement d'animations ou d'effets
 * - Zones de téléportation ou de changement de scène
 * - Détection de fin de niveau ou d'objectifs
 *
 * OPTIMISATIONS :
 * - Géométrie simple (BoxGeometry)
 * - Matériau wireframe léger
 * - Pas de calculs de collision complexes
 * - Événements optimisés
 */

import * as THREE from 'three'

import EventEmitter from '../Utils/EventEmitter.js'

export default class Zone extends EventEmitter
{
    /**
     * Constructor - Initialisation d'une zone interactive
     *
     * Crée une zone de détection rectangulaire avec visualisation debug
     * et gestion des événements d'entrée/sortie.
     *
     * @param {Object} _options - Options de configuration de la zone
     * @param {THREE.Vector3} _options.position - Position de la zone
     * @param {THREE.Vector3} _options.halfExtents - Demi-dimensions de la zone
     * @param {Object} _options.data - Données associées à la zone
     */
    constructor(_options)
    {
        super()                                                                             // Initialisation de l'EventEmitter

        // Stockage des options de configuration
        this.position = _options.position                                                   // Position de la zone
        this.halfExtents = _options.halfExtents                                             // Demi-dimensions (rayon de la zone)
        this.data = _options.data                                                           // Données associées à la zone

        // Configuration de l'état
        this.isIn = false                                                                   // État d'entrée dans la zone

        // Création du mesh de debug
        this.mesh = new THREE.Mesh(
            new THREE.BoxGeometry(
                _options.halfExtents.x * 2,                                                 // Largeur totale (demi-dimension * 2)
                _options.halfExtents.y * 2,                                                 // Hauteur totale (demi-dimension * 2)
                3,                                                                          // Profondeur fixe
                1, 1, 1                                                                     // Subdivisions minimales
            ),
            new THREE.MeshBasicMaterial({ 
                color: 0xff00ff,                                                            // Couleur magenta pour debug
                wireframe: true                                                             // Mode wireframe pour visibilité
            })
        )
        
        // Positionnement du mesh
        this.mesh.position.x = _options.position.x                                          // Position X
        this.mesh.position.y = _options.position.y                                          // Position Y
        this.mesh.position.z = 1.5                                                          // Position Z (hauteur fixe)
    }
}
