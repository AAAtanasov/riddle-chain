import { ChatOpenAI } from "@langchain/openai";
import { LLMService } from "../llm-service.interface";
import { RiddleModel } from "../riddle.model";


export class OpenAiService implements LLMService {
    private readonly model: ChatOpenAI;

    constructor(apiKey: string) {
        this.model = new ChatOpenAI({ model: "gpt-4o-mini", temperature: 0.1, openAIApiKey: apiKey });
    }

    public async getRiddle(): Promise<RiddleModel> {
        const prompt = this.getPromptMessage();

        const response = await this.model.invoke(prompt);

        console.log("Response from OpenAI:", response?.content);

        if (response?.content) {
            const riddle: RiddleModel = this.parseResponse(response?.content.toString());
            console.log("Parsed response:", riddle);

            return riddle;
        } else {
            // TODO: consider global  error handling library as winston
            console.error(response);
            throw new Error("No response from OpenAI");
        }
    }

    private getPromptMessage(): string {
        // Potential expansion: could add a topic for the riddle, could add difficulty level, can use a prompt but a simple string is enough for now
        const message = `
            Generate a creative riddle with its answer. Return the response in json format following the example:
            
            {question: "string", answer: "string"}
            
            Make it clever but not too difficult. Avoid using prepositions for the answer - make it concise and clear.
          `;

        return message;

    }

    private parseResponse(response: string): RiddleModel {
        const jsonRegex = /(\{.*\})/s;
        const match = response.match(jsonRegex);

        if (match && match[1]) {
            try {
                const test: RiddleModel = JSON.parse(match[1]);
                return test;
            } catch (error) {
                console.error("Error parsing JSON:", error);
                throw new Error(`Failed to parse JSON response: ${error}`);

            }
        };

        throw new Error(`Invalid response format, expected JSON but received \n ${response}`,);
    }


}