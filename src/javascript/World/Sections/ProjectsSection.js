/**
 * PROJECTSSECTION.JS - Section de Projets
 *
 * Ce fichier définit la section de projets dans l'environnement 3D du portfolio.
 * Cette section présente tous les projets avec leurs informations, liens
 * et distinctions, organisés dans un espace interactif.
 *
 * RESPONSABILITÉS :
 * - Création de la section de projets
 * - Gestion des objets statiques (base et collision)
 * - Configuration des projets individuels
 * - Affichage des informations et liens
 *
 * CARACTÉRISTIQUES :
 * - Section de présentation des projets
 * - Projets avec informations détaillées
 * - Liens vers les projets externes
 * - Distinctions et récompenses
 * - Zone interactive avec navigation
 *
 * UTILISATION :
 * - Présentation du portfolio de projets
 * - Accès aux projets externes
 * - Affichage des réalisations
 * - Section principale du portfolio
 */

import * as THREE from 'three'
import Project from './Project'
import gsap from 'gsap'

export default class ProjectsSection
{
    /**
     * Constructor - Initialisation de la section de projets
     *
     * Initialise la section de projets avec les options fournies
     * et configure les objets statiques et les projets.
     *
     * @param {Object} _options - Options de configuration
     * @param {Object} _options.time - Instance de gestion du temps
     * @param {Object} _options.resources - Gestionnaire de ressources
     * @param {Object} _options.camera - Instance de caméra
     * @param {Object} _options.passes - Passes de post-processing
     * @param {Object} _options.objects - Gestionnaire d'objets 3D
     * @param {Object} _options.areas - Gestionnaire de zones interactives
     * @param {Object} _options.zones - Gestionnaire de zones de caméra
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
        this.camera = _options.camera
        this.passes = _options.passes
        this.objects = _options.objects
        this.areas = _options.areas
        this.zones = _options.zones
        this.tiles = _options.tiles
        this.debug = _options.debug
        this.x = _options.x
        this.y = _options.y

        // Configuration de l'interface de debug
        if(this.debug)
        {
            this.debugFolder = this.debug.addFolder('projects')
            this.debugFolder.open()
        }

        // Configuration des paramètres de la section
        this.items = []                                                               // Liste des projets
        this.interDistance = 24                                                       // Distance entre les projets
        this.positionRandomess = 5                                                    // Aléatoire de position
        this.projectHalfWidth = 9                                                     // Demi-largeur d'un projet

        // Configuration du conteneur principal
        this.container = new THREE.Object3D()
        this.container.matrixAutoUpdate = false
        this.container.updateMatrix()

        // Initialisation des composants
        this.setGeometries()
        this.setMeshes()
        this.setList()
        this.setZone()

        // Création de tous les projets de la liste
        for(const _options of this.list)
        {
            this.add(_options)
        }
    }

    /**
     * SetGeometries - Configuration des géométries
     * 
     * Crée les géométries utilisées dans la section de projets.
     */
    setGeometries()
    {
        this.geometries = {}
        this.geometries.floor = new THREE.PlaneGeometry(16, 8)                        // Géométrie du sol des projets
    }

    /**
     * SetMeshes - Configuration des meshes
     * 
     * Crée les meshes utilisés dans la section de projets,
     * incluant le plan du tableau et le label de zone.
     */
    setMeshes()
    {
        this.meshes = {}

        // Configuration de la texture de zone ouverte
        this.resources.items.areaOpenTexture.magFilter = THREE.NearestFilter
        this.resources.items.areaOpenTexture.minFilter = THREE.LinearFilter

        // Récupération du plan du tableau depuis les ressources
        this.meshes.boardPlane = this.resources.items.projectsBoardPlane.scene.children[0]

        // Création du label de zone interactive
        this.meshes.areaLabel = new THREE.Mesh(
            new THREE.PlaneGeometry(2, 0.5),                                          // Géométrie du label
            new THREE.MeshBasicMaterial({ 
                transparent: true, 
                depthWrite: false, 
                color: 0xffffff, 
                alphaMap: this.resources.items.areaOpenTexture 
            })
        )
        this.meshes.areaLabel.matrixAutoUpdate = false
    }

    /**
     * SetList - Configuration de la liste des projets
     * 
     * Définit la liste complète des projets avec leurs informations,
     * textures, liens et distinctions.
     */
    setList()
    {
        this.list = [
            {
                name: 'Three.js Journey',
                imageSources:
                [
                    './models/projects/threejsJourney/slideA.webp',
                    './models/projects/threejsJourney/slideB.webp',
                    './models/projects/threejsJourney/slideC.webp',
                    './models/projects/threejsJourney/slideD.webp'
                ],
                floorTexture: this.resources.items.projectsThreejsJourneyFloorTexture,
                link:
                {
                    href: 'https://threejs-journey.com?c=p3',
                    x: - 4.8,
                    y: - 3,
                    halfExtents:
                    {
                        x: 3.2,
                        y: 1.5
                    }
                },
                distinctions:
                [
                    { type: 'fwa', x: 3.95, y: 4.15 }
                ]
            },
            {
                name: 'Chartogne Taillet',
                imageSources:
                [
                    './models/projects/chartogne/slideA.jpg',
                    './models/projects/chartogne/slideB.jpg',
                    './models/projects/chartogne/slideC.jpg'
                ],
                floorTexture: this.resources.items.projectsChartogneFloorTexture,
                link:
                {
                    href: 'https://chartogne-taillet.com',
                    x: - 4.8,
                    y: - 3.3,
                    halfExtents:
                    {
                        x: 3.2,
                        y: 1.5
                    }
                },
                distinctions:
                [
                    { type: 'awwwards', x: 3.95, y: 4.15 },
                    { type: 'fwa', x: 5.6, y: 4.15 },
                    { type: 'cssda', x: 7.2, y: 4.15 }
                ]
            },
            {
                name: 'Bonhomme | 10 ans',
                imageSources:
                [
                    './models/projects/bonhomme10ans/slideA.webp',
                    './models/projects/bonhomme10ans/slideB.webp',
                    './models/projects/bonhomme10ans/slideC.webp',
                    './models/projects/bonhomme10ans/slideD.webp'
                ],
                floorTexture: this.resources.items.projectsBonhomme10ansFloorTexture,
                link:
                {
                    href: 'https://anniversary.bonhommeparis.com/',
                    x: - 4.8,
                    y: - 2,
                    halfExtents:
                    {
                        x: 3.2,
                        y: 1.5
                    }
                },
                distinctions:
                [
                    { type: 'awwwards', x: 3.95, y: 4.15 },
                    { type: 'fwa', x: 5.6, y: 4.15 },
                ]
            },
            {
                name: 'Luni.app',
                imageSources:
                [
                    './models/projects/luni/slideA.webp',
                    './models/projects/luni/slideB.webp',
                    './models/projects/luni/slideC.webp',
                    './models/projects/luni/slideD.webp'
                ],
                floorTexture: this.resources.items.projectsLuniFloorTexture,
                link:
                {
                    href: 'https://luni.app',
                    x: - 4.8,
                    y: - 3,
                    halfExtents:
                    {
                        x: 3.2,
                        y: 1.5
                    }
                },
                distinctions:
                [
                    { type: 'awwwards', x: 3.95, y: 4.15 },
                    { type: 'fwa', x: 5.6, y: 4.15 },
                ]
            },
            {
                name: 'Madbox',
                imageSources:
                [
                    './models/projects/madbox/slideA.jpg',
                    './models/projects/madbox/slideB.jpg',
                    './models/projects/madbox/slideC.jpg'
                ],
                floorTexture: this.resources.items.projectsMadboxFloorTexture,
                link:
                {
                    href: 'https://madbox.io',
                    x: - 4.8,
                    y: - 4,
                    halfExtents:
                    {
                        x: 3.2,
                        y: 1.5
                    }
                },
                distinctions:
                [
                    { type: 'awwwards', x: 3.95, y: 4.15 },
                    { type: 'fwa', x: 5.6, y: 4.15 }
                ]
            },
            {
                name: 'Scout',
                imageSources:
                [
                    './models/projects/scout/slideA.jpg',
                    './models/projects/scout/slideB.jpg',
                    './models/projects/scout/slideC.jpg'
                ],
                floorTexture: this.resources.items.projectsScoutFloorTexture,
                link:
                {
                    href: 'https://fromscout.com',
                    x: - 4.8,
                    y: - 2,
                    halfExtents:
                    {
                        x: 3.2,
                        y: 1.5
                    }
                },
                distinctions:
                [
                ]
            },
            // {
            //     name: 'Zenly',
            //     imageSources:
            //     [
            //         './models/projects/zenly/slideA.jpg',
            //         './models/projects/zenly/slideB.jpg',
            //         './models/projects/zenly/slideC.jpg'
            //     ],
            //     floorTexture: this.resources.items.projectsZenlyFloorTexture,
            //     link:
            //     {
            //         href: 'https://zen.ly',
            //         x: - 4.8,
            //         y: - 4.2,
            //         halfExtents:
            //         {
            //             x: 3.2,
            //             y: 1.5
            //         }
            //     },
            //     distinctions:
            //     [
            //         { type: 'awwwards', x: 3.95, y: 4.15 },
            //         { type: 'fwa', x: 5.6, y: 4.15 },
            //         { type: 'cssda', x: 7.2, y: 4.15 }
            //     ]
            // },
            {
                name: 'priorHoldings',
                imageSources:
                [
                    './models/projects/priorHoldings/slideA.jpg',
                    './models/projects/priorHoldings/slideB.jpg',
                    './models/projects/priorHoldings/slideC.jpg'
                ],
                floorTexture: this.resources.items.projectsPriorHoldingsFloorTexture,
                link:
                {
                    href: 'https://prior.co.jp/discover/',
                    x: - 4.8,
                    y: - 3,
                    halfExtents:
                    {
                        x: 3.2,
                        y: 1.5
                    }
                },
                distinctions:
                [
                    { type: 'awwwards', x: 3.95, y: 4.15 },
                    { type: 'fwa', x: 5.6, y: 4.15 },
                    { type: 'cssda', x: 7.2, y: 4.15 }
                ]
            },
            {
                name: 'orano',
                imageSources:
                [
                    './models/projects/orano/slideA.jpg',
                    './models/projects/orano/slideB.jpg',
                    './models/projects/orano/slideC.jpg'
                ],
                floorTexture: this.resources.items.projectsOranoFloorTexture,
                link:
                {
                    href: 'https://orano.imm-g-prod.com/experience/innovation/en',
                    x: - 4.8,
                    y: - 3.4,
                    halfExtents:
                    {
                        x: 3.2,
                        y: 1.5
                    }
                },
                distinctions:
                [
                    { type: 'awwwards', x: 3.95, y: 4.15 },
                    { type: 'fwa', x: 5.6, y: 4.15 },
                    { type: 'cssda', x: 7.2, y: 4.15 }
                ]
            },
            {
                name: 'citrixRedbull',
                imageSources:
                [
                    './models/projects/citrixRedbull/slideA.jpg',
                    './models/projects/citrixRedbull/slideB.jpg',
                    './models/projects/citrixRedbull/slideC.jpg'
                ],
                floorTexture: this.resources.items.projectsCitrixRedbullFloorTexture,
                link:
                {
                    href: 'https://thenewmobileworkforce.imm-g-prod.com/',
                    x: - 4.8,
                    y: - 4.4,
                    halfExtents:
                    {
                        x: 3.2,
                        y: 1.5
                    }
                },
                distinctions:
                [
                    { type: 'awwwards', x: 3.95, y: 4.15 },
                    { type: 'fwa', x: 5.6, y: 4.15 },
                    { type: 'cssda', x: 7.2, y: 4.15 }
                ]
            },
            // {
            //     name: 'gleecChat',
            //     imageSources:
            //     [
            //         './models/projects/gleecChat/slideA.jpg',
            //         './models/projects/gleecChat/slideB.jpg',
            //         './models/projects/gleecChat/slideC.jpg',
            //         './models/projects/gleecChat/slideD.jpg'
            //     ],
            //     floorTexture: this.resources.items.projectsGleecChatFloorTexture,
            //     link:
            //     {
            //         href: 'http://gleec.imm-g-prod.com',
            //         x: - 4.8,
            //         y: - 3.4,
            //         halfExtents:
            //         {
            //             x: 3.2,
            //             y: 1.5
            //         }
            //     },
            //     distinctions:
            //     [
            //         { type: 'awwwards', x: 3.95, y: 4.15 },
            //         { type: 'fwa', x: 5.6, y: 4.15 },
            //         { type: 'cssda', x: 7.2, y: 4.15 }
            //     ]
            // },
            // {
            //     name: 'keppler',
            //     imageSources:
            //     [
            //         './models/projects/keppler/slideA.jpg',
            //         './models/projects/keppler/slideB.jpg',
            //         './models/projects/keppler/slideC.jpg'
            //     ],
            //     floorTexture: this.resources.items.projectsKepplerFloorTexture,
            //     link:
            //     {
            //         href: 'https://brunosimon.github.io/keppler/',
            //         x: 2.75,
            //         y: - 1.1,
            //         halfExtents:
            //         {
            //             x: 3.2,
            //             y: 1.5
            //         }
            //     },
            //     distinctions: []
            // }
        ]
    }

    /**
     * SetZone - Configuration de la zone de caméra
     * 
     * Crée une zone de caméra pour la section de projets avec
     * gestion des angles de caméra et des effets de flou.
     */
    setZone()
    {
        // Calcul de la largeur totale de la section
        const totalWidth = this.list.length * (this.interDistance / 2)

        // Création de la zone de caméra
        const zone = this.zones.add({
            position: { x: this.x + totalWidth - this.projectHalfWidth - 6, y: this.y }, // Position de la zone
            halfExtents: { x: totalWidth, y: 12 },                                      // Taille de la zone
            data: { cameraAngle: 'projects' }                                           // Angle de caméra spécifique
        })

        // Gestion de l'entrée dans la zone
        zone.on('in', (_data) =>
        {
            this.camera.angle.set(_data.cameraAngle)                                    // Changement d'angle de caméra
            gsap.to(this.passes.horizontalBlurPass.material.uniforms.uStrength.value, { x: 0, duration: 2 }) // Suppression du flou horizontal
            gsap.to(this.passes.verticalBlurPass.material.uniforms.uStrength.value, { y: 0, duration: 2 })   // Suppression du flou vertical
        })

        // Gestion de la sortie de la zone
        zone.on('out', () =>
        {
            this.camera.angle.set('default')                                            // Retour à l'angle par défaut
            gsap.to(this.passes.horizontalBlurPass.material.uniforms.uStrength.value, { x: this.passes.horizontalBlurPass.strength, duration: 2 }) // Restauration du flou horizontal
            gsap.to(this.passes.verticalBlurPass.material.uniforms.uStrength.value, { y: this.passes.verticalBlurPass.strength, duration: 2 })     // Restauration du flou vertical
        })
    }

    /**
     * Add - Ajout d'un projet à la section
     * 
     * Crée un nouveau projet et l'ajoute à la section avec
     * positionnement automatique et tuiles de navigation.
     *
     * @param {Object} _options - Options de configuration du projet
     */
    add(_options)
    {
        // Calcul de la position X (espacement automatique)
        const x = this.x + this.items.length * this.interDistance
        let y = this.y

        // Ajout d'aléatoire de position pour les projets suivants
        if(this.items.length > 0)
        {
            y += (Math.random() - 0.5) * this.positionRandomess
        }

        // Création du projet
        const project = new Project({
            time: this.time,
            resources: this.resources,
            objects: this.objects,
            areas: this.areas,
            geometries: this.geometries,
            meshes: this.meshes,
            debug: this.debugFolder,
            x: x,
            y: y,
            ..._options
        })

        // Ajout du projet au conteneur
        this.container.add(project.container)

        // Création des tuiles de navigation entre les projets
        if(this.items.length >= 1)
        {
            const previousProject = this.items[this.items.length - 1]
            const start = new THREE.Vector2(previousProject.x + this.projectHalfWidth, previousProject.y) // Point de départ
            const end = new THREE.Vector2(project.x - this.projectHalfWidth, project.y)                 // Point d'arrivée
            const delta = end.clone().sub(start)                                                         // Vecteur de direction
            this.tiles.add({
                start: start,
                delta: delta
            })
        }

        // Sauvegarde du projet dans la liste
        this.items.push(project)
    }
}
