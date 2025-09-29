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

        // Configuration de l'interface de debug
        if(this.debug)
        {
            this.debugFolder = this.debug.addFolder('galleryControls')
        }

        // Configuration du conteneur principal
        this.container = new THREE.Object3D()
        this.container.matrixAutoUpdate = false

        // État des contrôles
        this.state = {
            currentVehicleIndex: 0,
            isVisible: false,
            isTransitioning: false
        }

        // Initialisation des composants
        this.setNavigationArrows()
        this.setPositionIndicators()
        this.setSelectButton()
        this.setEvents()
        this.setDebug()

        // Masquage initial
        this.container.visible = false
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

        // Ajout des boutons au conteneur
        this.htmlContainer.appendChild(this.leftButton)
        this.htmlContainer.appendChild(this.rightButton)

        // Ajout au DOM
        document.body.appendChild(this.htmlContainer)
    }

    // Méthodes 3D supprimées - on utilise maintenant des boutons HTML simples

    /**
     * AnimateArrows - Animation des flèches
     *
     * Crée une animation de pulsation pour les flèches.
     */
    // Animations 3D supprimées - on utilise maintenant des boutons HTML avec CSS

    /**
     * SetPositionIndicators - Configuration des indicateurs de position
     *
     * Crée les points indicateurs qui montrent la position actuelle
     * dans la liste des véhicules.
     */
    setPositionIndicators()
    {
        // Conteneur pour les indicateurs
        this.indicatorsContainer = new THREE.Object3D()
        this.indicatorsContainer.position.set(0, -2, 0)
        this.container.add(this.indicatorsContainer)

        // Création des indicateurs
        this.indicators = []
        const spacing = 0.8
        const startX = -(this.vehicles.length - 1) * spacing / 2

        for(let i = 0; i < this.vehicles.length; i++)
        {
            const indicator = this.createIndicator(i)
            indicator.position.set(startX + i * spacing, 0, 0)
            this.indicatorsContainer.add(indicator)
            this.indicators.push(indicator)
        }

        // Mise à jour de l'indicateur actuel
        this.updateIndicators()
    }

    /**
     * CreateIndicator - Création d'un indicateur
     *
     * Crée un point indicateur pour une position donnée.
     *
     * @param {number} _index - Index de l'indicateur
     * @returns {THREE.Mesh} Indicateur créé
     */
    createIndicator(_index)
    {
        // Géométrie du point
        const geometry = new THREE.SphereGeometry(0.1, 8, 8)
        
        // Matériau du point
        const material = new THREE.MeshBasicMaterial({
            color: 0x666666,
            transparent: true,
            opacity: 0.6
        })

        // Création du mesh
        const indicator = new THREE.Mesh(geometry, material)
        indicator.matrixAutoUpdate = false

        // Ajout d'un effet de brillance
        const glowGeometry = new THREE.SphereGeometry(0.12, 8, 8)
        const glowMaterial = new THREE.MeshBasicMaterial({
            color: 0x00ffff,
            transparent: true,
            opacity: 0.2
        })
        const glow = new THREE.Mesh(glowGeometry, glowMaterial)
        glow.matrixAutoUpdate = false
        indicator.add(glow)

        return indicator
    }

    /**
     * SetSelectButton - Configuration du bouton de sélection
     *
     * Crée le bouton "Choisir ce véhicule" pour confirmer la sélection.
     */
    setSelectButton()
    {
        // Conteneur pour le bouton
        this.buttonContainer = new THREE.Object3D()
        this.buttonContainer.position.set(0, 2.5, 0)
        this.container.add(this.buttonContainer)

        // Géométrie du bouton
        const geometry = new THREE.PlaneGeometry(3, 0.8)
        
        // Matériau du bouton
        const material = new THREE.MeshBasicMaterial({
            color: 0x00ff00,
            transparent: true,
            opacity: 0.8
        })

        // Création du mesh
        this.selectButton = new THREE.Mesh(geometry, material)
        this.selectButton.matrixAutoUpdate = false
        this.buttonContainer.add(this.selectButton)

        // Ajout d'un effet de brillance
        const glowGeometry = new THREE.PlaneGeometry(3.2, 1)
        const glowMaterial = new THREE.MeshBasicMaterial({
            color: 0x00ffff,
            transparent: true,
            opacity: 0.3
        })
        const glow = new THREE.Mesh(glowGeometry, glowMaterial)
        glow.matrixAutoUpdate = false
        this.selectButton.add(glow)

        // Animation de pulsation du bouton
        gsap.to(this.selectButton.scale, {
            x: 1.05,
            y: 1.05,
            z: 1.05,
            duration: 2,
            repeat: -1,
            yoyo: true,
            ease: 'power2.inOut'
        })
    }

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

        // Animation d'entrée des boutons
        gsap.fromTo([this.leftButton, this.rightButton],
            {
                scale: 0.8,
                opacity: 0
            },
            {
                scale: 1,
                opacity: 1,
                duration: 0.5,
                ease: 'back.out(1.7)'
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

        // Animation de sortie des boutons
        gsap.to([this.leftButton, this.rightButton],
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
        this.updateIndicators()
    }

    /**
     * UpdateIndicators - Mise à jour des indicateurs
     *
     * Met à jour l'apparence des indicateurs selon la position actuelle.
     */
    updateIndicators()
    {
        for(let i = 0; i < this.indicators.length; i++)
        {
            const indicator = this.indicators[i]
            const isActive = i === this.state.currentVehicleIndex

            // Animation de l'indicateur actif
            if(isActive)
            {
                gsap.to(indicator.scale, {
                    x: 1.5,
                    y: 1.5,
                    z: 1.5,
                    duration: 0.3,
                    ease: 'back.out(1.7)'
                })

                gsap.to(indicator.material, {
                    opacity: 1,
                    duration: 0.3
                })
            }
            else
            {
                gsap.to(indicator.scale, {
                    x: 1,
                    y: 1,
                    z: 1,
                    duration: 0.3,
                    ease: 'power2.out'
                })

                gsap.to(indicator.material, {
                    opacity: 0.6,
                    duration: 0.3
                })
            }
        }
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

        // Nettoyage du conteneur 3D
        this.container.clear()
    }
}
