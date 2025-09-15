/**
 * FLOOR.JS - Système de Sol avec Dégradé de Couleurs
 *
 * Ce fichier définit le système de sol de l'environnement 3D du portfolio.
 * Il crée un sol avec un dégradé de couleurs personnalisable et un matériau
 * shader personnalisé pour l'affichage des textures de fond.
 *
 * RESPONSABILITÉS :
 * - Création d'un sol avec géométrie plane
 * - Gestion d'un dégradé de couleurs aux 4 coins
 * - Application d'un matériau shader personnalisé
 * - Génération de texture de fond dynamique
 * - Interface de debug pour personnalisation
 *
 * CARACTÉRISTIQUES :
 * - Géométrie plane avec subdivision (10x10)
 * - Dégradé de couleurs aux 4 coins
 * - Matériau shader personnalisé (FloorMaterial)
 * - Texture de fond générée dynamiquement
 * - Interface de debug avec contrôles de couleur
 * - Optimisations de performance (frustumCulled, matrixAutoUpdate)
 *
 * UTILISATION :
 * - Sol de base de l'environnement 3D
 * - Affichage des textures de fond des projets
 * - Dégradé de couleurs pour l'ambiance visuelle
 * - Interface de debug pour la personnalisation
 */

import * as THREE from 'three'
import FloorMaterial from '../Materials/Floor.js'

export default class Floor
{
    /**
     * Constructor - Initialisation du système de sol
     *
     * Initialise le système de sol avec géométrie, couleurs, matériau
     * et interface de debug pour la personnalisation.
     *
     * @param {Object} _options - Options de configuration
     * @param {Object} _options.debug - Interface de debug
     */
    constructor(_options)
    {
        // Stockage des options de configuration
        this.debug = _options.debug

        // Configuration du conteneur principal
        this.container = new THREE.Object3D()
        this.container.matrixAutoUpdate = false

        // Création de la géométrie plane avec subdivision
        this.geometry = new THREE.PlaneGeometry(2, 2, 10, 10)

        // Configuration des couleurs du dégradé aux 4 coins
        this.colors = {}
        this.colors.topLeft = '#f5883c'                                               // Orange clair (coin supérieur gauche)
        this.colors.topRight = '#ff9043'                                              // Orange vif (coin supérieur droit)
        this.colors.bottomRight = '#fccf92'                                           // Jaune clair (coin inférieur droit)
        this.colors.bottomLeft = '#f5aa58'                                            // Orange moyen (coin inférieur gauche)

        // Création du matériau shader personnalisé
        this.material = new FloorMaterial()

        /**
         * UpdateMaterial - Mise à jour du matériau avec dégradé de couleurs
         * 
         * Génère une texture de fond dynamique avec un dégradé de couleurs
         * aux 4 coins et l'applique au matériau shader.
         */
        this.updateMaterial = () =>
        {
            // Création des objets Color Three.js pour chaque coin
            const topLeft = new THREE.Color(this.colors.topLeft)
            const topRight = new THREE.Color(this.colors.topRight)
            const bottomRight = new THREE.Color(this.colors.bottomRight)
            const bottomLeft = new THREE.Color(this.colors.bottomLeft)

            // Conversion des couleurs en espace colorimétrique sRGB
            topLeft.convertLinearToSRGB()
            topRight.convertLinearToSRGB()
            bottomRight.convertLinearToSRGB()
            bottomLeft.convertLinearToSRGB()

            // Création du tableau de données pour la texture (RGBA)
            const data = new Uint8Array([
                Math.round(bottomLeft.r * 255), Math.round(bottomLeft.g * 255), Math.round(bottomLeft.b * 255), 255,    // Coin inférieur gauche
                Math.round(bottomRight.r * 255), Math.round(bottomRight.g * 255), Math.round(bottomRight.b * 255), 255,  // Coin inférieur droit
                Math.round(topLeft.r * 255), Math.round(topLeft.g * 255), Math.round(topLeft.b * 255), 255,              // Coin supérieur gauche
                Math.round(topRight.r * 255), Math.round(topRight.g * 255), Math.round(topRight.b * 255), 255             // Coin supérieur droit
            ])

            // Création de la texture de fond avec les données
            this.backgroundTexture = new THREE.DataTexture(data, 2, 2)
            this.backgroundTexture.magFilter = THREE.LinearFilter
            this.backgroundTexture.needsUpdate = true

            // Application de la texture au matériau shader
            this.material.uniforms.tBackground.value = this.backgroundTexture
        }

        // Mise à jour initiale du matériau
        this.updateMaterial()

        // Création du mesh du sol
        this.mesh = new THREE.Mesh(this.geometry, this.material)
        this.mesh.frustumCulled = false                                                // Désactivation du frustum culling
        this.mesh.matrixAutoUpdate = false                                             // Désactivation de la mise à jour automatique de la matrice
        this.mesh.updateMatrix()                                                       // Mise à jour manuelle de la matrice
        this.container.add(this.mesh)

        // Configuration de l'interface de debug
        if(this.debug)
        {
            const folder = this.debug.addFolder('floor')
            // folder.open()                                                             // Décommenter pour ouvrir automatiquement

            // Contrôles de couleur pour chaque coin du dégradé
            folder.addColor(this.colors, 'topLeft').onChange(this.updateMaterial)      // Coin supérieur gauche
            folder.addColor(this.colors, 'topRight').onChange(this.updateMaterial)     // Coin supérieur droit
            folder.addColor(this.colors, 'bottomRight').onChange(this.updateMaterial)  // Coin inférieur droit
            folder.addColor(this.colors, 'bottomLeft').onChange(this.updateMaterial)   // Coin inférieur gauche
        }
    }
}
