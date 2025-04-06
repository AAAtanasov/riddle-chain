'use client';

import { BrowserProvider } from "ethers";
import { useEffect, useState } from "react";

import { OnchainRiddle__factory as riddleFactory } from "../lib/typechain-types/factories"


// Potential fix for type of ethereum
declare global {
    interface Window {
        ethereum?: any;
    }
}

// Localhost
const RIDDLE_CONTRACT_ADDRESS = '0x5FbDB2315678afecb367f032d93F642f64180aa3';
// Sepolia
// const RIDDLE_CONTRACT_ADDRESS = '0x6d6DDe9c7C11bF4e0b495Ea17DF05d86e472C8a4';

// TODO: consider types for the react component
export default function Riddle() {
    const [riddle, setRiddle] = useState<string>('');

    async function fetchRiddle() {
        if (typeof window.ethereum !== 'undefined') {
            const browserProvider = new BrowserProvider(window.ethereum);
            // TODO: define contract type from typechain
            const contract = riddleFactory.connect(RIDDLE_CONTRACT_ADDRESS, browserProvider);

            try {
                const data = await contract.riddle();
                console.log("Riddle data:", data);
                setRiddle(data);
            } catch (error) {
                console.error("Error fetching riddle:", error);

            }

        } else {
            throw new Error("Ethereum object not found");
        }
    }

    useEffect(() => {
        fetchRiddle();
    }, []);

    return (
        <div className="flex flex-col">
            <h1>Riddle</h1>
            <p className="text-2xl">Riddle: {riddle}</p>
        </div>
    )

}