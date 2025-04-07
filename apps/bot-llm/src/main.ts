import { startListeners } from "./bot-server";

async function main() {
    await startListeners();
}

try {
    console.log("Starting bot-llm...");

    main();
} catch (error) {
    // TODO: handle with winston, make sure that the process doesn't die on error and keeps running
    console.error("Error in bot-llm:", error);
}
