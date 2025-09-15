/**
 * WORLD/SHADOWS.JS - Système d'Ombres Dynamiques
 *
 * Ce fichier gère le système d'ombres dynamiques du portfolio, créant des ombres
 * réalistes projetées par une source lumineuse (soleil) sur le sol. Les ombres
 * s'adaptent automatiquement à la position, rotation et distance des objets.
 *
 * RESPONSABILITÉS :
 * - Gestion du système de projection solaire
 * - Création et mise à jour des ombres dynamiques
 * - Calcul de la position et de l'orientation des ombres
 * - Gestion de la transparence selon la distance
 * - Système de debug avec contrôles interactifs
 * - Matériaux et géométries optimisés
 *
 * SYSTÈMES GÉRÉS :
 * - Soleil : Position et direction de la source lumineuse
 * - Projection : Calcul des ombres selon la géométrie solaire
 * - Matériaux : Matériau d'ombre personnalisé avec shaders
 * - Géométrie : Planes pour les ombres avec optimisations
 * - Debug : Interface de contrôle et visualisation
 * - Helper : Objet de test avec contrôles de transformation
 *
 * FONCTIONNALITÉS DES OMBRES :
 * - Projection réaliste selon la position du soleil
 * - Adaptation à la rotation des objets
 * - Transparence progressive selon la distance
 * - Évitement du z-fighting avec décalage
 * - Couleur et intensité configurables
 * - Mode wireframe pour debug
 *
 * CALCULS DE PROJECTION :
 * - Position : Projection selon le vecteur solaire
 * - Orientation : Rotation selon l'angle de l'objet
 * - Transparence : Fonction de distance avec puissance
 * - Alpha : Combinaison de distance et orientation
 *
 * ARCHITECTURE :
 * - Pattern de gestionnaire centralisé
 * - Système d'événements pour les mises à jour
 * - Interface de debug complète
 * - Contrôles de transformation interactifs
 * - Optimisations de performance
 *
 * OPTIMISATIONS :
 * - Matériau avec depthWrite désactivé
 * - Géométrie partagée pour toutes les ombres
 * - Calculs optimisés de projection
 * - Gestion intelligente de la transparence
 * - Debug conditionnel selon le mode
 */

import * as THREE from 'three'
import ShadowMaterial from '../Materials/Shadow.js'
import { TransformControls } from 'three/examples/jsm/controls/TransformControls.js'

export default class Shadows
{
    /**
     * Constructor - Initialisation du système d'ombres
     *
     * Initialise le système d'ombres dynamiques avec configuration des paramètres,
     * création des matériaux, géométries et mise en place de la boucle de mise à jour.
     *
     * @param {Object} _options - Options de configuration
     * @param {Object} _options.time - Gestionnaire du temps (Time.js)
     * @param {Object} _options.debug - Interface de debug (dat.GUI)
     * @param {Object} _options.renderer - Rendu Three.js
     * @param {Object} _options.camera - Caméra avec contrôles orbitaux
     */
    constructor(_options)
    {
        // Stockage des options de configuration
        this.time = _options.time                                                          // Gestionnaire du temps
        this.debug = _options.debug                                                        // Interface de debug
        this.renderer = _options.renderer                                                  // Rendu Three.js
        this.camera = _options.camera                                                      // Caméra avec contrôles

        // Configuration des paramètres d'ombres
        this.alpha = 0                                                                   // Intensité globale des ombres
        this.maxDistance = 3                                                             // Distance maximale de projection
        this.distancePower = 2                                                           // Puissance de la fonction de distance
        this.zFightingDistance = 0.001                                                   // Distance pour éviter le z-fighting
        this.color = '#d04500'                                                           // Couleur des ombres
        this.wireframeVisible = false                                                    // Mode wireframe pour debug
        this.items = []                                                                  // Liste des ombres créées

        // Conteneur principal des ombres
        this.container = new THREE.Object3D()
        this.container.matrixAutoUpdate = false                                          // Désactivation de la mise à jour automatique
        this.container.updateMatrix()                                                    // Mise à jour manuelle de la matrice

        // Interface de debug
        if(this.debug)
        {
            this.debugFolder = this.debug.addFolder('shadows')                           // Dossier de debug pour les ombres
            // this.debugFolder.open()                                                   // Ouverture automatique (commentée)

            // Contrôles de debug pour les paramètres d'ombres
            this.debugFolder.add(this, 'alpha').step(0.01).min(0).max(1)                // Intensité globale
            this.debugFolder.add(this, 'maxDistance').step(0.01).min(0).max(10)         // Distance maximale
            this.debugFolder.add(this, 'distancePower').step(0.01).min(1).max(5)        // Puissance de distance
            
            // Contrôle du mode wireframe
            this.debugFolder.add(this, 'wireframeVisible').name('wireframeVisible').onChange(() =>
            {
                for(const _shadow of this.items)
                {
                    _shadow.mesh.material = this.wireframeVisible ? this.materials.wireframe : _shadow.material  // Changement de matériau
                }
            })

            // Contrôle de la couleur
            this.debugFolder.addColor(this, 'color').onChange(() =>
            {
                this.materials.base.uniforms.uColor.value = new THREE.Color(this.color)  // Mise à jour du matériau de base

                for(const _shadow of this.items)
                {
                    _shadow.material.uniforms.uColor.value = new THREE.Color(this.color)  // Mise à jour de chaque ombre
                }
            })
        }

        // Initialisation des systèmes
        this.setSun()                                                                    // Configuration du soleil
        this.setMaterials()                                                              // Configuration des matériaux
        this.setGeometry()                                                               // Configuration de la géométrie
        this.setHelper()                                                                 // Configuration du helper de debug

        // Boucle de mise à jour des ombres
        this.time.on('tick', () =>
        {
            for(const _shadow of this.items)
            {
                // Calcul de la position de l'ombre
                const z = Math.max(_shadow.reference.position.z + _shadow.offsetZ, 0)    // Hauteur effective (minimum 0)
                const sunOffset = this.sun.vector.clone().multiplyScalar(z)              // Décalage selon le vecteur solaire

                _shadow.mesh.position.x = _shadow.reference.position.x + sunOffset.x     // Position X projetée
                _shadow.mesh.position.y = _shadow.reference.position.y + sunOffset.y     // Position Y projetée

                // Calcul de l'angle de l'ombre
                // Projection de la rotation comme vecteur sur un plan et extraction de l'angle
                const rotationVector = new THREE.Vector3(1, 0, 0)                       // Vecteur de référence
                rotationVector.applyQuaternion(_shadow.reference.quaternion)            // Application de la rotation de l'objet
                const projectedRotationVector = rotationVector.clone().projectOnPlane(new THREE.Vector3(0, 0, 1))  // Projection sur le plan horizontal

                // Calcul de l'alpha d'orientation (influence de l'angle sur la visibilité)
                let orientationAlpha = Math.abs(rotationVector.angleTo(new THREE.Vector3(0, 0, 1)) - Math.PI * 0.5) / (Math.PI * 0.5)
                orientationAlpha /= 0.5
                orientationAlpha -= 1 / 0.5
                orientationAlpha = Math.abs(orientationAlpha)
                orientationAlpha = Math.min(Math.max(orientationAlpha, 0), 1)           // Clamp entre 0 et 1

                const angle = Math.atan2(projectedRotationVector.y, projectedRotationVector.x)  // Angle de rotation
                _shadow.mesh.rotation.z = angle                                         // Application de la rotation

                // Calcul de la transparence (alpha)
                let alpha = (this.maxDistance - z) / this.maxDistance                   // Alpha basé sur la distance
                alpha = Math.min(Math.max(alpha, 0), 1)                                // Clamp entre 0 et 1
                alpha = Math.pow(alpha, this.distancePower)                             // Application de la puissance

                // Alpha final combinant tous les facteurs
                _shadow.material.uniforms.uAlpha.value = this.alpha * _shadow.alpha * orientationAlpha * alpha
            }
        })
    }

    /**
     * SetSun - Configuration du système solaire
     *
     * Configure la position du soleil et calcule le vecteur de projection
     * pour les ombres. Crée également un helper visuel pour le debug.
     *
     * FONCTIONNALITÉS :
     * - Position du soleil dans l'espace 3D
     * - Calcul du vecteur de projection pour les ombres
     * - Helper visuel avec flèche directionnelle
     * - Interface de debug pour ajuster la position
     * - Mise à jour automatique du vecteur de projection
     *
     * CALCULS :
     * - Vecteur de projection : normalisé et inversé selon la hauteur
     * - Direction : négative de la position pour pointer vers l'origine
     * - Longueur : distance du soleil à l'origine
     */
    setSun()
    {
        // Configuration du soleil
        this.sun = {}
        this.sun.position = new THREE.Vector3(- 2.5, - 2.65, 3.75)                     // Position du soleil dans l'espace
        this.sun.vector = new THREE.Vec3()                                             // Vecteur de projection calculé
        
        // Helper visuel pour le debug
        this.sun.helper = new THREE.ArrowHelper(
            new THREE.Vector3(0, 0, 1),                                                // Direction initiale
            new THREE.Vector3(0, 0, 0),                                                // Position de départ
            1,                                                                         // Longueur
            0xffffff,                                                                  // Couleur blanche
            0.1,                                                                       // Taille de la tête
            0.4                                                                        // Taille de la tige
        )
        this.sun.helper.visible = false                                                // Masqué par défaut
        this.container.add(this.sun.helper)                                            // Ajout au conteneur

        // Fonction de mise à jour du soleil
        this.sun.update = () =>
        {
            // Calcul du vecteur de projection (normalisé et inversé selon la hauteur)
            this.sun.vector.copy(this.sun.position).multiplyScalar(1 / this.sun.position.z).negate()
            
            // Mise à jour de la position du helper
            this.sun.helper.position.copy(this.sun.position)

            // Calcul de la direction (vers l'origine)
            const direction = this.sun.position.clone().negate().normalize()

            // Mise à jour du helper
            this.sun.helper.setDirection(direction)                                     // Direction de la flèche
            this.sun.helper.setLength(this.sun.helper.position.length())               // Longueur de la flèche
        }

        // Mise à jour initiale
        this.sun.update()

        // Interface de debug pour le soleil
        if(this.debug)
        {
            const folder = this.debugFolder.addFolder('sun')                           // Dossier de debug pour le soleil
            folder.open()                                                              // Ouverture automatique

            // Contrôles de position du soleil
            folder.add(this.sun.position, 'x').step(0.01).min(- 10).max(10).name('sunX').onChange(this.sun.update)  // Position X
            folder.add(this.sun.position, 'y').step(0.01).min(- 10).max(10).name('sunY').onChange(this.sun.update)  // Position Y
            folder.add(this.sun.position, 'z').step(0.01).min(0).max(10).name('sunZ').onChange(this.sun.update)     // Position Z
            folder.add(this.sun.helper, 'visible').name('sunHelperVisible')            // Visibilité du helper
        }
    }

    /**
     * SetMaterials - Configuration des matériaux d'ombres
     *
     * Crée et configure les matériaux utilisés pour les ombres, incluant
     * le matériau principal avec shaders personnalisés et le matériau
     * wireframe pour le debug.
     *
     * MATÉRIAUX CRÉÉS :
     * - Wireframe : Matériau de debug avec mode filaire
     * - Base : Matériau d'ombre personnalisé avec shaders
     *
     * PROPRIÉTÉS DU MATÉRIAU DE BASE :
     * - depthWrite : Désactivé pour éviter les conflits de profondeur
     * - uColor : Couleur de l'ombre (configurable)
     * - uAlpha : Transparence de l'ombre (dynamique)
     * - uFadeRadius : Rayon de dégradé pour les bords
     */
    setMaterials()
    {
        // Configuration des matériaux
        this.materials = {}
        
        // Matériau wireframe pour le debug
        this.materials.wireframe = new THREE.MeshBasicMaterial({ 
            color: 0xffffff, 
            wireframe: true 
        })

        // Matériau de base pour les ombres
        this.materials.base = new ShadowMaterial()                                     // Matériau personnalisé avec shaders
        this.materials.base.depthWrite = false                                         // Désactivation de l'écriture de profondeur
        this.materials.base.uniforms.uColor.value = new THREE.Color(this.color)        // Couleur de l'ombre
        this.materials.base.uniforms.uAlpha.value = 0                                  // Transparence initiale
        this.materials.base.uniforms.uFadeRadius.value = 0.35                          // Rayon de dégradé
    }

    /**
     * SetGeometry - Configuration de la géométrie des ombres
     *
     * Crée la géométrie de base utilisée pour toutes les ombres.
     * Utilise un plan unitaire qui sera mis à l'échelle selon les besoins
     * de chaque ombre individuelle.
     *
     * OPTIMISATIONS :
     * - Géométrie partagée pour toutes les ombres
     * - Plan unitaire simple et efficace
     * - Mise à l'échelle dynamique par mesh
     */
    setGeometry()
    {
        // Géométrie de base pour toutes les ombres
        this.geometry = new THREE.PlaneGeometry(1, 1, 1, 1)                            // Plan unitaire avec subdivisions
    }

    /**
     * SetHelper - Configuration du système de debug et de test
     *
     * Crée un objet de test avec contrôles de transformation pour tester
     * et visualiser le système d'ombres en temps réel. Inclut des raccourcis
     * clavier et une interface de debug.
     *
     * FONCTIONNALITÉS :
     * - Objet de test avec géométrie de boîte
     * - Contrôles de transformation (rotation, translation)
     * - Ombre associée pour test visuel
     * - Raccourcis clavier (R = rotation, G = translation)
     * - Désactivation des contrôles de caméra pendant la manipulation
     * - Interface de debug pour activer/désactiver
     *
     * CONTRÔLES CLAVIER :
     * - R : Mode rotation
     * - G : Mode translation
     */
    setHelper()
    {
        // Vérification du mode debug
        if(!this.debug)
        {
            return
        }

        // Configuration du helper
        this.helper = {}
        this.helper.active = false                                                      // État d'activation

        // Création de l'objet de test
        this.helper.mesh = new THREE.Mesh(
            new THREE.BoxGeometry(3, 1, 1, 1),                                         // Géométrie de boîte
            new THREE.MeshNormalMaterial()                                             // Matériau normal pour visibilité
        )
        this.helper.mesh.position.z = 1.5                                              // Position en hauteur
        this.helper.mesh.position.y = - 3                                              // Position latérale
        this.helper.mesh.visible = this.helper.active                                  // Visibilité selon l'état
        this.container.add(this.helper.mesh)                                           // Ajout au conteneur

        // Contrôles de transformation
        this.helper.transformControls = new TransformControls(this.camera.instance, this.renderer.domElement)
        this.helper.transformControls.size = 0.5                                       // Taille des contrôles
        this.helper.transformControls.attach(this.helper.mesh)                         // Attachement à l'objet
        this.helper.transformControls.visible = this.helper.active                     // Visibilité selon l'état
        this.helper.transformControls.enabled = this.helper.active                     // Activation selon l'état

        // Création de l'ombre associée
        this.helper.shadow = this.add(this.helper.mesh, { 
            sizeX: 6, 
            sizeY: 2, 
            offsetZ: - 0.35, 
            alpha: 0.99 
        })
        this.helper.shadow.mesh.visible = this.helper.active                           // Visibilité de l'ombre

        // Raccourcis clavier pour les modes de contrôle
        document.addEventListener('keydown', (_event) =>
        {
            if(_event.key === 'r')                                                     // Mode rotation
            {
                this.helper.transformControls.setMode('rotate')
            }
            else if(_event.key === 'g')                                                // Mode translation
            {
                this.helper.transformControls.setMode('translate')
            }
        })

        // Gestion de l'interaction avec les contrôles de caméra
        this.helper.transformControls.addEventListener('dragging-changed', (_event) =>
        {
            this.camera.orbitControls.enabled = !_event.value                          // Désactivation des contrôles de caméra pendant la manipulation
        })

        this.container.add(this.helper.transformControls)                              // Ajout des contrôles au conteneur

        // Interface de debug pour le helper
        if(this.debug)
        {
            const folder = this.debugFolder.addFolder('helper')                        // Dossier de debug pour le helper
            folder.open()                                                              // Ouverture automatique

            // Contrôle d'activation du helper
            folder.add(this.helper, 'active').name('visible').onChange(() =>
            {
                this.helper.mesh.visible = this.helper.active                          // Visibilité de l'objet
                this.helper.transformControls.visible = this.helper.active             // Visibilité des contrôles
                this.helper.transformControls.enabled = this.helper.active             // Activation des contrôles
                this.helper.shadow.mesh.visible = this.helper.active                   // Visibilité de l'ombre
            })
        }
    }

    /**
     * Add - Création d'une nouvelle ombre
     *
     * Crée une nouvelle ombre associée à un objet de référence. L'ombre
     * sera automatiquement mise à jour selon la position et rotation de
     * l'objet de référence.
     *
     * @param {THREE.Object3D} _reference - Objet de référence pour l'ombre
     * @param {Object} _options - Options de configuration de l'ombre
     * @param {number} _options.offsetZ - Décalage vertical de l'ombre
     * @param {number} _options.alpha - Intensité de l'ombre (0-1)
     * @param {number} _options.sizeX - Largeur de l'ombre
     * @param {number} _options.sizeY - Hauteur de l'ombre
     * @returns {Object} Objet d'ombre créé
     */
    add(_reference, _options = {})
    {
        // Configuration de l'ombre
        const shadow = {}

        // Options avec valeurs par défaut
        shadow.offsetZ = typeof _options.offsetZ === 'undefined' ? 0 : _options.offsetZ  // Décalage vertical
        shadow.alpha = typeof _options.alpha === 'undefined' ? 1 : _options.alpha        // Intensité de l'ombre

        // Référence à l'objet
        shadow.reference = _reference                                                     // Objet de référence

        // Matériau de l'ombre
        shadow.material = this.materials.base.clone()                                    // Clone du matériau de base

        // Mesh de l'ombre
        shadow.mesh = new THREE.Mesh(
            this.geometry,                                                               // Géométrie partagée
            this.wireframeVisible ? this.materials.wireframe : shadow.material          // Matériau selon le mode
        )
        shadow.mesh.position.z = this.zFightingDistance                                 // Position pour éviter le z-fighting
        shadow.mesh.scale.set(_options.sizeX, _options.sizeY, 2.4)                     // Mise à l'échelle de l'ombre

        // Ajout à la scène
        this.container.add(shadow.mesh)                                                  // Ajout au conteneur
        this.items.push(shadow)                                                          // Ajout à la liste

        return shadow
    }
}
