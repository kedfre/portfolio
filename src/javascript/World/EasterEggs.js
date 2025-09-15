/**
 * EASTEREGGS.JS - Œufs de Pâques et Fonctionnalités Cachées
 *
 * Ce fichier définit les œufs de Pâques et fonctionnalités cachées
 * dans l'environnement 3D du portfolio. Il inclut le code Konami,
 * les perruques interactives et d'autres surprises.
 *
 * RESPONSABILITÉS :
 * - Gestion du code Konami (↑↑↓↓←→←→BA)
 * - Système de perruques interactives
 * - Œufs de Pâques avec codes de réduction
 * - Fonctionnalités cachées et surprises
 *
 * CARACTÉRISTIQUES :
 * - Code Konami avec support tactile et clavier
 * - Perruques avec matériaux aléatoires
 * - Œufs de Pâques avec codes de réduction Three.js Journey
 * - Système de collision pour la découverte
 * - Interface utilisateur cachée
 *
 * UTILISATION :
 * - Fonctionnalités cachées du portfolio
 * - Codes de réduction et promotions
 * - Éléments interactifs amusants
 * - Découverte progressive du contenu
 */

import * as THREE from 'three'

export default class EasterEggs
{
    /**
     * Constructor - Initialisation des œufs de Pâques
     *
     * Initialise les fonctionnalités cachées et les œufs de Pâques
     * avec le code Konami et les perruques interactives.
     *
     * @param {Object} _options - Options de configuration
     * @param {Object} _options.resources - Gestionnaire de ressources
     * @param {Object} _options.car - Instance de la voiture
     * @param {Object} _options.walls - Gestionnaire de murs
     * @param {Object} _options.objects - Gestionnaire d'objets 3D
     * @param {Object} _options.materials - Gestionnaire de matériaux
     * @param {Object} _options.areas - Gestionnaire de zones interactives
     * @param {Object} _options.config - Configuration de l'application
     * @param {Object} _options.physics - Système de physique
     */
    constructor(_options)
    {
        // Stockage des options de configuration
        this.resources = _options.resources
        this.car = _options.car
        this.walls = _options.walls
        this.objects = _options.objects
        this.materials = _options.materials
        this.areas = _options.areas
        this.config = _options.config
        this.physics = _options.physics

        // Configuration du conteneur principal
        this.container = new THREE.Object3D()
        this.container.matrixAutoUpdate = false

        // Initialisation des composants
        this.setKonamiCode()
        this.setWigs()
        // this.setEggs()
    }

    /**
     * SetKonamiCode - Configuration du code Konami
     * 
     * Configure le code Konami (↑↑↓↓←→←→BA) avec support tactile et clavier,
     * incluant l'affichage du label et la création de citrons.
     */
    setKonamiCode()
    {
        // Configuration du code Konami
        this.konamiCode = {}
        this.konamiCode.x = - 60                                                    // Position X
        this.konamiCode.y = - 100                                                   // Position Y
        this.konamiCode.sequence = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight'] // Séquence de base

        // Ajout des touches B et A pour les appareils non-tactiles
        if(!this.config.touch)
        {
            this.konamiCode.sequence.push('b', 'a')
        }

        // Configuration des variables de suivi
        this.konamiCode.keyIndex = 0
        this.konamiCode.latestKeys = []
        this.konamiCode.count = 0

        // Configuration du label selon le type d'appareil
        if(this.config.touch)
        {
            this.konamiCode.labelTexture = this.resources.items.konamiLabelTouchTexture
        }
        else
        {
            this.konamiCode.labelTexture = this.resources.items.konamiLabelTexture
        }

        // Configuration de la texture du label
        this.konamiCode.labelTexture.magFilter = THREE.NearestFilter
        this.konamiCode.labelTexture.minFilter = THREE.LinearFilter

        // Création du mesh du label
        this.konamiCode.label = new THREE.Mesh(
            new THREE.PlaneGeometry(8, 8 / 16), 
            new THREE.MeshBasicMaterial({ 
                transparent: true, 
                depthWrite: false, 
                color: 0xffffff, 
                alphaMap: this.konamiCode.labelTexture 
            })
        )
        this.konamiCode.label.position.x = this.konamiCode.x + 5
        this.konamiCode.label.position.y = this.konamiCode.y
        this.konamiCode.label.matrixAutoUpdate = false
        this.konamiCode.label.updateMatrix()
        this.container.add(this.konamiCode.label)

        // Configuration des options de citron
        this.konamiCode.lemonOption = {
            base: this.resources.items.lemonBase.scene,
            collision: this.resources.items.lemonCollision.scene,
            offset: new THREE.Vector3(0, 0, 0),
            rotation: new THREE.Euler(Math.PI * 0.5, - Math.PI * 0.3, 0),
            duplicated: true,
            shadow: { sizeX: 1.2, sizeY: 1.8, offsetZ: - 0.15, alpha: 0.35 },
            mass: 0.5,
            sleep: true,
            soundName: 'woodHit'
        }

        // Création du premier citron
        this.objects.add({
            ...this.konamiCode.lemonOption,
            offset: new THREE.Vector3(this.konamiCode.x, this.konamiCode.y, 0.4)
        })

        this.konamiCode.testInput = (_input) =>
        {
            this.konamiCode.latestKeys.push(_input)

            if(this.konamiCode.latestKeys.length > this.konamiCode.sequence.length)
            {
                this.konamiCode.latestKeys.shift()
            }

            if(this.konamiCode.sequence.toString() === this.konamiCode.latestKeys.toString())
            {
                this.konamiCode.count++

                for(let i = 0; i < Math.pow(3, this.konamiCode.count); i++)
                {
                    window.setTimeout(() =>
                    {
                        const x = this.car.chassis.object.position.x + (Math.random() - 0.5) * 10
                        const y = this.car.chassis.object.position.y + (Math.random() - 0.5) * 10

                        this.objects.add({
                            ...this.konamiCode.lemonOption,
                            offset: new THREE.Vector3(x, y, 10),
                            rotation: new THREE.Euler(Math.random() * Math.PI * 2, Math.random() * Math.PI * 2, Math.random() * Math.PI * 2),
                            sleep: false
                        })
                        // this.eggs.add({
                        //     offset: new THREE.Vector3(x, y, 10),
                        //     rotation: new THREE.Euler(Math.random() * Math.PI * 2, Math.random() * Math.PI * 2, Math.random() * Math.PI * 2),
                        //     material: this.materials.shades.items.yellow,
                        //     code: 'MjAyMWVnZ2N2b3V6ZXI=',
                        //     sleep: false
                        // })
                    }, i * 50)
                }
            }
        }

        /**
         * Keyboard handling
         */
        window.addEventListener('keydown', (_event) =>
        {
            this.konamiCode.testInput(_event.key)
        })

        /**
         * Touch handling
         */
        this.konamiCode.touch = {}
        this.konamiCode.touch.x = 0
        this.konamiCode.touch.y = 0

        this.konamiCode.touch.touchstart = (_event) =>
        {
            window.addEventListener('touchend', this.konamiCode.touch.touchend)

            this.konamiCode.touch.x = _event.changedTouches[0].clientX
            this.konamiCode.touch.y = _event.changedTouches[0].clientY
        }
        this.konamiCode.touch.touchend = (_event) =>
        {
            window.removeEventListener('touchend', this.konamiCode.touch.touchend)

            const endX = _event.changedTouches[0].clientX
            const endY = _event.changedTouches[0].clientY
            const deltaX = endX - this.konamiCode.touch.x
            const deltaY = endY - this.konamiCode.touch.y
            const distance = Math.hypot(deltaX, deltaY)

            if(distance > 30)
            {
                const angle = Math.atan2(deltaY, deltaX)
                let direction = null

                if(angle < - Math.PI * 0.75)
                {
                    direction = 'ArrowLeft'
                }
                else if(angle < - Math.PI * 0.25)
                {
                    direction = 'ArrowUp'
                }
                else if(angle < Math.PI * 0.25)
                {
                    direction = 'ArrowRight'
                }
                else if(angle < Math.PI * 0.75)
                {
                    direction = 'ArrowDown'
                }
                else
                {
                    direction = 'ArrowLeft'
                }

                this.konamiCode.testInput(direction)
            }
        }
        window.addEventListener('touchstart', this.konamiCode.touch.touchstart)
    }

    /**
     * SetWigs - Configuration du système de perruques
     * 
     * Configure le système de perruques interactives avec matériaux aléatoires
     * et zone d'interaction pour changer de perruque.
     */
    setWigs()
    {
        // Configuration du système de perruques
        this.wigs = {}
        this.wigs.currentWig = null

        // Conteneur des perruques
        this.wigs.container = new THREE.Object3D()
        this.wigs.container.position.x = - 0.1
        this.wigs.container.position.y = - 30
        this.wigs.container.matrixAutoUpdate = false
        this.wigs.container.updateMatrix()
        this.container.add(this.wigs.container)

        // Matériaux disponibles pour les perruques
        this.wigs.materials = [
            this.materials.shades.items.green,
            this.materials.shades.items.red,
            this.materials.shades.items.emeraldGreen,
            this.materials.shades.items.purple,
            this.materials.shades.items.yellow,
            this.materials.shades.items.white
        ]

        // Liste des modèles de perruques
        this.wigs.list = [
            this.resources.items.wig1,
            this.resources.items.wig2,
            this.resources.items.wig3,
            this.resources.items.wig4
        ]

        // Création des conteneurs de perruques
        this.wigs.items = []

        for(const _wig of this.wigs.list)
        {
            const container = new THREE.Object3D()
            container.visible = false
            container.matrixAutoUpdate = false
            this.wigs.container.add(container)

            // Application du matériau par défaut
            const children = [..._wig.scene.children]
            for(const _mesh of children)
            {
                _mesh.material = this.wigs.materials[0]
                container.add(_mesh)
            }

            this.wigs.items.push(container)
        }

        // Fonction de changement de perruque
        this.wigs.change = () =>
        {
            // Masquage de la perruque précédente
            if(this.wigs.currentWig)
            {
                this.wigs.currentWig.visible = false
            }

            // Sélection d'une perruque aléatoire différente
            let randomWig = null
            do
            {
                randomWig = this.wigs.items[Math.floor(Math.random() * this.wigs.items.length)]
            } while(this.wigs.currentWig === randomWig)

            this.wigs.currentWig = randomWig
            this.wigs.currentWig.visible = true

            // Application d'un matériau aléatoire
            const randomMaterial = this.wigs.materials[Math.floor(Math.random() * this.wigs.materials.length)]

            for(const _mesh of this.wigs.currentWig.children)
            {
                _mesh.material = randomMaterial
            }

            // this.eggs.add({
            //     offset: new THREE.Vector3(0, 80, 10),
            //     material: this.materials.shades.items.metal,
            //     code: 'MjAyMWVnZ2F6ZW9jYmI=',
            //     sleep: false
            // })
        }

        // Zone d'interaction pour changer de perruque
        this.wigs.area = this.areas.add({
            position: new THREE.Vector2(0, 80),
            halfExtents: new THREE.Vector2(2, 2)
        })
        this.wigs.area.on('interact', this.wigs.change)

        // Label de la zone d'interaction
        this.resources.items.areaQuestionMarkTexture.magFilter = THREE.NearestFilter
        this.resources.items.areaQuestionMarkTexture.minFilter = THREE.LinearFilter
        this.wigs.areaLabel = new THREE.Mesh(
            new THREE.PlaneGeometry(1, 1), 
            new THREE.MeshBasicMaterial({ 
                transparent: true, 
                depthWrite: false, 
                color: 0xffffff, 
                alphaMap: this.resources.items.areaQuestionMarkTexture 
            })
        )
        this.wigs.areaLabel.position.x = 0
        this.wigs.areaLabel.position.y = 80
        this.wigs.areaLabel.matrixAutoUpdate = false
        this.wigs.areaLabel.updateMatrix()
        this.container.add(this.wigs.areaLabel)
    }

    /**
     * SetEggs - Configuration des œufs de Pâques avec codes de réduction
     * 
     * Configure le système d'œufs de Pâques cachés dans l'environnement 3D
     * avec des codes de réduction pour Three.js Journey. Les œufs sont
     * dispersés dans le monde et révèlent des codes de réduction lors
     * de la collision avec la voiture.
     */
    setEggs()
    {
        // Configuration du système d'œufs
        this.eggs = {}
        this.eggs.items = []

        // Message de console pour les développeurs
        console.log('🥚 2021eggbvpoabe')

        // Configuration des œufs de base avec positions et codes
        const eggOptions = [
            {
                offset: new THREE.Vector3(- 29.80, - 18.94, 0.5),                    // Position du premier œuf
                material: this.materials.shades.items.emeraldGreen,                   // Matériau vert émeraude
                code: 'MjAyMWVnZ2Fvem5kZXo='                                         // Code de réduction encodé en base64
            },
            {
                offset: new THREE.Vector3(103.91, 128.56, 0.5),                      // Position du deuxième œuf
                material: this.materials.shades.items.red,                            // Matériau rouge
                code: 'MjAyMWVnZ3Fxc3ZwcG8='                                         // Code de réduction encodé en base64
            },
            {
                offset: new THREE.Vector3(39.68, -23.67, 0.5),                       // Position du troisième œuf
                material: this.materials.shades.items.purple,                         // Matériau violet
                code: 'MjAyMWVnZ212b2Focnc='                                         // Code de réduction encodé en base64
            },
            {
                offset: new THREE.Vector3(107.62, -155.75, 0.5),                     // Position du quatrième œuf
                material: this.materials.shades.items.blue,                           // Matériau bleu
                code: 'MjAyMWVnZ2N1ZHBhaW4='                                         // Code de réduction encodé en base64
            },
        ]

        // Méthode pour ajouter un nouvel œuf de Pâques
        this.eggs.add = (_options) =>
        {
            // Configuration de l'œuf
            const egg = {}
            egg.found = false                                                          // État de découverte
            egg.code = _options.code                                                   // Code de réduction

            // Création de l'objet 3D de l'œuf
            egg.object = this.objects.add({
                base: this.resources.items.eggBase.scene,                              // Modèle 3D de base
                collision: this.resources.items.eggCollision.scene,                    // Modèle de collision
                duplicated: true,                                                      // Autoriser la duplication
                shadow: { sizeX: 1.2, sizeY: 1.8, offsetZ: - 0.15, alpha: 0.35 },    // Configuration de l'ombre
                mass: 0.5,                                                             // Masse physique
                sleep: typeof _options.sleep !== 'undefined' ? _options.sleep : true,  // État de sommeil physique
                soundName: 'woodHit',                                                  // Son de collision
                offset: _options.offset,                                               // Position de l'œuf
                rotation: typeof _options.sleep !== 'undefined' ? _options.rotation : new THREE.Euler(0, 0, 0) // Rotation
            })

            // Application du matériau personnalisé
            egg.object.container.children[0].material = _options.material

            // Fonction de callback pour la collision avec la voiture
            egg.collisionCallback = (_event) =>
            {
                // Vérification de la collision avec la voiture
                if(_event.body === this.physics.car.chassis.body && !egg.found)
                {
                    // Marquage de l'œuf comme trouvé
                    egg.found = true

                    // Décodage du code de réduction (base64 vers texte)
                    const code = atob(egg.code)

                    // Affichage de la boîte de dialogue avec délai
                    window.setTimeout(() =>
                    {
                        // Confirmation de l'utilisateur pour aller sur la page d'abonnement
                        if(window.confirm(`
You find an egg!
Here is your code for a 30% discount on https://threejs-journey.xyz
${code}

Would you like to go on the subscription page?
                        `))
                        {
                            // Ouverture de la page d'abonnement avec le code
                            window.open(`https://threejs-journey.xyz/subscribe/${code}`, '_blank')
                        }

                        // Réinitialisation de l'état après 1 seconde
                        window.setTimeout(() =>
                        {
                            egg.found = false
                        }, 1000)
                    }, 600)
                }
            }

            // Ajout de l'écouteur d'événement de collision
            egg.object.collision.body.addEventListener('collide', egg.collisionCallback)

            // Sauvegarde de l'œuf dans la liste
            this.eggs.items.push(egg)
        }

        // Création des œufs de base selon la configuration
        for(const _eggOption of eggOptions)
        {
            this.eggs.add(_eggOption)
        }
    }
}
