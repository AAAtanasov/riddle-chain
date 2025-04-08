'use client';

import { useEffect, useState } from "react";
import { GuessModel } from "../lib/guess/guess.model";
import { BrowserProvider } from "ethers";
import { OnchainRiddle } from "../lib/typechain-types";
import { OnchainRiddle__factory as riddleFactory } from "../lib/typechain-types/factories"
import { GuessResult } from "../lib/guess/guess-result";
import Link from "next/link";


declare global {
    interface Window {
        ethereum?: any;
    }
}

export interface RiddleProps {
    contractAddress: string;
    guessRiddleCallback: (guess: GuessModel) => Promise<void>
}

export function RiddleContents({ contractAddress, guessRiddleCallback }: RiddleProps) {
    const [answer, setAnswer] = useState<string>('');
    const [username, setUsername] = useState<string>('');

    const [provider, setProvider] = useState<BrowserProvider | null>(null);
    const [network, setNetwork] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [account, setAccount] = useState<string | undefined>(undefined);
    const [riddle, setRiddle] = useState<string>('');
    const [isRiddleSolved, setIsRiddleSolved] = useState<boolean>(false);
    const [isGuessing, setIsGuessing] = useState(false);
    // const [guessResult, setGuessResult] = useState<GuessResult | null>(null);
    const [guessResult, setGuessResult] = useState<GuessResult | null>(null);


    useEffect(() => {
        if (typeof window !== 'undefined' && window.ethereum) {
            const ethersProvider = new BrowserProvider(window.ethereum);
            setProvider(ethersProvider);
            const contract = riddleFactory.connect(contractAddress, ethersProvider);
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

            const isRiddleActive = await contract.isActive();
            setIsRiddleSolved(!isRiddleActive);
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
        if (!provider) {
            console.error('Provider is not defined');
            return;
        }

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
        console.log('Attempting guess...');
        if (isGuessing) {
            console.log('Already guessing...');
            setError('Already guessing. Please wait.');
            return;
        }

        if (isRiddleSolved) {
            setError('Riddle is solved. Please wait shortly for a new one.');
        }

        setIsGuessing(true);
        setError(null);
        setGuessResult(null);

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
        const contract: OnchainRiddle = riddleFactory.connect(contractAddress, signer);

        const answerEvent = contract.getEvent('AnswerAttempt');

        try {
            // todo: on RiddleSet reload
            contract.on(answerEvent, (user: string, correct: boolean, event: any) => {
                console.log('AnswerAttempt event:', user, correct);
                debugger;
                if (user.toLowerCase() === account) {
                    console.log('You guessed the riddle!');
                    if (correct) {
                        console.log('Correct answer!');
                        setIsRiddleSolved(true);
                        setGuessResult({
                            isCorrect: true,
                            feedback: 'Correct answer! You solved the riddle!',
                        })
                    } else {
                        console.log('Incorrect answer.');
                        setGuessResult({
                            isCorrect: false,
                            feedback: 'Unfortunetely this was the wrong answer. Feel free to try again!',
                        })
                    }
                    // store guess here 

                    // stop listening for my event 
                    setIsGuessing(false);

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
        } catch (error) {
            console.error("Error guessing riddle:", error);
        }
    }

    const displaySlicedWallet = (wallet: string) => {
        if (wallet.length > 10) {
            return `${wallet.slice(0, 6)}...${wallet.slice(-4)}`;
        }
        return wallet;
    }

    return (
        <>
            {!!error && (
                <div className="flex max-w-md my-4 p-3 bg-red-100 text-red-700 rounded text-center">
                    {error}
                </div>
            )}

            <div className="flex mt-4 items-center justify-center">
                {isConnected ? (
                    <div className="space-y-3">
                        <button
                            onClick={disconnectWallet}
                            className="p-2 bg-orange-500 text-white rounded hover:bg-red-600"
                        >
                            Disconnect Wallet
                        </button>
                    </div>
                ) : (
                    <button
                        onClick={connectWallet}
                        disabled={!provider}
                        className="px-4 py-2 bg-lime-500 text-white rounded hover:bg-green-600 disabled:bg-gray-400"
                    >
                        Connect MetaMask Wallet
                    </button>
                )}
            </div>

            {!!account && (
                <>
                    <div className="flex justify-between items-center my-6">
                        <p className="font-semibold">Connected Account:</p>
                        <p className="text-gray-500">{displaySlicedWallet(account)}</p>
                    </div>
                    <div className="flex justify-between items-center my-6">
                        <p className="font-semibold">Alias</p>
                        <input type="text" required className="w-1/2 p-4 border border-gray-300 rounded-md placeholder:font-light" placeholder="Alias"
                            value={username} onChange={(e) => setUsername(e.target.value)} />

                    </div>
                </>
            )}
            {riddle ? (
                <div className="flex justify-between items-center my-6 mx-4 text-center max-w-sm">
                    <p className=" text-2xl font-bold">{riddle}</p>
                </div>) : (
                <div className="flex justify-between items-center my-6 mx-4 text-center max-w-sm">
                    <p className=" text-2xl text-gray-500">Loading...</p>
                </div>
            )}

            {!!guessResult && (
                <div className="flex max-w-md items-center justify-center">
                    <div className={`w-full my-4 p-3 rounded-md text-center ${guessResult.isCorrect ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'} `} >
                        {guessResult.feedback}
                    </div >
                </div>

            )
            }

            <input type="text" className="w-full p-4 border border-gray-300 rounded-md placeholder:font-light" placeholder="Enter your guess..."
                value={answer} onChange={(e) => setAnswer(e.target.value)} />

            <div className="flex flex-col items-center mt-8">
                <button disabled={!isConnected || isRiddleSolved || isGuessing} onClick={attemptGuess} className="w-full md:width-auto flex justify-center
                     items-center p-6 font-bold rounded-md  disabled:bg-gray-500
                    shadow-lg px-9 bg-lime-500 hover:bg-opacity-90 hover:shadow-lg border transition hover:-translate-y-0.5 duration-250" >{isGuessing ? 'Guessing...' : 'Submit'}</button>
            </div>

            <div className="flex items-center justify-center mt-8">
                <Link href="/history" className="text-blue-500 hover:underline">View history...</Link>

            </div>
        </>
    );
}