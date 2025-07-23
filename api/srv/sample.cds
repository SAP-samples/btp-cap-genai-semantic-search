using {sample.db as db} from '../db/schema';

@requires: 'authenticated-user'
service SampleService {
    type DocumentWithSimilarityStructure {
        document   : Association to db.Documents;
        similarity : Double;
    }
    
    type SearchResponse {
        documents        : array of DocumentWithSimilarityStructure;
        reformulatedText : String;
        sqlQuery: String;
    }
    
    entity DocumentWithSimilarity {
        key id     : UUID;
        document   : Association to db.Documents;
        similarity : Double;
    }
    
    entity Documents as projection on db.Documents;

    action embed(data : String)            returns Boolean;
    action search(snippets: array of String) returns SearchResponse;
}
