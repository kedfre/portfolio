/**
 * GALLERYCAMERA.JS - Caméra Fixe pour la Galerie de Véhicules
 *
 * Ce composant gère la caméra fixe utilisée dans la galerie de véhicules.
 * La caméra est positionnée pour un gros plan optimal des véhicules et
 * ne bouge pas, seule la rotation des véhicules est possible.
 *
 * RESPONSABILITÉS :
 * - Positionnement fixe de la caméra pour le gros plan
 * - Configuration de l'éclairage de la galerie
 * - Gestion du redimensionnement
 * - Optimisation pour la prévisualisation
 *
 * FONCTIONNALITÉS :
 * - Position optimale pour le gros plan des véhicules
 * - Éclairage cohérent avec la scène principale
 * - Support du redimensionnement
 * - Interface de debug
 *
 * ARCHITECTURE :
 * - Caméra Perspective fixe
 * - Éclairage directionnel et ambiant
 * - Gestion des dimensions viewport
 * - Intégration avec le système existant
 */

import * as THREE from 'three'

export default class GalleryCamera
{
    /**
     * Constructor - Initialisation de la caméra de galerie
     *
     * Initialise la caméra fixe avec positionnement optimal pour la
     * prévisualisation des véhicules.
     *
     * @param {Object} _options - Options de configuration
     * @param {Object} _options.sizes - Gestionnaire des dimensions
     * @param {Object} _options.debug - Interface de debug
     */
    constructor(_options)
    {
        // Stockage des options de configuration
        this.sizes = _options.sizes
        this.debug = _options.debug

        // Configuration de l'interface de debug
        if(this.debug)
        {
            this.debugFolder = this.debug.addFolder('galleryCamera')
        }

        // Configuration du conteneur principal
        this.container = new THREE.Object3D()
        this.container.matrixAutoUpdate = false

        // Initialisation des composants
        this.setCamera()
        this.setLighting()
        this.setDebug()
        this.setConsoleFunctions()
    }

    /**
     * SetCamera - Configuration de la caméra
     *
     * Crée et configure la caméra perspective pour la galerie.
     */
    setCamera()
    {
        // Création de la caméra perspective
        this.camera = new THREE.PerspectiveCamera(
            50,                                    // FOV (Field of View)
            this.sizes.viewport.width / this.sizes.viewport.height, // Aspect ratio
            0.1,                                   // Near plane
            100                                    // Far plane
        )

        // Positionnement de la caméra pour le gros plan
        this.camera.position.set(0, 2, 8)          // Position optimale pour voir les véhicules
        this.camera.lookAt(0, 0, 0)                // Regarde vers le centre

        // Ajout de la caméra au conteneur
        this.container.add(this.camera)

        // Configuration de la position de base
        this.basePosition = {
            x: 0,
            y: 2,
            z: 8
        }

        // Configuration de la rotation de base
        this.baseRotation = {
            x: 0,
            y: 0,
            z: 0
        }

        // Zoom par défaut
        this.defaultZoom = 8
    }

    /**
     * SetLighting - Configuration de l'éclairage
     *
     * Configure l'éclairage de la galerie pour une prévisualisation optimale
     * des véhicules. Utilise un éclairage directionnel et ambiant.
     */
    setLighting()
    {
        // Lumière directionnelle principale (soleil)
        this.directionalLight = new THREE.DirectionalLight(0xffffff, 1)
        this.directionalLight.position.set(5, 10, 5)
        this.directionalLight.target.position.set(0, 0, 0)
        
        // Configuration des ombres
        this.directionalLight.castShadow = true
        this.directionalLight.shadow.mapSize.width = 2048
        this.directionalLight.shadow.mapSize.height = 2048
        this.directionalLight.shadow.camera.near = 0.5
        this.directionalLight.shadow.camera.far = 50
        this.directionalLight.shadow.camera.left = -10
        this.directionalLight.shadow.camera.right = 10
        this.directionalLight.shadow.camera.top = 10
        this.directionalLight.shadow.camera.bottom = -10

        // Ajout de la lumière directionnelle
        this.container.add(this.directionalLight)
        this.container.add(this.directionalLight.target)

        // Lumière ambiante pour éclairer les zones sombres
        this.ambientLight = new THREE.AmbientLight(0x404040, 0.4)
        this.container.add(this.ambientLight)

        // Lumière de remplissage (fill light)
        this.fillLight = new THREE.DirectionalLight(0xffffff, 0.3)
        this.fillLight.position.set(-5, 5, -5)
        this.fillLight.target.position.set(0, 0, 0)
        this.container.add(this.fillLight)
        this.container.add(this.fillLight.target)

        // Lumière rim (contour)
        this.rimLight = new THREE.DirectionalLight(0x00ffff, 0.2)
        this.rimLight.position.set(0, 3, -8)
        this.rimLight.target.position.set(0, 0, 0)
        this.container.add(this.rimLight)
        this.container.add(this.rimLight.target)
    }

    /**
     * SetDebug - Configuration de l'interface de debug
     *
     * Ajoute les contrôles de debug pour la caméra et l'éclairage.
     */
    setDebug()
    {
        if(!this.debug)
        {
            return
        }

        // Contrôles de la caméra
        const cameraFolder = this.debugFolder.addFolder('camera')
        cameraFolder.add(this.camera.position, 'x').min(-20).max(20).step(0.1).name('positionX')
        cameraFolder.add(this.camera.position, 'y').min(-10).max(10).step(0.1).name('positionY')
        cameraFolder.add(this.camera.position, 'z').min(0).max(20).step(0.1).name('positionZ')
        cameraFolder.add(this.camera, 'fov').min(10).max(120).step(1).name('fov')
        
        
        cameraFolder.add(this, 'resetCamera').name('resetCamera')

        // Contrôles de l'éclairage directionnel
        const directionalFolder = this.debugFolder.addFolder('directionalLight')
        directionalFolder.add(this.directionalLight.position, 'x').min(-20).max(20).step(0.1).name('positionX')
        directionalFolder.add(this.directionalLight.position, 'y').min(-10).max(20).step(0.1).name('positionY')
        directionalFolder.add(this.directionalLight.position, 'z').min(-20).max(20).step(0.1).name('positionZ')
        directionalFolder.add(this.directionalLight, 'intensity').min(0).max(3).step(0.1).name('intensity')
        directionalFolder.addColor(this.directionalLight, 'color').name('color')

        // Contrôles de la lumière ambiante
        const ambientFolder = this.debugFolder.addFolder('ambientLight')
        ambientFolder.add(this.ambientLight, 'intensity').min(0).max(2).step(0.1).name('intensity')
        ambientFolder.addColor(this.ambientLight, 'color').name('color')

        // Contrôles de la lumière de remplissage
        const fillFolder = this.debugFolder.addFolder('fillLight')
        fillFolder.add(this.fillLight.position, 'x').min(-20).max(20).step(0.1).name('positionX')
        fillFolder.add(this.fillLight.position, 'y').min(-10).max(20).step(0.1).name('positionY')
        fillFolder.add(this.fillLight.position, 'z').min(-20).max(20).step(0.1).name('positionZ')
        fillFolder.add(this.fillLight, 'intensity').min(0).max(2).step(0.1).name('intensity')
        fillFolder.addColor(this.fillLight, 'color').name('color')

        // Contrôles de la lumière rim
        const rimFolder = this.debugFolder.addFolder('rimLight')
        rimFolder.add(this.rimLight.position, 'x').min(-20).max(20).step(0.1).name('positionX')
        rimFolder.add(this.rimLight.position, 'y').min(-10).max(20).step(0.1).name('positionY')
        rimFolder.add(this.rimLight.position, 'z').min(-20).max(20).step(0.1).name('positionZ')
        rimFolder.add(this.rimLight, 'intensity').min(0).max(2).step(0.1).name('intensity')
        rimFolder.addColor(this.rimLight, 'color').name('color')
    }

    /**
     * ResetCamera - Réinitialisation de la caméra
     *
     * Remet la caméra à sa position et rotation de base.
     */
    resetCamera()
    {
        this.camera.position.set(
            this.basePosition.x,
            this.basePosition.y,
            this.basePosition.z
        )
        this.camera.rotation.set(
            this.baseRotation.x,
            this.baseRotation.y,
            this.baseRotation.z
        )
        this.camera.lookAt(0, 0, 0)
    }

    /**
     * SetConsoleFunctions - Configuration des fonctions console
     *
     * Ajoute des fonctions accessibles depuis la console pour contrôler la caméra.
     */
    setConsoleFunctions()
    {
        // Fonction pour afficher le zoom actuel
        window.getGalleryZoom = () => {
            console.log('Zoom actuel de la galerie:', this.camera.position.z)
            return this.camera.position.z
        }

        // Fonction pour modifier le zoom
        window.setGalleryZoom = (zoom) => {
            if(typeof zoom !== 'number' || zoom < 1 || zoom > 30) {
                console.error('Le zoom doit être un nombre entre 1 et 30')
                return
            }
            
            console.log('Tentative de modification du zoom à:', zoom)
            
            // Modifier la position Z de la caméra de la galerie
            this.camera.position.z = zoom
            this.camera.updateMatrixWorld()
            console.log('Caméra GalleryCamera mise à jour')
            
            // Modifier la caméra de la galerie si elle existe
            if(window.galleryCameraInstance && window.galleryCameraInstance.camera && window.galleryCameraInstance.camera.position) {
                window.galleryCameraInstance.camera.position.z = zoom
                window.galleryCameraInstance.camera.updateMatrixWorld()
                console.log('Caméra de la galerie mise à jour')
                
                // Forcer la mise à jour de la matrice de la caméra
                window.galleryCameraInstance.camera.updateProjectionMatrix()
                console.log('Matrice de projection mise à jour')
            } else {
                console.log('Caméra de la galerie non disponible')
            }
            
            console.log('Zoom de la galerie modifié à:', zoom)
            console.log('Position Z de la caméra GalleryCamera:', this.camera.position.z)
            
            // Vérifier la position après modification
            if(window.galleryCameraInstance) {
                console.log('Position Z de la caméra de la galerie après modification:', window.galleryCameraInstance.camera.position.z)
            }
        }

        // Fonction pour afficher toutes les informations de la caméra
        window.getGalleryCameraInfo = () => {
            console.log('=== Informations de la caméra de la galerie ===')
            console.log('Position:', {
                x: this.camera.position.x,
                y: this.camera.position.y,
                z: this.camera.position.z
            })
            console.log('Rotation:', {
                x: this.camera.rotation.x,
                y: this.camera.rotation.y,
                z: this.camera.rotation.z
            })
            console.log('FOV:', this.camera.fov)
            console.log('Zoom (position Z):', this.camera.position.z)
            
            // Vérifier les autres caméras disponibles
            console.log('=== Autres caméras disponibles ===')
            if(window.world && window.world.camera) {
                console.log('Caméra principale:', window.world.camera.position)
            }
            if(window.galleryCameraInstance && window.galleryCameraInstance.camera) {
                console.log('Caméra de la galerie:', window.galleryCameraInstance.camera.position)
            }
        }

        // Fonction pour diagnostiquer toutes les caméras disponibles
        window.diagnoseAllCameras = () => {
            console.log('=== Diagnostic de TOUTES les caméras ===')
            
            // 1. Caméra GalleryCamera (celle-ci)
            console.log('1. Caméra GalleryCamera (this):', this.camera.position)
            
            // 2. Caméra principale de l'application
            if(window.world && window.world.camera) {
                console.log('2. Caméra principale (world.camera):', window.world.camera.instance?.position || 'Pas d\'instance')
                console.log('   - Zoom distance:', window.world.camera.zoom?.distance || 'Pas de zoom')
                console.log('   - Zoom value:', window.world.camera.zoom?.value || 'Pas de zoom')
            } else {
                console.log('2. Caméra principale: Non disponible')
            }
            
            // 3. Caméra de la galerie
            if(window.galleryCameraInstance) {
                console.log('3. Caméra de la galerie (galleryCameraInstance):', window.galleryCameraInstance.camera?.position || 'Pas de position')
                console.log('   - Type:', window.galleryCameraInstance.camera?.type || 'Inconnu')
            } else {
                console.log('3. Caméra de la galerie: Non disponible')
            }
            
            // 4. Vérifier toutes les caméras dans la scène
            if(window.world && window.world.scene) {
                const cameras = []
                window.world.scene.traverse((child) => {
                    if(child.type === 'PerspectiveCamera' || child.type === 'OrthographicCamera') {
                        cameras.push({
                            name: child.name || 'Sans nom',
                            type: child.type,
                            position: child.position,
                            uuid: child.uuid
                        })
                    }
                })
                console.log('4. Toutes les caméras dans la scène:', cameras)
            }
        }

        // Fonction pour reset la caméra
        window.resetGalleryCamera = () => {
            this.resetCamera()
            console.log('Caméra de la galerie réinitialisée')
        }

        // Fonction pour modifier le zoom via le système de zoom de la caméra principale
        window.setGalleryZoomCamera = (zoomValue) => {
            if(typeof zoomValue !== 'number' || zoomValue < 0 || zoomValue > 1) {
                console.error('Le zoom doit être un nombre entre 0 et 1')
                return
            }
            
            console.log('Modification du zoom de la caméra principale à:', zoomValue)
            
            // Accéder à la caméra principale via l'application
            if(window.world && window.world.camera && window.world.camera.zoom) {
                window.world.camera.zoom.targetValue = zoomValue
                console.log('Zoom de la caméra principale modifié')
            } else {
                console.log('Caméra principale non disponible ou pas de système de zoom')
            }
        }

        // Fonction pour modifier le zoom de la caméra principale (simple)
        window.setGalleryZoom = (zoomValue) => {
            if(typeof zoomValue !== 'number' || zoomValue < 0 || zoomValue > 1) {
                console.error('Le zoom doit être un nombre entre 0 et 1')
                return
            }
            
            console.log('Modification du zoom de la caméra principale à:', zoomValue)
            
            // Modifier le zoom de la caméra principale
            if(window.world && window.world.camera && window.world.camera.zoom) {
                // Sauvegarder la valeur originale si pas déjà fait
                if(!window.galleryOriginalZoom) {
                    window.galleryOriginalZoom = window.world.camera.zoom.value
                    console.log('Zoom original sauvegardé:', window.galleryOriginalZoom)
                }
                
                // Modifier le zoom
                window.world.camera.zoom.targetValue = zoomValue
                console.log('Zoom de la caméra principale modifié')
                console.log('Distance actuelle:', window.world.camera.zoom.distance)
            } else {
                console.log('Caméra principale non disponible')
            }
        }

        // Fonction pour restaurer le zoom original
        window.restoreGalleryZoom = () => {
            if(window.galleryOriginalZoom !== undefined && window.world && window.world.camera && window.world.camera.zoom) {
                window.world.camera.zoom.targetValue = window.galleryOriginalZoom
                console.log('Zoom restauré à:', window.galleryOriginalZoom)
            } else {
                console.log('Aucun zoom original sauvegardé')
            }
        }

        // Fonction pour afficher le zoom actuel de la caméra principale
        window.getGalleryZoomCamera = () => {
            if(window.world && window.world.camera && window.world.camera.zoom) {
                console.log('Zoom actuel de la caméra principale:', window.world.camera.zoom.value)
                console.log('Distance de la caméra:', window.world.camera.zoom.distance)
                return window.world.camera.zoom.value
            } else {
                console.log('Caméra principale non disponible')
                return null
            }
        }

        // Affichage des fonctions disponibles
        console.log('=== Fonctions console pour la galerie (SIMPLIFIÉES) ===')
        console.log('setGalleryZoom(valeur) - Modifie le zoom de la caméra principale (0-1)')
        console.log('restoreGalleryZoom() - Restaure le zoom original')
        console.log('getGalleryZoomCamera() - Affiche le zoom actuel')
        console.log('diagnoseAllCameras() - Diagnostique toutes les caméras')
    }

    /**
     * Update - Mise à jour de la caméra
     *
     * Met à jour la caméra à chaque frame. Dans le cas de la galerie,
     * la caméra est fixe, donc cette méthode est principalement
     * utilisée pour les animations ou effets spéciaux.
     */
    update()
    {
        // La caméra est fixe dans la galerie
        // Cette méthode peut être étendue pour des animations
        // ou des effets spéciaux si nécessaire
    }

    /**
     * Resize - Redimensionnement de la caméra
     *
     * Met à jour la caméra lors du redimensionnement de la fenêtre.
     */
    resize()
    {
        // Mise à jour de l'aspect ratio
        this.camera.aspect = this.sizes.viewport.width / this.sizes.viewport.height
        this.camera.updateProjectionMatrix()
    }

    /**
     * GetCamera - Récupération de la caméra
     *
     * Retourne l'instance de la caméra pour utilisation externe.
     *
     * @returns {THREE.PerspectiveCamera} Instance de la caméra
     */
    getCamera()
    {
        return this.camera
    }

    /**
     * GetDirectionalLight - Récupération de la lumière directionnelle
     *
     * Retourne la lumière directionnelle pour utilisation externe.
     *
     * @returns {THREE.DirectionalLight} Lumière directionnelle
     */
    getDirectionalLight()
    {
        return this.directionalLight
    }

    /**
     * GetAmbientLight - Récupération de la lumière ambiante
     *
     * Retourne la lumière ambiante pour utilisation externe.
     *
     * @returns {THREE.AmbientLight} Lumière ambiante
     */
    getAmbientLight()
    {
        return this.ambientLight
    }

    /**
     * SetCameraPosition - Définition de la position de la caméra
     *
     * Définit une nouvelle position pour la caméra.
     *
     * @param {number} _x - Position X
     * @param {number} _y - Position Y
     * @param {number} _z - Position Z
     */
    setCameraPosition(_x, _y, _z)
    {
        this.camera.position.set(_x, _y, _z)
        this.camera.lookAt(0, 0, 0)
    }

    /**
     * SetCameraTarget - Définition de la cible de la caméra
     *
     * Définit une nouvelle cible pour la caméra.
     *
     * @param {number} _x - Position X de la cible
     * @param {number} _y - Position Y de la cible
     * @param {number} _z - Position Z de la cible
     */
    setCameraTarget(_x, _y, _z)
    {
        this.camera.lookAt(_x, _y, _z)
    }

    /**
     * Destroy - Destruction de la caméra
     *
     * Nettoie toutes les ressources utilisées par la caméra.
     */
    destroy()
    {
        // Nettoyage du conteneur
        this.container.clear()
    }
}
