import { LLMService } from "./llm-service.interface";
import { OpenAiService } from "./openai-llm/openai.service";
import { config } from "dotenv";

config();


async function main() {
    // TODO: Implement the bot logic
    const llmService: LLMService = new OpenAiService();

    const riddle = await llmService.getRiddle();
    console.log("Generated riddle:", riddle);

    // listen for blockchain changes and invoke riddle change then
}

try {
    main();
} catch (error) {
    console.error("Error in bot-llm:", error);
}
