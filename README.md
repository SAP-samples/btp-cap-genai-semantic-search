# CAP Application: Semantic Search Integrated with Generative AI Hub and SAP HANA Cloud's Vector Engine
Basic sample for semantic search engine on SAP Business Technology Platform


<!--- Register repository https://api.reuse.software/register, then add REUSE badge:
[![REUSE status](https://api.reuse.software/badge/github.com/SAP-samples/REPO-NAME)](https://api.reuse.software/info/github.com/SAP-samples/REPO-NAME)
-->
![Diagram](docs/architecture.png)
## Description
Basic sample for semantic search engine as CAP (Cloud Application Programming Model) application integrating generative AI hub and SAP HANA Cloud’s Vector Engine on SAP BTP, offering scalable and powerful search capabilities.

The application follows a modular structure, with the backend logic located in the 'api' folder and the frontend components in the 'ui' folder. Explore the 'api' folder for backend logic, including data models, service definitions, and business logic implementation. The 'ui' folder contains the frontend components, such as views, controllers and assets for the web interface, developed using TypeScript and SAPUI5 (SAP's web framework for building enterprise-ready web applications).

Follow the provided instructions in the 'Download and Installation' section to configure and install the application for deployment and development on SAP BTP.

## Getting Started
1. [Requirements](https://github.com/SAP-samples/btp-cap-genai-semantic-search/blob/main/docs/tutorial/1-Requirements.md)

## Configuration and Installation

Before proceeding with the installation, ensure you have completed any necessary preliminary steps. You can find detailed configuration and installation instructions in the 'Prepare for Deployment, Deployment and Development' section of the [Similarity Search Application repository](https://github.com/SAP-samples/btp-cap-genai-rag/tree/cap-genai-semantic-search-sample).

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
## UI Component
The project includes a UI component. Follow the instruccions mentioned in the "if UI is attached" section of the previously referenced repository for configuration and installation. Once configured, the UI is set to be deployed locally. After running `npm run watch`, check the port number where the application router is listening. Replace the port in the URL with this port number to access and test the application locally.

## How to obtain support
[Create an issue](https://github.com/SAP-samples/btp-cap-genai-semantic-search/issues) in this repository if you find a bug or have questions about the content.
 
For additional support, [ask a question in SAP Community](https://answers.sap.com/questions/ask.html).

## Contributing
If you wish to contribute code, offer fixes or improvements, please send a pull request. Due to legal reasons, contributors will be asked to accept a DCO when they create the first pull request to this project. This happens in an automated fashion during the submission process. SAP uses [the standard DCO text of the Linux Foundation](https://developercertificate.org/).

## License
Copyright (c) 2024 SAP SE or an SAP affiliate company. All rights reserved. This project is licensed under the Apache Software License, version 2.0 except as noted otherwise in the [LICENSE](LICENSE) file.
