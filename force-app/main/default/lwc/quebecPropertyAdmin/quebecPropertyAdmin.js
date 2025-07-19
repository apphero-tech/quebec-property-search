import { LightningElement, track } from 'lwc';
import isSystemConfigured from '@salesforce/apex/QuebecPropertyController.isSystemConfigured';
import getAuthorizedMunicipalities from '@salesforce/apex/QuebecPropertyController.getAuthorizedMunicipalities';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class QuebecPropertyAdmin extends LightningElement {
    
    // Configuration
    @track apiKey = '';
    @track municipalityCodes = '';
    @track isActive = false;
    @track isLoading = true;
    @track isSaving = false;
    @track isTesting = false;
    
    // Status
    @track connectionStatus = 'unknown'; // 'success', 'error', 'unknown'
    @track lastTestResult = '';
    
    // UI State
    @track activeTab = 'configuration';

    connectedCallback() {
        this.loadCurrentConfiguration();
    }

    async loadCurrentConfiguration() {
        try {
            this.isLoading = true;
            
            // Vérifier la configuration actuelle
            const isConfigured = await isSystemConfigured();
            
            if (isConfigured) {
                // Si configuré, charger les municipalités pour voir les codes actuels
                const municipalities = await getAuthorizedMunicipalities();
                if (municipalities && municipalities.length > 0) {
                    const codes = municipalities.map(m => m.code);
                    this.municipalityCodes = codes.join(',');
                    this.isActive = true;
                }
            }
            
        } catch (error) {
            this.showError('Erreur de chargement', error.body?.message || error.message);
        } finally {
            this.isLoading = false;
        }
    }

    handleInputChange(event) {
        const field = event.target.dataset.field;
        if (field === 'apiKey') {
            this.apiKey = event.target.value;
        } else if (field === 'municipalityCodes') {
            this.municipalityCodes = event.target.value;
        } else if (field === 'isActive') {
            this.isActive = event.target.checked;
        }
    }

    handleTabChange(event) {
        this.activeTab = event.target.dataset.tab;
    }

    async handleSaveConfiguration() {
        if (!this.validateConfiguration()) {
            return;
        }

        try {
            this.isSaving = true;
            
            // Pour le moment, on simule la sauvegarde
            // TODO: Créer une méthode Apex pour sauvegarder la configuration
            await this.saveConfigurationToSalesforce();
            
            this.showSuccess('Configuration sauvegardée', 'La configuration a été sauvegardée avec succès.');
            
        } catch (error) {
            this.showError('Erreur de sauvegarde', error.body?.message || error.message);
        } finally {
            this.isSaving = false;
        }
    }

    async saveConfigurationToSalesforce() {
        // Simulation pour le moment
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve();
            }, 1000);
        });
    }

    async handleTestConnection() {
        if (!this.apiKey) {
            this.showError('Erreur', 'Veuillez saisir une clé API avant de tester la connexion.');
            return;
        }

        try {
            this.isTesting = true;
            this.connectionStatus = 'unknown';
            
            // Pour le moment, on simule le test
            // TODO: Créer une méthode Apex pour tester la connexion
            const isConnected = await this.testAPIConnection();
            
            if (isConnected) {
                this.connectionStatus = 'success';
                this.lastTestResult = 'Connexion réussie le ' + new Date().toLocaleString('fr-CA');
                this.showSuccess('Test réussi', 'La connexion à l\'API fonctionne correctement.');
            } else {
                this.connectionStatus = 'error';
                this.lastTestResult = 'Échec de connexion le ' + new Date().toLocaleString('fr-CA');
                this.showError('Test échoué', 'Impossible de se connecter à l\'API. Vérifiez la clé API.');
            }
            
        } catch (error) {
            this.connectionStatus = 'error';
            this.lastTestResult = 'Erreur le ' + new Date().toLocaleString('fr-CA') + ': ' + error.message;
            this.showError('Erreur de test', error.body?.message || error.message);
        } finally {
            this.isTesting = false;
        }
    }

    async testAPIConnection() {
        // Simulation pour le moment
        return new Promise((resolve) => {
            setTimeout(() => {
                // Simuler succès si la clé contient "test"
                resolve(this.apiKey.includes('test'));
            }, 2000);
        });
    }

    validateConfiguration() {
        if (!this.apiKey || this.apiKey.trim().length === 0) {
            this.showError('Erreur de validation', 'La clé API est obligatoire.');
            return false;
        }

        if (this.isActive && (!this.municipalityCodes || this.municipalityCodes.trim().length === 0)) {
            this.showError('Erreur de validation', 'Veuillez saisir au moins un code de municipalité si le service est actif.');
            return false;
        }

        // Valider le format des codes de municipalités
        if (this.municipalityCodes) {
            const codes = this.municipalityCodes.split(',');
            for (let code of codes) {
                const trimmedCode = code.trim();
                if (trimmedCode && !/^\d+$/.test(trimmedCode)) {
                    this.showError('Erreur de validation', `Le code "${trimmedCode}" n'est pas valide. Utilisez seulement des chiffres.`);
                    return false;
                }
            }
        }

        return true;
    }

    // Getter pour vérifier si la configuration est complète
    get isFullyConfigured() {
        return this.hasValidApiKey && 
               this.hasValidConnection && 
               this.hasValidMunicipalities && 
               this.isActive;
    }

    get hasValidApiKey() {
        return this.apiKey && this.apiKey.trim().length > 0;
    }

    get hasValidConnection() {
        return this.connectionStatus === 'success';
    }

    get hasValidMunicipalities() {
        return this.municipalityCodes && this.municipalityCodes.trim().length > 0;
    }

    // Getters pour les classes CSS des onglets
    get configurationTabClass() {
        return `slds-tabs_default__item ${this.activeTab === 'configuration' ? 'slds-is-active' : ''}`;
    }

    get helpTabClass() {
        return `slds-tabs_default__item ${this.activeTab === 'help' ? 'slds-is-active' : ''}`;
    }

    // Getters pour l'affichage conditionnel des onglets
    get showConfigurationTab() {
        return this.activeTab === 'configuration';
    }

    get showHelpTab() {
        return this.activeTab === 'help';
    }

    // Getters pour l'état de la connexion
    get connectionStatusIcon() {
        switch (this.connectionStatus) {
            case 'success':
                return 'utility:success';
            case 'error':
                return 'utility:error';
            default:
                return 'utility:warning';
        }
    }

    get connectionStatusVariant() {
        switch (this.connectionStatus) {
            case 'success':
                return 'success';
            case 'error':
                return 'error';
            default:
                return 'warning';
        }
    }

    get connectionStatusText() {
        switch (this.connectionStatus) {
            case 'success':
                return 'Connexion active';
            case 'error':
                return 'Connexion échouée';
            default:
                return 'Non testé';
        }
    }

    // Getters pour l'état des boutons
    get saveButtonDisabled() {
        return this.isSaving || this.isLoading;
    }

    get testButtonDisabled() {
        return this.isTesting || this.isLoading || !this.apiKey;
    }

    get saveButtonLabel() {
        return this.isSaving ? 'Sauvegarde...' : 'Sauvegarder la configuration';
    }

    get testButtonLabel() {
        return this.isTesting ? 'Test en cours...' : 'Tester la connexion';
    }

    // Méthodes utilitaires pour les notifications
    showSuccess(title, message) {
        this.dispatchEvent(new ShowToastEvent({
            title,
            message,
            variant: 'success'
        }));
    }

    showError(title, message) {
        this.dispatchEvent(new ShowToastEvent({
            title,
            message,
            variant: 'error'
        }));
    }

    showInfo(title, message) {
        this.dispatchEvent(new ShowToastEvent({
            title,
            message,
            variant: 'info'
        }));
    }
}