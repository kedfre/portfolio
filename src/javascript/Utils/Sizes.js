/**
 * SIZES.JS - Classe de Gestion des Dimensions
 * 
 * Ce fichier définit une classe Sizes pour la gestion des dimensions
 * de la fenêtre et du viewport dans l'environnement 3D du portfolio.
 * Il étend EventEmitter et fournit des dimensions précises pour le rendu.
 * 
 * RESPONSABILITÉS :
 * - Gestion des dimensions de la fenêtre (window)
 * - Gestion des dimensions du viewport (100vw/100vh)
 * - Écoute des événements de redimensionnement
 * - Émission d'événements de changement de taille
 * 
 * CARACTÉRISTIQUES :
 * - Mesure précise du viewport avec un élément DOM temporaire
 * - Gestion des dimensions de la fenêtre
 * - Système d'événements pour les changements de taille
 * - Optimisation pour le rendu 3D
 * 
 * UTILISATION :
 * - Configuration du renderer Three.js
 * - Adaptation responsive de l'interface
 * - Gestion des dimensions de la caméra
 * - Optimisation des performances de rendu
 */

import EventEmitter from './EventEmitter.js'

export default class Sizes extends EventEmitter
{
    /**
     * Constructor - Initialisation de la gestion des dimensions
     * 
     * Initialise le système de gestion des dimensions avec un élément DOM
     * temporaire pour mesurer précisément le viewport et écoute les événements
     * de redimensionnement de la fenêtre.
     */
    constructor()
    {
        super()

        // Objet pour stocker les dimensions du viewport
        this.viewport = {}
        
        // Création d'un élément DOM temporaire pour mesurer le viewport
        this.$sizeViewport = document.createElement('div')
        this.$sizeViewport.style.width = '100vw'                    // Largeur viewport
        this.$sizeViewport.style.height = '100vh'                   // Hauteur viewport
        this.$sizeViewport.style.position = 'absolute'              // Position absolue
        this.$sizeViewport.style.top = 0                            // Position en haut
        this.$sizeViewport.style.left = 0                           // Position à gauche
        this.$sizeViewport.style.pointerEvents = 'none'             // Pas d'interaction

        // Liaison de la méthode resize et ajout de l'écouteur d'événement
        this.resize = this.resize.bind(this)
        window.addEventListener('resize', this.resize)

        // Calcul initial des dimensions
        this.resize()
    }

    /**
     * Resize - Calcul des dimensions
     * 
     * Calcule les dimensions actuelles de la fenêtre et du viewport
     * en utilisant un élément DOM temporaire pour une mesure précise.
     * Déclenche l'événement 'resize' pour notifier les composants.
     */
    resize()
    {
        // Ajout temporaire de l'élément pour mesurer le viewport
        document.body.appendChild(this.$sizeViewport)
        
        // Mesure des dimensions du viewport
        this.viewport.width = this.$sizeViewport.offsetWidth
        this.viewport.height = this.$sizeViewport.offsetHeight
        
        // Suppression de l'élément temporaire
        document.body.removeChild(this.$sizeViewport)

        // Mesure des dimensions de la fenêtre
        this.width = window.innerWidth
        this.height = window.innerHeight

        // Déclenchement de l'événement de redimensionnement
        this.trigger('resize')
    }
}
