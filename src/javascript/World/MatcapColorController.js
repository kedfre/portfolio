/**
 * MATCAPCOLORCONTROLLER.JS - Contrôleur de Couleurs des Matcaps
 *
 * Ce composant permet de modifier dynamiquement les couleurs des matcaps
 * appliqués aux véhicules dans la galerie.
 *
 * FONCTIONNALITÉS :
 * - Modification des couleurs des matcaps en temps réel
 * - Interface de debug pour sélectionner les couleurs
 * - Support de tous les types de matcaps (chrome, métal, verre, etc.)
 * - Sauvegarde des préférences de couleur
 * - Application des couleurs aux véhicules existants
 *
 * UTILISATION :
 * - Intégration avec VehiclePreview
 * - Contrôles de debug pour l'interface
 * - Modification des couleurs par nom de matériau
 */

import * as THREE from 'three'

export default class MatcapColorController
{
    /**
     * Constructor - Initialisation du contrôleur de couleurs
     *
     * @param {Object} _options - Options de configuration
     * @param {Object} _options.debug - Interface de debug
     * @param {Object} _options.resources - Gestionnaire de ressources
     */
    constructor(_options)
    {
        this.debug = _options.debug
        this.resources = _options.resources
        
        // Configuration des couleurs par défaut pour chaque type de matcap
        this.colorPresets = {
            chrome: { hue: 0, saturation: 0, lightness: 0.8 },
            blackMetal: { hue: 0, saturation: 0, lightness: 0.2 },
            orangeDuckHazzard: { hue: 30, saturation: 0.8, lightness: 0.6 },
            glass: { hue: 180, saturation: 0.3, lightness: 0.9 },
            black: { hue: 0, saturation: 0, lightness: 0.1 },
            white: { hue: 0, saturation: 0, lightness: 0.95 },
            yellow: { hue: 60, saturation: 0.8, lightness: 0.7 },
            red: { hue: 0, saturation: 0.8, lightness: 0.6 },
            metal: { hue: 0, saturation: 0, lightness: 0.5 },
            gray: { hue: 0, saturation: 0, lightness: 0.6 }
        }
        
        // État actuel des couleurs
        this.currentColors = { ...this.colorPresets }
        
        // Référence au véhicule actuel pour les mises à jour
        this.currentVehicle = null
        
        // Initialisation de l'interface de debug
        this.setDebug()
    }
    
    /**
     * SetDebug - Configuration de l'interface de debug
     *
     * Ajoute les contrôles de couleur pour chaque type de matcap.
     */
    setDebug()
    {
        if(!this.debug)
        {
            return
        }
        
        // Dossier principal pour les couleurs de matcaps
        this.debugFolder = this.debug.addFolder('matcapColors')
        
        // Création des contrôles pour chaque type de matcap
        Object.keys(this.colorPresets).forEach(matcapType => {
            const matcapFolder = this.debugFolder.addFolder(matcapType)
            
            // Contrôle de la teinte (Hue)
            matcapFolder.add(this.currentColors[matcapType], 'hue')
                .min(0).max(360).step(1)
                .name('Hue')
                .onChange(() => this.updateMatcapColor(matcapType))
            
            // Contrôle de la saturation
            matcapFolder.add(this.currentColors[matcapType], 'saturation')
                .min(0).max(1).step(0.01)
                .name('Saturation')
                .onChange(() => this.updateMatcapColor(matcapType))
            
            // Contrôle de la luminosité
            matcapFolder.add(this.currentColors[matcapType], 'lightness')
                .min(0).max(1).step(0.01)
                .name('Lightness')
                .onChange(() => this.updateMatcapColor(matcapType))
            
            // Bouton de réinitialisation
            matcapFolder.add(this, 'resetMatcapColor', matcapType).name('Reset')
        })
        
        // Actions globales
        this.debugFolder.add(this, 'resetAllColors').name('Reset All')
        this.debugFolder.add(this, 'applyColorsToVehicle').name('Apply to Vehicle')
    }
    
    /**
     * UpdateMatcapColor - Mise à jour de la couleur d'un matcap
     *
     * @param {string} _matcapType - Type de matcap à modifier
     */
    updateMatcapColor(_matcapType)
    {
        console.log(`🎨 Mise à jour de la couleur pour ${_matcapType}:`, this.currentColors[_matcapType])
        
        // Si un véhicule est actuellement affiché, appliquer les changements
        if(this.currentVehicle)
        {
            this.applyColorsToVehicle(this.currentVehicle)
        }
    }
    
    /**
     * ApplyColorsToVehicle - Application des couleurs au véhicule actuel
     *
     * @param {Object} _vehicle - Véhicule à modifier
     */
    applyColorsToVehicle(_vehicle)
    {
        if(!_vehicle || !_vehicle.container)
        {
            console.warn('❌ Aucun véhicule valide pour appliquer les couleurs')
            return
        }
        
        console.log('🎨 Application des couleurs au véhicule')
        
        // Parcourir tous les meshes du véhicule
        _vehicle.container.traverse((child) => {
            if(child instanceof THREE.Mesh && child.material)
            {
                // Déterminer le type de matcap selon le nom
                const meshName = child.name.toLowerCase()
                let matcapType = this.getMatcapTypeFromName(meshName)
                
                if(matcapType && this.currentColors[matcapType])
                {
                    // Créer un nouveau matériau avec la couleur modifiée
                    const newMaterial = this.createColoredMatcapMaterial(matcapType)
                    child.material = newMaterial
                    child.material.needsUpdate = true
                    
                    console.log(`🎨 Couleur appliquée à ${child.name} (${matcapType})`)
                }
            }
        })
    }
    
    /**
     * GetMatcapTypeFromName - Détermination du type de matcap selon le nom
     *
     * @param {string} _meshName - Nom du mesh
     * @returns {string|null} Type de matcap ou null
     */
    getMatcapTypeFromName(_meshName)
    {
        const name = _meshName.toLowerCase()
        
        if(name.includes('chrome')) return 'chrome'
        if(name.includes('blackmetal')) return 'blackMetal'
        if(name.includes('orangeduckhazzard')) return 'orangeDuckHazzard'
        if(name.includes('glass')) return 'glass'
        if(name.includes('black')) return 'black'
        if(name.includes('white')) return 'white'
        if(name.includes('yellow')) return 'yellow'
        if(name.includes('red')) return 'red'
        
        return null
    }
    
    /**
     * CreateColoredMatcapMaterial - Création d'un matériau matcap coloré
     *
     * @param {string} _matcapType - Type de matcap
     * @returns {THREE.MeshMatcapMaterial} Matériau avec couleur modifiée
     */
    createColoredMatcapMaterial(_matcapType)
    {
        const colorConfig = this.currentColors[_matcapType]
        
        // Conversion HSL vers RGB
        const color = new THREE.Color()
        color.setHSL(colorConfig.hue / 360, colorConfig.saturation, colorConfig.lightness)
        
        // Création du matériau avec la couleur
        const material = new THREE.MeshMatcapMaterial({
            color: color,
            matcap: this.getOriginalMatcapTexture(_matcapType)
        })
        
        return material
    }
    
    /**
     * GetOriginalMatcapTexture - Récupération de la texture matcap originale
     *
     * @param {string} _matcapType - Type de matcap
     * @returns {THREE.Texture} Texture matcap originale
     */
    getOriginalMatcapTexture(_matcapType)
    {
        const textureMap = {
            chrome: this.resources.items.matcapChromeTexture,
            blackMetal: this.resources.items.matcapBlackMetalTexture,
            orangeDuckHazzard: this.resources.items.matcapOrangeDuckHazzardTexture,
            glass: this.resources.items.matcapGlassTexture,
            black: this.resources.items.matcapBlackTexture,
            white: this.resources.items.matcapWhiteTexture,
            yellow: this.resources.items.matcapYellowTexture,
            red: this.resources.items.matcapRedTexture,
            metal: this.resources.items.matcapMetalTexture,
            gray: this.resources.items.matcapGrayTexture
        }
        
        return textureMap[_matcapType] || this.resources.items.matcapGrayTexture
    }
    
    /**
     * ResetMatcapColor - Réinitialisation d'une couleur de matcap
     *
     * @param {string} _matcapType - Type de matcap à réinitialiser
     */
    resetMatcapColor(_matcapType)
    {
        this.currentColors[_matcapType] = { ...this.colorPresets[_matcapType] }
        console.log(`🔄 Couleur réinitialisée pour ${_matcapType}`)
        
        if(this.currentVehicle)
        {
            this.applyColorsToVehicle(this.currentVehicle)
        }
    }
    
    /**
     * ResetAllColors - Réinitialisation de toutes les couleurs
     */
    resetAllColors()
    {
        this.currentColors = { ...this.colorPresets }
        console.log('🔄 Toutes les couleurs ont été réinitialisées')
        
        if(this.currentVehicle)
        {
            this.applyColorsToVehicle(this.currentVehicle)
        }
    }
    
    /**
     * SetCurrentVehicle - Définition du véhicule actuel
     *
     * @param {Object} _vehicle - Véhicule actuel
     */
    setCurrentVehicle(_vehicle)
    {
        this.currentVehicle = _vehicle
        console.log('🚗 Véhicule actuel défini pour le contrôleur de couleurs')
    }
    
    /**
     * GetColorConfig - Récupération de la configuration de couleur
     *
     * @param {string} _matcapType - Type de matcap
     * @returns {Object} Configuration de couleur
     */
    getColorConfig(_matcapType)
    {
        return this.currentColors[_matcapType] || this.colorPresets[_matcapType]
    }
    
    /**
     * SetColorConfig - Définition d'une configuration de couleur
     *
     * @param {string} _matcapType - Type de matcap
     * @param {Object} _config - Configuration de couleur
     */
    setColorConfig(_matcapType, _config)
    {
        this.currentColors[_matcapType] = { ..._config }
        console.log(`🎨 Configuration de couleur mise à jour pour ${_matcapType}:`, _config)
        
        if(this.currentVehicle)
        {
            this.applyColorsToVehicle(this.currentVehicle)
        }
    }
}