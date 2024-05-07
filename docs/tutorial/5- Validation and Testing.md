## Validation and Testing

In this section, you'll learn how to create test data using requests, test the backend with API requests, and validate the application's functionality via the UI.

### Test the Backend

As explained in the [Setup and Deploy](https://github.com/SAP-samples/btp-cap-genai-semantic-search/blob/main/docs/tutorial/2-Setup%20and%20Deploy.md) section, after configuring the UAA details from the Service Key of the `genai-semantic-search-sample-uaa` instance, you can test the backend by sending requests.

#### Start the Application

Run this command in the root folder:

```bash
npm run watch
```

#### Install REST Client or Postman

If you are working in Visual Studio Code, install the REST Client extension; otherwise, you can use Postman to send the requests.

#### Obtain an XSUAA Token

To access the API securely, you'll need to obtain an authentication token. Use this POST request to retrieve the token:

```
### GET XSUAA TOKEN

# @name getXsuaaToken
POST {{xsuaaHostname}}/oauth/token
Accept: application/json
Content-Type: application/x-www-form-urlencoded
Authorization: Basic {{btpXsuaaClient}}:{{btpXsuaaSecret}}

client_id={{btpXsuaaClient}}
&client_secret={{btpXsuaaSecret}}
&grant_type=client_credentials
````
#### Fetch Documents

After obtaining the token, use it to make an authorized request to fetch documents. Even if there are no documents initially, this test will verify that the backend is operational.

```
### FETCH DOCUMENTS

# @name fetchDocuments
GET {{btpAppHostname}}/odata/v4/sample/Documents
Authorization: Bearer {{token}}
```

#### Create Test Data

To create test data using the schema defined in [Configure the Data Model](https://github.com/SAP-samples/btp-cap-genai-semantic-search/blob/main/docs/tutorial/3-Configure%20the%20Data%20Model.md), use as reference this POST request in the requests.http file:

```
# @name embed1
POST {{btpAppHostname}}/odata/v4/sample/embed
content-type: application/json
Authorization: Bearer {{token}}

{
  "data": "{\"text\":\"Artificial Intelligence (AI) has seamlessly integrated into our daily routines, from smart assistants to personalized recommendations. This article explores how AI has transformed everyday life.\", \"title\":\"AI Everyday: The Integration of Artificial Intelligence into Daily Life\", \"author\":\"Megan Lee\", \"date\":\"2018-07-12\", \"summary\":\"An overview of how artificial intelligence has become a fundamental part of our daily routines, improving efficiency and personalization.\", \"category\":\"Technology\", \"tags\":[\"AI\", \"technology\", \"daily life\", \"smart technology\"], \"language\":\"EN\", \"publication\":\"Tech Today\", \"rights\":\"All rights reserved.\"}"
}
```

For a large dataset you might use other tools to create random data sets such as:

- [kaggle](https://www.kaggle.com/)
- [Mockaroo](https://www.mockaroo.com/)

These samples requests are included in api/test/requests.sample.http which you have duplicated and renamed as requests.sample.http as explained in [Development](https://github.com/SAP-samples/btp-cap-genai-rag/tree/cap-genaihub-vectorengine-sample#Development) section of the reference project.

### Test the UI

After confirming that the backend is functioning and test data has been created you can test the interaction with the UI.

1. Access the application through the URL

```url
http://localhost:5000/index.html
```

2. Perform a semantic search:

- Search for documents related to topics such as "AI," "Health," "Science," "Technology," "Space," and more.
- Type your desired keywords or phrases in the search bar.

**Example Searches:**
- `AI Technology`
- `Health and Wellness`
- `Space Exploration`
- `Science Research`

#### Review the Search Results:

- A table displays up to 10 documents matching the search criteria.
- The table title shows the count of documents found in brackets.
- Next to the title, a tooltip containing a question mark reveals the generated SQL query used for the search.





