import { z } from "zod";
import cds  from "@sap/cds";
import { zodResponseFormat } from "openai/helpers/zod";
import { OrchestrationClient } from "@sap-ai-sdk/orchestration";
import { AzureOpenAiEmbeddingClient } from "@sap-ai-sdk/foundation-models";
import { v4 as uuidv4 } from 'uuid'; 

const WHERE_CLAUSE_SCHEMA = z
    .object({
        whereClause: z.string()
            .describe(`
                You are tasked with analyzing a natural language search prompt and returning a valid SQL WHERE clause only if applicable.

                Follow these steps:

                1. Language Detection:
                - If the prompt explicitly mentions a document language (e.g., "documents in Spanish"), map it to the following language codes:
                    - German → 'DE'
                    - English → 'EN'
                    - Spanish → 'ES'
                    - French → 'FR'
                    - Japanese → 'JA'
                    - Portuguese → 'PT'
                - If no language is explicitly mentioned, infer the language based on the language the prompt is written in and map it to the appropriate code.

                2. Date Extraction:
                - Identify if the prompt includes any date-related expressions (e.g., "today", "last year", "March 2023").
                - Convert these into precise date ranges using the format YYYY-MM-DD.

                3. WHERE Clause Construction:
                - Construct a SQL WHERE clause using only the LANGUAGE and DATE fields.
                - The clause must begin with the keyword WHERE.
                - If neither language nor date can be determined, return an empty string ("").
                - Do not include any other columns or comments.
                - Ensure the clause is ready for direct inclusion in a SQL query.

                Output format:
                - Only return the SQL WHERE clause as a string.
                - If no applicable filters are detected, return an empty string ("").

                Examples:

                Input 1:
                "Search for scientific papers in Spanish about marine biology published last year."

                Output 1:
                WHERE LANGUAGE = 'ES' AND DATE >= '2023-01-01' AND DATE <= '2023-12-31'

                Input 2:
                "Documentos sobre inteligencia artificial"

                Output 2:
                WHERE LANGUAGE = 'ES'

                Input 3:
                "AI and tech research documents"

                Output 3:
                ""
            `),
       validWhereClause: z.boolean()
            .transform((flag) => !!flag)
            .describe("Validate the previously generated where clause, if it is correct  return 'true', otherwise return 'false'. The output should be always a boolean")
    }).describe("Schema for WHERE clause with optional validation status.");

const REFORMULATION_SCHEMA = z
    .object({
        reformulatedString: z.string()
            .describe(`
                1. From the prompt combine the snippets separated by | with Chronological ordered (old to new), to one aggregated query by reformulating them into one common text without |.
                2. Since the snippets are ordered from oldest to newest, review the facts presented in each topic. If earlier topics include outdated facts that are contradicted by later topics, discard the outdated information.
                3. Maintain the original wording and tone of the topics as much as possible, ensuring that the final query is clear and well-structured.
                4. If the prompt includes conditional phrases like "instead," adjust the search query accordingly. For example, if the prompt says "instead of A, search for B," focus the query on "B. Do not include the word "instead" in the final query and keep only B"
                Objective: Create a structured, clear, and up-to-date query that incorporates the most current and relevant information from the provided snippets.
            `)
    }).describe("Schema for reformulating a query");

export default class SampleService extends cds.ApplicationService {
    private embedder = new AzureOpenAiEmbeddingClient({
        modelName: "text-embedding-3-small",
        resourceGroup: "default"
    });

    async init(): Promise<void> {
        await super.init();

        this.on("embed", this.onEmbed);
        this.on("search", this.onSearch);
    }

    private onEmbed = async (req: cds.Request): Promise<any> => {
        const dataObj = JSON.parse(req.data.data);
        const { text, title, author, date, summary, category, tags, language, publication, rights, numberOfPages } = dataObj;
        const { Documents } = this.entities;
        
        console.dir(Documents, { depth: null, maxArrayLength: null });
        const embeddings = await this.embedder.run({input: text});
        const embeddingArray: number[] = embeddings.getEmbedding();

        if (embeddingArray.length > 0) {
            const generatedId = uuidv4();

            const query = `
                INSERT INTO "SAMPLE_DB_DOCUMENTS"
                ("ID", "TEXT", "TITLE", "AUTHOR", "DATE", "SUMMARY", "CATEGORY", "TAGS", "LANGUAGE", "PUBLICATION", "RIGHTS", "NUMBEROFPAGES", "EMBEDDING")
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, TO_REAL_VECTOR(?))
                `;

            const success = await cds.run(query, [
                generatedId,
                text,
                title,
                author,
                date,
                summary,
                category,
                JSON.stringify(tags),
                language,
                publication,
                rights,
                numberOfPages,
                `[${embeddingArray.join(',')}]`
            ]);
            
            if (success) {
                return true;
            }
        }
        return false;
    };

    private onSearch = async (req: cds.Request): Promise<any> => {
        const { snippets } = req.data;
        const baseText = snippets.join("|")

        console.log("Initial Search:", baseText);

        const reformulatedText = snippets.length > 1 ? await this.reformulatePrompt(baseText) : {reformulatedString: baseText};

        const textToUse = reformulatedText.reformulatedString;
        console.log("Reformulated String:", textToUse);

        const embeddings = await this.embedder.run({input: textToUse});
        const embeddingArray: number[] = embeddings.getEmbedding();

        const promptMetadata = await this.extractMetadataAndBuildWhereClause(textToUse);

        console.log("Where Clause:", promptMetadata.whereClause);
        console.log("Is Where Clause Valid:", promptMetadata.validWhereClause)

        if (embeddingArray.length > 0) {
            const whereClause: string = promptMetadata.validWhereClause ? promptMetadata.whereClause : "";
            const query = `
                SELECT ID, TEXT, TITLE, AUTHOR, DATE, SUMMARY, CATEGORY, TAGS, LANGUAGE, PUBLICATION, RIGHTS, NUMBEROFPAGES, COSINE_SIMILARITY(EMBEDDING, TO_REAL_VECTOR('[${embeddingArray.toString()}]')) as "similarity"
                FROM "SAMPLE_DB_DOCUMENTS"
                ${whereClause} 
                ORDER BY "similarity" DESC LIMIT ?
                `;

            console.log("Executing query:", query);
            const documents = await cds.run(query, [10]);
            if (documents) {
                const searchResults = documents.map((document: any) => ({
                    document: {
                        ID: document.ID,
                        text: document.TEXT,
                        title: document.TITLE,
                        author: document.AUTHOR,
                        date: document.DATE,
                        summary: document.SUMMARY,
                        category: document.CATEGORY,
                        tags: JSON.parse(document.TAGS.toString()),
                        language: document.LANGUAGE,
                        publication: document.PUBLICATION,
                        rights: document.RIGHTS,
                        numberOfPages: document.NUMBEROFPAGES
                    },
                    similarity: document.similarity
                }));
                const response = {
                    documents: searchResults,
                    reformulatedText: textToUse,
                    sqlQuery: query
                }
                return response;
            }
        }
        return [];
    };

    private extractMetadataAndBuildWhereClause = async (searchText: string): Promise<any> => {
        const currentYear = new Date().getFullYear();
        const schema = WHERE_CLAUSE_SCHEMA.strict();
        const responseFormat = zodResponseFormat(schema, "event") as any;
        const systemMessagePrompt = `Given the current year is ${currentYear}, create the where clause. \n${responseFormat.formatInstructions}`;

        return await this.processChatPrompt(searchText, responseFormat, systemMessagePrompt);
    };

    private reformulatePrompt = async (searchText: string): Promise<any> => {
        const schema = REFORMULATION_SCHEMA.strict();
        const responseFormat = zodResponseFormat(schema, "event") as any;

        const systemMessagePrompt = `Write a proper search query.\n${responseFormat.formatInstructions}`;

        return await this.processChatPrompt(searchText, responseFormat, systemMessagePrompt);
    };


    private async processChatPrompt(
        llmInput: string,
        responseFormat: any, 
        systemMessage: string
    ): Promise<object> {
        const orchestrationClient = new OrchestrationClient({
            llm: {
                model_name: "gpt-4o"
            },
            templating: {
                template: [
                    { role: "system", content: systemMessage },
                    { role: "user", content: llmInput }
                ],
                response_format: responseFormat
            },
        }, { resourceGroup: "default" });

        const response = await orchestrationClient.chatCompletion();
        const rawMessage = response?.data?.module_results?.llm?.choices?.[0]?.message?.content;
        if (!rawMessage) throw new Error("No response from LLM");

        return JSON.parse(rawMessage);
    }
}
