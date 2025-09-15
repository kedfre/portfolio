/**
 * DISTINCTIONCSECTION.JS - Section de Distinction C
 * 
 * Ce fichier définit la section de distinction C dans l'environnement 3D du portfolio.
 * Cette section présente un trophée Awwwards comme récompense principale,
 * avec une masse importante pour simuler un objet lourd et précieux.
 * 
 * RESPONSABILITÉS :
 * - Création de la section de distinction C
 * - Gestion du trophée Awwwards
 * - Configuration de la physique du trophée
 * - Intégration avec le système d'objets
 * 
 * CARACTÉRISTIQUES :
 * - Section de présentation du trophée principal
 * - Trophée Awwwards avec physique réaliste
 * - Masse importante (50) pour simulation de poids
 * - Objet interactif avec collision et sons
 * 
 * UTILISATION :
 * - Présentation du trophée principal
 * - Zone de valorisation des récompenses
 * - Objet interactif lourd
 * - Section de distinction spéciale
 */

import * as THREE from 'three'

export default class DistinctionCSection
{
    /**
     * Constructor - Initialisation de la section de distinction C
     * 
     * Initialise la section de distinction C avec les options fournies
     * et configure le trophée Awwwards principal.
     * 
     * @param {Object} _options - Options de configuration
     * @param {Object} _options.time - Instance de gestion du temps
     * @param {Object} _options.resources - Gestionnaire de ressources
     * @param {Object} _options.objects - Gestionnaire d'objets 3D
     * @param {Object} _options.walls - Gestionnaire de murs de briques
     * @param {Object} _options.debug - Interface de debug
     * @param {number} _options.x - Position X de la section
     * @param {number} _options.y - Position Y de la section
     */
    constructor(_options)
    {
        // Stockage des options de configuration
        this.time = _options.time
        this.resources = _options.resources
        this.objects = _options.objects
        this.walls = _options.walls
        this.debug = _options.debug
        this.x = _options.x
        this.y = _options.y

        // Configuration du conteneur principal
        this.container = new THREE.Object3D()
        this.container.matrixAutoUpdate = false

        // Initialisation des composants
        this.setTrophy()
    }

    /**
     * SetTrophy - Configuration du trophée Awwwards
     * 
     * Crée le trophée Awwwards principal avec une masse importante
     * pour simuler un objet lourd et précieux.
     */
    setTrophy()
    {
        this.objects.add({
            base: this.resources.items.awwwardsTrophyBase.scene,                        // Géométrie de base du trophée
            collision: this.resources.items.awwwardsTrophyCollision.scene,             // Géométrie de collision
            offset: new THREE.Vector3(0, - 5, 0),                                     // Position du trophée
            rotation: new THREE.Euler(0, 0, 0),                                       // Rotation
            duplicated: true,                                                         // Objet dupliqué
            shadow: { sizeX: 2, sizeY: 2, offsetZ: - 0.5, alpha: 0.5 },              // Configuration de l'ombre
            mass: 50,                                                                 // Masse importante (objet lourd)
            soundName: 'woodHit'                                                      // Son de collision
        })
    }
}
