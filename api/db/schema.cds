using {cuid} from '@sap/cds/common';

context sample.db {

      entity Documents : cuid {
            text      : String;
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
            embedding : Vector(1536);
      }
}
