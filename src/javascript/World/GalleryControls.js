/**
 * GALLERYCONTROLS.JS - Contrôles de Navigation de la Galerie
 *
 * Ce composant gère les contrôles de navigation de la galerie de véhicules.
 * Il fournit les flèches de navigation, les indicateurs de position et
 * le bouton de sélection.
 *
 * RESPONSABILITÉS :
 * - Flèches de navigation gauche/droite
 * - Indicateurs de position (points)
 * - Bouton de sélection "Choisir ce véhicule"
 * - Animations de transition
 * - Gestion des événements tactiles
 *
 * FONCTIONNALITÉS :
 * - Navigation fluide entre véhicules
 * - Indicateurs visuels de position
 * - Animations d'entrée/sortie
 * - Support tactile et clavier
 * - Interface de debug
 *
 * ARCHITECTURE :
 * - Conteneurs Three.js pour les éléments UI
 * - Gestion d'état pour la position actuelle
 * - Animations GSAP pour les transitions
 * - Système d'événements pour la communication
 */

import * as THREE from 'three'
import gsap from 'gsap'

export default class GalleryControls
{
    /**
     * Constructor - Initialisation des contrôles de la galerie
     *
     * Initialise les contrôles de navigation avec les flèches, indicateurs
     * et bouton de sélection.
     *
     * @param {Object} _options - Options de configuration
     * @param {Object} _options.debug - Interface de debug
     * @param {Array} _options.vehicles - Liste des véhicules disponibles
     * @param {Function} _options.onVehicleChange - Callback de changement de véhicule
     * @param {Function} _options.onVehicleSelect - Callback de sélection de véhicule
     */
    constructor(_options)
    {
        // Stockage des options de configuration
        this.debug = _options.debug
        this.vehicles = _options.vehicles
        this.onVehicleChange = _options.onVehicleChange
        this.onVehicleSelect = _options.onVehicleSelect
        this.onToggleColorSelector = _options.onToggleColorSelector

        // Configuration de l'interface de debug
        if(this.debug)
        {
            this.debugFolder = this.debug.addFolder('galleryControls')
        }

        // État des contrôles
        this.state = {
            currentVehicleIndex: 0,
            isVisible: false,
            isTransitioning: false
        }

        // Initialisation des composants
        this.setNavigationArrows()
        this.setEvents()
        this.setDebug()
    }

    /**
     * SetNavigationArrows - Configuration des boutons HTML
     *
     * Crée les boutons de navigation HTML simples.
     */
    setNavigationArrows()
    {
        // Création du conteneur HTML
        this.htmlContainer = document.createElement('div')
        this.htmlContainer.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 1000;
        `

        // Bouton gauche
        this.leftButton = document.createElement('button')
        this.leftButton.innerHTML = '←'
        this.leftButton.style.cssText = `
            position: absolute;
            left: 20px;
            top: 50%;
            transform: translateY(-50%);
            width: 60px;
            height: 60px;
            border: none;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.8);
            color: #333;
            font-size: 24px;
            cursor: pointer;
            pointer-events: auto;
            transition: all 0.3s ease;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
        `
        this.leftButton.addEventListener('mouseenter', () => {
            this.leftButton.style.background = 'rgba(255, 255, 255, 1)'
            this.leftButton.style.transform = 'translateY(-50%) scale(1.1)'
        })
        this.leftButton.addEventListener('mouseleave', () => {
            this.leftButton.style.background = 'rgba(255, 255, 255, 0.8)'
            this.leftButton.style.transform = 'translateY(-50%) scale(1)'
        })
        this.leftButton.addEventListener('click', () => {
            console.log('Clic sur bouton gauche')
            this.previousVehicle()
        })

        // Bouton droite
        this.rightButton = document.createElement('button')
        this.rightButton.innerHTML = '→'
        this.rightButton.style.cssText = `
            position: absolute;
            right: 20px;
            top: 50%;
            transform: translateY(-50%);
            width: 60px;
            height: 60px;
            border: none;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.8);
            color: #333;
            font-size: 24px;
            cursor: pointer;
            pointer-events: auto;
            transition: all 0.3s ease;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
        `
        this.rightButton.addEventListener('mouseenter', () => {
            this.rightButton.style.background = 'rgba(255, 255, 255, 1)'
            this.rightButton.style.transform = 'translateY(-50%) scale(1.1)'
        })
        this.rightButton.addEventListener('mouseleave', () => {
            this.rightButton.style.background = 'rgba(255, 255, 255, 0.8)'
            this.rightButton.style.transform = 'translateY(-50%) scale(1)'
        })
        this.rightButton.addEventListener('click', () => {
            console.log('Clic sur bouton droite')
            this.nextVehicle()
        })

        // Bouton sélecteur de couleurs
        this.colorButton = document.createElement('button')
        this.colorButton.innerHTML = '🎨'
        this.colorButton.style.cssText = `
            position: absolute;
            top: 20px;
            right: 20px;
            width: 50px;
            height: 50px;
            border: none;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.8);
            color: #333;
            font-size: 20px;
            cursor: pointer;
            pointer-events: auto;
            transition: all 0.3s ease;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
        `
        this.colorButton.addEventListener('mouseenter', () => {
            this.colorButton.style.background = 'rgba(255, 255, 255, 1)'
            this.colorButton.style.transform = 'scale(1.1)'
        })
        this.colorButton.addEventListener('mouseleave', () => {
            this.colorButton.style.background = 'rgba(255, 255, 255, 0.8)'
            this.colorButton.style.transform = 'scale(1)'
        })
        this.colorButton.addEventListener('click', () => {
            console.log('Clic sur bouton couleurs')
            this.toggleColorSelector()
        })

        // Bouton "Choisir ce véhicule" centré en bas
        this.chooseButton = document.createElement('button')
        this.chooseButton.innerHTML = 'Choisir ce véhicule'
        this.chooseButton.style.cssText = `
            position: absolute;
            bottom: 30px;
            left: 50%;
            transform: translateX(-50%);
            padding: 15px 30px;
            border: none;
            border-radius: 25px;
            background: linear-gradient(135deg, #00ff88, #00cc6a);
            color: white;
            font-size: 16px;
            font-weight: bold;
            cursor: pointer;
            pointer-events: auto;
            transition: all 0.3s ease;
            box-shadow: 0 6px 20px rgba(0, 255, 136, 0.3);
            text-transform: uppercase;
            letter-spacing: 1px;
        `
        this.chooseButton.addEventListener('mouseenter', () => {
            this.chooseButton.style.background = 'linear-gradient(135deg, #00cc6a, #00aa55)'
            this.chooseButton.style.transform = 'translateX(-50%) scale(1.05)'
            this.chooseButton.style.boxShadow = '0 8px 25px rgba(0, 255, 136, 0.4)'
        })
        this.chooseButton.addEventListener('mouseleave', () => {
            this.chooseButton.style.background = 'linear-gradient(135deg, #00ff88, #00cc6a)'
            this.chooseButton.style.transform = 'translateX(-50%) scale(1)'
            this.chooseButton.style.boxShadow = '0 6px 20px rgba(0, 255, 136, 0.3)'
        })
        this.chooseButton.addEventListener('click', () => {
            console.log('Clic sur bouton "Choisir ce véhicule"')
            this.selectVehicle()
        })

        // Ajout des boutons au conteneur
        this.htmlContainer.appendChild(this.leftButton)
        this.htmlContainer.appendChild(this.rightButton)
        this.htmlContainer.appendChild(this.colorButton)
        this.htmlContainer.appendChild(this.chooseButton)

        // Ajout au DOM
        document.body.appendChild(this.htmlContainer)
        
        // Masquage initial des boutons HTML
        this.htmlContainer.style.display = 'none'
    }

    // Méthodes 3D supprimées - on utilise maintenant des boutons HTML simples

    /**
     * AnimateArrows - Animation des flèches
     *
     * Crée une animation de pulsation pour les flèches.
     */
    // Animations 3D supprimées - on utilise maintenant des boutons HTML avec CSS



    /**
     * SetEvents - Configuration des événements
     *
     * Configure les événements de clic pour les contrôles.
     */
    setEvents()
    {
        // Les événements sont maintenant gérés directement dans setNavigationArrows()
        // avec addEventListener sur les boutons HTML
        console.log('Événements configurés via boutons HTML')
    }

    /**
     * SetDebug - Configuration de l'interface de debug
     *
     * Ajoute les contrôles de debug pour les contrôles.
     */
    setDebug()
    {
        if(!this.debug)
        {
            return
        }

        // Contrôles d'état
        this.debugFolder.add(this.state, 'currentVehicleIndex').min(0).max(this.vehicles.length - 1).step(1).name('currentVehicleIndex')
        this.debugFolder.add(this.state, 'isVisible').name('isVisible')

        // Actions
        this.debugFolder.add(this, 'nextVehicle').name('nextVehicle')
        this.debugFolder.add(this, 'previousVehicle').name('previousVehicle')
        this.debugFolder.add(this, 'selectVehicle').name('selectVehicle')
        this.debugFolder.add(this, 'show').name('show')
        this.debugFolder.add(this, 'hide').name('hide')
    }

    /**
     * Show - Affichage des contrôles
     *
     * Affiche les contrôles avec une animation d'entrée.
     */
    show()
    {
        if(this.state.isVisible)
        {
            return
        }

        this.state.isVisible = true
        this.htmlContainer.style.display = 'block'

        console.log('Affichage des boutons HTML')

        // Animation d'entrée des boutons HTML
        gsap.fromTo([this.leftButton, this.rightButton, this.colorButton, this.chooseButton],
            {
                scale: 0.8,
                opacity: 0
            },
            {
                scale: 1,
                opacity: 1,
                duration: 0.5,
                ease: 'back.out(1.7)',
                stagger: 0.1
            }
        )
    }

    /**
     * Hide - Masquage des contrôles
     *
     * Masque les contrôles avec une animation de sortie.
     */
    hide()
    {
        if(!this.state.isVisible)
        {
            return
        }

        this.state.isVisible = false

        // Animation de sortie des boutons HTML
        gsap.to([this.leftButton, this.rightButton, this.colorButton, this.chooseButton],
            {
                scale: 0.8,
                opacity: 0,
                duration: 0.3,
                ease: 'back.in(1.7)',
                onComplete: () =>
                {
                    this.htmlContainer.style.display = 'none'
                }
            }
        )
    }

    /**
     * SetCurrentVehicle - Mise à jour du véhicule actuel
     *
     * Met à jour l'affichage des contrôles selon le véhicule actuel.
     *
     * @param {number} _index - Index du véhicule actuel
     */
    setCurrentVehicle(_index)
    {
        if(_index < 0 || _index >= this.vehicles.length)
        {
            return
        }

        this.state.currentVehicleIndex = _index
        // Plus d'indicateurs 3D - on utilise seulement les boutons HTML
    }

    /**
     * NextVehicle - Véhicule suivant
     *
     * Passe au véhicule suivant et déclenche le callback.
     */
    nextVehicle()
    {
        if(this.state.isTransitioning)
        {
            return
        }

        const nextIndex = (this.state.currentVehicleIndex + 1) % this.vehicles.length
        this.setCurrentVehicle(nextIndex)

        if(this.onVehicleChange)
        {
            this.onVehicleChange(nextIndex)
        }
    }

    /**
     * PreviousVehicle - Véhicule précédent
     *
     * Passe au véhicule précédent et déclenche le callback.
     */
    previousVehicle()
    {
        if(this.state.isTransitioning)
        {
            return
        }

        const prevIndex = this.state.currentVehicleIndex === 0 
            ? this.vehicles.length - 1 
            : this.state.currentVehicleIndex - 1
        this.setCurrentVehicle(prevIndex)

        if(this.onVehicleChange)
        {
            this.onVehicleChange(prevIndex)
        }
    }

    /**
     * SelectVehicle - Sélection du véhicule
     *
     * Sélectionne le véhicule actuel et déclenche le callback.
     */
    selectVehicle()
    {
        if(this.state.isTransitioning)
        {
            return
        }

        const selectedVehicle = this.vehicles[this.state.currentVehicleIndex]

        if(this.onVehicleSelect)
        {
            this.onVehicleSelect(selectedVehicle)
        }
    }

    /**
     * SetCamera - Configuration de la caméra
     *
     * Définit la caméra pour le raycaster.
     *
     * @param {THREE.Camera} _camera - Caméra à utiliser
     */
    setCamera(_camera)
    {
        this.camera = _camera
    }

    /**
     * ToggleColorSelector - Basculement du sélecteur de couleurs
     *
     * Ouvre ou ferme le sélecteur de couleurs.
     */
    toggleColorSelector()
    {
        // Cette méthode sera appelée par le parent (VehicleGallery)
        // qui a accès au colorSelector
        console.log('🎨 toggleColorSelector appelé, callback disponible:', !!this.onToggleColorSelector)
        if(this.onToggleColorSelector)
        {
            this.onToggleColorSelector()
        }
        else
        {
            console.warn('❌ onToggleColorSelector callback non défini')
        }
    }

    /**
     * Destroy - Destruction des contrôles
     *
     * Nettoie toutes les ressources utilisées par les contrôles.
     */
    destroy()
    {
        // Suppression des éléments HTML
        if(this.htmlContainer && this.htmlContainer.parentNode)
        {
            this.htmlContainer.parentNode.removeChild(this.htmlContainer)
        }
    }
}
