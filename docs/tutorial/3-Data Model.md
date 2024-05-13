### Schema Description

Before setting up and deploying the application, let's take a look at the schema that defines the structure of the data model used in this application. The schema is defined in the `schema.cds` file and contains the following:

```cds
using {cuid} from '@sap/cds/common';

context sample.db {
    entity Documents : cuid {
        text          : String;
        title         : String(200);
        author        : String(150);
        date          : Date;
        summary       : String(500);
        category      : String(100);
        tags          : array of String;
        language      : String(5);
        publication   : String(100);
        rights        : String(100);
        numberOfPages : Integer;
        embedding     : Vector(1536);
    }
}
```

The Documents entity represents the data model for this application, containing attributes such as text, title, author, date, and more.

### Build and deploy the Data Model

If you want to test the application with a different dataset or make changes to the data model, you can do so by modifying the schema defined in the schema.cds file. However, it's important to note that deploying changes to the data model may require updating the application's artifacts and redeploying the application. To do this, use the following command in the root folder:

```bash
npm run build:deploy
```

#### Example Modifications
Add New Attribute: To add a new attribute to the Documents entity, simply define it within the entity block in the schema.cds file and redeploy the application.
Change Data Type: If you need to change the data type of an existing attribute, update the corresponding attribute definition in the schema.cds file and redeploy the application.
