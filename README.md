# Riddle chain 

This is a demo application built as a challenge. The goal was to implement the [smart contract](https://github.com/poppyseedDev/solidity-riddle/blob/main/contracts/OnchainRiddle.sol) and utilize it to store and read riddles.

## Project structure

This is project structured as a monorepo and created using [Turborepo](https://turbo.build/docs/getting-started/examples). The project contains 3 sub-repos which contain the following:

- `bot-llm`: Project connecting to an LLM and listening to a smart contract events
- `contracts`: Project responsible for deployment of smart contracts 
- `web`: A nextjs application containing the FrontEnd application that displays riddles. It uses `Tailwind CSS` for styling.

The default package manager is `pnpm`. Each project has their own `.env` file configurations, examples can be seen in `.env.example` in each directory. Further details about each project can be seen in their respective `README.md` files. 

The project is **work in-progress-ish and very likely to have unhandled bugs**. There is no Docker configuration currently setup. Present are files which do not function and must change in order for the process to work. Despite this *Docker is used to host and run a local Database* using [PostgresSQL](https://www.postgresql.org/) so is required.

The tested version of this repository works with **Node 22**. 
 
## Starting the project

There are two considered use cases - testing on a [Hardhat](https://hardhat.org/) node or using Sepolia network. Below are detailed instructions for both approaches.

### Using Hardhat
- In root folder execute `pnpm install`
- Navigate to `apps/contracts`
- Copy `.env.example` to a file `.env.local`. The env variables are the default keys coming with hardhat, they are publicly known.
- Navigate to `apps/contracts` and execute `npx hardhat node`. This starts a **local hardhat node** on address `http://127.0.0.1:8545/`. Should the ports be taken adjustments will need to be made.
- In a new terminal again from apps/contracts execute `pnpm deploy-riddle —network localhost` - this deploys the contracts and sets an initial riddle. Expect to see `First riddle set successfully!` as last line of logs. 
- From the root directory execute `docker-compose up`. Feel free to use `docker-compsoe up -d` to start in detached mode. This prepares the postgres container to be used as database for the web application.
- Navigate to `apps/web` and copy `.env.example` to `.env.local`. You can use it as is since we keep the env variables the same for the local node. 
- Execute `pnpm init-prisma` in context of `apps/web` - your database should now be set.
- Navigate to `apps/bot-llm` and copy the `.env.example` file. **You need to enter your own OpenAI key**, you can get one from [the platform openAI site](https://platform.openai.com/). The other values can be kept the same, `INFURA_API_KEY` is not required for hardhat test.
- In the root folder execute `pnpm dev`. You should be able to open the application on http://localhost:3000/ and test it.
- **BEFORE TESTING LOCALLY** Locally make sure you have [metamask](https://metamask.io/) installed on your browser. You need to also add a custom network and change to it in order for you to see riddles from your local network. You can find support on adding a custom network on this [link](https://support.metamask.io/configure/networks/how-to-add-a-custom-network-rpc/). As a guideline you can set
```
Network name - localhost
Default RPC URL - http://127.0.0.1:8545/
ChainID - 1337
Currency symbol - ETH
Block expror URL - http://127.0.0.1:8545/
```	
- In order to also to have funds in your account you can import the default hardhat account with it's private key, existing in the `.env.example` in `bot-llm` under `DEPLOYER_PRIVATE_KEY`. On how to import an account into Metamask you can follow this [resource](https://support.metamask.io/start/how-to-import-an-account/).
 	
- After all these steps the application can be tested and should work.

### Using Sepolia
- In root folder execute `pnpm install`
- Navigate to `apps/contracts`
- You will need to set the keys defined in `.env.example` in a `.env.local` file. You need to enter your account, exporting it from Metamask. You can find a guide on how you can do this [here](https://support.metamask.io/configure/accounts/how-to-export-an-accounts-private-key/). You will also need some testETH to pay for the transaction, make sure you have some available or request some from a faucet. For example - [chainlink](https://faucets.chain.link/) or [alchemy](https://www.alchemy.com/faucets/ethereum-sepolia).
- Make sure that you have both `DEPLOYER_PRIVATE_KEY` and `INFURA_API_KEY` set and then navigate to `apps/contracts` and execute `pnpm deploy-riddle --network sepolia` 
- After a succesful deployment you need to copy the contract address, it will be shown in the logs. You will need this for the other `.env` variables.
>`OnchainRiddle deployed to: 0x6d6DDe9c7C11bF4e0b495Ea17DF05d86e472C8a4`
- From the root directory execute `docker-compose up`. Feel free to use `docker-compsoe up -d` to start in detached mode. This prepares the postgres container to be used as database for the web application.
- Navigate to `apps/web` and copy `.env.example` to `.env.local`. Copy the deployed contract address to the `.env.example` file.
- While having the docker container running with the postgres db in `apps/web` execute `pnpm init-prisma`.
- Navigate to `apps/bot-llm` and copy the `.env.example` file. **You need to enter your own OpenAI key**. You can get one from [the platform openAI site](https://platform.openai.com/). You need to set also your own `DEPLOYER_PRIVATE_KEY` - needs to be the same as the one in `app/contracts`. You must also add `INFURA_API_KEY`, which you can obtain from [here](https://developer.metamask.io/login). You are allowed 3M credits which are plenty for test purpouses. 
- In the root folder execute `pnpm dev`. You should be able to open the application on http://localhost:3000/ and test it.
- Make sure that you are using Metamask wallet and you have set your Network to Sepolia. There is a known bug for no riddles being loaded and no error being shown if the selected network is localhost.
