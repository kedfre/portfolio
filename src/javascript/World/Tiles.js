/**
 * WORLD/TILES.JS - Système de Tuiles Décoratives
 *
 * Ce fichier gère le système de tuiles décoratives du portfolio, créant des
 * éléments visuels aléatoires le long de chemins définis. Les tuiles sont
 * placées avec des variations de position, rotation et type pour créer
 * un aspect naturel et varié.
 *
 * RESPONSABILITÉS :
 * - Gestion des modèles de tuiles avec probabilités
 * - Placement automatique le long de chemins
 * - Variation aléatoire de position et rotation
 * - Système de rotation cyclique pour éviter la répétition
 * - Intégration avec le système d'objets
 *
 * SYSTÈMES GÉRÉS :
 * - Modèles : Différents types de tuiles avec probabilités
 * - Placement : Calcul de positions le long de chemins
 * - Variation : Randomisation de position et rotation
 * - Rotation : Système cyclique pour diversité visuelle
 * - Intégration : Ajout au système d'objets 3D
 *
 * TYPES DE TUILES :
 * - TilesA : Tuiles de base (probabilité élevée)
 * - TilesB : Tuiles rares (probabilité faible)
 * - TilesC : Tuiles spéciales (probabilité moyenne)
 * - TilesD : Tuiles décoratives (probabilité moyenne)
 * - TilesE : Tuiles alternatives (probabilité moyenne)
 *
 * FONCTIONNALITÉS :
 * - Placement automatique selon distance inter-tuiles
 * - Variation aléatoire de position (tangent et aléatoire)
 * - Rotation cyclique pour éviter la répétition
 * - Système de probabilités pour diversité
 * - Calculs géométriques précis pour placement
 *
 * ARCHITECTURE :
 * - Pattern de gestionnaire centralisé
 * - Système de probabilités pondérées
 * - Calculs vectoriels pour placement
 * - Intégration avec le système d'objets
 * - Optimisations de performance
 *
 * OPTIMISATIONS :
 * - Calculs de distance optimisés
 * - Placement par lots pour performance
 * - Système de rotation cyclique
 * - Réutilisation de modèles
 * - Calculs vectoriels efficaces
 */

import * as THREE from 'three'

export default class Tiles
{
    /**
     * Constructor - Initialisation du système de tuiles
     *
     * Initialise le système de tuiles décoratives avec configuration des
     * paramètres de placement, distances et randomisation.
     *
     * @param {Object} _options - Options de configuration
     * @param {Object} _options.resources - Gestionnaire des ressources (Resources.js)
     * @param {Object} _options.objects - Gestionnaire des objets 3D (Objects.js)
     * @param {Object} _options.debug - Interface de debug (dat.GUI)
     */
    constructor(_options)
    {
        // Stockage des options de configuration
        this.resources = _options.resources                                                // Gestionnaire des ressources
        this.objects = _options.objects                                                    // Gestionnaire des objets 3D
        this.debug = _options.debug                                                        // Interface de debug

        // Configuration du système
        this.items = []                                                                   // Liste des tuiles créées
        this.interDistance = 1.5                                                          // Distance entre les tuiles
        this.tangentDistance = 0.3                                                        // Distance tangentielle pour variation
        this.positionRandomess = 0.3                                                      // Randomisation de position
        this.rotationRandomess = 0.1                                                      // Randomisation de rotation

        // Initialisation des modèles
        this.setModels()                                                                  // Configuration des modèles de tuiles
    }

    /**
     * SetModels - Configuration des modèles de tuiles
     *
     * Configure les différents types de tuiles avec leurs probabilités
     * et crée un système de sélection aléatoire avec rotation cyclique
     * pour éviter la répétition visuelle.
     *
     * SYSTÈME DE PROBABILITÉS :
     * - TilesA : 8 chances (47%) - Tuiles de base les plus communes
     * - TilesB : 1 chance (6%) - Tuiles rares
     * - TilesC : 2 chances (12%) - Tuiles spéciales
     * - TilesD : 4 chances (24%) - Tuiles décoratives
     * - TilesE : 2 chances (12%) - Tuiles alternatives
     *
     * POURQUOI LES PROBABILITÉS ?
     * Les probabilités servent à créer de la diversité visuelle et un aspect naturel :
     * 
     * 1. ÉVITER LA MONOTONIE :
     *    - Sans probabilités : toutes les tuiles identiques → aspect répétitif
     *    - Avec probabilités : mélange naturel de différents types → intérêt visuel
     * 
     * 2. CRÉER UNE HIÉRARCHIE VISUELLE :
     *    - TilesA (47%) : fond visuel, éléments de base
     *    - TilesB (6%) : éléments rares, accents remarquables
     *    - TilesC/D/E (12-24%) : variété et spécialisation
     * 
     * 3. SIMULER LA NATURE :
     *    - Placement "organique" et imprévisible
     *    - Évite les patterns artificiels répétitifs
     * 
     * 4. AVANTAGES GAMEPLAY :
     *    - Tuiles rares (6%) deviennent des "trouvailles"
     *    - Crée surprise et exploration
     *    - Ajoute valeur aux éléments rares
     * 
     * EXEMPLE DE RÉSULTAT :
     * Tuile1: Type A (47% de chance) → fond
     * Tuile2: Type D (24% de chance) → variété
     * Tuile3: Type A (47% de chance) → fond
     * Tuile4: Type B (6% de chance) → rare !
     * → Résultat : varié et intéressant au lieu de monotone
     *
     * FONCTIONNALITÉS :
     * - Système de probabilités pondérées
     * - Rotation cyclique pour diversité visuelle
     * - Sélection aléatoire basée sur des plages
     * - Gestion des modèles de base et de collision
     */
    setModels()
    {
        // Configuration des modèles
        this.models = {}

        // Définition des types de tuiles avec probabilités
        this.models.items = [
            // Tuiles de base (probabilité élevée)
            {
                base: this.resources.items.tilesABase.scene,                               // Modèle visuel de base
                collision: this.resources.items.tilesACollision.scene,                    // Modèle de collision
                chances: 8                                                                 // Probabilité (8/17 = 47%)
            },
            // Tuiles rares (probabilité faible)
            {
                base: this.resources.items.tilesBBase.scene,                               // Modèle visuel de base
                collision: this.resources.items.tilesBCollision.scene,                    // Modèle de collision
                chances: 1                                                                 // Probabilité (1/17 = 6%)
            },
            // Tuiles spéciales (probabilité moyenne)
            {
                base: this.resources.items.tilesCBase.scene,                               // Modèle visuel de base
                collision: this.resources.items.tilesCCollision.scene,                    // Modèle de collision
                chances: 2                                                                 // Probabilité (2/17 = 12%)
            },
            // Tuiles décoratives (probabilité moyenne)
            {
                base: this.resources.items.tilesDBase.scene,                               // Modèle visuel de base
                collision: this.resources.items.tilesDCollision.scene,                    // Modèle de collision
                chances: 4                                                                 // Probabilité (4/17 = 24%)
            },
            // Tuiles alternatives (probabilité moyenne)
            {
                base: this.resources.items.tilesEBase.scene,                               // Modèle visuel de base
                collision: this.resources.items.tilesECollision.scene,                    // Modèle de collision
                chances: 2                                                                 // Probabilité (2/17 = 12%)
            }
        ]

        // Calcul des probabilités normalisées
        const totalChances = this.models.items.reduce((_totalChances, _item) => _totalChances + _item.chances, 0)
        let chances = 0
        
        // Configuration des plages de probabilités et rotation
        this.models.items = this.models.items.map((_item) =>
        {
            // Configuration des plages de probabilités
            _item.minChances = chances                                                      // Plage minimum

            chances += _item.chances / totalChances                                         // Calcul de la plage maximum
            _item.maxChances = chances                                                      // Plage maximum

            // Configuration de la rotation cyclique
            _item.rotationIndex = 0                                                         // Index de rotation initial

            return _item
        })

        // Fonction de sélection aléatoire avec rotation cyclique
        this.models.pick = () =>
        {
            const random = Math.random()                                                    // Nombre aléatoire entre 0 et 1
            const model = this.models.items.find((_item) => random >= _item.minChances && random <= _item.maxChances)  // Sélection selon la plage
            
            // Incrémentation de l'index de rotation
            model.rotationIndex++

            // Reset cyclique de la rotation (0, 1, 2, 3, 0, 1, 2, 3...)
            if(model.rotationIndex > 3)
            {
                model.rotationIndex = 0
            }

            return model
        }

        // EXEMPLE TECHNIQUE DU FONCTIONNEMENT :
        // random = 0.3 → TilesA (plage 0.0-0.47) → 47% de chance
        // random = 0.5 → TilesB (plage 0.47-0.53) → 6% de chance (rare !)
        // random = 0.7 → TilesD (plage 0.65-0.89) → 24% de chance
        // random = 0.95 → TilesE (plage 0.89-1.0) → 12% de chance
    }

    /**
     * Add - Création et placement de tuiles le long d'un chemin
     *
     * Crée des tuiles décoratives le long d'un chemin défini avec variations
     * de position, rotation et type. Utilise des calculs géométriques précis
     * pour un placement naturel et varié.
     *
     * @param {Object} _options - Options de placement
     * @param {THREE.Vector2} _options.start - Point de départ du chemin
     * @param {THREE.Vector2} _options.delta - Vecteur de direction et distance
     *
     * CALCULS GÉOMÉTRIQUES :
     * 1. Calcul de la distance totale du chemin
     * 2. Détermination du nombre de tuiles à placer
     * 3. Calcul des vecteurs de direction et d'espacement
     * 4. Calcul du vecteur de centrage pour alignement
     * 5. Calcul du vecteur tangentiel pour variation
     * 6. Calcul de l'angle de rotation de base
     *
     * VARIATIONS :
     * - Position : Randomisation + variation tangentielle
     * - Rotation : Angle de base + randomisation + rotation cyclique
     * - Type : Sélection aléatoire avec probabilités
     */
    add(_options)
    {
        // Configuration du chemin de tuiles
        const tilePath = {}
        tilePath.start = _options.start                                                      // Point de départ
        tilePath.delta = _options.delta                                                      // Vecteur de direction et distance

        // Calculs géométriques de base
        tilePath.distance = tilePath.delta.length()                                          // Distance totale du chemin
        tilePath.count = Math.floor(tilePath.distance / this.interDistance)                 // Nombre de tuiles à placer
        tilePath.directionVector = tilePath.delta.clone().normalize()                       // Vecteur de direction normalisé
        tilePath.interVector = tilePath.directionVector.clone().multiplyScalar(this.interDistance)  // Vecteur d'espacement
        tilePath.centeringVector = tilePath.delta.clone().sub(tilePath.interVector.clone().multiplyScalar(tilePath.count))  // Vecteur de centrage
        tilePath.tangentVector = tilePath.directionVector.clone().rotateAround(new THREE.Vector2(0, 0), Math.PI * 0.5).multiplyScalar(this.tangentDistance)  // Vecteur tangentiel
        tilePath.angle = tilePath.directionVector.angle()                                    // Angle de rotation de base

        // Création des tuiles
        for(let i = 0; i < tilePath.count; i++)
        {
            // Sélection du modèle de tuile
            const model = this.models.pick()                                                 // Sélection aléatoire avec probabilités

            // Calcul de la position de base
            const position = tilePath.start.clone().add(tilePath.interVector.clone().multiplyScalar(i)).add(tilePath.centeringVector)
            
            // Randomisation de la position
            position.x += (Math.random() - 0.5) * this.positionRandomess                    // Variation aléatoire X
            position.y += (Math.random() - 0.5) * this.positionRandomess                    // Variation aléatoire Y

            // Application de la variation tangentielle
            const tangent = tilePath.tangentVector

            // Alternance de la direction tangentielle
            if(i % 1 === 0)                                                                  // Alternance à chaque tuile
            {
                tangent.negate()                                                             // Inversion de la direction
            }

            position.add(tangent)                                                            // Application de la variation tangentielle

            // Calcul de la rotation
            let rotation = tilePath.angle                                                    // Angle de base du chemin
            rotation += (Math.random() - 0.5) * this.rotationRandomess                      // Randomisation de la rotation
            rotation += model.rotationIndex / 4 * Math.PI * 2                               // Rotation cyclique du modèle

            // Création de la tuile
            this.objects.add({
                base: model.base,                                                            // Modèle visuel
                collision: model.collision,                                                  // Modèle de collision
                offset: new THREE.Vector3(position.x, position.y, 0),                       // Position finale
                rotation: new THREE.Euler(0, 0, rotation),                                  // Rotation finale
                duplicated: true,                                                            // Marqueur de duplication
                mass: 0                                                                     // Masse nulle (statique)
            })
        }
    }
}
