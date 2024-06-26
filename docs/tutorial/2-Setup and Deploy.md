# **Setup and Deployment Guide**

### **Cloning the Repository**
To start with this project, follow these steps:

1. Clone this repository.
   ```bash
   git clone https://github.com/SAP-samples/btp-cap-genai-semantic-search.git
2. Navigate to the project directory.
   ```bash
   cd btp-cap-genai-semantic-search

### **Prepare for Deployment**

1. [Create an instance of SAP AI Core](https://help.sap.com/docs/sap-ai-core/sap-ai-core-service-guide/create-service-instance) and make sure to choose the service plan `extended` to activate Generative AI Hub and continue [creating a Service Key](https://help.sap.com/docs/sap-ai-core/sap-ai-core-service-guide/create-service-key). When setting up the SAP AI Core instance, a default resource group named "default" will be automatically created. Please select this as the resource group ID for the subsequent step.

2. [Create deployments](https://help.sap.com/docs/sap-ai-core/sap-ai-core-service-guide/create-deployment-for-generative-ai-model-in-sap-ai-core) for a model support ChatCompletion (e.g, gpt-35-turbo or gpt-4) and an embedding model (text-embedding-ada-002) and note down the Deployment IDs for each. All available models are listed [here](https://help.sap.com/docs/sap-ai-core/sap-ai-core-service-guide/models-and-scenarios-in-generative-ai-hub). 

3. [Create a Destination](https://help.sap.com/docs/btp/sap-business-technology-platform/create-destination) for Generative AI Hub in the SAP BTP Cockpit of your Subaccount based on the Service Key of SAP AI Core you created in the previous step:

   ```yaml
   Name: GENERATIVE_AI_HUB
   Description: SAP AI Core deployed service (generative AI hub)
   URL: <AI-API-OF-AI-CORE-SERVICE-KEY>/v2 # make sure to add /v2!
   Type: HTTP
   ProxyType: Internet
   Authentication: OAuth2ClientCredentials
   tokenServiceURL: <TOKEN-SERVICE-URL-OF-AI-CORE-SERVICE-KEY>/oauth/token
   clientId: <YOUR-CLIENT-ID-OF-AI-CORE-SERVICE-KEY>
   clientSecret: <YOUR-CLIENT-SECRET-OF-AI-CORE-SERVICE-KEY>
   # Additional Properties:
   URL.headers.AI-Resource-Group: default # adjust if necessary
   URL.headers.Content-Type: application/json
   HTML5.DynamicDestination: true
   ````
4. [Create SAP HANA Cloud instance](https://help.sap.com/docs/HANA_CLOUD_ALIBABA_CLOUD/683a53aec4fc408783bbb2dd8e47afeb/7d4071a49c204dfc9e542c5e47b53156.html) with Vector Engine (QRC 1/2024 or later). Starting with this release, Vector Engine is automatically enabled; manual activation is not required.

### **Deployment**

> ℹ️ **Note**
> Make sure [TypeScript support is enabled](https://cap.cloud.sap/docs/node.js/typescript), otherwise run `npm i -g typescript ts-node`

1. Run `npm install` or `yarn install` in `api` directory to install project specific dependencies.
2. Duplicate `api/.cdsrc.sample.json` to `api/.cdsrc.json` and enter the Deployment IDs for the created ChatCompletion and Embedding model from the preparation steps above. Adjust the Resource Group if necessary.
3. Run `npm run build` or `yarn build` on CLI to build the MTA.
4. Login to your subaccount with [Cloud Foundry CLI](https://docs.cloudfoundry.org/cf-cli/install-go-cli.html), running `cf login`.
5. Run `npm run deploy` or `yarn deploy` on CLI to deploy the API to your Subaccount.

### **Development**

> ℹ️ **Note**
> Make sure [TypeScript support is enabled](https://cap.cloud.sap/docs/node.js/typescript), otherwise run `npm i -g typescript ts-node`

1. Navigate to `router` directory and run `npm install` or `yarn install` to install project specific dependencies.
2. Duplicate `router/default-services.sapmple.json` to `router/default-services.json` and enter the 'url', 'clientid' and 'clientsecret' from the UAA instance.
3. Login to your subaccount with [Cloud Foundry CLI](https://docs.cloudfoundry.org/cf-cli/install-go-cli.html), running `cf login`.
4. [Bind services for hybrid testing](https://cap.cloud.sap/docs/advanced/hybrid-testing) and development (create Service Keys if necessary).

   ```yaml
   cd api # make sure to execute in the api directory
   cds bind -2 genaihub-vectorengine-sample-uaa
   cds bind -2 genaihub-vectorengine-sample-destination
   cds bind -2 genaihub-vectorengine-sample-hdi-container
   ```
   After the services are bound successfuly, `api/.cdsrc-private.json` should exist with the `hybrid` profile.

5. Run npm run `watch:api` or yarn `watch:api` from project root to start CAP backend.
6. Duplicate `api/test/requests.sample.http` to `api/test/requests.http` and enter UAA details from the Service Key of the `genaihub-vectorengine-sample-uaa` instance to execute the requests.

### Notes:
* **Ignore Error Message**: When creating the destination in SAP BTP Cockpit, you might encounter a message like "404 not found." Ignore this message, as long as the message dialog is green, indicating that the creation of the destination was successful.
* **Cloud Foundry Login**: If deploying to a different Cloud Foundry account, use `cf login -a API_ENDPOINT -o ORG_NAME`.
* **mta.yaml Configuration**: Within the provided `mta.yaml` file, pay close attention to the `database_id` parameter under the `genai-semantic-search-sample-hdi-container` module. This parameter specifies the unique identifier for the HDI container's database. It's crucial to have here `<your-unique-database-id-here>` the correct ID for your project. You can find this ID by navigating to the SAP BTP Cockpit, accessing "Instances and Subscriptions," locating the instance named genai-semantic-search-sample-hdi-container, selecting "Service Keys," and then identifying the appropriate key where the database ID is specified. Failure to replace it with the correct ID may lead to deployment errors or unexpected behavior.

### Code Snippet Part of mta.yaml:

```yaml
resources:
    - name: genai-semantic-search-sample-hdi-container
      type: com.sap.xs.hdi-container
      parameters:
          service: hana
          service-plan: hdi-shared
          config: 
            database_id: <your-unique-database-id-here>
      properties:
          hdi-service-name: ${service-name}
```
