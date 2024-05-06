Before proceeding with the installation, ensure you have completed any necessary preliminary steps. You can find detailed configuration and installation instructions in the 'Prepare for Deployment, Deployment and Development' section of the [Similarity Search Application repository](https://github.com/SAP-samples/btp-cap-genai-rag/tree/cap-genaihub-vectorengine-sample).

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
