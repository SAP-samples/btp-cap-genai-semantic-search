# CAP Application: Semantic Search Integrated with Generative AI Hub and SAP HANA Cloud's Vector Engine
Basic sample for semantic search engine on SAP Business Technology Platform

<!--- Register repository https://api.reuse.software/register, then add REUSE badge:
[![REUSE status](https://api.reuse.software/badge/github.com/SAP-samples/REPO-NAME)](https://api.reuse.software/info/github.com/SAP-samples/REPO-NAME)
-->

## Description
Basic sample for semantic search engine as CAP (Cloud Application Programming Model) application integrating generative AI hub and SAP HANA Cloud’s Vector Engine on SAP BTP, offering scalable and powerful search capabilities.

The application follows a modular structure, with the backend logic located in the 'api' folder and the frontend components in the 'ui' folder. Explore the 'api' folder for backend logic, including data models, service definitions, and business logic implementation. The 'ui' folder contains the frontend components, such as views, controllers and assets for the web interface, developed using TypeScript and SAPUI5 (SAP's web framework for building enterprise-ready web applications).

Follow the provided instructions in the 'Download and Installation' section to configure and install the application for deployment and development on SAP BTP.

## Requirements
* Cloud Foundry Subaccount [Create a Subaccount](https://help.sap.com/docs/sap-ai-core/sap-ai-core-service-guide/create-subaccount)
* Access to generative AI hub (SAP AI Core with service plan extended)
* Access to SAP HANA Cloud Vector Engine (QRC 1/2024 or later)

## Download and Installation
Follow the configuration and installation steps provided in the 'Prepare for Deployment, Deployment and Development' section:  [Similarity Search Application](https://github.com/SAP-samples/btp-cap-genai-rag/tree/cap-genaihub-vectorengine-sample)

## How to obtain support
[Create an issue](https://github.com/SAP-samples/<repository-name>/issues) in this repository if you find a bug or have questions about the content.
 
For additional support, [ask a question in SAP Community](https://answers.sap.com/questions/ask.html).

## Contributing
If you wish to contribute code, offer fixes or improvements, please send a pull request. Due to legal reasons, contributors will be asked to accept a DCO when they create the first pull request to this project. This happens in an automated fashion during the submission process. SAP uses [the standard DCO text of the Linux Foundation](https://developercertificate.org/).

## License
Copyright (c) 2024 SAP SE or an SAP affiliate company. All rights reserved. This project is licensed under the Apache Software License, version 2.0 except as noted otherwise in the [LICENSE](LICENSE) file.
