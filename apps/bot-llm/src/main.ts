import { LLMService } from "./llm-service.interface";
import { OpenAiService } from "./openai-llm/openai.service";
import path from "path";
import { config } from "dotenv";

// TODO: load based on environment
config({ path: path.resolve(__dirname, '../.env.local') });


async function main() {
    console.log("Starting bot-llm...");

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
        throw new Error("API key is not defined");
    }

    const llmService: LLMService = new OpenAiService(apiKey);

    const riddle = await llmService.getRiddle();
    console.log("Generated riddle:", riddle);

    // listen for blockchain changes and invoke riddle change then
}

try {
    main();
} catch (error) {
    // TODO: handle with winston, make sure that the process doesn't die on error and keeps running
    console.error("Error in bot-llm:", error);
}
