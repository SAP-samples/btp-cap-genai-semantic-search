import { z } from "zod";
import cds, { ApplicationService } from "@sap/cds";
import { Request } from "@sap/cds/apis/services";
import {
    ChatPromptTemplate,
    HumanMessagePromptTemplate,
    PromptTemplate,
    SystemMessagePromptTemplate
} from "langchain/prompts";
import { StructuredOutputParser } from "langchain/output_parsers";
import { LLMChain } from "langchain/chains";
import * as aiCore from "./utils/ai-core";
import BTPEmbedding from "./utils/langchain/BTPEmbedding";
import BTPAzureOpenAIChatLLM from "./utils/langchain/BTPAzureOpenAIChatLLM";

const WHERE_CLAUSE_SCHEMA = z
    .object({
        whereClause: z.string()
            .describe(`
                Execute the following steps with the prompt:

                1. Detect the language, which can be determined in two ways:

                    Explicit Language Specification: Check if the prompt explicitly specifies the language of the documents to be searched for (e.g., "documents in Spanish"). The AI should map this request to the corresponding language code (DE for German, EN for English, ES for Spanish, FR for French, JA for Japanese, PT for Portuguese).
                    Implicit Language Detection: If the prompt does not explicitly specify the language, detect the language in which the prompt is written and consider this as the desired language for the search results. This detection should also be mapped to the corresponding language code as mentioned above.

                2. Determine if the prompt includes a specific date or date range and extract the relevant dates, formatting them appropriately.
                
                    Construct a SQL WHERE clause to filter entries in the "SAMPLE_DB_DOCUMENTS" database by the extracted language (whether explicitly specified or detected), and dates. The WHERE clause should adhere to SQL standards in terms of syntax and formatting, specifically focusing on the 'LANGUAGE', and 'DATE' fields.
                    
                    Output Requirement:
                    The output should be a properly formatted SQL WHERE clause, ready for inclusion in the base SQL query structure. This clause should accurately reflect the user's search intent in terms of language (whether specified or detected), and date criteria. No additional explanations or comments are needed alongside the WHERE clause.
                    
                    Example Input Query 1 (Explicit Language Specification):
                    "Search for scientific papers in Spanish about marine biology published last year."
                    
                    Expected Output 1:
                    WHERE LANGUAGE = 'ES' AND DATE >= '2023-01-01' AND DATE <= '2023-12-31'
                    
                    Example Input Query 2 (Implicit Language Detection):
                    "Documentos sobre inteligencia artificial"
                    
                    Expected Output 2 (Assuming the AI detects the prompt is in Spanish):
                    WHERE LANGUAGE = 'ES'

                Remember, only the WHERE clause is needed as a response to this prompt. WHERE should be always written at the begining of the response, do not add different columns from "LANGUAGE" or "DATE".
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

let array2VectorBuffer = (data: Array<number>): Buffer => {
    const sizeFloat = 4;
    const sizeDimensions = 4;
    const bufferSize = data.length * sizeFloat + sizeDimensions;

    const buffer = Buffer.allocUnsafe(bufferSize);
    // write size into buffer
    buffer.writeUInt32LE(data.length, 0);
    data.forEach((value: number, index: number) => {
        buffer.writeFloatLE(value, index * sizeFloat + sizeDimensions);
    });
    return buffer;
};

export default class SampleService extends ApplicationService {
    async init(): Promise<void> {
        await super.init();
        await aiCore.checkDefaultResourceGroup();
        this.on("embed", this.onEmbed);
        this.on("search", this.onSearch);
    }

    private onEmbed = async (req: Request): Promise<any> => {
        const dataObj = JSON.parse(req.data.data);
        const { text, title, author, date, summary, category, tags, language, publication, rights, numberOfPages } = dataObj;
        const { Documents } = this.entities;
        const embedder = new BTPEmbedding(aiCore.embed);
        const embeddings = await embedder.embedDocuments([text]);
        if (embeddings.length > 0) {
            const document = {
                text: text,
                title: title,
                author: author,
                date: date,
                summary: summary,
                category: category,
                tags: tags,
                language: language,
                publication: publication,
                rights: rights,
                numberOfPages: numberOfPages,
                embedding: array2VectorBuffer(embeddings[0])
            };
            const success = await INSERT.into(Documents).entries([document]);
            if (success) {
                return true;
            }
        }
        return false;
    };

    private onSearch = async (req: Request): Promise<any> => {
        const { snippets } = req.data;
        const baseText = snippets.join("|")

        console.log("Initial Search:", baseText);

        const reformulatedText = snippets.length > 1 ? await this.reformulatePrompt(baseText) : {reformulatedString: baseText};

        const textToUse = reformulatedText.reformulatedString;
        console.log("Reformulated String:", textToUse);

        const embedder = new BTPEmbedding(aiCore.embed);
        const embeddings = await embedder.embedDocuments([textToUse]);

        const promptMetadata = await this.extractMetadataAndBuildWhereClause(textToUse);
        console.log("Where Clause:", promptMetadata.whereClause);
        console.log("Is Where Clause Valid:", promptMetadata.validWhereClause)

        if (embeddings.length > 0) {
            const whereClause: string = promptMetadata.validWhereClause ? promptMetadata.whereClause : "";

            const query = `
                SELECT ID, TEXT, TITLE, AUTHOR, DATE, SUMMARY, CATEGORY, TAGS, LANGUAGE, PUBLICATION, RIGHTS, NUMBEROFPAGES, COSINE_SIMILARITY(EMBEDDING, TO_REAL_VECTOR('[${embeddings[0].toString()}]')) as "similarity"
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

    private extractMetadataAndBuildWhereClause = async (promptText: string): Promise<any> => {
        const currentYear = new Date().getFullYear();
        const template = `Given the current year is ${currentYear}, create the where clause. \n{format_instructions}`;

        return await this.processChatPrompt(promptText, WHERE_CLAUSE_SCHEMA, template);
    };

    private reformulatePrompt = async (promptText: string): Promise<any> => {
        const template = `Write a proper search query. \n{format_instructions}`;
        return await this.processChatPrompt(promptText, REFORMULATION_SCHEMA, template);
    };

    private async processChatPrompt(promptText: string, schema: any, template: string): Promise<object> {
        const llm = new BTPAzureOpenAIChatLLM(aiCore.chatCompletion);
        const parser = StructuredOutputParser.fromZodSchema(schema);
        const formatInstructions = parser.getFormatInstructions();

        const systemPrompt = new PromptTemplate({
            template: template,
            inputVariables: [],
            partialVariables: { format_instructions: formatInstructions }
        });
        const systemMessagePrompt = new SystemMessagePromptTemplate({ prompt: systemPrompt });
        const humanMessagePrompt = HumanMessagePromptTemplate.fromTemplate("{prompt}");
        const chatPrompt = ChatPromptTemplate.fromMessages([systemMessagePrompt, humanMessagePrompt]);

        const chain = new LLMChain({
            llm: llm,
            prompt: chatPrompt
        });

        const response = await chain.call({ prompt: promptText });
        const result = await parser.parse(response.text);

        return result;
    }
}
