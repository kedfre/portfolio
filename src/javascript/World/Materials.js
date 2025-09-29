/**
 * WORLD/MATERIALS.JS - Gestionnaire de Matériaux
 *
 * Ce fichier gère tous les matériaux utilisés dans l'environnement 3D du portfolio.
 * Il centralise la création, la configuration et la gestion des matériaux Three.js,
 * incluant les matériaux de base, les matériaux matcap avancés et les matériaux d'ombres.
 *
 * RESPONSABILITÉS :
 * - Gestion centralisée de tous les matériaux
 * - Configuration des matériaux matcap avec uniforms
 * - Gestion des matériaux de base (pures couleurs)
 * - Configuration des matériaux d'ombres de sol
 * - Interface de debug pour tous les matériaux
 *
 * TYPES DE MATÉRIAUX GÉRÉS :
 * - Matériaux purs : Couleurs de base (rouge, blanc, jaune)
 * - Matériaux matcap : 13 matériaux avec textures matcap
 * - Matériau d'ombre de sol : Matériau shader pour les ombres
 *
 * MATÉRIAUX MATCAP :
 * - white, orange, green, brown, gray, beige, red, black
 * - emeraldGreen, purple, blue, yellow, metal
 * - Chaque matériau utilise une texture matcap spécifique
 * - Uniforms partagés pour l'éclairage indirect et la révélation
 *
 * ARCHITECTURE :
 * - Pattern de gestionnaire centralisé
 * - Uniforms partagés entre matériaux similaires
 * - Interface de debug intégrée avec dat.GUI
 * - Mise à jour automatique des uniforms
 * - Références croisées avec les ressources
 *
 * OPTIMISATIONS :
 * - Réutilisation des uniforms entre matériaux
 * - Mise à jour groupée des matériaux
 * - Interface de debug pour ajustements en temps réel
 * - Gestion centralisée des couleurs et paramètres
 */

import * as THREE from 'three'
import FloorShadowMaterial from '../Materials/FloorShadow.js'
import MatcapMaterial from '../Materials/Matcap.js'

export default class Materials
{
    /**
     * Constructor - Initialisation du gestionnaire de matériaux
     *
     * Initialise le gestionnaire centralisé de tous les matériaux utilisés
     * dans l'environnement 3D. Configure les matériaux de base, les matériaux
     * matcap avancés et les matériaux d'ombres avec leurs interfaces de debug.
     *
     * @param {Object} _options - Options de configuration
     * @param {Object} _options.resources - Gestionnaire des ressources (Resources.js)
     * @param {Object} _options.debug - Interface de debug (dat.GUI)
     */
    constructor(_options)
    {
        // Stockage des options de configuration
        this.resources = _options.resources                                              // Gestionnaire des ressources pour les textures
        this.debug = _options.debug                                                      // Interface de debug

        // Configuration de l'interface de debug
        if(this.debug)
        {
            this.debugFolder = this.debug.addFolder('materials')                        // Dossier de debug pour les matériaux
            this.debugFolder.open()                                                      // Ouverture automatique du dossier
        }

        // Initialisation du conteneur principal des matériaux
        this.items = {}                                                                  // Conteneur principal pour tous les matériaux

        // Initialisation séquentielle de tous les types de matériaux
        this.setPures()                                                                  // Matériaux de base (couleurs pures)
        this.setShades()                                                                 // Matériaux matcap avancés
        this.setFloorShadow()                                                            // Matériau d'ombre de sol
    }

    /**
     * SetPures - Configuration des matériaux de base (couleurs pures)
     *
     * Crée des matériaux Three.js de base avec des couleurs pures.
     * Ces matériaux sont utilisés pour des éléments simples qui n'ont pas
     * besoin d'effets avancés comme l'éclairage ou les textures.
     *
     * MATÉRIAUX CRÉÉS :
     * - Rouge : Matériau rouge pur (0xff0000)
     * - Blanc : Matériau blanc pur (0xffffff)
     * - Jaune : Matériau jaune personnalisé (0xffe889)
     */
    setPures()
    {
        // Configuration du conteneur des matériaux purs
        this.pures = {}
        this.pures.items = {}

        // Matériau rouge pur
        this.pures.items.red = new THREE.MeshBasicMaterial({ color: 0xff0000 })         // Rouge pur
        this.pures.items.red.name = 'pureRed'                                           // Nom pour identification

        // Matériau blanc pur
        this.pures.items.white = new THREE.MeshBasicMaterial({ color: 0xffffff })       // Blanc pur
        this.pures.items.white.name = 'pureWhite'                                       // Nom pour identification

        // Matériau jaune personnalisé
        this.pures.items.yellow = new THREE.MeshBasicMaterial({ color: 0xffe889 })      // Jaune personnalisé
        this.pures.items.yellow.name = 'pureYellow'                                     // Nom pour identification
    }

    /**
     * SetShades - Configuration des matériaux matcap avancés
     *
     * Crée et configure tous les matériaux matcap utilisés dans l'environnement 3D.
     * Ces matériaux utilisent la technique matcap pour un rendu réaliste avec
     * éclairage indirect et animations de révélation.
     *
     * FONCTIONNALITÉS :
     * - 13 matériaux matcap avec textures spécifiques
     * - Uniforms partagés pour l'éclairage indirect
     * - Animation de révélation progressive
     * - Interface de debug pour ajustements en temps réel
     * - Mise à jour automatique des uniforms
     *
     * MATÉRIAUX MATCAP :
     * - white, orange, green, brown, gray, beige, red, black
     * - emeraldGreen, purple, blue, yellow, metal
     */
    setShades()
    {
        // Configuration du conteneur des matériaux matcap
        this.shades = {}
        this.shades.items = {}
        this.shades.indirectColor = '#d04500'                                            // Couleur de l'éclairage indirect

        // Configuration des uniforms partagés entre tous les matériaux matcap
        this.shades.uniforms = {
            uRevealProgress: 0,                                                          // Progression de la révélation (0-1)
            uIndirectDistanceAmplitude: 1.75,                                           // Amplitude de la distance indirecte
            uIndirectDistanceStrength: 0.5,                                             // Force de la distance indirecte
            uIndirectDistancePower: 2.0,                                                // Puissance de la distance indirecte
            uIndirectAngleStrength: 1.5,                                                // Force de l'angle indirect
            uIndirectAngleOffset: 0.6,                                                  // Décalage de l'angle indirect
            uIndirectAnglePower: 1.0,                                                   // Puissance de l'angle indirect
            uIndirectColor: null                                                         // Couleur de l'éclairage indirect (définie plus tard)
        }

        // Création des matériaux matcap individuels

        // Matériau matcap blanc
        this.shades.items.white = new MatcapMaterial()                                   // Création du matériau matcap
        this.shades.items.white.name = 'shadeWhite'                                      // Nom pour identification
        this.shades.items.white.uniforms.matcap.value = this.resources.items.matcapWhiteTexture  // Assignation de la texture matcap
        this.items.white = this.shades.items.white                                       // Ajout au conteneur principal

        // Matériau matcap orange
        this.shades.items.orange = new MatcapMaterial()                                  // Création du matériau matcap
        this.shades.items.orange.name = 'shadeOrange'                                    // Nom pour identification
        this.shades.items.orange.uniforms.matcap.value = this.resources.items.matcapOrangeTexture  // Assignation de la texture matcap
        this.items.orange = this.shades.items.orange                                     // Ajout au conteneur principal

        // Matériau matcap vert
        this.shades.items.green = new MatcapMaterial()                                   // Création du matériau matcap
        this.shades.items.green.name = 'shadeGreen'                                      // Nom pour identification
        this.shades.items.green.uniforms.matcap.value = this.resources.items.matcapGreenTexture  // Assignation de la texture matcap
        this.items.green = this.shades.items.green                                       // Ajout au conteneur principal

        // Matériau matcap marron
        this.shades.items.brown = new MatcapMaterial()                                   // Création du matériau matcap
        this.shades.items.brown.name = 'shadeBrown'                                      // Nom pour identification
        this.shades.items.brown.uniforms.matcap.value = this.resources.items.matcapBrownTexture  // Assignation de la texture matcap
        this.items.brown = this.shades.items.brown                                       // Ajout au conteneur principal

        // Matériau matcap gris
        this.shades.items.gray = new MatcapMaterial()                                    // Création du matériau matcap
        this.shades.items.gray.name = 'shadeGray'                                        // Nom pour identification
        this.shades.items.gray.uniforms.matcap.value = this.resources.items.matcapGrayTexture  // Assignation de la texture matcap
        this.items.gray = this.shades.items.gray                                         // Ajout au conteneur principal

        // Matériau matcap beige
        this.shades.items.beige = new MatcapMaterial()                                   // Création du matériau matcap
        this.shades.items.beige.name = 'shadeBeige'                                      // Nom pour identification
        this.shades.items.beige.uniforms.matcap.value = this.resources.items.matcapBeigeTexture  // Assignation de la texture matcap
        this.items.beige = this.shades.items.beige                                       // Ajout au conteneur principal

        // Matériau matcap rouge
        this.shades.items.red = new MatcapMaterial()                                     // Création du matériau matcap
        this.shades.items.red.name = 'shadeRed'                                          // Nom pour identification
        this.shades.items.red.uniforms.matcap.value = this.resources.items.matcapRedTexture  // Assignation de la texture matcap
        this.items.red = this.shades.items.red                                           // Ajout au conteneur principal

        // Matériau matcap noir
        this.shades.items.black = new MatcapMaterial()                                   // Création du matériau matcap
        this.shades.items.black.name = 'shadeBlack'                                      // Nom pour identification
        this.shades.items.black.uniforms.matcap.value = this.resources.items.matcapBlackTexture  // Assignation de la texture matcap
        this.items.black = this.shades.items.black                                       // Ajout au conteneur principal

        // Matériau matcap vert émeraude
        this.shades.items.emeraldGreen = new MatcapMaterial()                            // Création du matériau matcap
        this.shades.items.emeraldGreen.name = 'shadeEmeraldGreen'                        // Nom pour identification
        this.shades.items.emeraldGreen.uniforms.matcap.value = this.resources.items.matcapEmeraldGreenTexture  // Assignation de la texture matcap
        this.items.emeraldGreen = this.shades.items.emeraldGreen                         // Ajout au conteneur principal

        // Matériau matcap violet
        this.shades.items.purple = new MatcapMaterial()                                  // Création du matériau matcap
        this.shades.items.purple.name = 'shadePurple'                                    // Nom pour identification
        this.shades.items.purple.uniforms.matcap.value = this.resources.items.matcapPurpleTexture  // Assignation de la texture matcap
        this.items.purple = this.shades.items.purple                                     // Ajout au conteneur principal

        // Matériau matcap bleu
        this.shades.items.blue = new MatcapMaterial()                                    // Création du matériau matcap
        this.shades.items.blue.name = 'shadeBlue'                                        // Nom pour identification
        this.shades.items.blue.uniforms.matcap.value = this.resources.items.matcapBlueTexture  // Assignation de la texture matcap
        this.items.blue = this.shades.items.blue                                         // Ajout au conteneur principal

        // Matériau matcap jaune
        this.shades.items.yellow = new MatcapMaterial()                                  // Création du matériau matcap
        this.shades.items.yellow.name = 'shadeYellow'                                    // Nom pour identification
        this.shades.items.yellow.uniforms.matcap.value = this.resources.items.matcapYellowTexture  // Assignation de la texture matcap
        this.items.yellow = this.shades.items.yellow                                     // Ajout au conteneur principal

        // Matériau matcap métal
        this.shades.items.metal = new MatcapMaterial()                                   // Création du matériau matcap
        this.shades.items.metal.name = 'shadeMetal'                                      // Nom pour identification
        this.shades.items.metal.uniforms.matcap.value = this.resources.items.matcapMetalTexture  // Assignation de la texture matcap
        this.items.metal = this.shades.items.metal                                       // Ajout au conteneur principal
        
        // Matériau matcap black métal
        this.shades.items.blackMetal = new MatcapMaterial()                                   // Création du matériau matcap
        this.shades.items.blackMetal.name = 'shadeBlackMetal'                                      // Nom pour identification
        this.shades.items.blackMetal.uniforms.matcap.value = this.resources.items.matcapBlackMetalTexture  // Assignation de la texture matcap
        this.items.blackMetal = this.shades.items.blackMetal      

        // Matériau matcap chrome
        this.shades.items.chrome = new MatcapMaterial()                                   // Création du matériau matcap
        this.shades.items.chrome.name = 'shadeChrome'                                      // Nom pour identification
        this.shades.items.chrome.uniforms.matcap.value = this.resources.items.matcapChromeTexture  // Assignation de la texture matcap
        this.items.chrome = this.shades.items.chrome      

        // Matériau matcap glass
        this.shades.items.glass = new MatcapMaterial()                                   // Création du matériau matcap
        this.shades.items.glass.name = 'shadeGlass'                                      // Nom pour identification
        this.shades.items.glass.uniforms.matcap.value = this.resources.items.matcapGlassTexture  // Assignation de la texture matcap
        this.items.glass = this.shades.items.glass      

        // Matériau matcap or (commenté - non utilisé)
        // this.shades.items.gold = new MatcapMaterial()
        // this.shades.items.gold.name = 'shadeGold'
        // this.shades.items.gold.uniforms.matcap.value = this.resources.items.matcapGoldTexture
        // this.items.gold = this.shades.items.gold

        // Fonction de mise à jour des uniforms de tous les matériaux matcap
        this.shades.updateMaterials = () =>
        {
            // Conversion de la couleur indirecte en objet THREE.Color
            this.shades.uniforms.uIndirectColor = new THREE.Color(this.shades.indirectColor)

            // Mise à jour de chaque uniform pour chaque matériau
            for(const _uniformName in this.shades.uniforms)
            {
                const _uniformValue = this.shades.uniforms[_uniformName]

                // Application de l'uniform à tous les matériaux matcap
                for(const _materialKey in this.shades.items)
                {
                    const material = this.shades.items[_materialKey]
                    material.uniforms[_uniformName].value = _uniformValue
                }
            }
        }

        // Mise à jour initiale des matériaux
        this.shades.updateMaterials()

        // Configuration de l'interface de debug
        if(this.debug)
        {
            const folder = this.debugFolder.addFolder('shades')                           // Dossier de debug pour les matériaux matcap
            folder.open()                                                                 // Ouverture automatique du dossier

            // Contrôles de debug pour les paramètres d'éclairage indirect
            folder.add(this.shades.uniforms, 'uIndirectDistanceAmplitude').step(0.001).min(0).max(3).onChange(this.shades.updateMaterials)
            folder.add(this.shades.uniforms, 'uIndirectDistanceStrength').step(0.001).min(0).max(2).onChange(this.shades.updateMaterials)
            folder.add(this.shades.uniforms, 'uIndirectDistancePower').step(0.001).min(0).max(5).onChange(this.shades.updateMaterials)
            folder.add(this.shades.uniforms, 'uIndirectAngleStrength').step(0.001).min(0).max(2).onChange(this.shades.updateMaterials)
            folder.add(this.shades.uniforms, 'uIndirectAngleOffset').step(0.001).min(- 2).max(2).onChange(this.shades.updateMaterials)
            folder.add(this.shades.uniforms, 'uIndirectAnglePower').step(0.001).min(0).max(5).onChange(this.shades.updateMaterials)
            folder.addColor(this.shades, 'indirectColor').onChange(this.shades.updateMaterials)  // Contrôle de couleur
        }
    }

    /**
     * SetFloorShadow - Configuration du matériau d'ombre de sol
     *
     * Crée et configure le matériau shader utilisé pour les ombres de sol.
     * Ce matériau gère l'affichage des ombres portées avec une couleur
     * personnalisable et une transparence variable.
     *
     * FONCTIONNALITÉS :
     * - Matériau shader personnalisé pour les ombres
     * - Couleur d'ombre personnalisable
     * - Transparence variable (alpha)
     * - Mise à jour automatique des uniforms
     * - Interface de debug pour ajustements
     *
     * CARACTÉRISTIQUES :
     * - depthWrite désactivé pour éviter les conflits de profondeur
     * - Couleur d'ombre par défaut : #d04500 (orange)
     * - Alpha initial : 0 (invisible)
     * - Mise à jour en temps réel via interface de debug
     */
    setFloorShadow()
    {
        // Création du matériau d'ombre de sol
        this.items.floorShadow = new FloorShadowMaterial()                               // Création du matériau shader
        this.items.floorShadow.depthWrite = false                                        // Désactivation de l'écriture de profondeur
        this.items.floorShadow.shadowColor = '#d04500'                                   // Couleur d'ombre par défaut (orange)
        this.items.floorShadow.uniforms.uShadowColor.value = new THREE.Color(this.items.floorShadow.shadowColor)  // Initialisation de la couleur
        this.items.floorShadow.uniforms.uAlpha.value = 0                                 // Alpha initial (invisible)

        // Fonction de mise à jour du matériau d'ombre
        this.items.floorShadow.updateMaterials = () =>
        {
            // Mise à jour de la couleur d'ombre du matériau principal
            this.items.floorShadow.uniforms.uShadowColor.value = new THREE.Color(this.items.floorShadow.shadowColor)

            // Mise à jour de la couleur d'ombre pour tous les objets qui utilisent ce matériau
            for(const _item of this.objects.items)
            {
                for(const _child of _item.container.children)
                {
                    if(_child.material instanceof THREE.ShaderMaterial)
                    {
                        if(_child.material.uniforms.uShadowColor)
                        {
                            _child.material.uniforms.uShadowColor.value = new THREE.Color(this.items.floorShadow.shadowColor)
                        }
                    }
                }
            }
        }

        // Configuration de l'interface de debug
        if(this.debug)
        {
            const folder = this.debugFolder.addFolder('floorShadow')                     // Dossier de debug pour l'ombre de sol
            folder.open()                                                                // Ouverture automatique du dossier

            // Contrôle de couleur pour l'ombre de sol
            folder.addColor(this.items.floorShadow, 'shadowColor').onChange(this.items.floorShadow.updateMaterials)
        }
    }
}
