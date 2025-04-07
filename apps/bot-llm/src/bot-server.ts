import { ethers } from "ethers";
import { OnchainRiddle, OnchainRiddle__factory as riddleFactory } from "./lib/typechain-types";

// const urlToConnect = "wss://sepolia.infura.io/ws/v3";
// const urlToConnect = "https://sepolia.infura.io/v3";

/**
 *  Starts a simple listening process for the riddle contract.
 * @param infuraKey Key to RPC node.
 * @param contractAddress Adress of contract for which we want to listen to.
 * @param privateKey The deployer key used to set the new riddle.
 */
export async function startListeners(infuraKey: string, contractAddress: string, privateKey: string): Promise<void> {
    try {
        // const provider = new ethers.JsonRpcProvider(`${urlToConnect}/${infuraKey}`);
        // const provider = new ethers.JsonRpcProvider('http://127.0.0.1:8545/');
        const provider = new ethers.WebSocketProvider('http://127.0.0.1:8545/');

        console.log("Connected to provider");

        const riddleContract: OnchainRiddle = riddleFactory.connect(contractAddress, provider);
        console.log("Listening to contract events...");

        // TOdo: check if riddle is set - if not set it 

        const answerEvent = riddleContract.getEvent('AnswerAttempt');


        riddleContract.on(answerEvent, (user: string, correct: boolean, event: any) => {
            const timestamp = new Date().toISOString();
            console.log(`[${timestamp}] Answer attempt detected!`);
            console.log(`User: ${user}`);
            console.log(`Correct: ${correct}`);
        });

        console.log('Event listeners initialized. Waiting for events...');

        process.stdin.resume();

        process.on('SIGINT', () => {
            console.log('Shutting down event listener...');
            // Unsubscribe from all events
            riddleContract.removeAllListeners();
            process.exit(0);
        });


    } catch (error) {
        console.error('Error in event listener:', error);
        process.exit(1);
    }
}