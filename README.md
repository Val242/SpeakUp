# Developer Dashboard - Admin Feedback

Une interface de tableau de bord moderne pour la gestion des feedbacks développeurs, construite avec React et CSS. Ce dashboard est conçu pour les collaborateurs (développeurs) qui reçoivent des feedbacks assignés par l'administrateur principal.

## 🚀 Fonctionnalités

### Pour le Collaborateur/Développeur
- **Tableau de bord interactif** avec statistiques en temps réel
- **Gestion des feedbacks assignés** avec mise à jour des statuts
- **Gestion des dates d'exécution** pour le tracking des tâches
- **Statistiques détaillées** (tâches assignées, en cours, terminées, en retard, à faire cette semaine)
- **Interface responsive** adaptée mobile et desktop
- **Système de déconnexion** sécurisé
- **États de chargement et d'erreur** gérés proprement
- **Architecture modulaire** prête pour l'intégration backend

### Fonctionnalités de Tracking
- ✅ **Assignation de dates d'exécution** pour chaque feedback
- ✅ **Mise à jour des statuts** (Assigné, En cours, Terminé, En attente)
- ✅ **Suivi des tâches en retard** avec indicateurs visuels
- ✅ **Statistiques de performance** personnelles
- ✅ **Historique des modifications** de statut

## 📁 Structure du projet

```
src/
├── components/          # Composants React (à créer)
├── services/           # Services API
│   ├── apiService.js   # Centralisation des appels API
│   └── mockService.js  # Services de démonstration
├── config/             # Configuration
│   ├── api.js         # URLs et configuration API
│   └── environment.js # Configuration environnement
├── data/              # Données de démonstration
│   └── mockData.js    # Données mock pour tests
├── styles/             # Styles CSS (à créer)
├── utils/              # Utilitaires (à créer)
├── App.js              # Composant principal
├── App.css             # Styles du composant principal
└── index.css           # Styles globaux
```

## 🔧 Configuration

### Variables d'environnement

Créez un fichier `.env` à la racine du projet :

```env
# URL de l'API backend
REACT_APP_API_BASE_URL=http://localhost:3001

# Utiliser les données mock (true/false)
REACT_APP_USE_MOCK_DATA=true
```

### Installation des dépendances

```bash
npm install
```

### Démarrage en mode développement

```bash
npm start
```

L'application sera accessible à l'adresse `http://localhost:3000`

## 🔌 Intégration Backend

### Endpoints API requis

Le frontend s'attend à ce que votre backend expose les endpoints suivants :

#### 1. Authentification
```
POST /api/auth/login
POST /api/auth/logout
POST /api/auth/refresh
```

#### 2. Profil utilisateur
```
GET /api/user/profile
PUT /api/user/profile
```

#### 3. Statistiques du tableau de bord
```
GET /api/dashboard/stats
```

**Réponse attendue :**
```json
{
  "assignedTasks": 8,
  "inProgress": 3,
  "completed": 12,
  "overdue": 2,
  "dueThisWeek": 4
}
```

#### 4. Gestion des feedbacks
```
GET /api/feedback?page=1&limit=10
GET /api/feedback/:id
PUT /api/feedback/:id/status
PUT /api/feedback/:id/due-date
POST /api/feedback
DELETE /api/feedback/:id
POST /api/feedback/:id/comments
GET /api/feedback/stats
```

**Réponse attendue pour GET /api/feedback :**
```json
{
  "feedbacks": [
    {
      "id": "002",
      "title": "Feature Request",
      "submittedBy": "Sarah Wilson",
      "date": "Jan 14, 2025",
      "description": "Would be great to have dark mode option...",
      "status": "Assigned",
      "dueDate": "2025-01-25",
      "priority": "Medium",
      "category": "UI/UX"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 2,
    "totalItems": 15
  }
}
```

### Authentification

Le système utilise des tokens JWT stockés dans le localStorage :

```javascript
// Stockage du token
localStorage.setItem('authToken', token);

// Récupération du token
const token = localStorage.getItem('authToken');

// Headers d'authentification
{
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json'
}
```

## 🎨 Architecture Frontend

### Services API

Les appels API sont centralisés dans `src/services/apiService.js` :

- `userService` : Gestion du profil utilisateur
- `dashboardService` : Statistiques du tableau de bord
- `feedbackService` : CRUD des feedbacks + gestion des dates d'exécution
- `authService` : Authentification et déconnexion
- `notificationService` : Notifications (futur)

### Services de Démonstration

Pour le développement sans backend, utilisez `src/services/mockService.js` :

- Données réalistes pour tester l'interface
- Simulation des délais réseau
- Gestion des erreurs aléatoires
- Persistance locale des modifications

### Gestion d'état

L'application utilise React Hooks pour la gestion d'état :

- `useState` pour les données locales
- `useEffect` pour les appels API au montage
- Gestion des états de chargement et d'erreur
- Gestion des dates d'exécution et statuts

### Styles

- CSS modulaire avec classes BEM
- Design responsive avec media queries
- Animations et transitions fluides
- Thème cohérent avec l'image de référence
- Indicateurs visuels pour les tâches en retard

## 🚀 Déploiement

### Build de production

```bash
npm run build
```

### Variables d'environnement de production

```env
REACT_APP_API_BASE_URL=https://votre-api-backend.com
REACT_APP_USE_MOCK_DATA=false
```

## 🔧 Développement

### Mode Démonstration

Pour tester l'interface sans backend :

1. Activez les données mock dans `.env` :
```env
REACT_APP_USE_MOCK_DATA=true
```

2. Lancez l'application :
```bash
npm start
```

3. L'interface utilisera les données de démonstration

### Ajout de nouvelles fonctionnalités

1. **Nouveau service API** : Ajoutez dans `src/services/apiService.js`
2. **Nouveau service mock** : Ajoutez dans `src/services/mockService.js`
3. **Nouveau composant** : Créez dans `src/components/`
4. **Nouveaux styles** : Ajoutez dans `src/styles/`

### Structure recommandée pour les composants

```javascript
import React, { useState, useEffect } from 'react';
import { getServices } from '../config/environment';
import './ComponentName.css';

function ComponentName() {
  const [services, setServices] = useState(null);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadServices = async () => {
      const serviceModule = await getServices();
      setServices(serviceModule);
    };
    loadServices();
  }, []);

  if (loading) return <div>Chargement...</div>;
  if (error) return <div>Erreur: {error}</div>;

  return (
    <div className="component-name">
      {/* Contenu du composant */}
    </div>
  );
}

export default ComponentName;
```

## 🐛 Dépannage

### Erreurs courantes

1. **CORS errors** : Vérifiez la configuration CORS de votre backend
2. **401 Unauthorized** : Vérifiez la validité du token JWT
3. **404 Not Found** : Vérifiez les URLs des endpoints API
4. **Données mock non chargées** : Vérifiez `REACT_APP_USE_MOCK_DATA=true`

### Debug

Activez les logs de développement :

```javascript
// Dans config/environment.js
import { debug } from './environment';
debug.log('Message de debug', data);
```

## 📝 TODO

- [ ] Ajouter des tests unitaires
- [ ] Implémenter la pagination dynamique
- [ ] Ajouter des filtres de feedback (par statut, priorité, date)
- [ ] Créer des composants réutilisables
- [ ] Ajouter des animations de transition
- [ ] Implémenter les notifications en temps réel
- [ ] Ajouter la gestion des thèmes (dark/light mode)
- [ ] Ajouter des graphiques de performance
- [ ] Implémenter l'export des données
- [ ] Ajouter la gestion des commentaires sur les feedbacks

## 🤝 Contribution

1. Fork le projet
2. Créez une branche feature (`git checkout -b feature/AmazingFeature`)
3. Commit vos changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrez une Pull Request

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.
