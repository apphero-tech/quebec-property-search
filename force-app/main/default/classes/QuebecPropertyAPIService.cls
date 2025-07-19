/**
 * @description Service API pour Quebec Property Search - Interface avec MongoDB
 * @author Quebec Property Search Package
 * @version 1.0
 */
public class QuebecPropertyAPIService {
    
    /**
     * @description Teste la connexion à l'API
     * @return Boolean indiquant si la connexion fonctionne
     */
    public static Boolean testConnection() {
        try {
            HttpRequest req = new HttpRequest();
            req.setEndpoint('callout:Quebec_Property_API/v1/health');
            req.setMethod('GET');
            req.setTimeout(30000);
            req.setHeader('Authorization', 'Bearer ' + getAPIKey());
            req.setHeader('Content-Type', 'application/json');
            
            Http http = new Http();
            HttpResponse response = http.send(req);
            
            return response.getStatusCode() == 200;
            
        } catch (Exception e) {
            System.debug(LoggingLevel.ERROR, 'API Connection test failed: ' + e.getMessage());
            return false;
        }
    }
    
    /**
     * @description Recherche par adresse
     */
    public static List<QuebecPropertyController.PropertySearchResult> searchByAddress(
        String municipality, 
        String streetName, 
        String civicNumber
    ) {
        // Version basique pour les tests
        List<QuebecPropertyController.PropertySearchResult> results = 
            new List<QuebecPropertyController.PropertySearchResult>();
            
        // TODO: Implémenter l'appel API réel
        
        return results;
    }
    
    /**
     * @description Recherche par propriétaire
     */
    public static List<QuebecPropertyController.PropertySearchResult> searchByOwner(
        String municipality,
        String firstName,
        String lastName
    ) {
        // Version basique pour les tests
        List<QuebecPropertyController.PropertySearchResult> results = 
            new List<QuebecPropertyController.PropertySearchResult>();
            
        // TODO: Implémenter l'appel API réel
        
        return results;
    }
    
    /**
     * @description Récupère la clé API depuis la configuration
     */
    private static String getAPIKey() {
        Quebec_Property_Config__c config = Quebec_Property_Config__c.getOrgDefaults();
        if (config?.API_Key__c == null) {
            throw new QuebecPropertyException('Clé API non configurée');
        }
        return config.API_Key__c;
    }
}
