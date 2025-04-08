'use client';

import { useEffect, useState } from "react";
import { GuessModel } from "../lib/guess/guess.model";
import { BrowserProvider } from "ethers";
import { OnchainRiddle } from "../lib/typechain-types";
import { OnchainRiddle__factory as riddleFactory } from "../lib/typechain-types/factories"

// TODO: use .env file
const RIDDLE_CONTRACT_ADDRESS = '0x5FbDB2315678afecb367f032d93F642f64180aa3';


export interface RiddleProps {
    riddle: string;
    // account: string | null;

    guessRiddleCallback: (guess: GuessModel) => Promise<void>
}

export function RiddleContents({ guessRiddleCallback }: RiddleProps) {
    // const [riddle, setRiddle] = useState<string>('');
    // const [account, setAccount] = useState(null);
    const [isActive, setIsActive] = useState(false);
    const [answer, setAnswer] = useState<string>('');
    const [username, setUsername] = useState<string>('');

    const [provider, setProvider] = useState<BrowserProvider | null>(null);
    const [network, setNetwork] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [account, setAccount] = useState<string | undefined>(undefined);
    const [riddle, setRiddle] = useState<string>(''); // Assuming riddle is passed as a prop

    useEffect(() => {
        if (typeof window !== 'undefined' && window.ethereum) {
            const ethersProvider = new BrowserProvider(window.ethereum);
            setProvider(ethersProvider);
            const contract = riddleFactory.connect(RIDDLE_CONTRACT_ADDRESS, ethersProvider);
            fetchRiddle(contract);

            // Check if already connected
            checkConnection(ethersProvider);

            // Set up event listeners
            window.ethereum.on('accountsChanged', handleAccountsChanged);
            window.ethereum.on('chainChanged', handleChainChanged);

            return () => {
                window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
                window.ethereum.removeListener('chainChanged', handleChainChanged);
            };
        } else {
            setError('MetaMask is not installed. Please install it to use this feature.');
        }
    }, []);

    async function fetchRiddle(contract: OnchainRiddle) {
        try {
            const data = await contract.riddle();
            console.log("Riddle data:", data);
            setRiddle(data);

            // TODO: for inactive yet riddle
            // isActive = await contract.isActive();
        } catch (error) {
            console.error("Error fetching riddle:", error);

        }
    }

    const checkConnection = async (provider: BrowserProvider) => {
        try {
            const accounts = await provider.send('eth_accounts', []);
            if (accounts.length > 0) {
                setAccount(accounts[0]);
                setIsConnected(true);
                await updateNetwork(provider);
            }
        } catch (err) {
            console.error('Error checking connection:', err);
        }
    };

    const connectWallet = async () => {
        if (!provider) return;

        try {
            const accounts = await provider.send('eth_requestAccounts', []);
            setAccount(accounts[0]);
            setIsConnected(true);
            await updateNetwork(provider);
            setError(null);
        } catch (err) {
            console.error('Error connecting:', err);
            setError('Failed to connect wallet. Please try again.');
        }
    };

    const disconnectWallet = () => {
        setIsConnected(false);
        setAccount(undefined);
        setNetwork(null);
    };

    const handleAccountsChanged = (accounts: string[]) => {
        console.log('Accounts changed:', accounts);
        if (accounts.length === 0) {
            disconnectWallet();
        } else {
            setAccount(accounts[0]);
        }
    };

    const handleChainChanged = () => {
        if (provider) {
            updateNetwork(provider);
        }
    };

    const updateNetwork = async (provider: BrowserProvider) => {
        try {
            const network = await provider.getNetwork();
            setNetwork(network.name);
        } catch (err) {
            console.error('Error getting network:', err);
            setNetwork('unknown');
        }
    };

    const attemptGuess = async () => {
        debugger;
        console.log('Attempting guess...');
        if (isActive) {
            console.log('Already guessing...');
            return;
        }
        setIsActive(false);

        // TODO: validation
        const guessModel: GuessModel = {
            answer,
            username,
            id: 0,
            wallet: account!,
            isCorrect: false,
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        if (!provider) {
            throw new Error("Provider is not defined");
        }
        const signer = await provider.getSigner();
        const contract: OnchainRiddle = riddleFactory.connect(RIDDLE_CONTRACT_ADDRESS, signer);

        // TODO
        // await guessRiddleCallback(guessModel);

        const answerEvent = contract.getEvent('AnswerAttempt');

        try {
            // todo: on RiddleSet reload
            contract.on(answerEvent, (user: string, correct: boolean, event: any) => {
                console.log('AnswerAttempt event:', user, correct);
                if (user === account) {
                    console.log('You guessed the riddle!');
                    if (correct) {
                        console.log('Correct answer!');
                    } else {
                        console.log('Incorrect answer.');
                    }
                    // store guess here 

                    // stop listening for my event 
                    contract.off(answerEvent);
                }
            });

            // Making sure to trim the answer and convert it to lowercase for our ease of use
            const trimmedAnswer = answer.trim().toLowerCase();
            const data = await contract.submitAnswer(trimmedAnswer);
            console.log('data: ', data);
            await guessRiddleCallback(guessModel);
            await data.wait();

            // Resetting answer if all was succesful
            setAnswer('');
            // await 
        } catch (error) {
            console.error("Error guessing riddle:", error);

        }

        // setAnswer('');
        setIsActive(true);
    }

    return (
        <div className="flex flex-col space-y-4">
            <button onClick={attemptGuess}>Test</button>
            <h1>Riddle</h1>
            <label htmlFor="username" className="text-2xl">Username: </label>
            <input id="username" name="username" type="text" className="p-4 m-2 bg-slate-300 rounded-xl border-4 border-lime-400" placeholder="Do you want a name?" value={username} onChange={(e) => setUsername(e.target.value)} />
            <label htmlFor="answer" className="text-2xl">Answer: {riddle}</label>
            <input id="answer" name="answer" type="text" className="p-4 m-2 bg-slate-300 rounded-xl border-4 border-lime-400" placeholder="Type your answer here..." value={answer} onChange={(e) => setAnswer(e.target.value)} />
            <button className="p-4 bg-lime-400 rounded-xl" disabled={!isActive} onClick={attemptGuess}>Submit</button>

            <div className="flex">
                <div>
                    <h2 className="text-xl font-semibold mb-4">Wallet Connection</h2>

                    {error && (
                        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
                            {error}
                        </div>
                    )}

                    {isConnected ? (
                        <div className="space-y-3">
                            <p><strong>Status:</strong> Connected</p>
                            <p><strong>Account:</strong> {account?.slice(0, 6)}...{account?.slice(-4)}</p>
                            <p><strong>Network:</strong> {network}</p>
                            <button
                                onClick={disconnectWallet}
                                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                            >
                                Disconnect Wallet
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={connectWallet}
                            disabled={!provider}
                            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400"
                        >
                            Connect MetaMask Wallet
                        </button>
                    )}
                </div>
            </div>
        </div>

    );
}