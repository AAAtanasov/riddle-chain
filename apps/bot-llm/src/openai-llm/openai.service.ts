import { ChatOpenAI } from "@langchain/openai";
import { LLMService } from "../llm-service.interface";
import { PromptTemplate } from "@langchain/core/prompts";

export class OpenAiService implements LLMService {
    private readonly model: ChatOpenAI;

    constructor() {
        this.model = new ChatOpenAI({ model: "gpt-4", temperature: 0.1 });
    }

    public async getRiddle(): Promise<string> {
        const prompt = this.getPromptMessage();

        const response = await this.model.invoke(prompt.toString());

        console.log("Response from OpenAI:", response?.content);


        return 'test';

    }

    private getPromptMessage(): PromptTemplate {
        // Potential expansion: could add a topic for the riddle

        return PromptTemplate.fromTemplate(`
            Generate a creative riddle with its answer. Return the response in json format following the example:
            
            {question: "string", answer: "string"}
            
            Make it clever but not too difficult.
          `);

    }


}