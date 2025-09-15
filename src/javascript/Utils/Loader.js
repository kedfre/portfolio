/**
 * LOADER.JS - Classe de Chargement d'Assets
 * 
 * Ce fichier définit une classe Resources (Loader) pour le chargement
 * des assets dans l'environnement 3D du portfolio. Il étend EventEmitter
 * et gère le chargement de différents types de fichiers (images, modèles 3D).
 * 
 * RESPONSABILITÉS :
 * - Chargement d'assets de différents types (images, GLB, FBX, Draco)
 * - Gestion des loaders Three.js spécialisés
 * - Suivi de la progression du chargement
 * - Émission d'événements de progression et de fin
 * 
 * TYPES SUPPORTÉS :
 * - Images : jpg, png, webp
 * - Modèles 3D : glb, gltf, fbx
 * - Compression : drc (Draco)
 * 
 * CARACTÉRISTIQUES :
 * - Système d'événements pour la progression
 * - Loaders Three.js optimisés
 * - Support de la compression Draco
 * - Gestion d'erreurs et validation
 * 
 * UTILISATION :
 * - Chargement des assets du portfolio
 * - Suivi de la progression de chargement
 * - Gestion des ressources 3D
 * - Optimisation des performances
 */

import EventEmitter from './EventEmitter.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'

export default class Resources extends EventEmitter
{
    /**
     * Constructor - Initialisation du Loader
     * 
     * Initialise le système de chargement avec les loaders spécialisés
     * et les compteurs de progression.
     */
    constructor()
    {
        super()

        // Configuration des loaders spécialisés
        this.setLoaders()

        // Compteurs de progression
        this.toLoad = 0      // Nombre total d'assets à charger
        this.loaded = 0      // Nombre d'assets chargés
        this.items = {}      // Objet stockant les assets chargés
    }

    /**
     * SetLoaders - Configuration des loaders spécialisés
     * 
     * Configure les loaders pour différents types de fichiers avec
     * leurs extensions et actions de chargement correspondantes.
     */
    setLoaders()
    {
        this.loaders = []

        // Loader pour les images (jpg, png, webp)
        this.loaders.push({
            extensions: ['jpg', 'png', 'webp'],
            action: (_resource) =>
            {
                const image = new Image()

                // Gestion du chargement réussi
                image.addEventListener('load', () =>
                {
                    this.fileLoadEnd(_resource, image)
                })

                // Gestion des erreurs de chargement
                image.addEventListener('error', () =>
                {
                    this.fileLoadEnd(_resource, image)
                })

                // Démarrage du chargement
                image.src = _resource.source
            }
        })

        // Loader pour la compression Draco
        const dracoLoader = new DRACOLoader()
        dracoLoader.setDecoderPath('draco/')                    // Chemin vers les décodeurs
        dracoLoader.setDecoderConfig({ type: 'js' })           // Configuration JS

        this.loaders.push({
            extensions: ['drc'],
            action: (_resource) =>
            {
                dracoLoader.load(_resource.source, (_data) =>
                {
                    this.fileLoadEnd(_resource, _data)

                    // Libération du module décodeur pour optimiser la mémoire
                    DRACOLoader.releaseDecoderModule()
                })
            }
        })

        // Loader pour les modèles GLTF/GLB
        const gltfLoader = new GLTFLoader()
        gltfLoader.setDRACOLoader(dracoLoader)                 // Intégration du loader Draco

        this.loaders.push({
            extensions: ['glb', 'gltf'],
            action: (_resource) =>
            {
                gltfLoader.load(_resource.source, (_data) =>
                {
                    this.fileLoadEnd(_resource, _data)
                })
            }
        })

        // Loader pour les modèles FBX
        const fbxLoader = new FBXLoader()

        this.loaders.push({
            extensions: ['fbx'],
            action: (_resource) =>
            {
                fbxLoader.load(_resource.source, (_data) =>
                {
                    this.fileLoadEnd(_resource, _data)
                })
            }
        })
    }

    /**
     * Load - Démarrage du chargement des assets
     * 
     * Lance le chargement d'un tableau de ressources en utilisant
     * les loaders appropriés selon l'extension des fichiers.
     * 
     * @param {Array} _resources - Tableau des ressources à charger
     */
    load(_resources = [])
    {
        // Parcours de chaque ressource
        for(const _resource of _resources)
        {
            this.toLoad++
            
            // Extraction de l'extension du fichier
            const extensionMatch = _resource.source.match(/\.([a-z]+)$/)

            if(typeof extensionMatch[1] !== 'undefined')
            {
                const extension = extensionMatch[1]
                
                // Recherche du loader approprié pour cette extension
                const loader = this.loaders.find((_loader) => _loader.extensions.find((_extension) => _extension === extension))

                if(loader)
                {
                    // Démarrage du chargement avec le loader approprié
                    loader.action(_resource)
                }
                else
                {
                    console.warn(`Cannot found loader for ${_resource}`)
                }
            }
            else
            {
                console.warn(`Cannot found extension of ${_resource}`)
            }
        }
    }

    /**
     * FileLoadEnd - Fin du chargement d'un fichier
     * 
     * Appelée lorsqu'un fichier a fini de se charger (succès ou erreur).
     * Met à jour les compteurs et déclenche les événements appropriés.
     * 
     * @param {Object} _resource - Ressource qui a fini de se charger
     * @param {*} _data - Données chargées (image, modèle, etc.)
     */
    fileLoadEnd(_resource, _data)
    {
        this.loaded++                                    // Incrémentation du compteur
        this.items[_resource.name] = _data               // Stockage des données

        // Déclenchement de l'événement de fin de chargement d'un fichier
        this.trigger('fileEnd', [_resource, _data])

        // Vérification si tous les fichiers sont chargés
        if(this.loaded === this.toLoad)
        {
            // Déclenchement de l'événement de fin de chargement global
            this.trigger('end')
        }
    }
}
