### Schema Description

The schema that defines the structure of the data model used in this application is outlined in the `schema.cds` file. Below are the attributes of the `Documents` entity with a brief description of each:

```cds
using {cuid} from '@sap/cds/common';

context sample.db {
    entity Documents : cuid {
        text          : String;            // The full text content of the document
        title         : String(200);       // Title of the document
        author        : String(150);       // Author's name
        date          : Date;              // Publication date
        summary       : String(500);       // Brief summary of the document
        category      : String(100);       // Document category
        tags          : array of String;   // Tags for search optimization
        language      : String(5);         // Language code (e.g., EN, DE)
        publication   : String(100);       // Name of the publication
        rights        : String(100);       // Copyright and usage rights information
        numberOfPages : Integer;           // Total number of pages
        embedding     : Vector(1536);      // Vector representation for advanced processing (e.g., machine learning models)
    }
}
```

### Build and Deploy the Data Model

> ℹ️ **Note**
> The following step is only necessary, if it is desired to test with a different dataset or data model.

The schema in the `schema.cds` file should be updated. Deploying changes to the data model involves updating the application's artifacts and redeploying. The following steps outline the build and deployment process:

```bash
# Navigate to the root folder and execute:
npm run build:deploy
```
### Example Modifications

To modify the `Documents` entity in the `schema.cds` file, follow these examples:

- **Add New Attribute:**
  To add a new attribute to the `Documents` entity, define it within the entity block as follows:

  ```cds
  entity Documents : cuid {
      // Existing attributes...
      version : Integer;  // Adds a new attribute to track document version
  }
  ````

- **Change Data Type:**
    To change the data type of an existing attribute, update the corresponding attribute definition. For instance, to     increase the character limit for the summary field:

    ```cds
    entity Documents : cuid {
        summary : String(1000);  // Updated from String(500)
    }
    ```
  
After making these changes, remember to redeploy the application to apply the modifications..
