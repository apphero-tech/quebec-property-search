/**
 * @description Contrôleur principal pour le composant Quebec Property Search
 * @author Quebec Property Search Package
 * @version 1.0
 */
public with sharing class QuebecPropertyController {
    
    /**
     * @description Vérifie si le système est configuré correctement
     * @return Boolean indiquant si la configuration est valide
     */
    @AuraEnabled
    public static Boolean isSystemConfigured() {
        try {
            Quebec_Property_Config__c config = Quebec_Property_Config__c.getOrgDefaults();
            return config != null && 
                   String.isNotBlank(config.API_Key__c) && 
                   config.Is_Active__c == true;
        } catch (Exception e) {
            System.debug(LoggingLevel.ERROR, 'Error checking system configuration: ' + e.getMessage());
            return false;
        }
    }
    
    /**
     * @description Récupère la liste des municipalités autorisées pour cette organisation
     * @return List<MunicipalityInfo> informations des municipalités autorisées
     */
    @AuraEnabled(cacheable=true)
    public static List<MunicipalityInfo> getAuthorizedMunicipalities() {
        try {
            Quebec_Property_Config__c config = Quebec_Property_Config__c.getOrgDefaults();
            if (config == null || String.isBlank(config.Municipality_Codes__c)) {
                return new List<MunicipalityInfo>();
            }
            
            List<String> codes = config.Municipality_Codes__c.split(',');
            List<MunicipalityInfo> municipalities = new List<MunicipalityInfo>();
            
            for (String code : codes) {
                municipalities.add(new MunicipalityInfo(code.trim()));
            }
            
            return municipalities;
        } catch (Exception e) {
            System.debug(LoggingLevel.ERROR, 'Error getting authorized municipalities: ' + e.getMessage());
            throw new AuraHandledException('Erreur lors de la récupération des municipalités autorisées: ' + e.getMessage());
        }
    }
    
    /**
     * @description Recherche des propriétés selon les critères fournis
     * @param searchParams Paramètres de recherche
     * @return List<PropertySearchResult> résultats de recherche
     */
    @AuraEnabled
    public static List<PropertySearchResult> searchProperties(Map<String, Object> searchParams) {
        try {
            if (!isSystemConfigured()) {
                throw new QuebecPropertyException('Le système n\'est pas configuré. Contactez votre administrateur.');
            }
            
            String municipality = (String) searchParams.get('municipality');
            String searchType = (String) searchParams.get('searchType');
            
            // Vérifier que la municipalité est autorisée
            if (!isMunicipalityAuthorized(municipality)) {
                throw new QuebecPropertyException('Cette municipalité n\'est pas autorisée pour votre organisation.');
            }
            
            // Appeler le service API approprié
            if (searchType == 'address') {
                return QuebecPropertyAPIService.searchByAddress(
                    municipality,
                    (String) searchParams.get('streetName'),
                    (String) searchParams.get('civicNumber')
                );
            } else if (searchType == 'owner') {
                return QuebecPropertyAPIService.searchByOwner(
                    municipality,
                    (String) searchParams.get('ownerFirstName'),
                    (String) searchParams.get('ownerLastName')
                );
            } else {
                throw new QuebecPropertyException('Type de recherche non valide: ' + searchType);
            }
            
        } catch (QuebecPropertyException ex) {
            throw new AuraHandledException(ex.getMessage());
        } catch (Exception ex) {
            System.debug(LoggingLevel.ERROR, 'Error in searchProperties: ' + ex.getMessage());
            throw new AuraHandledException('Erreur lors de la recherche: ' + ex.getMessage());
        }
    }
    
    // Méthode privée pour vérifier l'autorisation des municipalités
    private static Boolean isMunicipalityAuthorized(String municipalityCode) {
        try {
            Quebec_Property_Config__c config = Quebec_Property_Config__c.getOrgDefaults();
            if (config == null || String.isBlank(config.Municipality_Codes__c)) {
                return false;
            }
            
            Set<String> authorizedCodes = new Set<String>();
            for (String code : config.Municipality_Codes__c.split(',')) {
                authorizedCodes.add(code.trim());
            }
            
            return authorizedCodes.contains(municipalityCode);
        } catch (Exception e) {
            System.debug(LoggingLevel.ERROR, 'Error checking municipality authorization: ' + e.getMessage());
            return false;
        }
    }
    
    // Classes wrapper pour les données
    public class MunicipalityInfo {
        @AuraEnabled public String code { get; set; }
        @AuraEnabled public String name { get; set; }
        @AuraEnabled public String label { get; set; }
        @AuraEnabled public String value { get; set; }
        
        public MunicipalityInfo(String municipalityCode) {
            this.code = municipalityCode;
            this.name = getMunicipalityName(municipalityCode);
            this.label = this.name + ' (' + municipalityCode + ')';
            this.value = municipalityCode;
        }
        
        private String getMunicipalityName(String code) {
            Map<String, String> municipalityNames = new Map<String, String>{
                '66102' => 'Kirkland',
                '66023' => 'Montréal',
                '23027' => 'Québec'
            };
            String municipalityName = municipalityNames.get(code);
            return municipalityName != null ? municipalityName : 'Municipalité ' + code;
        }
    }
    
    public class PropertySearchResult {
        @AuraEnabled public String id { get; set; }
        @AuraEnabled public PropertyAddress address { get; set; }
        @AuraEnabled public MunicipalityInfo municipality { get; set; }
        @AuraEnabled public List<PropertyOwner> owners { get; set; }
        @AuraEnabled public Map<String, Object> rawData { get; set; }
        
        public PropertySearchResult() {
            this.owners = new List<PropertyOwner>();
            this.rawData = new Map<String, Object>();
        }
    }
    
    public class PropertyAddress {
        @AuraEnabled public String civicNumber { get; set; }
        @AuraEnabled public String streetName { get; set; }
        @AuraEnabled public String fullAddress { get; set; }
    }
    
    public class PropertyOwner {
        @AuraEnabled public String legalName { get; set; }
        @AuraEnabled public String firstName { get; set; }
    }
}
