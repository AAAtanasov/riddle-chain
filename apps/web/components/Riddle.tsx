'use client';

import { BrowserProvider } from "ethers";
import { useEffect, useState } from "react";

import { OnchainRiddle__factory as riddleFactory } from "../lib/typechain-types/factories"
import { OnchainRiddle } from "../lib/typechain-types";


// Potential fix for type of ethereum
declare global {
    interface Window {
        ethereum?: any;
    }
}

// TODO: secure and listen to accountsChanged event. WARNING TO ME - changing accounts may not get the correct account, need to verify and test

// TODO: env variable
// Localhost
// const RIDDLE_CONTRACT_ADDRESS = '0x5FbDB2315678afecb367f032d93F642f64180aa3';
// Sepolia
const RIDDLE_CONTRACT_ADDRESS = '0x6d6DDe9c7C11bF4e0b495Ea17DF05d86e472C8a4';

// TODO: consider types for the react component
export default function Riddle() {
    const [riddle, setRiddle] = useState<string>('');
    const [account, setAccount] = useState(null);
    const [isActive, setIsActive] = useState(false);
    const [answer, setAnswer] = useState<string>('');
    // let contract: OnchainRiddle;
    let browserProvider: BrowserProvider;
    // const [provider, setProvider] = useState(null);
    // const [signer, setSigner] = useState(null);

    async function fetchRiddle(): Promise<void> {
        if (isWindowEthereumDefined()) {
            requestAccount();
            const browserProvider = fetchBrowserProvider();
            // TODO: define contract type from typechain
            const contract = riddleFactory.connect(RIDDLE_CONTRACT_ADDRESS, browserProvider);

            try {
                const data = await contract.riddle();
                console.log("Riddle data:", data);
                setRiddle(data);

                const isActive = await contract.isActive();
                setIsActive(isActive);
            } catch (error) {
                console.error("Error fetching riddle:", error);

            }
        }
    }

    useEffect(() => {
        fetchRiddle();
    }, []);

    function fetchBrowserProvider(): BrowserProvider {
        if (!browserProvider && isWindowEthereumDefined()) {
            browserProvider = new BrowserProvider(window.ethereum);

            const signer = browserProvider.getSigner();

            return browserProvider;
        }

        return browserProvider;
    }

    function isWindowEthereumDefined(): boolean {
        const isDefined = typeof window.ethereum !== 'undefined';

        if (!isDefined) {
            throw new Error("Ethereum object not found");
        }

        return isDefined;
    }

    async function requestAccount(): Promise<void> {
        if (isWindowEthereumDefined()) {
            try {
                await window.ethereum.request({ method: 'eth_requestAccounts' }, []);

            } catch (error) {
                console.error("Error requesting account:", error);
                throw error;
            }
        }
    }

    async function guessRiddle(): Promise<void> {
        if (!isActive || !answer || answer.trim() === '') {
            return;
        }

        console.log("Guessing riddle with answer:", answer);

        setIsActive(false);
        requestAccount();

        const browserProvider = fetchBrowserProvider();
        const signer = await browserProvider.getSigner();
        console.log("Signer: ", signer);

        const contract: OnchainRiddle = riddleFactory.connect(RIDDLE_CONTRACT_ADDRESS, signer);
        const answerEvent = contract.getEvent('AnswerAttempt');

        try {
            contract.on(answerEvent, (user: string, correct: boolean, event: any) => {
                console.log('AnswerAttempt event:', user, correct);
                if (user === signer.address) {
                    console.log('You guessed the riddle!');
                    if (correct) {
                        console.log('Correct answer!');
                    } else {
                        console.log('Incorrect answer.');
                    }

                    // stop listening for my event 
                    contract.off(answerEvent);
                }
            });

            // Making sure to trim the answer and convert it to lowercase for our ease of use
            const trimmedAnswer = answer.trim().toLowerCase();
            const data = await contract.submitAnswer(trimmedAnswer);
            console.log('data: ', data);
            await data.wait();

            // Resetting answer if all was succesful
            setAnswer('');
        } catch (error) {
            console.error("Error guessing riddle:", error);

        } finally {
            setIsActive(true);
        }
    }

    // TODO: add suspence to loading while waiting for check for transaction
    return (
        <div className="flex flex-col space-y-4">
            <h1>Riddle</h1>
            <label htmlFor="answer" className="text-2xl">Answer: {riddle}</label>
            <input id="answer" name="answer" type="text" className="p-4 m-2 bg-slate-300 rounded-xl border-4 border-lime-400" placeholder="Type your answer here..." value={answer} onChange={(e) => setAnswer(e.target.value)} />
            <button className="p-4 bg-lime-400 rounded-xl" disabled={!isActive} onClick={guessRiddle}>Submit</button>
        </div>
    )

}