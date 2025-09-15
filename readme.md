# Portfolio 3D Interactif

Un portfolio web interactif en 3D basé sur Three.js, permettant de naviguer dans un environnement virtuel pour découvrir des projets et informations personnelles.

## 🚀 Démarrage Rapide

### Prérequis
- [Node.js](https://nodejs.org/en/download/) (version 16+ recommandée)

### Installation

```bash
# Cloner le dépôt
git clone https://github.com/kedfre/portfolio.git
cd portfolio

# Installer les dépendances
npm install

# Lancer le serveur de développement
npm run dev
```

Le serveur sera accessible sur [http://localhost:5173](http://localhost:5173)

### Build de Production

```bash
# Construire pour la production
npm run build

# Prévisualiser le build
npm run preview
```

## 🛠️ Technologies Utilisées

- **Three.js** - Moteur 3D pour le web
- **Vite** - Outil de build moderne
- **JavaScript ES6+** - Langage de programmation
- **GLSL** - Shaders personnalisés
- **Blender** - Modélisation 3D

## 📁 Structure du Projet

```
Portfolio/
├── src/                    # Code source principal
│   ├── javascript/         # Logique JavaScript
│   ├── shaders/           # Shaders GLSL
│   ├── style/             # Styles CSS
│   └── images/            # Images et assets
├── static/                # Assets statiques
│   ├── models/            # Modèles 3D (.glb)
│   └── sounds/            # Fichiers audio
├── resources/             # Fichiers Blender
├── doc/                   # Documentation
│   ├── devbook.md         # Plan de développement
│   └── documentation-technique.md
└── CHANGELOG.md           # Historique des modifications
```

## 📚 Documentation

- **[DevBook](doc/devbook.md)** - Plan de développement et phases du projet
- **[Documentation Technique](doc/documentation-technique.md)** - Architecture et implémentation détaillée
- **[Changelog](CHANGELOG.md)** - Historique des modifications

## 🎮 Contrôles

- **Clavier** : Navigation directionnelle (WASD/Flèches)
- **Souris** : Rotation de la caméra
- **Mobile** : Contrôles tactiles adaptés

## 🔧 Scripts Disponibles

- `npm run dev` - Serveur de développement
- `npm run build` - Build de production
- `npm run preview` - Prévisualisation du build
- `npm audit` - Vérification des vulnérabilités

## ⚠️ Notes de Sécurité

Ce projet contient des vulnérabilités connues dans les dépendances (voir `npm audit`). Ces vulnérabilités sont acceptables pour un environnement de développement local mais devraient être corrigées avant un déploiement en production.

## 📄 Licence

Basé sur le projet [folio-2019](https://github.com/brunosimon/folio-2019) de Bruno Simon sous licence MIT.

## 🤝 Contribution

Ce projet est personnel mais les suggestions et améliorations sont les bienvenues via les issues GitHub.

---

*Développé avec ❤️ en utilisant Three.js et Vite*

