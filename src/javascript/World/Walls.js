/**
 * WORLD/WALLS.JS - Système de Murs et Structures
 *
 * Ce fichier gère le système de murs et structures du portfolio, créant des
 * assemblages d'objets selon différentes formes géométriques. Il supporte
 * plusieurs types de structures avec randomisation pour un aspect naturel.
 *
 * RESPONSABILITÉS :
 * - Création de murs selon différentes formes géométriques
 * - Placement d'objets avec randomisation de position et rotation
 * - Gestion des patterns de briques avec décalage
 * - Support de formes complexes (rectangle, triangle, brique)
 * - Intégration avec le système d'objets 3D
 *
 * SYSTÈMES GÉRÉS :
 * - Formes : Rectangle, triangle, pattern de briques
 * - Placement : Calcul de positions selon la géométrie
 * - Randomisation : Variation de position et rotation
 * - Patterns : Décalage de briques pour aspect réaliste
 * - Intégration : Ajout au système d'objets 3D
 *
 * TYPES DE FORMES :
 * - Rectangle : Mur rectangulaire standard
 * - Brick : Mur avec pattern de briques décalées
 * - Triangle : Structure triangulaire
 *
 * FONCTIONNALITÉS :
 * - Placement automatique selon dimensions
 * - Randomisation de position et rotation
 * - Pattern de briques avec décalage alterné
 * - Équilibrage de la dernière ligne (optionnel)
 * - Support de formes triangulaires
 *
 * ARCHITECTURE :
 * - Pattern de gestionnaire centralisé
 * - Calculs géométriques pour placement
 * - Système de coordonnées avec randomisation
 * - Intégration avec le système d'objets
 * - Optimisations de performance
 *
 * OPTIMISATIONS :
 * - Calculs de position optimisés
 * - Réutilisation de vecteurs
 * - Placement par lots pour performance
 * - Calculs géométriques efficaces
 */

import * as THREE from 'three'

export default class Walls
{
    /**
     * Constructor - Initialisation du système de murs
     *
     * Initialise le système de murs avec les gestionnaires nécessaires
     * pour la création et le placement d'objets.
     *
     * @param {Object} _options - Options de configuration
     * @param {Object} _options.resources - Gestionnaire des ressources (Resources.js)
     * @param {Object} _options.objects - Gestionnaire des objets 3D (Objects.js)
     */
    constructor(_options)
    {
        // Stockage des options de configuration
        this.resources = _options.resources                                                // Gestionnaire des ressources
        this.objects = _options.objects                                                    // Gestionnaire des objets 3D
    }

    /**
     * Add - Création d'un mur avec forme géométrique
     *
     * Crée un mur composé d'objets placés selon une forme géométrique définie.
     * Supporte plusieurs types de formes avec randomisation pour un aspect naturel.
     *
     * @param {Object} _options - Options de création du mur
     * @param {Object} _options.shape - Configuration de la forme
     * @param {string} _options.shape.type - Type de forme ('rectangle', 'brick', 'triangle')
     * @param {number} _options.shape.widthCount - Nombre d'objets en largeur
     * @param {number} _options.shape.heightCount - Nombre d'objets en hauteur
     * @param {THREE.Vector3} _options.shape.offsetWidth - Décalage entre objets en largeur
     * @param {THREE.Vector3} _options.shape.offsetHeight - Décalage entre objets en hauteur
     * @param {THREE.Vector3} _options.shape.position - Position de base du mur
     * @param {THREE.Vector3} _options.shape.randomOffset - Randomisation de position
     * @param {THREE.Vector3} _options.shape.randomRotation - Randomisation de rotation
     * @param {boolean} _options.shape.equilibrateLastLine - Équilibrage de la dernière ligne
     * @param {Object} _options.object - Configuration de l'objet à placer
     * @returns {Object} Objet mur avec coordonnées et items
     */
    add(_options)
    {
        // Configuration du mur
        const wall = {}
        wall.coordinates = []                                                              // Liste des coordonnées calculées
        wall.items = []                                                                    // Liste des objets créés

        // Configuration de la forme
        const shape = _options.shape
        let widthCount = shape.widthCount                                                  // Nombre d'objets en largeur
        let heightCount = shape.heightCount                                                // Nombre d'objets en hauteur

        // Génération des coordonnées selon le type de forme
        switch(_options.shape.type)
        {
            // Formes rectangulaires et pattern de briques
            case 'rectangle':
            case 'brick':
                // Parcours des lignes (hauteur)
                for(let i = 0; i < heightCount; i++)
                {
                    const lastLine = i === heightCount - 1                                  // Détection de la dernière ligne
                    let j = 0                                                              // Index de colonne de départ
                    let widthCountTemp = widthCount                                        // Nombre de colonnes temporaire

                    // Équilibrage de la dernière ligne pour les briques
                    if(_options.shape.type === 'brick' && lastLine && _options.shape.equilibrateLastLine)
                    {
                        if(i % 2 === 0)                                                    // Ligne paire
                        {
                            widthCountTemp--                                                // Réduction d'une colonne
                        }
                        else
                        {
                            j++                                                            // Décalage d'une colonne
                        }
                    }

                    // Parcours des colonnes (largeur)
                    for(; j < widthCountTemp; j++)
                    {
                        // Calcul de la position de base
                        const offset = new THREE.Vector3()
                        offset.add(shape.offsetWidth.clone().multiplyScalar(j - (shape.widthCount - 1) * 0.5))  // Position en largeur (centrée)
                        offset.add(shape.offsetHeight.clone().multiplyScalar(i))            // Position en hauteur
                        
                        // Randomisation de la position
                        offset.x += (Math.random() - 0.5) * shape.randomOffset.x           // Randomisation X
                        offset.y += (Math.random() - 0.5) * shape.randomOffset.y           // Randomisation Y
                        offset.z += (Math.random() - 0.5) * shape.randomOffset.z           // Randomisation Z

                        // Décalage de briques pour pattern réaliste
                        if(_options.shape.type === 'brick' && i % 2 === 0)                 // Lignes paires
                        {
                            offset.add(shape.offsetWidth.clone().multiplyScalar(0.5))      // Décalage de demi-largeur
                        }

                        // Calcul de la rotation avec randomisation
                        const rotation = new THREE.Euler()
                        rotation.x += (Math.random() - 0.5) * shape.randomRotation.x       // Randomisation rotation X
                        rotation.y += (Math.random() - 0.5) * shape.randomRotation.y       // Randomisation rotation Y
                        rotation.z += (Math.random() - 0.5) * shape.randomRotation.z       // Randomisation rotation Z

                        // Ajout des coordonnées calculées
                        wall.coordinates.push({
                            offset,
                            rotation
                        })
                    }
                }

                break

            // Forme triangulaire
            case 'triangle':
                heightCount = shape.widthCount                                              // Hauteur = largeur pour triangle
                
                // Parcours des lignes du triangle
                for(let i = 0; i < heightCount; i++)
                {
                    // Parcours des colonnes (largeur décroissante)
                    for(let j = 0; j < widthCount; j++)
                    {
                        // Calcul de la position triangulaire
                        const offset = new THREE.Vector3()
                        offset.add(shape.offsetWidth.clone().multiplyScalar(j - (shape.widthCount - 1) * 0.5))  // Position en largeur (centrée)
                        offset.add(shape.offsetWidth.clone().multiplyScalar(i * 0.5))      // Décalage triangulaire en largeur
                        offset.add(shape.offsetHeight.clone().multiplyScalar(i))            // Position en hauteur
                        
                        // Randomisation de la position
                        offset.x += (Math.random() - 0.5) * shape.randomOffset.x           // Randomisation X
                        offset.y += (Math.random() - 0.5) * shape.randomOffset.y           // Randomisation Y
                        offset.z += (Math.random() - 0.5) * shape.randomOffset.z           // Randomisation Z

                        // Décalage de briques pour pattern réaliste (si applicable)
                        if(_options.shape.type === 'brick' && i % 2 === 0)                 // Lignes paires
                        {
                            offset.add(shape.offsetWidth.clone().multiplyScalar(0.5))      // Décalage de demi-largeur
                        }

                        // Calcul de la rotation avec randomisation
                        const rotation = new THREE.Euler()
                        rotation.x += (Math.random() - 0.5) * shape.randomRotation.x       // Randomisation rotation X
                        rotation.y += (Math.random() - 0.5) * shape.randomRotation.y       // Randomisation rotation Y
                        rotation.z += (Math.random() - 0.5) * shape.randomRotation.z       // Randomisation rotation Z

                        // Ajout des coordonnées calculées
                        wall.coordinates.push({
                            offset,
                            rotation
                        })
                    }

                    widthCount--                                                            // Réduction de la largeur pour forme triangulaire
                }

                break
        }

        // Création des objets selon les coordonnées calculées
        for(const _coordinates of wall.coordinates)
        {
            // Configuration de l'objet avec coordonnées calculées
            const objectOptions = { ..._options.object }                                    // Copie des options de base
            objectOptions.offset = _options.object.offset.clone().add(_coordinates.offset).add(shape.position)  // Position finale
            objectOptions.rotation = _options.object.rotation.clone()                      // Rotation de base
            
            // Application de la rotation randomisée
            objectOptions.rotation.x += _coordinates.rotation.x                            // Rotation X randomisée
            objectOptions.rotation.y += _coordinates.rotation.y                            // Rotation Y randomisée
            objectOptions.rotation.z += _coordinates.rotation.z                            // Rotation Z randomisée
            
            // Création de l'objet et ajout à la liste
            wall.items.push(this.objects.add(objectOptions))
        }

        return wall
    }
}
