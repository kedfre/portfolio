/**
 * WORLD/OBJECTS.JS - Gestionnaire d'Objets 3D
 *
 * Ce fichier gère tous les objets 3D de l'environnement du portfolio.
 * Il orchestre la création, la conversion, l'optimisation et la gestion
 * des objets avec leurs matériaux, physique, ombres et sons.
 *
 * RESPONSABILITÉS :
 * - Gestion centralisée de tous les objets 3D
 * - Conversion automatique des meshes avec matériaux appropriés
 * - Optimisation par fusion de géométries
 * - Intégration avec le système de physique
 * - Gestion des ombres et des sons
 * - Parsing intelligent des noms d'objets
 *
 * SYSTÈMES GÉRÉS :
 * - Parsing des matériaux : Attribution automatique selon les noms
 * - Fusion de géométries : Optimisation des performances
 * - Conversion de meshes : Application des matériaux et transformations
 * - Intégration physique : Synchronisation avec Cannon.js
 * - Gestion des ombres : Ajout automatique des ombres portées
 * - Sons de collision : Déclenchement des sons lors des impacts
 *
 * TYPES D'OBJETS SUPPORTÉS :
 * - Objets avec matériaux matcap (shade*)
 * - Objets avec matériaux purs (pure*)
 * - Sols avec ombres (floor*)
 * - Objets par défaut (matériau blanc)
 *
 * ARCHITECTURE :
 * - Pattern de gestionnaire centralisé
 * - Système de parsing basé sur les noms
 * - Optimisation par fusion de géométries
 * - Intégration multi-système (physique, ombres, sons)
 * - Gestion des transformations et centrage
 *
 * OPTIMISATIONS :
 * - Fusion de géométries pour réduire les draw calls
 * - Désactivation de matrixAutoUpdate pour les objets statiques
 * - Parsing intelligent des matériaux
 * - Gestion optimisée des transformations
 * - Réutilisation des matériaux entre objets
 */

import * as THREE from 'three'
import * as BufferGeometryUtils from 'three/addons/utils/BufferGeometryUtils.js';


export default class Objects
{
    /**
     * Constructor - Initialisation du gestionnaire d'objets 3D
     *
     * Initialise le gestionnaire centralisé de tous les objets 3D de l'environnement.
     * Configure les systèmes de parsing, de fusion de géométries et les conteneurs
     * nécessaires pour la gestion optimisée des objets.
     *
     * @param {Object} _options - Options de configuration
     * @param {Object} _options.time - Gestionnaire du temps (Time.js)
     * @param {Object} _options.resources - Gestionnaire des ressources (Resources.js)
     * @param {Object} _options.materials - Gestionnaire des matériaux (Materials.js)
     * @param {Object} _options.physics - Système de physique (Physics.js)
     * @param {Object} _options.shadows - Système d'ombres (Shadows.js)
     * @param {Object} _options.sounds - Gestionnaire audio (Sounds.js)
     * @param {Object} _options.debug - Interface de debug (dat.GUI)
     */
    constructor(_options)
    {
        // Stockage des options de configuration
        this.time = _options.time                                                          // Gestionnaire du temps pour les animations
        this.resources = _options.resources                                                // Gestionnaire des ressources pour les assets
        this.materials = _options.materials                                                // Gestionnaire des matériaux
        this.physics = _options.physics                                                    // Système de physique Cannon.js
        this.shadows = _options.shadows                                                    // Système d'ombres portées
        this.sounds = _options.sounds                                                      // Gestionnaire audio
        this.debug = _options.debug                                                        // Interface de debug

        // Configuration du conteneur principal des objets
        this.container = new THREE.Object3D()                                             // Conteneur parent pour tous les objets
        this.container.matrixAutoUpdate = false                                           // Désactivation de la mise à jour automatique

        // Initialisation des conteneurs de données
        this.items = []                                                                   // Liste de tous les objets créés
        this.floorShadows = []                                                            // Liste des ombres de sol

        // Initialisation des systèmes
        this.setParsers()                                                                 // Configuration du système de parsing des matériaux
        this.setMerge()                                                                   // Configuration du système de fusion de géométries
    }

    /**
     * SetParsers - Configuration du système de parsing des matériaux
     *
     * Configure le système intelligent de parsing des noms d'objets pour
     * attribuer automatiquement les matériaux appropriés. Le système utilise
     * des expressions régulières pour identifier le type de matériau à appliquer.
     *
     * PARSERS CONFIGURÉS :
     * - Parser matcap : Objets avec noms "shade*" (ex: shadeWhite_01)
     * - Parser pur : Objets avec noms "pure*" (ex: pureRed_02)
     * - Parser sol : Objets avec noms "floor*" (ex: floor_01)
     * - Parser par défaut : Tous les autres objets
     *
     * LOGIQUE DE PARSING :
     * - Extraction du nom du matériau depuis le nom de l'objet
     * - Conversion PascalCase vers camelCase pour les matcaps
     * - Application du matériau approprié ou fallback
     * - Gestion des enfants et du clonage
     */
    setParsers()
    {
        // Configuration du conteneur des parsers
        this.parsers = {}

        // Configuration des parsers de matériaux
        this.parsers.items = [
            // Parser pour les matériaux matcap (shade*)
            {
                regex: /^shade([a-z]+)_?[0-9]{0,3}?/i,                                    // Regex pour identifier les objets matcap
                apply: (_mesh, _options) =>
                {
                    // Extraction du nom du matériau depuis le nom de l'objet
                    const match = _mesh.name.match(/^shade([a-z]+)_?[0-9]{0,3}?/i)
                    const materialName = `${match[1].substring(0, 1).toLowerCase()}${match[1].substring(1)}` // Conversion PascalCase vers camelCase
                    let material = this.materials.shades.items[materialName]

                    // Matériau par défaut si le matériau spécifique n'existe pas
                    if(typeof material === 'undefined')
                    {
                        material = new THREE.MeshNormalMaterial()                        // Matériau de fallback
                    }

                    // Création du mesh avec le nouveau matériau
                    const mesh = _options.duplicated ? _mesh.clone() : _mesh             // Clonage conditionnel
                    mesh.material = material                                             // Application du matériau

                    // Application du matériau aux enfants si présents
                    if(mesh.children.length)
                    {
                        for(const _child of mesh.children)
                        {
                            if(_child instanceof THREE.Mesh)
                            {
                                _child.material = material                               // Application du matériau aux enfants
                            }
                        }
                    }

                    return mesh
                }
            },

            // Parser pour les matériaux purs (pure*)
            {
                regex: /^pure([a-z]+)_?[0-9]{0,3}?/i,                                     // Regex pour identifier les objets purs
                apply: (_mesh, _options) =>
                {
                    // Extraction du nom du matériau depuis le nom de l'objet
                    const match = _mesh.name.match(/^pure([a-z]+)_?[0-9]{0,3}?/i)
                    const materialName = match[1].toLowerCase()                           // Conversion en minuscules
                    let material = this.materials.pures.items[materialName]

                    // Matériau par défaut si le matériau spécifique n'existe pas
                    if(typeof material === 'undefined')
                    {
                        material = new THREE.MeshNormalMaterial()                        // Matériau de fallback
                    }

                    // Création du mesh avec le nouveau matériau
                    const mesh = _options.duplicated ? _mesh.clone() : _mesh             // Clonage conditionnel
                    mesh.material = material                                             // Application du matériau

                    return mesh
                }
            },

            // Parser pour les sols avec ombres (floor*)
            {
                regex: /^floor_?[0-9]{0,3}?/i,                                           // Regex pour identifier les sols
                apply: (_mesh, _options) =>
                {
                    // Création manuelle du sol à cause des UV manquantes
                    const geometry = new THREE.PlaneGeometry(_mesh.scale.x, _mesh.scale.y, 10, 10)  // Géométrie plane avec subdivision
                    const material = this.materials.items.floorShadow.clone()            // Clonage du matériau d'ombre

                    // Configuration des uniforms du matériau d'ombre
                    material.uniforms.tShadow.value = _options.floorShadowTexture        // Texture d'ombre
                    material.uniforms.uShadowColor.value = new THREE.Color(this.materials.items.floorShadow.shadowColor)  // Couleur d'ombre
                    material.uniforms.uAlpha.value = 0                                   // Alpha initial (invisible)

                    // Création du mesh avec géométrie et matériau
                    const mesh = new THREE.Mesh(geometry, material)
                    mesh.matrixAutoUpdate = false                                        // Désactivation de la mise à jour automatique
                    mesh.updateMatrix()                                                  // Mise à jour de la matrice

                    // Ajout à la liste des ombres de sol
                    this.floorShadows.push(mesh)

                    return mesh
                }
            }
        ]

        // Parser par défaut pour tous les autres objets
        this.parsers.default = {}
        this.parsers.default.apply = (_mesh) =>
        {
            // Création d'un mesh cloné avec le matériau blanc par défaut
            const mesh = _mesh.clone()                                                    // Clonage du mesh original
            mesh.material = this.materials.shades.items.white                            // Application du matériau blanc matcap

            return mesh
        }
    }

    /**
     * SetMerge - Configuration du système de fusion de géométries
     *
     * Configure le système d'optimisation qui fusionne les géométries des objets
     * ayant le même matériau pour réduire le nombre de draw calls et améliorer
     * les performances de rendu.
     *
     * FONCTIONNALITÉS :
     * - Fusion des géométries par nom de matériau
     * - Réduction des draw calls pour améliorer les performances
     * - Gestion des transformations et matrices
     * - Application automatique de la fusion
     *
     * PROCESSUS DE FUSION :
     * 1. Collecte des géométries par nom de matériau
     * 2. Application des transformations à chaque géométrie
     * 3. Fusion des géométries avec BufferGeometryUtils
     * 4. Création d'un mesh unique par matériau
     */
    setMerge()
    {
        // Configuration du système de fusion
        this.merge = {}
        this.merge.items = {}                                                             // Conteneur des éléments à fusionner

        // Configuration du conteneur des objets fusionnés
        this.merge.container = new THREE.Object3D()                                      // Conteneur pour les meshes fusionnés
        this.merge.container.matrixAutoUpdate = false                                    // Désactivation de la mise à jour automatique
        this.container.add(this.merge.container)                                         // Ajout au conteneur principal

        // Fonction d'ajout d'un mesh au système de fusion
        this.merge.add = (_name, _mesh) =>
        {
            let mergeItem = this.merge.items[_name]

            // Création d'un élément de fusion s'il n'existe pas
            if(!mergeItem)
            {
                mergeItem = {}

                // Configuration de la géométrie
                mergeItem.geometry = new THREE.BufferGeometry()                          // Géométrie vide pour la fusion
                mergeItem.geometriesToMerge = []                                         // Liste des géométries à fusionner

                // Configuration du matériau
                mergeItem.material = _mesh.material                                      // Référence au matériau original
                mergeItem.material.side = THREE.DoubleSide                               // Rendu des deux faces

                // Création du mesh fusionné
                mergeItem.mesh = new THREE.Mesh(mergeItem.geometry, mergeItem.material)  // Mesh final fusionné
                this.merge.container.add(mergeItem.mesh)                                 // Ajout au conteneur

                // Sauvegarde de l'élément de fusion
                this.merge.items[_name] = mergeItem
            }

            // Application de la transformation de l'objet à la géométrie
            const geometry = _mesh.geometry
            _mesh.updateMatrixWorld()                                                    // Mise à jour de la matrice monde
            geometry.applyMatrix(_mesh.matrixWorld)                                      // Application de la transformation

            // Ajout de la géométrie à la liste de fusion
            mergeItem.geometriesToMerge.push(geometry)
        }

        // Fonction d'application de la fusion des géométries
        this.merge.applyMerge = () =>
        {
            // Parcours de tous les éléments à fusionner
            for(const _mergeItemName in this.merge.items)
            {
                const mergeItem = this.merge.items[_mergeItemName]

                // Fusion des géométries avec BufferGeometryUtils
                mergeItem.geometry = BufferGeometryUtils.mergeGeometries(mergeItem.geometriesToMerge)  // Fusion des géométries
                mergeItem.mesh.geometry = mergeItem.geometry                                           // Application de la géométrie fusionnée
            }
        }

        // Fonction de mise à jour du système de fusion
        this.merge.update = () =>
        {
            // Parcours de tous les objets
            for(const _object of this.items)
            {
                // Vérification si l'objet doit être fusionné
                if(_object.shouldMerge)
                {
                    const children = [..._object.container.children]                                   // Copie des enfants
                    
                    // Parcours des enfants de l'objet
                    for(const _child of children)
                    {
                        const materialName = _child.material.name
                        
                        // Ajout au système de fusion si le matériau a un nom
                        if(materialName !== '')
                        {
                            this.merge.add(materialName, _child)                                      // Ajout au système de fusion

                            // Suppression du parent
                            _object.container.remove(_child)                                          // Retrait du conteneur parent
                        }
                    }

                    // Note : Si aucun enfant, l'objet pourrait être supprimé
                    // (code commenté pour l'instant)

                    _object.shouldMerge = false                                                       // Désactivation du flag de fusion
                }
            }

            // Application de la fusion
            this.merge.applyMerge()                                                                   // Exécution de la fusion
        }
    }

    /**
     * GetConvertedMesh - Conversion des meshes avec application des matériaux
     *
     * Convertit une liste d'enfants 3D en appliquant les parsers de matériaux
     * appropriés et en gérant le centrage automatique des objets.
     *
     * FONCTIONNALITÉS :
     * - Application des parsers de matériaux selon les noms
     * - Détection automatique du centre de l'objet
     * - Recentrage automatique des enfants
     * - Optimisation pour les objets statiques
     *
     * PROCESSUS DE CONVERSION :
     * 1. Parcours des enfants pour détecter le centre
     * 2. Application des parsers de matériaux
     * 3. Recentrage des enfants par rapport au centre
     * 4. Optimisation des matrices pour les objets statiques
     *
     * @param {Array} _children - Liste des enfants à convertir
     * @param {Object} _options - Options de conversion
     * @param {number} _options.mass - Masse de l'objet (0 = statique)
     * @param {boolean} _options.duplicated - Si l'objet doit être dupliqué
     * @param {Object} _options.floorShadowTexture - Texture d'ombre pour les sols
     * @returns {THREE.Object3D} Conteneur avec les meshes convertis
     */
    getConvertedMesh(_children, _options = {})
    {
        const container = new THREE.Object3D()                                             // Conteneur pour les meshes convertis
        const center = new THREE.Vector3()                                                // Centre de l'objet

        // Parcours de tous les enfants de base
        const baseChildren = [..._children]                                               // Copie de la liste des enfants

        for(const _child of baseChildren)
        {
            // Détection du centre de l'objet
            if(_child.name.match(/^center_?[0-9]{0,3}?/i))
            {
                center.set(_child.position.x, _child.position.y, _child.position.z)      // Définition du centre
            }

            // Traitement des meshes
            if(_child instanceof THREE.Mesh)
            {
                // Recherche du parser approprié
                let parser = this.parsers.items.find((_item) => _child.name.match(_item.regex))
                if(typeof parser === 'undefined')
                {
                    parser = this.parsers.default                                          // Parser par défaut si aucun trouvé
                }

                // Création du mesh en appliquant le parser
                const mesh = parser.apply(_child, _options)                               // Application du parser

                // Ajout au conteneur
                container.add(mesh)                                                       // Ajout du mesh converti
            }
        }

        // Recentrage des enfants par rapport au centre
        if(center.length() > 0)
        {
            // Déplacement de tous les enfants vers le centre
            for(const _child of container.children)
            {
                _child.position.sub(center)                                               // Soustraction du centre
            }

            // Déplacement du conteneur vers le centre
            container.position.add(center)                                                // Ajout du centre
        }

        // Optimisation pour les objets statiques (masse = 0)
        if(_options.mass && _options.mass === 0)
        {
            container.matrixAutoUpdate = false                                            // Désactivation de la mise à jour automatique
            container.updateMatrix()                                                      // Mise à jour de la matrice
        }

        return container
    }

    /**
     * Add - Ajout d'un objet complet à l'environnement
     *
     * Crée et ajoute un objet complet à l'environnement 3D avec tous ses systèmes
     * intégrés : conversion des meshes, physique, ombres, sons et optimisations.
     *
     * FONCTIONNALITÉS :
     * - Conversion automatique des meshes avec matériaux
     * - Intégration avec le système de physique
     * - Gestion des ombres portées
     * - Sons de collision
     * - Optimisations de performance
     * - Synchronisation temps réel
     *
     * SYSTÈMES INTÉGRÉS :
     * - Conversion des meshes avec parsers
     * - Création d'objets physiques
     * - Ajout d'ombres portées
     * - Sons de collision
     * - Synchronisation physique-visuel
     * - Optimisations de matrices
     *
     * @param {Object} _options - Options de création de l'objet
     * @param {Object} _options.base - Objet de base avec enfants
     * @param {Object} _options.collision - Objet de collision avec enfants
     * @param {number} _options.mass - Masse de l'objet (0 = statique)
     * @param {THREE.Vector3} _options.offset - Décalage de position
     * @param {THREE.Euler} _options.rotation - Rotation de l'objet
     * @param {boolean} _options.sleep - Si l'objet doit commencer endormi
     * @param {string} _options.soundName - Nom du son de collision
     * @param {Object} _options.shadow - Configuration des ombres
     * @returns {Object} Objet créé avec tous ses systèmes
     */
    add(_options)
    {
        const object = {}

        // Configuration des flags de fusion
        object.merged = false                                                              // Flag de fusion (non utilisé actuellement)
        object.shouldMerge = _options.mass === 0                                          // Fusion pour les objets statiques

        // Configuration du décalage de position
        const offset = new THREE.Vector3()
        if(_options.offset)
        {
            offset.copy(_options.offset)                                                  // Copie du décalage fourni
        }

        // Configuration de la rotation
        const rotation = new THREE.Euler()
        if(_options.rotation)
        {
            rotation.copy(_options.rotation)                                              // Copie de la rotation fournie
        }

        // Configuration du sommeil initial
        const sleep = typeof _options.sleep === 'undefined' ? true : _options.sleep      // Sommeil par défaut

        // Création et configuration du conteneur
        object.container = this.getConvertedMesh(_options.base.children, _options)       // Conversion des meshes
        object.container.position.copy(offset)                                           // Application du décalage
        object.container.rotation.copy(rotation)                                         // Application de la rotation
        this.container.add(object.container)                                             // Ajout au conteneur principal

        // Optimisation des matrices pour les objets statiques
        if(_options.mass === 0)
        {
            object.container.matrixAutoUpdate = false                                      // Désactivation de la mise à jour automatique
            object.container.updateMatrix()                                               // Mise à jour de la matrice

            // Optimisation des enfants
            for(const _child of object.container.children)
            {
                _child.matrixAutoUpdate = false                                           // Désactivation pour les enfants
                _child.updateMatrix()                                                     // Mise à jour des matrices
            }
        }

        // Création de l'objet physique
        object.collision = this.physics.addObjectFromThree({
            meshes: [..._options.collision.children],                                     // Meshes de collision
            offset,                                                                      // Décalage de position
            rotation,                                                                    // Rotation
            mass: _options.mass,                                                         // Masse de l'objet
            sleep                                                                        // État de sommeil initial
        })

        // Ajustement des positions des enfants par rapport au centre de collision
        for(const _child of object.container.children)
        {
            _child.position.sub(object.collision.center)                                 // Soustraction du centre de collision
        }

        // Configuration des sons de collision
        if(_options.soundName)
        {
            object.collision.body.addEventListener('collide', (_event) =>
            {
                const relativeVelocity = _event.contact.getImpactVelocityAlongNormal()   // Vitesse relative de l'impact
                this.sounds.play(_options.soundName, relativeVelocity)                   // Lecture du son avec intensité
            })
        }

        // Configuration des ombres portées
        if(_options.shadow)
        {
            this.shadows.add(object.container, _options.shadow)                          // Ajout des ombres
        }

        // Synchronisation physique-visuel pour les objets dynamiques
        if(_options.mass > 0)
        {
            this.time.on('tick', () =>
            {
                object.container.position.copy(object.collision.body.position)           // Synchronisation de la position
                object.container.quaternion.copy(object.collision.body.quaternion)      // Synchronisation de la rotation
            })
        }

        // Sauvegarde de l'objet
        this.items.push(object)                                                          // Ajout à la liste des objets

        return object
    }
}
