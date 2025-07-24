# **Setup and Deployment Guide**

### **Cloning the Repository**
To start with this project, follow these steps:

1. Clone this repository.
   ```bash
   git clone https://github.com/SAP-samples/btp-cap-genai-semantic-search.git
   ```
2. Navigate to the project directory.
   ```bash
   cd btp-cap-genai-semantic-search
   ```
### **Prepare for Deployment**

1. [Create an instance of SAP AI Core:](https://help.sap.com/docs/sap-ai-core/sap-ai-core-service-guide/create-service-instance) and make sure to choose the service plan `extended` to activate Generative AI Hub and continue [creating a Service Key](https://help.sap.com/docs/sap-ai-core/sap-ai-core-service-guide/create-service-key). When setting up the SAP AI Core instance, a default resource group named "default" will be automatically created. Please select this as the resource group ID for the subsequent step.

2. [Create deployments:](https://help.sap.com/docs/sap-ai-core/sap-ai-core-service-guide/create-deployment-for-generative-ai-model-in-sap-ai-core)

   - Using the `orchestration` scenario, choose a model that supports Chat Completions, such as `gpt-4o` (recommended).       The orchestration scenario allows structured prompt/response handling without manual parsing.
     
   - Create an additional deployment using the embedding model, such as:

      - text-embedding-3-small (lightweight)
      - text-embedding-3-large (higher quality)
        
   All available models are listed [here](https://me.sap.com/notes/3437766). 

4. [Create a Destination:](https://help.sap.com/docs/btp/sap-business-technology-platform/create-destination) for Generative AI Hub in the SAP BTP Cockpit of your Subaccount based on the Service Key of SAP AI Core you created in the previous step:

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
5. [Create SAP HANA Cloud instance:](https://help.sap.com/docs/HANA_CLOUD_ALIBABA_CLOUD/683a53aec4fc408783bbb2dd8e47afeb/7d4071a49c204dfc9e542c5e47b53156.html) with Vector Engine (QRC 1/2024 or later). Starting with this release, Vector Engine is automatically enabled; manual activation is not required.

### **Deployment**

> ℹ️ **Note:**
> Make sure [TypeScript support is enabled](https://cap.cloud.sap/docs/node.js/typescript), otherwise run `npm i -g typescript ts-node`

1. Run `npm install` or `yarn install` in `api` directory to install project specific dependencies.
2. Navigate to the root folder and run `npm run build` or `yarn build` to build the mta.yaml file. 
4. Login to your subaccount with [Cloud Foundry CLI](https://docs.cloudfoundry.org/cf-cli/install-go-cli.html), running `cf login`.
5. Run `npm run deploy` or `yarn deploy` on CLI to deploy the API to your Subaccount. After deployment, you will find the following instances created under "Services -> Instances" in BTP:
   ```yaml
   genai-semantic-search-sample-uaa    
   genai-semantic-search-sample-destination
   genai-semantic-search-sample-hdi-container
   ```
### **Development**

> ℹ️ **Note:**
> Make sure [TypeScript support is enabled](https://cap.cloud.sap/docs/node.js/typescript), otherwise run `npm i -g typescript ts-node`

1. Navigate to `router` directory and run `npm install` or `yarn install` to install project specific dependencies.
2. Login to your subaccount with [Cloud Foundry CLI](https://docs.cloudfoundry.org/cf-cli/install-go-cli.html), running `cf login`.
3. [Bind services for hybrid testing](https://cap.cloud.sap/docs/advanced/hybrid-testing) and development (create Service Keys if necessary).
   ```yaml
   cd api # make sure to execute in the api directory
   cds bind -2 genai-semantic-search-sample-uaa
   cds bind -2 genai-semantic-search-sample-destination
   cds bind -2 genai-semantic-search-sample-hdi-container
   cds bind -2 <NAME-OF-YOUR-AI-CORE-INSTANCE>
   ```
   After the services are bound successfuly, `api/.cdsrc-private.json` should exist with the `hybrid` profile.
4. Duplicate `router/dev/default-services.sapmple.json` to `router/dev/default-services.json` and enter the 'url', 'clientid' and 'clientsecret' from the UAA instance previously created in BTP.
5. Run npm run `watch:api` or yarn `watch:api` from project root to start CAP backend.
6. Duplicate `api/test/requests.sample.http` to `api/test/requests.http` and enter UAA details from the Service Key of the `genai-semantic-search-sample-uaa`. These requests will be utilized for testing in subsequent steps.

### Notes:
* **Cloud Foundry Login**: If deploying to a different Cloud Foundry account, use `cf login -a API_ENDPOINT -o ORG_NAME`.
