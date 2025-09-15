/**
 * EVENTEMITTER.JS - Classe de Gestion d'Événements
 * 
 * Ce fichier définit une classe EventEmitter personnalisée pour la gestion
 * des événements dans l'environnement 3D du portfolio. Il implémente un système
 * d'événements avec support des namespaces et des callbacks multiples.
 * 
 * RESPONSABILITÉS :
 * - Gestion des événements avec système de callbacks
 * - Support des namespaces pour organiser les événements
 * - Méthodes pour ajouter, supprimer et déclencher des événements
 * - Résolution des noms d'événements et des namespaces
 * 
 * CARACTÉRISTIQUES :
 * - Système d'événements basé sur des callbacks
 * - Support des namespaces (ex: 'event.namespace')
 * - Callbacks multiples par événement
 * - Gestion d'erreurs et validation
 * 
 * UTILISATION :
 * - Communication entre composants de l'application
 * - Déclenchement d'événements personnalisés
 * - Architecture event-driven
 * - Découplage des composants
 */

export default class
{
    /**
     * Constructor - Initialisation de l'EventEmitter
     * 
     * Initialise le système d'événements avec un objet de callbacks
     * et un namespace de base.
     */
    constructor()
    {
        // Objet principal pour stocker les callbacks
        this.callbacks = {}
        // Namespace de base pour les événements sans namespace
        this.callbacks.base = {}
    }

    /**
     * On - Ajout d'un listener d'événement
     * 
     * Ajoute un callback pour un ou plusieurs événements avec support
     * des namespaces. Peut accepter plusieurs noms séparés par des espaces.
     * 
     * @param {string} _names - Noms des événements (ex: 'event1 event2.namespace')
     * @param {Function} callback - Fonction à exécuter lors du déclenchement
     * @returns {Object} Instance de l'EventEmitter pour chaînage
     */
    on(_names, callback)
    {
        const that = this

        // Validation des paramètres
        if(typeof _names === 'undefined' || _names === '')
        {
            console.warn('wrong names')
            return false
        }

        if(typeof callback === 'undefined')
        {
            console.warn('wrong callback')
            return false
        }

        // Résolution des noms d'événements
        const names = this.resolveNames(_names)

        // Traitement de chaque nom d'événement
        names.forEach(function(_name)
        {
            // Résolution du nom et du namespace
            const name = that.resolveName(_name)

            // Création du namespace s'il n'existe pas
            if(!(that.callbacks[ name.namespace ] instanceof Object))
                that.callbacks[ name.namespace ] = {}

            // Création du tableau de callbacks s'il n'existe pas
            if(!(that.callbacks[ name.namespace ][ name.value ] instanceof Array))
                that.callbacks[ name.namespace ][ name.value ] = []

            // Ajout du callback au tableau
            that.callbacks[ name.namespace ][ name.value ].push(callback)
        })

        return this
    }

    /**
     * Off - Suppression d'un listener d'événement
     * 
     * Supprime un ou plusieurs callbacks pour des événements avec support
     * des namespaces. Peut supprimer des événements spécifiques ou des namespaces entiers.
     * 
     * @param {string} _names - Noms des événements à supprimer
     * @returns {Object} Instance de l'EventEmitter pour chaînage
     */
    off(_names)
    {
        const that = this

        // Validation des paramètres
        if(typeof _names === 'undefined' || _names === '')
        {
            console.warn('wrong name')
            return false
        }

        // Résolution des noms d'événements
        const names = this.resolveNames(_names)

        // Traitement de chaque nom d'événement
        names.forEach(function(_name)
        {
            // Résolution du nom et du namespace
            const name = that.resolveName(_name)

            // Suppression du namespace entier
            if(name.namespace !== 'base' && name.value === '')
            {
                delete that.callbacks[ name.namespace ]
            }

            // Suppression d'événements spécifiques
            else
            {
                // Namespace de base - suppression dans tous les namespaces
                if(name.namespace === 'base')
                {
                    // Parcours de tous les namespaces
                    for(const namespace in that.callbacks)
                    {
                        if(that.callbacks[ namespace ] instanceof Object && that.callbacks[ namespace ][ name.value ] instanceof Array)
                        {
                            delete that.callbacks[ namespace ][ name.value ]

                            // Suppression du namespace s'il est vide
                            if(Object.keys(that.callbacks[ namespace ]).length === 0)
                                delete that.callbacks[ namespace ]
                        }
                    }
                }

                // Namespace spécifique - suppression dans le namespace donné
                else if(that.callbacks[ name.namespace ] instanceof Object && that.callbacks[ name.namespace ][ name.value ] instanceof Array)
                {
                    delete that.callbacks[ name.namespace ][ name.value ]

                    // Suppression du namespace s'il est vide
                    if(Object.keys(that.callbacks[ name.namespace ]).length === 0)
                        delete that.callbacks[ name.namespace ]
                }
            }
        })

        return this
    }

    /**
     * Trigger - Déclenchement d'un événement
     * 
     * Déclenche un événement et exécute tous les callbacks associés.
     * Peut accepter des arguments à passer aux callbacks.
     * 
     * @param {string} _name - Nom de l'événement à déclencher
     * @param {Array} _args - Arguments à passer aux callbacks
     * @returns {*} Résultat du dernier callback exécuté
     */
    trigger(_name, _args)
    {
        // Validation des paramètres
        if(typeof _name === 'undefined' || _name === '')
        {
            console.warn('wrong name')
            return false
        }

        const that = this
        let finalResult = null
        let result = null

        // Préparation des arguments (tableau par défaut)
        const args = !(_args instanceof Array) ? [] : _args

        // Résolution du nom d'événement (un seul événement pour trigger)
        let name = this.resolveNames(_name)

        // Résolution du nom et du namespace
        name = this.resolveName(name[ 0 ])

        // Namespace de base - recherche dans tous les namespaces
        if(name.namespace === 'base')
        {
            // Parcours de tous les namespaces
            for(const namespace in that.callbacks)
            {
                if(that.callbacks[ namespace ] instanceof Object && that.callbacks[ namespace ][ name.value ] instanceof Array)
                {
                    // Exécution de tous les callbacks
                    that.callbacks[ namespace ][ name.value ].forEach(function(callback)
                    {
                        result = callback.apply(that, args)

                        // Stockage du premier résultat
                        if(typeof finalResult === 'undefined')
                        {
                            finalResult = result
                        }
                    })
                }
            }
        }

        // Namespace spécifique - recherche dans le namespace donné
        else if(this.callbacks[ name.namespace ] instanceof Object)
        {
            if(name.value === '')
            {
                console.warn('wrong name')
                return this
            }

            // Exécution de tous les callbacks du namespace
            that.callbacks[ name.namespace ][ name.value ].forEach(function(callback)
            {
                result = callback.apply(that, args)

                // Stockage du premier résultat
                if(typeof finalResult === 'undefined')
                    finalResult = result
            })
        }

        return finalResult
    }

    /**
     * ResolveNames - Résolution des noms d'événements
     * 
     * Parse et nettoie une chaîne de noms d'événements séparés par des espaces,
     * virgules ou slashes. Supprime les caractères non autorisés.
     * 
     * @param {string} _names - Chaîne de noms d'événements
     * @returns {Array} Tableau des noms d'événements nettoyés
     */
    resolveNames(_names)
    {
        let names = _names
        // Suppression des caractères non autorisés (lettres, chiffres, espaces, virgules, points, slashes)
        names = names.replace(/[^a-zA-Z0-9 ,/.]/g, '')
        // Remplacement des virgules et slashes par des espaces
        names = names.replace(/[,/]+/g, ' ')
        // Division en tableau
        names = names.split(' ')

        return names
    }

    /**
     * ResolveName - Résolution d'un nom d'événement
     * 
     * Parse un nom d'événement pour extraire le nom et le namespace.
     * Format: 'event.namespace' ou 'event' (namespace par défaut: 'base')
     * 
     * @param {string} name - Nom d'événement à parser
     * @returns {Object} Objet avec original, value et namespace
     */
    resolveName(name)
    {
        const newName = {}
        const parts = name.split('.')

        // Propriétés de base
        newName.original  = name                    // Nom original
        newName.value     = parts[ 0 ]              // Nom de l'événement
        newName.namespace = 'base'                  // Namespace par défaut

        // Namespace spécifié
        if(parts.length > 1 && parts[ 1 ] !== '')
        {
            newName.namespace = parts[ 1 ]
        }

        return newName
    }
}
