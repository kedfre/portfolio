/**
 * VEHICLEPREVIEW.JS - Prévisualisation des Véhicules dans la Galerie
 *
 * Ce composant gère l'affichage et la rotation des véhicules dans la galerie.
 * Il utilise le système CarFactory existant pour créer les véhicules et
 * gère leur rotation avec la souris.
 *
 * RESPONSABILITÉS :
 * - Affichage des véhicules en gros plan
 * - Rotation des véhicules avec la souris
 * - Gestion des transitions entre véhicules
 * - Intégration avec CarFactory existant
 * - Optimisation des performances
 *
 * FONCTIONNALITÉS :
 * - Rotation fluide avec la souris
 * - Animations de transition entre véhicules
 * - Gestion des matériaux et éclairage
 * - Support de tous les types de véhicules
 * - Interface de debug
 *
 * ARCHITECTURE :
 * - Utilise CarFactory pour la création des véhicules
 * - Gestion d'état pour le véhicule actuel
 * - Système de rotation avec contrôles de souris
 * - Animations GSAP pour les transitions
 */

import * as THREE from 'three'
import CarFactory from './CarFactory.js'
import gsap from 'gsap'

export default class VehiclePreview
{
    /**
     * Constructor - Initialisation de la prévisualisation des véhicules
     *
     * Initialise le système de prévisualisation avec la configuration
     * des véhicules et la gestion des interactions.
     *
     * @param {Object} _options - Options de configuration
     * @param {Object} _options.config - Configuration de l'application
     * @param {Object} _options.debug - Interface de debug
     * @param {Object} _options.resources - Gestionnaire de ressources
     * @param {Object} _options.time - Gestionnaire du temps
     * @param {Object} _options.materials - Gestionnaire de matériaux
     * @param {Array} _options.vehicles - Liste des véhicules disponibles
     * @param {Object} _options.camera - Caméra de la galerie
     */
    constructor(_options)
    {
        // Stockage des options de configuration
        this.config = _options.config
        this.debug = _options.debug
        this.resources = _options.resources
        this.time = _options.time
        this.materials = _options.materials
        this.vehicles = _options.vehicles
        this.camera = _options.camera
        this.objects = _options.objects  // Gestionnaire d'objets 3D
        

        // Configuration de l'interface de debug
        if(this.debug)
        {
            this.debugFolder = this.debug.addFolder('vehiclePreview')
        }

        // Configuration du conteneur principal
        this.container = new THREE.Object3D()
        this.container.matrixAutoUpdate = false

        // État de la prévisualisation
        this.state = {
            currentVehicleIndex: 0,
            currentVehicle: null,
            isRotating: false,
            rotationSpeed: 0.005,
            autoRotation: true,
            autoRotationSpeed: 0.001
        }

        // Contrôles de rotation
        this.rotation = {
            mouse: { x: 0, y: 0 },
            target: { x: 0, y: 0 },
            current: { x: 0, y: 0 },
            isDragging: false,
            lastMousePosition: { x: 0, y: 0 }
        }

        // Initialisation des composants
        this.setVehicleContainer()
        this.setEvents()
        this.setDebug()

        // Création du premier véhicule
        this.setVehicle(0)
    }

    /**
     * SetVehicleContainer - Configuration du conteneur des véhicules
     *
     * Crée le conteneur qui accueillera les véhicules et configure
     * le positionnement pour le gros plan.
     */
    setVehicleContainer()
    {
        // Conteneur pour le véhicule actuel
        this.vehicleContainer = new THREE.Object3D()
        this.vehicleContainer.position.set(0, 0, 0)
        this.vehicleContainer.matrixAutoUpdate = false
        this.vehicleContainer.visible = true // S'assurer que le conteneur est visible
        this.container.add(this.vehicleContainer)
        
        console.log('📦 Conteneurs créés:')
        console.log('  - container visible:', this.container.visible)
        console.log('  - vehicleContainer visible:', this.vehicleContainer.visible)

        // Conteneur pour les véhicules en transition
        this.transitionContainer = new THREE.Object3D()
        this.transitionContainer.matrixAutoUpdate = false
        this.container.add(this.transitionContainer)
    }

    /**
     * SetEvents - Configuration des événements
     *
     * Configure les événements de souris pour la rotation des véhicules
     * et la boucle de mise à jour.
     */
    setEvents()
    {
        // Boucle de mise à jour
        this.time.on('tick', () =>
        {
            this.update()
        })

        // Événements de souris pour la rotation
        this.setMouseEvents()
    }

    /**
     * SetMouseEvents - Configuration des événements de souris
     *
     * Configure les événements de souris pour permettre la rotation
     * des véhicules avec la souris.
     */
    setMouseEvents()
    {
        // Variables pour le suivi de la souris
        this.mousePosition = { x: 0, y: 0 }
        this.isMouseDown = false

        // Événement mousedown
        const onMouseDown = (event) =>
        {
            this.isMouseDown = true
            this.rotation.isDragging = true
            this.rotation.lastMousePosition.x = event.clientX
            this.rotation.lastMousePosition.y = event.clientY
            this.state.autoRotation = false
        }

        // Événement mousemove
        const onMouseMove = (event) =>
        {
            if(this.isMouseDown && this.rotation.isDragging)
            {
                const deltaX = event.clientX - this.rotation.lastMousePosition.x
                const deltaY = event.clientY - this.rotation.lastMousePosition.y

                // Rotation seulement sur l'axe Z (horizontal) pour le glissement gauche-droite
                this.rotation.target.x += deltaX * this.state.rotationSpeed * 0.5
                // Pas de rotation verticale (Y) pour le glissement gauche-droite
                // this.rotation.target.y += deltaY * this.state.rotationSpeed * 0.5

                // Limitation de la rotation horizontale (pas de limite pour l'instant)
                // this.rotation.target.y = Math.max(-Math.PI / 3, Math.min(Math.PI / 3, this.rotation.target.y))

                this.rotation.lastMousePosition.x = event.clientX
                this.rotation.lastMousePosition.y = event.clientY
                
            }
        }

        // Événement mouseup
        const onMouseUp = () =>
        {
            this.isMouseDown = false
            this.rotation.isDragging = false
            this.state.autoRotation = true
        }

        // Événement mouseleave
        const onMouseLeave = () =>
        {
            this.isMouseDown = false
            this.rotation.isDragging = false
        }

        // Ajout des événements au canvas
        const canvas = document.querySelector('.canvas')
        if(canvas)
        {
            console.log('✅ Canvas trouvé, attachement des événements de souris')
            canvas.addEventListener('mousedown', onMouseDown)
            canvas.addEventListener('mousemove', onMouseMove)
            canvas.addEventListener('mouseup', onMouseUp)
            canvas.addEventListener('mouseleave', onMouseLeave)

            // Stockage des références pour le nettoyage
            this.mouseEvents = {
                canvas,
                onMouseDown,
                onMouseMove,
                onMouseUp,
                onMouseLeave
            }
        }
        else
        {
            console.warn('❌ Canvas non trouvé, utilisation des événements globaux')
            // Fallback : attacher aux événements globaux
            window.addEventListener('mousedown', onMouseDown)
            window.addEventListener('mousemove', onMouseMove)
            window.addEventListener('mouseup', onMouseUp)
            window.addEventListener('mouseleave', onMouseLeave)

            // Stockage des références pour le nettoyage
            this.mouseEvents = {
                canvas: null,
                onMouseDown,
                onMouseMove,
                onMouseUp,
                onMouseLeave
            }
        }
    }

    /**
     * SetDebug - Configuration de l'interface de debug
     *
     * Ajoute les contrôles de debug pour la prévisualisation.
     */
    setDebug()
    {
        if(!this.debug)
        {
            return
        }

        // Contrôles d'état
        this.debugFolder.add(this.state, 'currentVehicleIndex').min(0).max(this.vehicles.length - 1).step(1).name('currentVehicleIndex')
        this.debugFolder.add(this.state, 'autoRotation').name('autoRotation')
        this.debugFolder.add(this.state, 'autoRotationSpeed').min(0).max(0.01).step(0.0001).name('autoRotationSpeed')
        this.debugFolder.add(this.state, 'rotationSpeed').min(0).max(0.02).step(0.0001).name('rotationSpeed')

        // Contrôles de rotation
        const rotationFolder = this.debugFolder.addFolder('rotation')
        rotationFolder.add(this.rotation.current, 'x').min(-Math.PI).max(Math.PI).step(0.01).name('rotationX')
        rotationFolder.add(this.rotation.current, 'y').min(-Math.PI).max(Math.PI).step(0.01).name('rotationY')

        // Actions
        this.debugFolder.add(this, 'resetRotation').name('resetRotation')
        this.debugFolder.add(this, 'nextVehicle').name('nextVehicle')
        this.debugFolder.add(this, 'previousVehicle').name('previousVehicle')
    }

    /**
     * SetVehicle - Configuration d'un véhicule
     *
     * Crée et affiche un véhicule spécifique dans la galerie.
     *
     * @param {number} _index - Index du véhicule à afficher
     * @param {Function} _onComplete - Callback de fin de transition
     */
    setVehicle(_index, _onComplete = null)
    {
        if(_index < 0 || _index >= this.vehicles.length)
        {
            return
        }

        const vehicle = this.vehicles[_index]
        this.state.currentVehicleIndex = _index
        
        console.log('Changement de véhicule vers l\'index:', _index)
        console.log('Véhicule sélectionné:', vehicle)

        // Animation de transition si un véhicule est déjà affiché
        if(this.state.currentVehicle)
        {
            this.transitionToVehicle(vehicle, _onComplete)
        }
        else
        {
            this.createVehicle(vehicle)
            if(_onComplete)
            {
                _onComplete()
            }
        }
    }

    /**
     * CreateVehicle - Création d'un véhicule
     *
     * Crée un nouveau véhicule directement à partir des modèles 3D pour la galerie.
     * Cette approche évite les complications de la classe Car complète.
     *
     * @param {Object} _vehicle - Configuration du véhicule
     */
    createVehicle(_vehicle)
    {
        // Configuration temporaire pour la sélection du modèle
        const tempConfig = {
            ...this.config,
            ..._vehicle.config
        }

        // Sélection du modèle selon la configuration
        let chassisModel = null
        console.log('Configuration du véhicule:', tempConfig)
        
        if(tempConfig.cyberTruck)
        {
            chassisModel = this.resources.items.carCyberTruckChassis
            console.log('Modèle CyberTruck:', chassisModel)
        }
        else if(tempConfig.dukeHazzard)
        {
            chassisModel = this.resources.items.carDukeHazzardChassis
            console.log('Modèle Duke Hazzard:', chassisModel)
        }
        else
        {
            chassisModel = this.resources.items.carDefaultChassis
            console.log('Modèle par défaut:', chassisModel)
        }
        
        // Si le modèle n'est pas disponible, créons un modèle de test
        if(!chassisModel)
        {
            console.log('Modèle non disponible, création d\'un modèle de test')
            chassisModel = this.createTestModel(tempConfig)
        }

        // Création du conteneur du véhicule
        this.state.currentVehicle = {
            container: new THREE.Object3D(),
            config: tempConfig,
            update: () => {
                // Pas de mise à jour nécessaire dans la galerie
            },
            destroy: () => {
                // Nettoyage simple
                if(this.state.currentVehicle && this.state.currentVehicle.container)
                {
                    this.vehicleContainer.remove(this.state.currentVehicle.container)
                }
            }
        }

        // Création du mesh du châssis directement à partir du modèle
        if(chassisModel && chassisModel.scene)
        {
            console.log('✅ Modèle trouvé, clonage direct du modèle')
            
            // Cloner directement le modèle pour éviter les problèmes avec getConvertedMesh
            const chassisMesh = chassisModel.scene.clone()
            
            // Appliquer les matcaps selon les noms des enfants
            chassisMesh.traverse((child) => {
                if(child instanceof THREE.Mesh) {
                    // Sélection du matcap selon le nom de l'enfant
                    let matcapTexture = null
                    let matcapName = ''
                    
                    const meshName = child.name.toLowerCase()
                    
                    // Mapping des noms vers les matcaps
                    if(meshName.includes('chrome')) {
                        matcapTexture = this.resources.items.matcapChromeTexture
                        matcapName = 'Chrome'
                    } else if(meshName.includes('blackmetal')) {
                        matcapTexture = this.resources.items.matcapBlackMetalTexture
                        matcapName = 'BlackMetal'
                    } else if(meshName.includes('orangeduckhazzard')) {
                        matcapTexture = this.resources.items.matcapOrangeDuckHazzardTexture
                        matcapName = 'OrangeDuckHazzard'
                    } else if(meshName.includes('glass')) {
                        matcapTexture = this.resources.items.matcapGlassTexture
                        matcapName = 'Glass'
                    } else if(meshName.includes('black')) {
                        matcapTexture = this.resources.items.matcapBlackTexture
                        matcapName = 'Black'
                    } else if(meshName.includes('white')) {
                        matcapTexture = this.resources.items.matcapWhiteTexture
                        matcapName = 'White'
                    } else if(meshName.includes('yellow')) {
                        matcapTexture = this.resources.items.matcapYellowTexture
                        matcapName = 'Yellow'
                    } else if(meshName.includes('red')) {
                        matcapTexture = this.resources.items.matcapRedTexture
                        matcapName = 'Red'
                    } else {
                        // Matcap par défaut selon le type de véhicule
                        if(tempConfig && tempConfig.cyberTruck) {
                            matcapTexture = this.resources.items.matcapMetalTexture
                            matcapName = 'Metal (default)'
                        } else if(tempConfig && tempConfig.dukeHazzard) {
                            matcapTexture = this.resources.items.matcapOrangeDuckHazzardTexture
                            matcapName = 'Orange (default)'
                        } else {
                            matcapTexture = this.resources.items.matcapGrayTexture
                            matcapName = 'Gray (default)'
                        }
                    }
                    
                    if(matcapTexture) {
                        // Créer un matériau matcap simple
                        child.material = new THREE.MeshMatcapMaterial({ 
                            matcap: matcapTexture 
                        })
                        child.material.needsUpdate = true
                        console.log('🎨 Matcap appliqué:', matcapName, 'sur', child.name)
                    } else {
                        // Fallback vers un matériau basique
                        let color = 0x888888  // Gris par défaut
                        if(tempConfig && tempConfig.cyberTruck) {
                            color = 0x333333  // Gris foncé pour CyberTruck
                        } else if(tempConfig && tempConfig.dukeHazzard) {
                            color = 0xff6600  // Orange pour Duke Hazzard
                        }
                        child.material = new THREE.MeshBasicMaterial({ color: color })
                        child.material.needsUpdate = true
                        console.log('🔧 Fallback vers matériau basique:', color.toString(16), 'pour', child.name)
                    }
                }
            })
            
            this.state.currentVehicle.container.add(chassisMesh)
            console.log('✅ Mesh ajouté au conteneur du véhicule avec matcaps')
            
            
            // Diagnostic de visibilité
            console.log('🔍 Diagnostic de visibilité:')
            console.log('  - chassisMesh visible:', chassisMesh.visible)
            console.log('  - chassisMesh enfants:', chassisMesh.children.length)
            chassisMesh.traverse((child) => {
                if(child instanceof THREE.Mesh) {
                    console.log('  - mesh:', child.name, 'visible:', child.visible, 'material:', child.material.type)
                }
            })
        }
        else
        {
            console.warn('❌ Modèle non trouvé ou scène vide')
        }

        // Positionnement du véhicule
        this.state.currentVehicle.container.position.set(0, 0, 0)
        this.state.currentVehicle.container.scale.setScalar(1.5) // Plus grand pour être bien visible
        this.state.currentVehicle.container.visible = true // S'assurer que le véhicule est visible
        this.vehicleContainer.add(this.state.currentVehicle.container)
        
        console.log('🚗 Véhicule créé et ajouté:')
        console.log('  - Conteneur visible:', this.state.currentVehicle.container.visible)
        console.log('  - Nombre d\'enfants:', this.state.currentVehicle.container.children.length)
        console.log('  - Position:', this.state.currentVehicle.container.position)
        console.log('  - Échelle:', this.state.currentVehicle.container.scale)

        // Réinitialisation de la rotation
        this.resetRotation()
    }

    /**
     * CreateSimpleMesh - Création d'un mesh simple
     *
     * Crée un mesh simple à partir des enfants d'un modèle 3D.
     *
     * @param {Array} _children - Enfants du modèle 3D
     * @returns {THREE.Object3D} Conteneur avec les meshes
     */
    createSimpleMesh(_children)
    {
        const container = new THREE.Object3D()
        console.log('🔧 Création du mesh simple avec', _children.length, 'enfants')
        
        for(const child of _children)
        {
            if(child instanceof THREE.Mesh)
            {
                console.log('✅ Mesh trouvé:', child.name || 'sans nom')
                // Clonage du mesh
                const mesh = child.clone()
                
                // Application d'un matériau basique pour l'instant (matcaps à implémenter plus tard)
                let materialColor = 0x888888  // Couleur par défaut
                if(this.config && this.config.cyberTruck) {
                    materialColor = 0x333333  // Gris foncé pour CyberTruck
                } else if(this.config && this.config.dukeHazzard) {
                    materialColor = 0xff6600  // Orange pour Duke Hazzard
                } else {
                    materialColor = 0x666666  // Gris pour la voiture par défaut
                }
                
                // Forcer l'application du matériau et s'assurer qu'il est visible
                mesh.material = new THREE.MeshLambertMaterial({ 
                    color: materialColor,
                    transparent: false,
                    opacity: 1.0
                })
                
                // Forcer la mise à jour du matériau
                mesh.material.needsUpdate = true
                mesh.material.visible = true
                
                console.log('✅ Matériau basique appliqué:', materialColor.toString(16))
                console.log('🔍 Matériau détails:', {
                    color: mesh.material.color.getHexString(),
                    visible: mesh.material.visible,
                    transparent: mesh.material.transparent,
                    opacity: mesh.material.opacity
                })
                
                // Vérification que le mesh est visible
                mesh.visible = true
                console.log('🔍 Mesh créé:', mesh.name, 'visible:', mesh.visible, 'material:', mesh.material)
                
                container.add(mesh)
            }
        }
        
        console.log('✅ Mesh simple créé avec', container.children.length, 'meshes')
        return container
    }

    /**
     * CreateTestModel - Création d'un modèle de test
     *
     * Crée un modèle de test simple quand les vrais modèles ne sont pas disponibles.
     *
     * @param {Object} _config - Configuration du véhicule
     * @returns {Object} Modèle de test avec structure scene.children
     */
    createTestModel(_config)
    {
        const testModel = {
            scene: {
                children: []
            }
        }
        
        // Création d'un châssis de test selon le type
        if(_config.cyberTruck)
        {
            // CyberTruck - forme rectangulaire
            const geometry = new THREE.BoxGeometry(2, 0.5, 4)
            const material = new THREE.MeshLambertMaterial({ color: 0x333333 })
            const mesh = new THREE.Mesh(geometry, material)
            mesh.name = 'cybertruck_chassis'
            mesh.visible = true
            testModel.scene.children.push(mesh)
        }
        else if(_config.dukeHazzard)
        {
            // Duke Hazzard - forme de voiture de course
            const geometry = new THREE.BoxGeometry(1.8, 0.4, 3.5)
            const material = new THREE.MeshLambertMaterial({ color: 0xff6600 })
            const mesh = new THREE.Mesh(geometry, material)
            mesh.name = 'dukehazzard_chassis'
            mesh.visible = true
            testModel.scene.children.push(mesh)
        }
        else
        {
            // Voiture par défaut - forme classique
            const geometry = new THREE.BoxGeometry(1.6, 0.5, 3.2)
            const material = new THREE.MeshLambertMaterial({ color: 0x666666 })
            const mesh = new THREE.Mesh(geometry, material)
            mesh.name = 'default_chassis'
            mesh.visible = true
            testModel.scene.children.push(mesh)
        }
        
        return testModel
    }


    /**
     * TransitionToVehicle - Transition vers un nouveau véhicule
     *
     * Gère la transition fluide entre deux véhicules avec des animations.
     *
     * @param {Object} _vehicle - Nouveau véhicule
     * @param {Function} _onComplete - Callback de fin de transition
     */
    transitionToVehicle(_vehicle, _onComplete = null)
    {
        // Animation de sortie du véhicule actuel
        gsap.to(this.vehicleContainer, 
            {
                scaleX: 0.8,
                scaleY: 0.8,
                scaleZ: 0.8,
                rotationY: Math.PI * 0.5,
                duration: 0.3,
                ease: 'power2.in',
                onComplete: () =>
                {
                    // Suppression de l'ancien véhicule
                    if(this.state.currentVehicle)
                    {
                        if(this.state.currentVehicle.container)
                        {
                            this.vehicleContainer.remove(this.state.currentVehicle.container)
                        }
                        if(this.state.currentVehicle.destroy)
                        {
                            try
                            {
                                this.state.currentVehicle.destroy()
                            }
                            catch(error)
                            {
                                console.warn('Erreur lors de la destruction du véhicule lors de la transition:', error)
                            }
                        }
                    }

                    // Création du nouveau véhicule
                    this.createVehicle(_vehicle)

                    // Animation d'entrée du nouveau véhicule
                    gsap.fromTo(this.vehicleContainer,
                        {
                            scaleX: 0.8,
                            scaleY: 0.8,
                            scaleZ: 0.8,
                            rotationY: -Math.PI * 0.5
                        },
                        {
                            scaleX: 1,
                            scaleY: 1,
                            scaleZ: 1,
                            rotationY: 0,
                            duration: 0.4,
                            ease: 'back.out(1.7)',
                            onComplete: () =>
                            {
                                if(_onComplete)
                                {
                                    _onComplete()
                                }
                            }
                        }
                    )
                }
            }
        )
    }

    /**
     * ResetRotation - Réinitialisation de la rotation
     *
     * Remet la rotation du véhicule à zéro.
     */
    resetRotation()
    {
        this.rotation.current.x = 0
        this.rotation.current.y = 0
        this.rotation.target.x = 0
        this.rotation.target.y = 0
        this.vehicleContainer.rotation.set(0, 0, 0)
    }

    /**
     * NextVehicle - Véhicule suivant
     *
     * Passe au véhicule suivant dans la liste.
     */
    nextVehicle()
    {
        const nextIndex = (this.state.currentVehicleIndex + 1) % this.vehicles.length
        this.setVehicle(nextIndex)
    }

    /**
     * PreviousVehicle - Véhicule précédent
     *
     * Passe au véhicule précédent dans la liste.
     */
    previousVehicle()
    {
        const prevIndex = this.state.currentVehicleIndex === 0 
            ? this.vehicles.length - 1 
            : this.state.currentVehicleIndex - 1
        this.setVehicle(prevIndex)
    }

    /**
     * Update - Mise à jour de la prévisualisation
     *
     * Met à jour la rotation du véhicule et gère l'auto-rotation.
     */
    update()
    {
        if(!this.state.currentVehicle)
        {
            return
        }

        // Auto-rotation si activée et pas de drag
        if(this.state.autoRotation && !this.rotation.isDragging)
        {
            this.rotation.target.x += this.state.autoRotationSpeed
        }

        // Interpolation de la rotation
        this.rotation.current.x += (this.rotation.target.x - this.rotation.current.x) * 0.1
        this.rotation.current.y += (this.rotation.target.y - this.rotation.current.y) * 0.1

        // Application de la rotation au conteneur
        if(this.vehicleContainer) {
            // Rotation seulement sur l'axe Z (horizontal) pour le glissement gauche-droite
            this.vehicleContainer.rotation.set(
                0,  // Pas de rotation X
                0,  // Pas de rotation Y  
                this.rotation.current.x  // Rotation seulement sur l'axe Z
            )
            
            // Rotation aussi sur le conteneur du véhicule actuel si il existe
            if(this.state.currentVehicle && this.state.currentVehicle.container) {
                this.state.currentVehicle.container.rotation.set(
                    0,  // Pas de rotation X
                    0,  // Pas de rotation Y
                    this.rotation.current.x  // Rotation seulement sur l'axe Z
                )
            }
            
        } else {
            console.warn('❌ vehicleContainer non trouvé')
        }

        // Mise à jour du véhicule si nécessaire
        if(this.state.currentVehicle && this.state.currentVehicle.update)
        {
            try
            {
                this.state.currentVehicle.update()
            }
            catch(error)
            {
                // Ignorer les erreurs de mise à jour dans la galerie
                console.warn('Erreur lors de la mise à jour du véhicule dans la galerie:', error)
            }
        }
    }

    /**
     * GetCurrentVehicle - Récupération du véhicule actuel
     *
     * Retourne le véhicule actuellement affiché.
     *
     * @returns {Object} Véhicule actuel
     */
    getCurrentVehicle()
    {
        return this.vehicles[this.state.currentVehicleIndex]
    }

    /**
     * Destroy - Destruction de la prévisualisation
     *
     * Nettoie toutes les ressources utilisées par la prévisualisation.
     */
    destroy()
    {
        // Désabonnement des événements
        this.time.off('tick')

        // Suppression des événements de souris
        if(this.mouseEvents)
        {
            const { canvas, onMouseDown, onMouseMove, onMouseUp, onMouseLeave } = this.mouseEvents
            canvas.removeEventListener('mousedown', onMouseDown)
            canvas.removeEventListener('mousemove', onMouseMove)
            canvas.removeEventListener('mouseup', onMouseUp)
            canvas.removeEventListener('mouseleave', onMouseLeave)
        }

        // Destruction du véhicule actuel
        if(this.state.currentVehicle && this.state.currentVehicle.destroy)
        {
            try
            {
                this.state.currentVehicle.destroy()
            }
            catch(error)
            {
                console.warn('Erreur lors de la destruction du véhicule dans la galerie:', error)
            }
        }

        // Plus de CarFactory à détruire

        // Nettoyage du conteneur
        this.container.clear()
    }
}
