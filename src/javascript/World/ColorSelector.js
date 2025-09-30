/**
 * COLORSELECTOR.JS - Interface de Sélection des Couleurs des Matcaps
 *
 * Ce composant fournit une interface utilisateur pour modifier les couleurs
 * des matcaps des véhicules dans la galerie. Il s'intègre avec le
 * MatcapColorController pour offrir une expérience utilisateur intuitive.
 *
 * FONCTIONNALITÉS :
 * - Interface HTML pour sélectionner les couleurs
 * - Contrôles HSL (Hue, Saturation, Lightness) pour chaque type de matcap
 * - Prévisualisation en temps réel des couleurs
 * - Boutons de réinitialisation
 * - Intégration avec MatcapColorController
 * - Animations d'apparition/disparition
 *
 * UTILISATION :
 * - Intégration dans VehicleGallery
 * - Interface utilisateur pour la personnalisation
 * - Contrôles visuels pour les couleurs
 */

export default class ColorSelector
{
    /**
     * Constructor - Initialisation du sélecteur de couleurs
     *
     * @param {Object} _options - Options de configuration
     * @param {Object} _options.matcapColorController - Contrôleur de couleurs des matcaps
     * @param {Object} _options.debug - Interface de debug
     */
    constructor(_options)
    {
        this.matcapColorController = _options.matcapColorController
        this.debug = _options.debug
        
        // État de l'interface
        this.state = {
            isVisible: false,
            currentMatcapType: null
        }
        
        // Types de matcaps disponibles
        this.matcapTypes = [
            { key: 'chrome', name: 'Chrome', color: '#C0C0C0' },
            { key: 'blackMetal', name: 'Métal Noir', color: '#333333' },
            { key: 'orangeDuckHazzard', name: 'Orange Duke Hazzard', color: '#FF6600' },
            { key: 'glass', name: 'Verre', color: '#E6F3FF' },
            { key: 'black', name: 'Noir', color: '#000000' },
            { key: 'white', name: 'Blanc', color: '#FFFFFF' },
            { key: 'yellow', name: 'Jaune', color: '#FFFF00' },
            { key: 'red', name: 'Rouge', color: '#FF0000' },
            { key: 'metal', name: 'Métal', color: '#808080' },
            { key: 'gray', name: 'Gris', color: '#999999' }
        ]
        
        // Initialisation de l'interface
        this.setHTML()
        this.setEvents()
        this.setDebug()
    }
    
    /**
     * SetHTML - Création de l'interface HTML
     *
     * Crée l'interface utilisateur avec les contrôles de couleur.
     */
    setHTML()
    {
        // Conteneur principal
        this.container = document.createElement('div')
        this.container.className = 'color-selector'
        this.container.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            width: 300px;
            background: rgba(0, 0, 0, 0.8);
            border-radius: 10px;
            padding: 20px;
            color: white;
            font-family: 'Comic Neue', cursive;
            font-size: 14px;
            z-index: 1000;
            transform: translateX(100%);
            transition: transform 0.3s ease;
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.1);
        `
        
        // Titre
        const title = document.createElement('h3')
        title.textContent = '🎨 Couleurs des Matcaps'
        title.style.cssText = `
            margin: 0 0 15px 0;
            font-size: 16px;
            font-weight: bold;
            text-align: center;
        `
        this.container.appendChild(title)
        
        // Sélecteur de type de matcap
        const matcapSelector = document.createElement('select')
        matcapSelector.className = 'matcap-type-selector'
        matcapSelector.style.cssText = `
            width: 100%;
            padding: 8px;
            margin-bottom: 15px;
            border: none;
            border-radius: 5px;
            background: rgba(255, 255, 255, 0.1);
            color: white;
            font-family: inherit;
        `
        
        // Option par défaut
        const defaultOption = document.createElement('option')
        defaultOption.value = ''
        defaultOption.textContent = 'Sélectionner un matériau...'
        matcapSelector.appendChild(defaultOption)
        
        // Options pour chaque type de matcap
        this.matcapTypes.forEach(matcap => {
            const option = document.createElement('option')
            option.value = matcap.key
            option.textContent = matcap.name
            matcapSelector.appendChild(option)
        })
        
        this.container.appendChild(matcapSelector)
        
        // Conteneur des contrôles de couleur
        this.colorControlsContainer = document.createElement('div')
        this.colorControlsContainer.className = 'color-controls'
        this.colorControlsContainer.style.cssText = `
            display: none;
        `
        
        // Contrôles HSL
        this.createHSLControls()
        
        this.container.appendChild(this.colorControlsContainer)
        
        // Boutons d'action
        this.createActionButtons()
        
        // Ajout au DOM
        document.body.appendChild(this.container)
        
        // Stockage des références
        this.matcapSelector = matcapSelector
    }
    
    /**
     * CreateHSLControls - Création des contrôles HSL
     *
     * Crée les sliders pour Hue, Saturation et Lightness.
     */
    createHSLControls()
    {
        // Contrôle Hue
        const hueGroup = this.createSliderGroup('Hue', 'hue', 0, 360, 1)
        this.colorControlsContainer.appendChild(hueGroup)
        
        // Contrôle Saturation
        const saturationGroup = this.createSliderGroup('Saturation', 'saturation', 0, 1, 0.01)
        this.colorControlsContainer.appendChild(saturationGroup)
        
        // Contrôle Lightness
        const lightnessGroup = this.createSliderGroup('Lightness', 'lightness', 0, 1, 0.01)
        this.colorControlsContainer.appendChild(lightnessGroup)
        
        // Prévisualisation de la couleur
        this.colorPreview = document.createElement('div')
        this.colorPreview.className = 'color-preview'
        this.colorPreview.style.cssText = `
            width: 100%;
            height: 40px;
            border-radius: 5px;
            margin: 10px 0;
            border: 2px solid rgba(255, 255, 255, 0.3);
            background: #808080;
        `
        this.colorControlsContainer.appendChild(this.colorPreview)
    }
    
    /**
     * CreateSliderGroup - Création d'un groupe de slider
     *
     * @param {string} _label - Label du slider
     * @param {string} _property - Propriété à contrôler
     * @param {number} _min - Valeur minimale
     * @param {number} _max - Valeur maximale
     * @param {number} _step - Pas du slider
     * @returns {HTMLElement} Groupe de slider
     */
    createSliderGroup(_label, _property, _min, _max, _step)
    {
        const group = document.createElement('div')
        group.className = `slider-group ${_property}`
        group.style.cssText = `
            margin-bottom: 10px;
        `
        
        // Label
        const label = document.createElement('label')
        label.textContent = _label
        label.style.cssText = `
            display: block;
            margin-bottom: 5px;
            font-weight: bold;
        `
        group.appendChild(label)
        
        // Conteneur slider + valeur
        const sliderContainer = document.createElement('div')
        sliderContainer.style.cssText = `
            display: flex;
            align-items: center;
            gap: 10px;
        `
        
        // Slider
        const slider = document.createElement('input')
        slider.type = 'range'
        slider.min = _min
        slider.max = _max
        slider.step = _step
        slider.className = `color-slider ${_property}`
        slider.style.cssText = `
            flex: 1;
            height: 6px;
            border-radius: 3px;
            background: rgba(255, 255, 255, 0.2);
            outline: none;
            -webkit-appearance: none;
        `
        
        // Style du slider
        slider.style.background = `linear-gradient(to right, 
            rgba(255, 255, 255, 0.2) 0%, 
            rgba(255, 255, 255, 0.8) 50%, 
            rgba(255, 255, 255, 0.2) 100%)`
        
        // Valeur affichée
        const valueDisplay = document.createElement('span')
        valueDisplay.className = `value-display ${_property}`
        valueDisplay.style.cssText = `
            min-width: 40px;
            text-align: right;
            font-family: monospace;
            font-size: 12px;
        `
        
        sliderContainer.appendChild(slider)
        sliderContainer.appendChild(valueDisplay)
        group.appendChild(sliderContainer)
        
        // Stockage des références
        this[`${_property}Slider`] = slider
        this[`${_property}Value`] = valueDisplay
        
        // Ajout de l'événement directement ici
        slider.addEventListener('input', (event) => {
            const value = parseFloat(event.target.value)
            valueDisplay.textContent = _property === 'hue' ? 
                Math.round(value) + '°' : 
                (value * 100).toFixed(0) + '%'
            
            this.updateColor()
        })
        
        return group
    }
    
    /**
     * CreateActionButtons - Création des boutons d'action
     *
     * Crée les boutons de réinitialisation et de fermeture.
     */
    createActionButtons()
    {
        const buttonContainer = document.createElement('div')
        buttonContainer.style.cssText = `
            display: flex;
            gap: 10px;
            margin-top: 15px;
        `
        
        // Bouton Reset
        const resetButton = document.createElement('button')
        resetButton.textContent = '🔄 Reset'
        resetButton.className = 'reset-button'
        resetButton.style.cssText = `
            flex: 1;
            padding: 8px;
            border: none;
            border-radius: 5px;
            background: rgba(255, 100, 100, 0.8);
            color: white;
            font-family: inherit;
            cursor: pointer;
            transition: background 0.2s;
        `
        buttonContainer.appendChild(resetButton)
        
        // Bouton Fermer
        const closeButton = document.createElement('button')
        closeButton.textContent = '✕ Fermer'
        closeButton.className = 'close-button'
        closeButton.style.cssText = `
            flex: 1;
            padding: 8px;
            border: none;
            border-radius: 5px;
            background: rgba(100, 100, 100, 0.8);
            color: white;
            font-family: inherit;
            cursor: pointer;
            transition: background 0.2s;
        `
        buttonContainer.appendChild(closeButton)
        
        this.container.appendChild(buttonContainer)
        
        // Stockage des références
        this.resetButton = resetButton
        this.closeButton = closeButton
    }
    
    /**
     * SetEvents - Configuration des événements
     *
     * Configure les événements pour l'interface utilisateur.
     */
    setEvents()
    {
        // Sélection du type de matcap
        this.matcapSelector.addEventListener('change', (event) => {
            const matcapType = event.target.value
            if(matcapType) {
                this.selectMatcapType(matcapType)
            } else {
                this.hideColorControls()
            }
        })
        
        // Les événements des sliders sont maintenant ajoutés directement dans createSliderGroup()
        
        // Bouton Reset
        if(this.resetButton) {
            this.resetButton.addEventListener('click', () => {
                this.resetCurrentMatcap()
            })
        }
        
        // Bouton Fermer
        if(this.closeButton) {
            this.closeButton.addEventListener('click', () => {
                this.hide()
            })
        }
        
        // Hover effects
        if(this.resetButton) {
            this.resetButton.addEventListener('mouseenter', () => {
                this.resetButton.style.background = 'rgba(255, 100, 100, 1)'
            })
            this.resetButton.addEventListener('mouseleave', () => {
                this.resetButton.style.background = 'rgba(255, 100, 100, 0.8)'
            })
        }
        
        if(this.closeButton) {
            this.closeButton.addEventListener('mouseenter', () => {
                this.closeButton.style.background = 'rgba(100, 100, 100, 1)'
            })
            this.closeButton.addEventListener('mouseleave', () => {
                this.closeButton.style.background = 'rgba(100, 100, 100, 0.8)'
            })
        }
    }
    
    /**
     * SelectMatcapType - Sélection d'un type de matcap
     *
     * @param {string} _matcapType - Type de matcap sélectionné
     */
    selectMatcapType(_matcapType)
    {
        this.state.currentMatcapType = _matcapType
        
        // Récupération de la configuration actuelle
        const colorConfig = this.matcapColorController.getColorConfig(_matcapType)
        
        // Mise à jour des sliders
        this.hueSlider.value = colorConfig.hue
        this.saturationSlider.value = colorConfig.saturation
        this.lightnessSlider.value = colorConfig.lightness
        
        // Mise à jour des affichages de valeur
        this.hueValue.textContent = Math.round(colorConfig.hue) + '°'
        this.saturationValue.textContent = (colorConfig.saturation * 100).toFixed(0) + '%'
        this.lightnessValue.textContent = (colorConfig.lightness * 100).toFixed(0) + '%'
        
        // Affichage des contrôles
        this.showColorControls()
        
        // Mise à jour de la prévisualisation
        this.updateColorPreview()
        
        console.log(`🎨 Type de matcap sélectionné: ${_matcapType}`)
    }
    
    /**
     * ShowColorControls - Affichage des contrôles de couleur
     */
    showColorControls()
    {
        this.colorControlsContainer.style.display = 'block'
    }
    
    /**
     * HideColorControls - Masquage des contrôles de couleur
     */
    hideColorControls()
    {
        this.colorControlsContainer.style.display = 'none'
        this.state.currentMatcapType = null
    }
    
    /**
     * UpdateColor - Mise à jour de la couleur
     *
     * Met à jour la couleur du matcap sélectionné.
     */
    updateColor()
    {
        if(!this.state.currentMatcapType) return
        
        const colorConfig = {
            hue: parseFloat(this.hueSlider.value),
            saturation: parseFloat(this.saturationSlider.value),
            lightness: parseFloat(this.lightnessSlider.value)
        }
        
        // Mise à jour du contrôleur
        this.matcapColorController.setColorConfig(this.state.currentMatcapType, colorConfig)
        
        // Mise à jour de la prévisualisation
        this.updateColorPreview()
    }
    
    /**
     * UpdateColorPreview - Mise à jour de la prévisualisation
     *
     * Met à jour l'affichage de prévisualisation de la couleur.
     */
    updateColorPreview()
    {
        if(!this.state.currentMatcapType) return
        
        const hue = parseFloat(this.hueSlider.value)
        const saturation = parseFloat(this.saturationSlider.value)
        const lightness = parseFloat(this.lightnessSlider.value)
        
        // Conversion HSL vers CSS
        const color = `hsl(${hue}, ${saturation * 100}%, ${lightness * 100}%)`
        this.colorPreview.style.background = color
    }
    
    /**
     * ResetCurrentMatcap - Réinitialisation du matcap actuel
     */
    resetCurrentMatcap()
    {
        if(!this.state.currentMatcapType) return
        
        this.matcapColorController.resetMatcapColor(this.state.currentMatcapType)
        
        // Mise à jour de l'interface
        this.selectMatcapType(this.state.currentMatcapType)
        
        console.log(`🔄 Matcap ${this.state.currentMatcapType} réinitialisé`)
    }
    
    /**
     * Show - Affichage du sélecteur
     */
    show()
    {
        this.state.isVisible = true
        this.container.style.transform = 'translateX(0)'
        console.log('🎨 Sélecteur de couleurs affiché')
    }
    
    /**
     * Hide - Masquage du sélecteur
     */
    hide()
    {
        this.state.isVisible = false
        this.container.style.transform = 'translateX(100%)'
        console.log('🎨 Sélecteur de couleurs masqué')
    }
    
    /**
     * Toggle - Basculement de l'affichage
     */
    toggle()
    {
        console.log('🎨 ColorSelector.toggle appelé, état actuel:', this.state.isVisible)
        if(this.state.isVisible) {
            this.hide()
        } else {
            this.show()
        }
    }
    
    /**
     * SetDebug - Configuration de l'interface de debug
     */
    setDebug()
    {
        if(!this.debug) return
        
        this.debugFolder = this.debug.addFolder('colorSelector')
        this.debugFolder.add(this.state, 'isVisible').name('isVisible')
        this.debugFolder.add(this, 'show').name('show')
        this.debugFolder.add(this, 'hide').name('hide')
        this.debugFolder.add(this, 'toggle').name('toggle')
    }
    
    /**
     * Destroy - Destruction du sélecteur
     */
    destroy()
    {
        if(this.container && this.container.parentNode) {
            this.container.parentNode.removeChild(this.container)
        }
        console.log('🎨 Sélecteur de couleurs détruit')
    }
}
