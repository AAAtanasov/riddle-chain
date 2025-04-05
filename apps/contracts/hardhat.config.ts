import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import { config as dotenvConfig } from "dotenv";

// TODO: load based on environment, should use hardhat vars but for now we use dotenv
dotenvConfig({ path: __dirname + "/.env.local" });

const { DEPLOYER_PRIVATE_KEY, INFURA_API_KEY, PRIVATE_KEY } = process.env;

// if (!DEPLOYER_PRIVATE_KEY) {
//   throw new Error("DEPLOYER_PRIVATE_KEY is not defined");
// }

const config: HardhatUserConfig = {
  solidity: "0.8.28",
  networks: {
    hardhat: {
      chainId: 1337,
      // accounts: [
      //   { privateKey: DEPLOYER_PRIVATE_KEY || "", balance: "10000000000000000000000" },
      // ]
    },
    sepolia: {
      url: `https://sepolia.infura.io/v3/${INFURA_API_KEY}`,
      accounts: [`0x${PRIVATE_KEY}`]
    }
  }
};

export default config;
