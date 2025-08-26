using {cuid} from '@sap/cds/common';

context sample.db {

      entity Documents : cuid {
            text      : String(200);
            title       : String(200);
            author      : String(150);
            date        : Date;
            summary     : String(500);
            category    : String(100);
            tags        : array of String;
            language    : String(5);
            publication : String(100);
            rights      : String(100);
            numberOfPages : Integer;

            // Embedding generated externally via OpenAI API
            embedding_openai : Vector(1536);

            // Embedding generated natively in SAP HANA (Q4 2024 release)
            // Uses VECTOR_EMBEDDING function with SAP_NEB.20240715 model (768 dims)
            embedding_hana : Vector(768) = VECTOR_EMBEDDING(
            text, 'DOCUMENT', 'SAP_NEB.20240715'
            ) stored;
      }
}
