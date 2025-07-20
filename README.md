# Quebec Property Search

Application Salesforce moderne pour la recherche de propriétés dans les rôles d'évaluation foncière du Québec.

## Fonctionnalités

- 🔍 Recherche par adresse
- 👤 Recherche par propriétaire  
- ⚙️ Interface d'administration
- 🔗 Intégration MongoDB Atlas
- 🏛️ Support multi-municipalités

## Architecture

- **Frontend**: Lightning Web Components (LWC)
- **Backend**: Apex classes avec intégration API
- **Base de données**: MongoDB Atlas via AWS API Gateway
- **API**: AWS Chalice avec authentification par clé

## Installation

1. Déployez le package dans votre org Salesforce
2. Configurez les Named Credentials
3. Assignez les permissions appropriées
4. Configurez l'accès aux municipalités via Quebec Property Admin

## Configuration

Utilisez le composant `Quebec Property Admin` pour :
- Configurer la clé API
- Tester la connexion
- Définir les municipalités autorisées

## Support

Développé par AppHero Tech
