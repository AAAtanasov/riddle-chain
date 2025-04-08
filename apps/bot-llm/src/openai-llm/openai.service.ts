import { ChatOpenAI } from "@langchain/openai";
import { LLMService } from "../llm-service.interface";
import { RiddleModel } from "../riddle/riddle.model";


export class OpenAiService implements LLMService {
    private readonly model: ChatOpenAI;

    /**
     * Initializes the OpenAiService with the provided API key. It sets up the OpenAI to have temperature 0.4 indicating how "creative" the model should be.
     * @param apiKey - OpenAI API key
     */
    constructor(apiKey: string) {
        this.model = new ChatOpenAI({ model: "gpt-4o-mini", temperature: 1, openAIApiKey: apiKey });
    }

    public async generateRiddle(oldRiddle: string): Promise<RiddleModel> {
        if (!oldRiddle) {
            throw new Error("Old riddle is required.");
        }
        const prompt = this.getPromptMessage(oldRiddle);

        const response = await this.model.invoke(prompt);

        console.log("Response from OpenAI:", response?.content);

        if (response?.content) {
            const riddle: RiddleModel = this.parseResponse(response?.content.toString());
            console.log("Parsed response:", riddle);

            return riddle;
        } else {
            // Potential improvement: consider global  error handling library as winston
            console.error(response);
            throw new Error("No response from OpenAI");
        }
    }

    private getPromptMessage(oldRiddle: string): string {
        // Potential expansion: could add a topic for the riddle, could add difficulty level, can use a prompt but a simple string is enough for now
        const message = `
            Generate a creative riddle with its answer. Return the response in json format following the example:
            
            {question: "string", answer: "string"}
            
            Avoid using prepositions for the answer - make it concise and clear.
            The riddle must not be similar to: "${oldRiddle}".
          `;

        return message;

    }

    private parseResponse(response: string): RiddleModel {
        const jsonRegex = /(\{.*\})/s;
        const match = response.match(jsonRegex);

        if (match && match[1]) {
            try {
                const test: RiddleModel = JSON.parse(match[1]);
                // Need to make sure that the answer is lowercase for correct comparison
                return { question: test.question, answer: test.answer.trim().toLowerCase() };
            } catch (error) {
                console.error("Error parsing JSON:", error);
                throw new Error(`Failed to parse JSON response: ${error}`);

            }
        };

        throw new Error(`Invalid response format, expected JSON but received \n ${response}`,);
    }


}