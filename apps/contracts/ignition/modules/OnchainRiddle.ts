import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";


const OnchainRiddleModule = buildModule("OnchainRiddleModule", (m) => {
    console.log('OnchainRiddleModule deeeepl');
    const deployer = m.getAccount(0);
    if (!deployer) {
        throw new Error("No deployer account found!");
    }
    const riddle = m.contract("OnchainRiddle", [], {
        from: deployer,
    });

    return { riddle };
});

export default OnchainRiddleModule;

