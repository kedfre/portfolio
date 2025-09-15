/**
 * TIME.JS - Classe de Gestion du Temps
 * 
 * Ce fichier définit une classe Time pour la gestion du temps
 * dans l'environnement 3D du portfolio. Il étend EventEmitter
 * et fournit un système de tick global avec delta time et temps écoulé.
 * 
 * RESPONSABILITÉS :
 * - Gestion du temps global de l'application
 * - Calcul du delta time entre les frames
 * - Calcul du temps écoulé depuis le démarrage
 * - Émission d'événements de tick pour l'animation
 * 
 * CARACTÉRISTIQUES :
 * - Système de tick basé sur requestAnimationFrame
 * - Delta time avec limitation pour éviter les sauts
 * - Temps écoulé depuis le démarrage
 * - Système d'événements pour les animations
 * 
 * UTILISATION :
 * - Animation des objets 3D
 * - Gestion des transitions et interpolations
 * - Synchronisation des effets temporels
 * - Optimisation des performances d'animation
 */

import EventEmitter from './EventEmitter.js'

export default class Time extends EventEmitter
{
    /**
     * Constructor - Initialisation du système de temps
     * 
     * Initialise le système de temps avec les valeurs de base
     * et démarre la boucle de tick pour l'animation.
     */
    constructor()
    {
        super()

        // Temps de démarrage de l'application
        this.start = Date.now()
        // Temps actuel (initialisé au temps de démarrage)
        this.current = this.start
        // Temps écoulé depuis le démarrage (initialisé à 0)
        this.elapsed = 0
        // Delta time entre les frames (initialisé à 16ms = 60fps)
        this.delta = 16

        // Liaison de la méthode tick et démarrage de la boucle
        this.tick = this.tick.bind(this)
        this.tick()
    }

    /**
     * Tick - Boucle principale d'animation
     * 
     * Boucle principale qui calcule le delta time et le temps écoulé,
     * puis déclenche l'événement 'tick' pour notifier les composants
     * qui ont besoin d'être mis à jour.
     */
    tick()
    {
        // Programmation de la prochaine frame
        this.ticker = window.requestAnimationFrame(this.tick)

        // Temps actuel en millisecondes
        const current = Date.now()

        // Calcul du delta time (temps écoulé depuis la dernière frame)
        this.delta = current - this.current
        // Calcul du temps écoulé depuis le démarrage
        this.elapsed = current - this.start
        // Mise à jour du temps actuel
        this.current = current

        // Limitation du delta time pour éviter les sauts importants
        if(this.delta > 60)
        {
            this.delta = 60
        }

        // Déclenchement de l'événement de tick
        this.trigger('tick')
    }

    /**
     * Stop - Arrêt du système de temps
     * 
     * Arrête la boucle d'animation en annulant la prochaine frame
     * programmée avec requestAnimationFrame.
     */
    stop()
    {
        window.cancelAnimationFrame(this.ticker)
    }
}
