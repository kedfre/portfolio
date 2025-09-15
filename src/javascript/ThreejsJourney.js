/**
 * THREEJSJOURNEY.JS - Interface Promotionnelle
 * 
 * Ce fichier gère l'interface promotionnelle pour Three.js Journey.
 * Il s'agit d'un popup intelligent qui apparaît après une certaine distance parcourue.
 * 
 * FONCTIONNALITÉS :
 * - Déclenchement basé sur la distance parcourue par la voiture
 * - Persistance avec localStorage pour éviter le spam
 * - Animations fluides avec GSAP
 * - Gestion des interactions (clics, survols)
 * - Messages séquentiels avec transitions
 * 
 * LOGIQUE DE DÉCLENCHEMENT :
 * - Distance minimale : 75 unités (5 en mode debug)
 * - Multiplicateur selon le nombre de vues précédentes
 * - Désactivé sur mobile (touch)
 * - Peut être désactivé définitivement par l'utilisateur
 * 
 * ARCHITECTURE :
 * - Messages séquentiels avec étapes
 * - Animations de position et visibilité
 * - Gestion des états (hover, active, visible)
 * - Persistance des préférences utilisateur
 * 
 * OPTIMISATIONS :
 * - Évite le spam avec localStorage
 * - Désactivé sur mobile pour l'UX
 * - Animations performantes avec GSAP
 * - Gestion intelligente des événements
 */

import gsap from 'gsap'

export default class ThreejsJourney
{
    /**
     * Constructor - Initialisation de l'interface promotionnelle
     * 
     * @param {Object} _options - Options de configuration
     * @param {Object} _options.config - Configuration de l'application
     * @param {Object} _options.time - Gestionnaire de temps
     * @param {Object} _options.world - Monde 3D
     * 
     * LOGIQUE DE DÉCLENCHEMENT :
     * - Suit la distance parcourue par la voiture
     * - Distance minimale : 75 unités (5 en debug)
     * - Multiplicateur selon le nombre de vues précédentes
     * - Désactivé sur mobile et si l'utilisateur a refusé
     */
    constructor(_options)
    {
        // Options
        this.config = _options.config
        this.time = _options.time
        this.world = _options.world

        // Éléments DOM
        this.$container = document.querySelector('.js-threejs-journey')
        this.$messages = [...this.$container.querySelectorAll('.js-message')]
        this.$yes = this.$container.querySelector('.js-yes')
        this.$no = this.$container.querySelector('.js-no')
        
        // État de l'interface
        this.step = 0                                    // Étape actuelle
        this.maxStep = this.$messages.length - 1         // Nombre total d'étapes
        this.shown = false                               // Interface déjà affichée
        this.traveledDistance = 0                        // Distance parcourue
        
        // Persistance avec localStorage
        this.seenCount = window.localStorage.getItem('threejsJourneySeenCount') || 0
        this.seenCount = parseInt(this.seenCount)
        this.prevent = !!window.localStorage.getItem('threejsJourneyPrevent')
        
        // Distance minimale avec multiplicateur
        this.minTraveledDistance = (this.config.debug ? 5 : 75) * (this.seenCount + 1)

        // Démarrage immédiat en mode debug
        if(this.config.debug)
            this.start()
        
        // Arrêt si l'utilisateur a refusé définitivement
        if(this.prevent)
            return

        // Configuration des interactions et logs
        this.setYesNo()
        this.setLog()

        // Surveillance de la distance parcourue
        this.time.on('tick', () =>
        {
            if(this.world.physics)
            {
                // Accumulation de la distance parcourue
                this.traveledDistance += this.world.physics.car.forwardSpeed

                // Déclenchement si conditions remplies
                if(!this.config.touch && !this.shown && this.traveledDistance > this.minTraveledDistance)
                {
                    this.start()
                }
            }
        })
    }

    /**
     * setYesNo - Configuration des interactions utilisateur
     * 
     * Configure les événements de clic et de survol pour les boutons "Oui" et "Non".
     * Gère la persistance des préférences utilisateur et les animations de transition.
     * 
     * FONCTIONNALITÉS :
     * - Bouton "Oui" : Désactive définitivement l'interface
     * - Bouton "Non" : Continue la séquence puis masque l'interface
     * - Effets de survol avec classes CSS
     * - Persistance avec localStorage
     */
    setYesNo()
    {
        // Gestion du clic sur "Oui" (accepter)
        this.$yes.addEventListener('click', () =>
        {
            // Délai de 2 secondes avant de masquer l'interface
            gsap.delayedCall(2, () =>
            {
                this.hide()
            })
            // Sauvegarde de la préférence : ne plus afficher l'interface
            window.localStorage.setItem('threejsJourneyPrevent', 1)
        })

        // Gestion du clic sur "Non" (refuser)
        this.$no.addEventListener('click', () =>
        {
            // Passage au message suivant
            this.next()

            // Délai de 5 secondes avant de masquer l'interface
            gsap.delayedCall(5, () =>
            {
                this.hide()
            })
        })

        // Effets de survol pour le bouton "Oui"
        this.$yes.addEventListener('mouseenter', () =>
        {
            this.$container.classList.remove('is-hover-none')
            this.$container.classList.remove('is-hover-no')
            this.$container.classList.add('is-hover-yes')
        })

        // Effets de survol pour le bouton "Non"
        this.$no.addEventListener('mouseenter', () =>
        {
            this.$container.classList.remove('is-hover-none')
            this.$container.classList.add('is-hover-no')
            this.$container.classList.remove('is-hover-yes')
        })

        // Restauration de l'état par défaut au survol du bouton "Oui"
        this.$yes.addEventListener('mouseleave', () =>
        {
            this.$container.classList.add('is-hover-none')
            this.$container.classList.remove('is-hover-no')
            this.$container.classList.remove('is-hover-yes')
        })

        // Restauration de l'état par défaut au survol du bouton "Non"
        this.$no.addEventListener('mouseleave', () =>
        {
            this.$container.classList.add('is-hover-none')
            this.$container.classList.remove('is-hover-no')
            this.$container.classList.remove('is-hover-yes')
        })
    }

    /**
     * setLog - Messages de console pour les développeurs
     * 
     * Affiche des messages colorés dans la console pour promouvoir Three.js Journey.
     * Ces messages s'affichent automatiquement au chargement de l'interface.
     * 
     * MESSAGES :
     * - Message d'accueil pour les développeurs
     * - Question sur l'apprentissage du portfolio
     * - Lien vers Three.js Journey avec code de parrainage
     * - Signature de Bruno Simon
     * 
     * @note Le logo ASCII en commentaire peut être décommenté pour un effet visuel
     */
    setLog()
    {
        // Logo ASCII de Three.js Journey (commenté pour économiser l'espace console)
        // console.log(
        //     `%c 
        // ▶
        // ▶▶▶▶
        // ▶▶▶▶▶▶▶
        // ▶▶▶▶▶▶▶▶▶▶
        // ▶▶▶▶▶▶▶▶     ▶
        // ▶▶▶▶      ▶▶▶▶▶▶▶▶
        // ▶     ▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶
        //    ▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶
        //       ▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶      
        // ▶▶        ▶▶▶▶▶▶▶▶▶▶     ▶   ▶▶▶
        // ▶▶▶▶▶▶        ▶      ▶▶▶▶▶   ▶▶▶▶▶▶
        // ▶▶▶▶▶▶▶▶▶▶▶       ▶▶▶▶▶▶▶▶   ▶▶▶▶▶▶▶▶▶
        // ▶▶▶▶▶▶▶▶▶▶▶▶▶   ▶▶▶▶▶▶▶▶▶▶   ▶▶▶▶▶▶▶
        // ▶▶▶▶▶▶▶▶▶▶▶▶▶   ▶▶▶▶▶▶▶▶▶▶   ▶▶▶▶
        // ▶▶▶▶▶▶▶▶▶▶▶▶▶   ▶▶▶▶▶▶▶▶▶▶   ▶
        //  ▶▶▶▶▶▶▶▶▶▶▶▶   ▶▶▶▶▶▶▶▶▶▶
        //      ▶▶▶▶▶▶▶▶   ▶▶▶▶▶▶▶
        // ▶▶▶▶     ▶▶▶▶   ▶▶▶
        // ▶▶▶▶▶▶▶     ▶   
        // ▶▶▶▶▶▶▶▶▶▶
        // ▶▶▶▶▶▶▶
        // ▶▶
        //             `,
        //     'color: #705df2;'
        // )
        
        // Messages promotionnels colorés
        console.log('%cWhat are you doing here?! you sneaky developer...', 'color: #32ffce');
        console.log('%cDo you want to learn how this portfolio has been made?', 'color: #32ffce');
        console.log('%cCheckout Three.js Journey 👉 https://threejs-journey.com?c=p2', 'color: #32ffce');
        console.log('%c— Bruno', 'color: #777777');
    }

    /**
     * hide - Masquage de l'interface promotionnelle
     * 
     * Masque progressivement l'interface en retirant la visibilité des messages
     * puis en désactivant le container principal avec un délai.
     * 
     * SÉQUENCE :
     * 1. Retrait de la classe 'is-visible' de tous les messages
     * 2. Délai de 0.5s pour laisser l'animation se terminer
     * 3. Retrait de la classe 'is-active' du container
     */
    hide()
    {
        // Masquage de tous les messages
        for(const _$message of this.$messages)
        {
            _$message.classList.remove('is-visible')
        }

        // Délai avant de désactiver complètement l'interface
        gsap.delayedCall(0.5, () =>
        {
            this.$container.classList.remove('is-active')
        })
    }

    /**
     * start - Démarrage de l'interface promotionnelle
     * 
     * Active l'interface et lance la séquence de messages avec des délais programmés.
     * Met à jour le compteur de vues et marque l'interface comme affichée.
     * 
     * SÉQUENCE DE MESSAGES :
     * - Message 1 : Immédiatement
     * - Message 2 : Après 4 secondes
     * - Message 3 : Après 7 secondes
     * 
     * PERSISTANCE :
     * - Incrémente le compteur de vues dans localStorage
     * - Marque l'interface comme affichée pour éviter les répétitions
     */
    start()
    {
        // Activation de l'interface
        this.$container.classList.add('is-active')

        // Lancement de la séquence de messages
        window.requestAnimationFrame(() =>
        {
            // Premier message immédiat
            this.next()

            // Deuxième message après 4 secondes
            gsap.delayedCall(4, () =>
            {
                this.next()
            })
            
            // Troisième message après 7 secondes
            gsap.delayedCall(7, () =>
            {
                this.next()
            })
        })

        // Marquage de l'interface comme affichée
        this.shown = true
        
        // Incrémentation du compteur de vues
        window.localStorage.setItem('threejsJourneySeenCount', this.seenCount + 1)
    }

    /**
     * updateMessages - Mise à jour de l'affichage des messages
     * 
     * Gère la visibilité et le positionnement des messages selon l'étape actuelle.
     * Les messages visibles sont empilés verticalement avec un espacement de 20px.
     * 
     * LOGIQUE D'AFFICHAGE :
     * - Messages visibles : i < this.step
     * - Messages cachés : i >= this.step
     * - Positionnement : translateY pour l'empilement vertical
     * - Espacement : 20px entre chaque message
     * 
     * ALGORITHME :
     * 1. Détermine la visibilité de chaque message
     * 2. Inverse l'ordre pour le positionnement (du bas vers le haut)
     * 3. Calcule les positions avec accumulation de hauteur
     * 4. Restaure l'ordre original
     */
    updateMessages()
    {
        let i = 0

        // Gestion de la visibilité des messages
        for(const _$message of this.$messages)
        {
            if(i < this.step)
                _$message.classList.add('is-visible')

            i++
        }

        // Positionnement des messages (ordre inversé pour calculer du bas vers le haut)
        this.$messages.reverse()

        let height = 0
        i = this.maxStep
        for(const _$message of this.$messages)
        {
            const messageHeight = _$message.offsetHeight
            if(i < this.step)
            {
                // Message visible : positionnement avec accumulation de hauteur
                _$message.style.transform = `translateY(${- height}px)`
                height += messageHeight + 20 // Espacement de 20px
            }
            else
            {
                // Message caché : positionnement hors écran
                _$message.style.transform = `translateY(${messageHeight}px)`
            }

            i--
        }

        // Restauration de l'ordre original des messages
        this.$messages.reverse()
    }

    /**
     * next - Passage au message suivant
     * 
     * Incrémente l'étape actuelle et met à jour l'affichage des messages.
     * Vérifie que l'étape ne dépasse pas le nombre maximum de messages.
     * 
     * VALIDATION :
     * - Vérifie que this.step <= this.maxStep
     * - Retourne silencieusement si limite atteinte
     * 
     * ACTIONS :
     * - Incrémente this.step
     * - Met à jour l'affichage via updateMessages()
     */
    next()
    {
        // Vérification de la limite d'étapes
        if(this.step > this.maxStep)
            return

        // Passage à l'étape suivante
        this.step++

        // Mise à jour de l'affichage des messages
        this.updateMessages()
    }
}