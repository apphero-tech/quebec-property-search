public with sharing class PropertyAPI {
    
    @AuraEnabled
    public static List<String> getCollections() {
        // Pour test - retourne des données fixes
        return new List<String>{'Kirkland', 'Montreal', 'Quebec'};
    }
    
    @AuraEnabled
    public static List<Map<String, Object>> searchByAddress(String collection, String streetName, String civicNumber) {
        // Pour test - retourne des données de test
        Map<String, Object> testResult = new Map<String, Object>();
        testResult.put('_id', '12345');
        testResult.put('address', streetName + ' ' + civicNumber);
        testResult.put('collection', collection);
        
        return new List<Map<String, Object>>{testResult};
    }
}