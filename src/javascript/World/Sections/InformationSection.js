/**
 * INFORMATIONSECTION.JS - Section d'Information
 * 
 * Ce fichier définit la section d'information dans l'environnement 3D du portfolio.
 * Cette section présente les informations de contact, les activités et les liens
 * sociaux avec des éléments interactifs et des baguettes de pain.
 * 
 * RESPONSABILITÉS :
 * - Création de la section d'information
 * - Gestion des objets statiques (base et collision)
 * - Configuration des baguettes de pain interactives
 * - Création des liens de contact et réseaux sociaux
 * - Affichage des activités et informations
 * 
 * CARACTÉRISTIQUES :
 * - Section de présentation des informations
 * - Baguettes de pain interactives avec physique
 * - Liens de contact (Twitter, GitHub, LinkedIn, Email)
 * - Affichage des activités et informations
 * - Zone interactive avec navigation
 * 
 * UTILISATION :
 * - Présentation des informations de contact
 * - Liens vers les réseaux sociaux
 * - Zone interactive avec baguettes
 * - Section d'information du portfolio
 */

import * as THREE from 'three'

export default class InformationSection
{
    /**
     * Constructor - Initialisation de la section d'information
     * 
     * Initialise la section d'information avec les options fournies
     * et configure les objets statiques, les baguettes, les liens et les activités.
     * 
     * @param {Object} _options - Options de configuration
     * @param {Object} _options.time - Instance de gestion du temps
     * @param {Object} _options.resources - Gestionnaire de ressources
     * @param {Object} _options.objects - Gestionnaire d'objets 3D
     * @param {Object} _options.areas - Gestionnaire de zones interactives
     * @param {Object} _options.tiles - Gestionnaire de tuiles de navigation
     * @param {Object} _options.debug - Interface de debug
     * @param {number} _options.x - Position X de la section
     * @param {number} _options.y - Position Y de la section
     */
    constructor(_options)
    {
        // Stockage des options de configuration
        this.time = _options.time
        this.resources = _options.resources
        this.objects = _options.objects
        this.areas = _options.areas
        this.tiles = _options.tiles
        this.debug = _options.debug
        this.x = _options.x
        this.y = _options.y

        // Configuration du conteneur principal
        this.container = new THREE.Object3D()
        this.container.matrixAutoUpdate = false

        // Initialisation des composants
        this.setStatic()
        this.setBaguettes()
        this.setLinks()
        this.setActivities()
        this.setTiles()
    }

    /**
     * SetStatic - Configuration des objets statiques
     * 
     * Ajoute les objets statiques de la section d'information avec
     * leur géométrie de base, de collision et de texture d'ombre.
     */
    setStatic()
    {
        this.objects.add({
            base: this.resources.items.informationStaticBase.scene,                    // Géométrie de base
            collision: this.resources.items.informationStaticCollision.scene,         // Géométrie de collision
            floorShadowTexture: this.resources.items.informationStaticFloorShadowTexture, // Texture d'ombre
            offset: new THREE.Vector3(this.x, this.y, 0),                             // Position de la section
            mass: 0                                                                   // Masse nulle (objet statique)
        })
    }

    /**
     * SetBaguettes - Configuration des baguettes de pain
     * 
     * Crée deux baguettes de pain interactives avec physique
     * et positions différentes pour créer un effet visuel intéressant.
     */
    setBaguettes()
    {
        // Configuration des baguettes
        this.baguettes = {}
        this.baguettes.x = - 4                                                        // Position X de base
        this.baguettes.y = 6                                                          // Position Y de base

        // Première baguette (baguette A)
        this.baguettes.a = this.objects.add({
            base: this.resources.items.informationBaguetteBase.scene,                 // Géométrie de base de la baguette
            collision: this.resources.items.informationBaguetteCollision.scene,      // Géométrie de collision
            offset: new THREE.Vector3(this.x + this.baguettes.x - 0.56, this.y + this.baguettes.y - 0.666, 0.2), // Position
            rotation: new THREE.Euler(0, 0, - Math.PI * 37 / 180),                  // Rotation (37 degrés)
            duplicated: true,                                                         // Objet dupliqué
            shadow: { sizeX: 0.6, sizeY: 3.5, offsetZ: - 0.15, alpha: 0.35 },        // Configuration de l'ombre
            mass: 1.5,                                                                // Masse pour la physique
            // soundName: 'woodHit'                                                   // Son de collision (commenté)
        })

        // Deuxième baguette (baguette B)
        this.baguettes.b = this.objects.add({
            base: this.resources.items.informationBaguetteBase.scene,                 // Géométrie de base de la baguette
            collision: this.resources.items.informationBaguetteCollision.scene,      // Géométrie de collision
            offset: new THREE.Vector3(this.x + this.baguettes.x - 0.8, this.y + this.baguettes.y - 2, 0.5), // Position
            rotation: new THREE.Euler(0, - 0.5, Math.PI * 60 / 180),                // Rotation (60 degrés + rotation Y)
            duplicated: true,                                                         // Objet dupliqué
            shadow: { sizeX: 0.6, sizeY: 3.5, offsetZ: - 0.15, alpha: 0.35 },        // Configuration de l'ombre
            mass: 1.5,                                                                // Masse pour la physique
            sleep: false,                                                             // Pas de mise en veille
            // soundName: 'woodHit'                                                   // Son de collision (commenté)
        })
    }

    /**
     * SetLinks - Configuration des liens de contact
     * 
     * Crée les liens de contact et réseaux sociaux avec des zones interactives
     * et des labels visuels pour Twitter, GitHub, LinkedIn et Email.
     */
    setLinks()
    {
        // Configuration des liens
        this.links = {}
        this.links.x = 1.95                                                           // Position X de base
        this.links.y = - 1.5                                                          // Position Y de base
        this.links.halfExtents = {}
        this.links.halfExtents.x = 1                                                  // Demi-largeur des zones
        this.links.halfExtents.y = 1                                                  // Demi-hauteur des zones
        this.links.distanceBetween = 2.4                                              // Distance entre les liens
        this.links.labelWidth = this.links.halfExtents.x * 2 + 1                      // Largeur des labels
        this.links.labelGeometry = new THREE.PlaneGeometry(this.links.labelWidth, this.links.labelWidth * 0.25, 1, 1) // Géométrie des labels
        this.links.labelOffset = - 1.6                                                // Décalage des labels
        this.links.items = []                                                          // Liste des liens

        // Conteneur pour les liens
        this.links.container = new THREE.Object3D()
        this.links.container.matrixAutoUpdate = false
        this.container.add(this.links.container)

        // Options des liens de contact
        this.links.options = [
            {
                href: 'https://twitter.com/bruno_simon/',                              // Twitter
                labelTexture: this.resources.items.informationContactTwitterLabelTexture
            },
            {
                href: 'https://github.com/brunosimon/',                               // GitHub
                labelTexture: this.resources.items.informationContactGithubLabelTexture
            },
            {
                href: 'https://www.linkedin.com/in/simonbruno77/',                    // LinkedIn
                labelTexture: this.resources.items.informationContactLinkedinLabelTexture
            },
            {
                href: 'mailto:simon.bruno.77@gmail.com',                              // Email
                labelTexture: this.resources.items.informationContactMailLabelTexture
            }
        ]

        // Création de chaque lien
        let i = 0
        for(const _option of this.links.options)
        {
            // Configuration de l'élément
            const item = {}
            item.x = this.x + this.links.x + this.links.distanceBetween * i            // Position X
            item.y = this.y + this.links.y                                             // Position Y
            item.href = _option.href                                                   // URL du lien

            // Création de la zone interactive
            item.area = this.areas.add({
                position: new THREE.Vector2(item.x, item.y),                          // Position de la zone
                halfExtents: new THREE.Vector2(this.links.halfExtents.x, this.links.halfExtents.y) // Taille de la zone
            })
            item.area.on('interact', () =>
            {
                window.open(_option.href, '_blank')                                    // Ouverture du lien
            })

            // Configuration de la texture
            item.texture = _option.labelTexture
            item.texture.magFilter = THREE.NearestFilter                               // Filtrage de la texture
            item.texture.minFilter = THREE.LinearFilter

            // Création du label visuel
            item.labelMesh = new THREE.Mesh(this.links.labelGeometry, new THREE.MeshBasicMaterial({ 
                wireframe: false, 
                color: 0xffffff, 
                alphaMap: _option.labelTexture, 
                depthTest: true, 
                depthWrite: false, 
                transparent: true 
            }))
            item.labelMesh.position.x = item.x + this.links.labelWidth * 0.5 - this.links.halfExtents.x
            item.labelMesh.position.y = item.y + this.links.labelOffset
            item.labelMesh.matrixAutoUpdate = false
            item.labelMesh.updateMatrix()
            this.links.container.add(item.labelMesh)

            // Sauvegarde de l'élément
            this.links.items.push(item)

            i++
        }
    }

    /**
     * SetActivities - Configuration de l'affichage des activités
     * 
     * Crée un affichage des activités avec une texture et un matériau
     * transparent pour présenter les informations.
     */
    setActivities()
    {
        // Configuration des activités
        this.activities = {}
        this.activities.x = this.x + 0                                                 // Position X
        this.activities.y = this.y - 10                                                // Position Y
        this.activities.multiplier = 5.5                                               // Multiplicateur de taille

        // Géométrie de l'affichage
        this.activities.geometry = new THREE.PlaneGeometry(2 * this.activities.multiplier, 1 * this.activities.multiplier, 1, 1)

        // Texture des activités
        this.activities.texture = this.resources.items.informationActivitiesTexture
        this.activities.texture.magFilter = THREE.NearestFilter                        // Filtrage de la texture
        this.activities.texture.minFilter = THREE.LinearFilter

        // Matériau transparent
        this.activities.material = new THREE.MeshBasicMaterial({ 
            wireframe: false, 
            color: 0xffffff, 
            alphaMap: this.activities.texture, 
            transparent: true 
        })

        // Mesh de l'affichage
        this.activities.mesh = new THREE.Mesh(this.activities.geometry, this.activities.material)
        this.activities.mesh.position.x = this.activities.x
        this.activities.mesh.position.y = this.activities.y
        this.activities.mesh.matrixAutoUpdate = false
        this.activities.mesh.updateMatrix()
        this.container.add(this.activities.mesh)
    }

    /**
     * SetTiles - Configuration des tuiles de navigation
     * 
     * Configure les tuiles de navigation qui permettent de se déplacer
     * vers d'autres sections du portfolio.
     */
    setTiles()
    {
        this.tiles.add({
            start: new THREE.Vector2(this.x - 1.2, this.y + 13),                      // Point de départ
            delta: new THREE.Vector2(0, - 20)                                         // Direction et distance
        })
    }
}
