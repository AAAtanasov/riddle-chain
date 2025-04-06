import hre from "hardhat";
import OnchainRiddleModule from "../ignition/modules/OnchainRiddle";

async function main() {
    console.log("Deploying contracts...");

    const { riddle } = await hre.ignition.deploy(OnchainRiddleModule);

    console.log("OnchainRiddle deployed to:", riddle.target);

    const exampleRiddle: string = "I add flavor to your dishes and keep your hash safe. What am I?";
    // when testing need to lower the answer 
    const riddleAnswer: string = "salt";
    const answerHash = "0x" + Buffer.from(hre.ethers.keccak256(hre.ethers.toUtf8Bytes(riddleAnswer)).slice(2), 'hex').toString('hex');

    console.log("Setting first initial riddle...");
    await riddle.setRiddle(exampleRiddle, answerHash);
    console.log("First riddle set successfully!");

}

main().catch(console.error);