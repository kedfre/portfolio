/**
 * VEHICLEGALLERY.JS - Gestionnaire Principal de la Galerie de Sélection de Véhicules
 *
 * Ce composant gère la galerie de sélection de véhicules qui s'affiche au clic sur "Start".
 * Il orchestre tous les sous-composants de la galerie et gère les transitions.
 *
 * RESPONSABILITÉS :
 * - Orchestration de tous les composants de la galerie
 * - Gestion des états (fermé, ouvert, sélection)
 * - Navigation entre les véhicules
 * - Transition vers l'application principale
 * - Intégration avec le système existant
 *
 * COMPOSANTS GÉRÉS :
 * - VehiclePreview : Prévisualisation des véhicules
 * - GalleryControls : Contrôles de navigation
 * - GalleryCamera : Caméra fixe pour la galerie
 * - Floor : Sol de la galerie (réutilise Floor.js)
 * - Materials : Matériaux (réutilise Materials.js)
 *
 * VÉHICULES SUPPORTÉS :
 * - Voiture par défaut (Car.js)
 * - CyberTruck (Car.js avec config.cyberTruck)
 * - Duke Hazzard (DukeHazzardCar.js)
 *
 * ARCHITECTURE :
 * - Pattern de composition avec conteneurs Three.js
 * - Gestion d'état centralisée
 * - Intégration transparente avec l'architecture existante
 * - Support debug avec dat.GUI
 */

import * as THREE from 'three'
import VehiclePreview from './VehiclePreview.js'
import GalleryControls from './GalleryControls.js'
// Plus besoin de GalleryCamera - on utilise la caméra principale
import Floor from './Floor.js'
import Materials from './Materials.js'
import gsap from 'gsap'

export default class VehicleGallery
{
    /**
     * Constructor - Initialisation de la galerie de véhicules
     *
     * Initialise la galerie avec tous ses composants et configure l'état initial.
     * La galerie est créée mais reste invisible jusqu'à l'activation.
     *
     * @param {Object} _options - Options de configuration
     * @param {Object} _options.config - Configuration de l'application
     * @param {Object} _options.debug - Interface de debug (dat.GUI)
     * @param {Object} _options.resources - Gestionnaire de ressources
     * @param {Object} _options.time - Gestionnaire du temps
     * @param {Object} _options.sizes - Gestionnaire des dimensions
     * @param {Object} _options.camera - Instance de caméra principale
     * @param {Object} _options.scene - Scène Three.js principale
     * @param {Object} _options.renderer - Rendu Three.js
     * @param {Object} _options.passes - Post-processing
     */
    constructor(_options)
    {
        // Stockage des options de configuration
        this.config = _options.config
        this.debug = _options.debug
        this.resources = _options.resources
        this.time = _options.time
        this.sizes = _options.sizes
        this.camera = _options.camera
        this.scene = _options.scene
        this.renderer = _options.renderer
        this.passes = _options.passes
        this.objects = _options.objects  // Gestionnaire d'objets 3D
        this.materials = _options.materials  // Gestionnaire de matériaux

        // Configuration de l'interface de debug
        if(this.debug)
        {
            this.debugFolder = this.debug.addFolder('vehicleGallery')
            this.debugFolder.open()
        }

        // Configuration du conteneur principal de la galerie
        this.container = new THREE.Object3D()
        this.container.matrixAutoUpdate = false
        this.container.visible = false // Invisible par défaut

        // État de la galerie
        this.state = {
            isOpen: false,
            currentVehicleIndex: 0,
            selectedVehicle: null,
            isTransitioning: false
        }

        // Configuration des véhicules disponibles
        this.vehicles = [
            {
                id: 'default',
                name: 'Voiture par défaut',
                config: { dukeHazzard: false, cyberTruck: false }
            },
            {
                id: 'cybertruck',
                name: 'CyberTruck',
                config: { dukeHazzard: false, cyberTruck: true }
            },
            {
                id: 'dukehazzard',
                name: 'Duke Hazzard',
                config: { dukeHazzard: true, cyberTruck: false }
            }
        ]

        // Initialisation des composants
        this.setMaterials()
        this.setFloor()
        this.setCamera()
        this.setVehiclePreview()
        this.setControls()
        this.setEvents()

        // Configuration de l'interface de debug
        if(this.debug)
        {
            this.setDebug()
        }

        // Configuration des fonctions console
        this.setConsoleFunctions()
        
        // Configuration automatique du zoom pour la galerie (après avoir défini les fonctions)
        setTimeout(() => {
            if(window.setGalleryZoom) {
                window.setGalleryZoom(0.6)
                console.log('🔍 Zoom configuré à 0.6, position caméra:', this.camera.instance.position)
                console.log('🔍 Distance caméra:', this.camera.zoom.distance)
            }
        }, 100)
    }

    /**
     * SetMaterials - Configuration des matériaux pour la galerie
     *
     * Réutilise le système de matériaux existant pour maintenir la cohérence
     * visuelle avec l'application principale.
     */
    setMaterials()
    {
        this.materials = new Materials({
            resources: this.resources,
            debug: this.debugFolder
        })
    }

    /**
     * SetFloor - Configuration du sol de la galerie
     *
     * Réutilise le système de sol existant pour maintenir la cohérence
     * visuelle avec l'application principale.
     */
    setFloor()
    {
        this.floor = new Floor({
            debug: this.debugFolder
        })

        this.container.add(this.floor.container)
    }

    /**
     * SetCamera - Configuration de la caméra de la galerie
     *
     * Utilise la caméra principale de l'application au lieu de créer une nouvelle caméra.
     */
    setCamera()
    {
        // Pas de caméra séparée - on utilise la caméra principale
        console.log('Galerie utilise la caméra principale de l\'application')
    }

    /**
     * SetVehiclePreview - Configuration de la prévisualisation des véhicules
     *
     * Crée le système de prévisualisation qui gère l'affichage et la rotation
     * des véhicules dans la galerie.
     */
    setVehiclePreview()
    {
        
        this.vehiclePreview = new VehiclePreview({
            config: this.config,
            debug: this.debugFolder,
            resources: this.resources,
            time: this.time,
            materials: this.materials,
            vehicles: this.vehicles,
            camera: this.camera,  // Utilise la caméra principale
            objects: this.objects  // Ajout du gestionnaire d'objets pour getConvertedMesh
        })

        // Déplacer le conteneur des véhicules vers le bas pour le centrer verticalement
        this.vehiclePreview.container.position.y = -1.5  // Décalage vers le bas

        // Ajout d'un éclairage spécifique pour les matcaps
        this.setGalleryLighting()

        this.container.add(this.vehiclePreview.container)
    }

    /**
     * SetGalleryLighting - Configuration de l'éclairage pour la galerie
     * 
     * Ajoute un éclairage spécifique pour que les matcaps soient bien visibles
     * dans la galerie.
     */
    setGalleryLighting()
    {
        // Lumière directionnelle principale
        this.galleryLight = new THREE.DirectionalLight(0xffffff, 1.0)
        this.galleryLight.position.set(5, 5, 5)
        this.galleryLight.target.position.set(0, 0, 0)
        this.container.add(this.galleryLight)
        this.container.add(this.galleryLight.target)

        // Lumière ambiante pour éclairer les ombres
        this.galleryAmbientLight = new THREE.AmbientLight(0x404040, 0.8)
        this.container.add(this.galleryAmbientLight)

        console.log('💡 Éclairage de la galerie ajouté pour les matcaps')
        
        // Diagnostic de l'éclairage
        console.log('🔍 Diagnostic de l\'éclairage:')
        console.log('  - galleryLight:', this.galleryLight)
        console.log('  - galleryAmbientLight:', this.galleryAmbientLight)
        console.log('  - Position de la caméra:', this.camera.instance.position)
        console.log('  - Zoom de la caméra:', this.camera.zoom.value)
    }

    /**
     * SetControls - Configuration des contrôles de navigation
     *
     * Crée les contrôles de navigation (flèches, indicateurs) pour permettre
     * à l'utilisateur de naviguer entre les véhicules.
     */
    setControls()
    {
        this.controls = new GalleryControls({
            debug: this.debugFolder,
            vehicles: this.vehicles,
            onVehicleChange: (index) => this.changeVehicle(index),
            onVehicleSelect: (vehicle) => this.selectVehicle(vehicle)
        })

        // Configuration de la caméra pour les contrôles
        this.controls.setCamera(this.camera.instance)

        this.container.add(this.controls.container)
    }

    /**
     * SetEvents - Configuration des événements
     *
     * Configure les événements de la galerie et la boucle de mise à jour.
     */
    setEvents()
    {
        // Boucle de mise à jour
        this.time.on('tick', () =>
        {
            if(this.state.isOpen)
            {
                this.update()
            }
        })

        // Gestion du redimensionnement
        this.sizes.on('resize', () =>
        {
            if(this.state.isOpen)
            {
                this.resize()
            }
        })
    }

    /**
     * SetDebug - Configuration de l'interface de debug
     *
     * Ajoute les contrôles de debug pour la galerie.
     */
    setDebug()
    {
        // Contrôles d'état
        this.debugFolder.add(this.state, 'isOpen').name('isOpen')
        this.debugFolder.add(this.state, 'currentVehicleIndex').min(0).max(this.vehicles.length - 1).step(1).name('currentVehicleIndex')
        
        // Actions
        this.debugFolder.add(this, 'open').name('open')
        this.debugFolder.add(this, 'close').name('close')
        this.debugFolder.add(this, 'nextVehicle').name('nextVehicle')
        this.debugFolder.add(this, 'previousVehicle').name('previousVehicle')
    }

    /**
     * Open - Ouverture de la galerie
     *
     * Affiche la galerie avec une animation d'entrée et initialise
     * l'affichage du premier véhicule.
     */
    open()
    {
        if(this.state.isOpen || this.state.isTransitioning)
        {
            return
        }

        this.state.isOpen = true
        this.state.isTransitioning = true

        // Affichage du conteneur
        this.container.visible = true

        // Initialisation du premier véhicule
        this.vehiclePreview.setVehicle(this.state.currentVehicleIndex)
        this.controls.setCurrentVehicle(this.state.currentVehicleIndex)

        // Animation d'entrée
        gsap.fromTo(this.container, 
            { 
                scaleX: 0.8,
                scaleY: 0.8,
                scaleZ: 0.8,
                rotationY: Math.PI * 0.1
            },
            { 
                scaleX: 1,
                scaleY: 1,
                scaleZ: 1,
                rotationY: 0,
                duration: 0.8,
                ease: 'back.out(1.7)',
                onComplete: () =>
                {
                    this.state.isTransitioning = false
                }
            }
        )

        // Animation des contrôles
        this.controls.show()
    }

    /**
     * Close - Fermeture de la galerie
     *
     * Ferme la galerie avec une animation de sortie.
     */
    close()
    {
        if(!this.state.isOpen || this.state.isTransitioning)
        {
            return
        }

        this.state.isTransitioning = true

        // Animation de sortie
        gsap.to(this.container, 
            { 
                scaleX: 0.8,
                scaleY: 0.8,
                scaleZ: 0.8,
                rotationY: Math.PI * 0.1,
                duration: 0.5,
                ease: 'back.in(1.7)',
                onComplete: () =>
                {
                    this.container.visible = false
                    this.state.isOpen = false
                    this.state.isTransitioning = false
                }
            }
        )

        // Animation des contrôles
        this.controls.hide()
    }

    /**
     * ChangeVehicle - Changement de véhicule
     *
     * Change le véhicule affiché dans la galerie avec une animation de transition.
     *
     * @param {number} _index - Index du nouveau véhicule
     */
    changeVehicle(_index)
    {
        if(this.state.isTransitioning || _index === this.state.currentVehicleIndex)
        {
            return
        }

        this.state.isTransitioning = true
        this.state.currentVehicleIndex = _index

        // Animation de transition du véhicule
        this.vehiclePreview.setVehicle(_index, () =>
        {
            this.state.isTransitioning = false
        })

        // Mise à jour des contrôles
        this.controls.setCurrentVehicle(_index)
    }

    /**
     * SelectVehicle - Sélection d'un véhicule
     *
     * Sélectionne le véhicule actuel et ferme la galerie pour lancer l'application.
     *
     * @param {Object} _vehicle - Véhicule sélectionné
     */
    selectVehicle(_vehicle)
    {
        if(this.state.isTransitioning)
        {
            return
        }

        this.state.selectedVehicle = _vehicle

        // Animation de sélection
        gsap.to(this.vehiclePreview.container, 
            { 
                scale: 1.1,
                duration: 0.2,
                yoyo: true,
                repeat: 1,
                ease: 'power2.inOut',
                onComplete: () =>
                {
                    this.close()
                    this.onVehicleSelected(_vehicle)
                }
            }
        )
    }

    /**
     * NextVehicle - Véhicule suivant
     *
     * Passe au véhicule suivant dans la liste.
     */
    nextVehicle()
    {
        const nextIndex = (this.state.currentVehicleIndex + 1) % this.vehicles.length
        this.changeVehicle(nextIndex)
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
        this.changeVehicle(prevIndex)
    }

    /**
     * Update - Mise à jour de la galerie
     *
     * Met à jour tous les composants de la galerie à chaque frame.
     */
    update()
    {
        if(this.vehiclePreview)
        {
            this.vehiclePreview.update()
        }

        // Pas de mise à jour de caméra séparée - utilise la caméra principale
    }

    /**
     * Resize - Redimensionnement de la galerie
     *
     * Gère le redimensionnement de la galerie et de ses composants.
     */
    resize()
    {
        // Pas de redimensionnement de caméra séparée - utilise la caméra principale
    }

    /**
     * OnVehicleSelected - Callback de sélection de véhicule
     *
     * Callback appelé lorsqu'un véhicule est sélectionné.
     * Doit être défini par le composant parent.
     *
     * @param {Object} _vehicle - Véhicule sélectionné
     */
    onVehicleSelected(_vehicle)
    {
        // À implémenter par le composant parent
        console.log('Véhicule sélectionné:', _vehicle)
    }

    /**
     * GetSelectedVehicle - Récupération du véhicule sélectionné
     *
     * Retourne le véhicule actuellement sélectionné.
     *
     * @returns {Object|null} Véhicule sélectionné ou null
     */
    getSelectedVehicle()
    {
        return this.state.selectedVehicle
    }

    /**
     * GetCurrentVehicle - Récupération du véhicule actuel
     *
     * Retourne le véhicule actuellement affiché dans la galerie.
     *
     * @returns {Object} Véhicule actuel
     */
    getCurrentVehicle()
    {
        return this.vehicles[this.state.currentVehicleIndex]
    }

    /**
     * Destroy - Destruction de la galerie
     *
     * Nettoie toutes les ressources utilisées par la galerie.
     */
    destroy()
    {
        // Désabonnement des événements
        this.time.off('tick')
        this.sizes.off('resize')

        // Destruction des composants
        if(this.vehiclePreview)
        {
            this.vehiclePreview.destroy()
        }

        if(this.controls)
        {
            this.controls.destroy()
        }

        // Pas de destruction de caméra séparée - utilise la caméra principale

        if(this.floor)
        {
            this.floor.destroy()
        }

        if(this.materials)
        {
            this.materials.destroy()
        }

        // Nettoyage du conteneur
        this.container.clear()
    }

    /**
     * SetConsoleFunctions - Configuration des fonctions console
     *
     * Ajoute des fonctions accessibles depuis la console pour contrôler la galerie.
     */
    setConsoleFunctions()
    {
        // Fonction pour modifier le zoom de la caméra principale
        window.setGalleryZoom = (zoomValue) => {
            if(typeof zoomValue !== 'number' || zoomValue < 0 || zoomValue > 1) {
                console.error('Le zoom doit être un nombre entre 0 et 1')
                return
            }
            
            console.log('Modification du zoom de la caméra principale à:', zoomValue)
            
            // Modifier le zoom de la caméra principale
            if(this.camera && this.camera.zoom) {
                // Sauvegarder les valeurs originales si pas déjà fait
                if(!window.galleryOriginalValues) {
                    window.galleryOriginalValues = {
                        minDistance: this.camera.zoom.minDistance,
                        amplitude: this.camera.zoom.amplitude,
                        value: this.camera.zoom.value
                    }
                    console.log('Valeurs originales sauvegardées:', window.galleryOriginalValues)
                }
                
                // Surcharger les paramètres pour un zoom plus important
                this.camera.zoom.minDistance = 2        // Distance minimale très proche (au lieu de 14)
                this.camera.zoom.amplitude = 8         // Amplitude réduite (au lieu de 15)
                
                // Modifier le zoom
                this.camera.zoom.targetValue = zoomValue
                console.log('Zoom de la caméra principale modifié avec paramètres surchargés')
                console.log('Distance actuelle:', this.camera.zoom.distance)
            } else {
                console.log('Caméra principale non disponible')
            }
        }

        // Fonction pour restaurer le zoom original
        window.restoreGalleryZoom = () => {
            if(window.galleryOriginalValues && this.camera && this.camera.zoom) {
                // Restaurer les paramètres originaux
                this.camera.zoom.minDistance = window.galleryOriginalValues.minDistance
                this.camera.zoom.amplitude = window.galleryOriginalValues.amplitude
                this.camera.zoom.targetValue = window.galleryOriginalValues.value
                console.log('Zoom et paramètres restaurés aux valeurs originales')
            } else {
                console.log('Aucune valeur originale sauvegardée')
            }
        }

        // Fonction pour afficher le zoom actuel
        window.getGalleryZoomCamera = () => {
            if(this.camera && this.camera.zoom) {
                console.log('Zoom actuel de la caméra principale:', this.camera.zoom.value)
                console.log('Distance actuelle:', this.camera.zoom.distance)
                return this.camera.zoom.value
            } else {
                console.log('Caméra principale non disponible')
                return null
            }
        }

        // Fonction pour ajuster la position verticale des véhicules
        window.setGalleryVehiclePosition = (y) => {
            if(typeof y !== 'number') {
                console.error('La position Y doit être un nombre')
                return
            }
            
            if(this.vehiclePreview && this.vehiclePreview.container) {
                this.vehiclePreview.container.position.y = y
                console.log('Position verticale des véhicules modifiée à:', y)
            } else {
                console.log('Véhicules non disponibles')
            }
        }

        // Affichage des fonctions disponibles
        console.log('=== Fonctions console pour la galerie ===')
        console.log('setGalleryZoom(valeur) - Modifie le zoom (0-1)')
        console.log('restoreGalleryZoom() - Restaure le zoom original')
        console.log('getGalleryZoomCamera() - Affiche le zoom actuel')
        console.log('setGalleryVehiclePosition(y) - Ajuste la position verticale des véhicules')
    }
}
