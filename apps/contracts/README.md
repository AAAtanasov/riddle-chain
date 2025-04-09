# Contracts project

This project contains the `OnchainRiddle.sol` contract and the test that came with it. It has a script inside it that utilizes Hardhat ignition modules in order to deploy the smart contract. It is used for local development to start a local hardhat node that can be used for development using 

> `npx hardhat node`

It contains the typechain dependency, which was used to generate the types for the smart contract. The current configuration is defined for:

- localhost
- sepolia

Make sure to add your `.env` variables correctly in order to deploy a contract. Instructions on which variable does what can be seen in the main README.

