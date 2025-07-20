import { LightningElement, track } from 'lwc';
import getCollections from '@salesforce/apex/PropertyAPI.getCollections';
import searchByAddress from '@salesforce/apex/PropertyAPI.searchByAddress';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class PropertySearch extends LightningElement {
    @track collections = [];
    @track selectedCollection = '';
    @track streetName = '';
    @track civicNumber = '';
    @track results = [];
    @track isLoading = false;
    @track showResults = false;

    connectedCallback() {
        this.loadCollections();
    }

    async loadCollections() {
        try {
            this.collections = await getCollections();
        } catch (error) {
            this.showError('Erreur de chargement', error.body?.message || error.message);
        }
    }

    get collectionOptions() {
        return this.collections.map(col => ({
            label: col,
            value: col
        }));
    }

    handleInputChange(event) {
        const field = event.target.dataset.field;
        this[field] = event.target.value;
    }

    async handleSearch() {
        if (!this.selectedCollection || !this.streetName || !this.civicNumber) {
            this.showError('Erreur', 'Veuillez remplir tous les champs');
            return;
        }

        this.isLoading = true;
        this.showResults = false;

        try {
            this.results = await searchByAddress({
                collection: this.selectedCollection,
                streetName: this.streetName,
                civicNumber: this.civicNumber
            });
            this.showResults = true;
            
            if (this.results.length === 0) {
                this.showInfo('Aucun résultat', 'Aucune propriété trouvée');
            }
        } catch (error) {
            this.showError('Erreur de recherche', error.body?.message || error.message);
        } finally {
            this.isLoading = false;
        }
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