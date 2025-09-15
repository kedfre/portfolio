/**
 * DISTINCTIONDSECTION.JS - Section de Distinction D
 * 
 * Ce fichier définit la section de distinction D dans l'environnement 3D du portfolio.
 * Cette section présente les récompenses et distinctions avec des objets statiques
 * et un trophée Webby avec une ombre plus grande et une masse modérée.
 * 
 * RESPONSABILITÉS :
 * - Création de la section de distinction D
 * - Gestion des objets statiques (base et collision)
 * - Configuration du trophée Webby
 * - Intégration avec le système d'objets
 * 
 * CARACTÉRISTIQUES :
 * - Section de présentation des récompenses Webby
 * - Objets statiques avec collision
 * - Trophée Webby avec ombre étendue
 * - Objet interactif avec collision et sons
 * 
 * UTILISATION :
 * - Présentation des distinctions Webby
 * - Zone de valorisation des récompenses
 * - Objet interactif avec physique
 * - Section de distinction spéciale
 */

import * as THREE from 'three'

export default class DistinctionDSection
{
    /**
     * Constructor - Initialisation de la section de distinction D
     * 
     * Initialise la section de distinction D avec les options fournies
     * et configure les objets statiques et le trophée Webby.
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
        this.setStatic()
        this.setTrophy()
    }

    /**
     * SetStatic - Configuration des objets statiques
     * 
     * Ajoute les objets statiques de la section de distinction D avec
     * leur géométrie de base, de collision et de texture d'ombre.
     */
    setStatic()
    {
        this.objects.add({
            base: this.resources.items.distinctionCStaticBase.scene,                    // Géométrie de base
            collision: this.resources.items.distinctionCStaticCollision.scene,         // Géométrie de collision
            floorShadowTexture: this.resources.items.distinctionCStaticFloorShadowTexture, // Texture d'ombre
            offset: new THREE.Vector3(this.x, this.y, 0),                             // Position de la section
            mass: 0                                                                   // Masse nulle (objet statique)
        })
    }

    /**
     * SetTrophy - Configuration du trophée Webby
     * 
     * Crée le trophée Webby avec une ombre étendue et une masse modérée
     * pour simuler un objet de taille moyenne.
     */
    setTrophy()
    {
        this.objects.add({
            base: this.resources.items.webbyTrophyBase.scene,                          // Géométrie de base du trophée Webby
            collision: this.resources.items.webbyTrophyCollision.scene,               // Géométrie de collision
            offset: new THREE.Vector3(0, - 2.5, 5),                                  // Position du trophée
            rotation: new THREE.Euler(0, 0, 0),                                       // Rotation
            duplicated: true,                                                         // Objet dupliqué
            shadow: { sizeX: 4, sizeY: 4, offsetZ: - 0.5, alpha: 0.65 },              // Ombre étendue
            mass: 15,                                                                 // Masse modérée
            soundName: 'woodHit',                                                     // Son de collision
            sleep: false                                                              // Pas de mise en veille
        })
    }
}
