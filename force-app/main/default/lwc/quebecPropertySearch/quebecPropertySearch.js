import { LightningElement, track } from 'lwc';
import isSystemConfigured from '@salesforce/apex/QuebecPropertyController.isSystemConfigured';
import getAuthorizedMunicipalities from '@salesforce/apex/QuebecPropertyController.getAuthorizedMunicipalities';
import searchProperties from '@salesforce/apex/QuebecPropertyController.searchProperties';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class QuebecPropertySearch extends LightningElement {
    
    // Configuration - COMMENCER AVEC UN ÉTAT INDÉTERMINÉ
    @track isConfigured = null; // null = en cours de vérification, true = configuré, false = non configuré
    @track isLoading = true;
    
    // Search parameters
    @track searchType = 'address';
    @track municipalities = [];
    @track selectedMunicipality = '';
    @track streetName = '';
    @track civicNumber = '';
    @track ownerFirstName = '';
    @track ownerLastName = '';
    @track lotNumber = '';
    @track matricule = '';
    
    // Results
    @track searchResults = [];
    @track showResults = false;

    connectedCallback() {
        this.checkConfiguration();
    }

    async checkConfiguration() {
        try {
            // VÉRIFICATION RAPIDE DE LA CONFIGURATION
            const configResult = await isSystemConfigured();
            this.isConfigured = configResult;
            
            if (this.isConfigured) {
                await this.loadMunicipalities();
            }
        } catch (error) {
            this.isConfigured = false;
            this.showError('Erreur de configuration', error.body?.message || error.message);
        } finally {
            this.isLoading = false;
        }
    }

    async loadMunicipalities() {
        try {
            this.municipalities = await getAuthorizedMunicipalities();
        } catch (error) {
            this.showError('Erreur', 'Impossible de charger les municipalités autorisées');
        }
    }

    handleSearchTypeChange(event) {
        this.searchType = event.detail.value;
        this.clearResults();
    }

    handleInputChange(event) {
        const field = event.target.dataset.field;
        this[field] = event.target.value;
    }

    async handleSearch() {
        if (!this.validateSearchInputs()) {
            return;
        }

        this.isLoading = true;
        try {
            const searchParams = {
                municipality: this.selectedMunicipality,
                searchType: this.searchType
            };

            if (this.searchType === 'address') {
                searchParams.streetName = this.streetName;
                searchParams.civicNumber = this.civicNumber;
            } else if (this.searchType === 'owner') {
                searchParams.ownerFirstName = this.ownerFirstName;
                searchParams.ownerLastName = this.ownerLastName;
            } else if (this.searchType === 'lot') {
                searchParams.lotNumber = this.lotNumber;
            } else if (this.searchType === 'matricule') {
                searchParams.matricule = this.matricule;
            }

            this.searchResults = await searchProperties({ searchParams });
            this.showResults = true;

            if (this.searchResults.length === 0) {
                this.showInfo('Aucun résultat', 'Aucune propriété trouvée pour ces critères');
            }
        } catch (error) {
            this.showError('Erreur de recherche', error.body?.message || error.message);
        } finally {
            this.isLoading = false;
        }
    }

    validateSearchInputs() {
        if (!this.selectedMunicipality) {
            this.showError('Erreur', 'Veuillez sélectionner une municipalité');
            return false;
        }

        if (this.searchType === 'address') {
            if (!this.streetName || !this.civicNumber) {
                this.showError('Erreur', 'Veuillez saisir le nom de rue et le numéro civique');
                return false;
            }
        } else if (this.searchType === 'owner') {
            if (!this.ownerFirstName || !this.ownerLastName) {
                this.showError('Erreur', 'Veuillez saisir le prénom et nom du propriétaire');
                return false;
            }
        } else if (this.searchType === 'lot') {
            if (!this.lotNumber) {
                this.showError('Erreur', 'Veuillez saisir le numéro de lot');
                return false;
            }
        } else if (this.searchType === 'matricule') {
            if (!this.matricule) {
                this.showError('Erreur', 'Veuillez saisir le matricule');
                return false;
            }
        }

        return true;
    }

    clearResults() {
        this.searchResults = [];
        this.showResults = false;
    }

    // Search type options
    get searchTypeOptions() {
        return [
            { label: 'Recherche par adresse', value: 'address' },
            { label: 'Recherche par propriétaire', value: 'owner' },
            { label: 'Recherche par lot', value: 'lot' },
            { label: 'Recherche par matricule', value: 'matricule' }
        ];
    }

    get municipalityOptions() {
        return this.municipalities.map(municipality => ({
            label: municipality.label,
            value: municipality.value
        }));
    }

    // GETTERS AMÉLIORÉS POUR ÉVITER LE FLASH
    get isConfigurationChecking() {
        return this.isConfigured === null; // En cours de vérification
    }

    get isConfigurationComplete() {
        return this.isConfigured === true; // Configuré
    }

    get isConfigurationError() {
        return this.isConfigured === false; // Non configuré
    }

    // Conditional rendering
    get isAddressSearch() {
        return this.searchType === 'address';
    }

    get isOwnerSearch() {
        return this.searchType === 'owner';
    }

    get isLotSearch() {
        return this.searchType === 'lot';
    }

    get isMatriculeSearch() {
        return this.searchType === 'matricule';
    }

    // Utility methods
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

    showSuccess(title, message) {
        this.dispatchEvent(new ShowToastEvent({
            title,
            message,
            variant: 'success'
        }));
    }
}
