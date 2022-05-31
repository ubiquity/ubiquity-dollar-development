import "@nomiclabs/hardhat-ethers";
import "@nomiclabs/hardhat-etherscan";
import "@nomiclabs/hardhat-waffle";
import "@typechain/hardhat";
import * as dotenv from "dotenv";
import fs from "fs";
import "hardhat-deploy";
import "hardhat-gas-reporter";
import { HardhatUserConfig } from "hardhat/types";
import path from "path";
import "solidity-coverage";
import { colorizeText } from './tasks/utils/console-colors';
import namedAccounts from "../../fixtures/named-accounts.json";

// @ts-expect-error
namedAccounts.ubq = {
  default: "0xefC0e701A824943b469a694aC564Aa1efF7Ab7dd", //  without UBQ => impersonate
  mainnet: 0, // use default account 0 with UBQ (of same address !) on mainnet
};

dotenv.config();
dotenv.config({ path: "../../.env" });

loadHardHatTasks();

const GAS_PRICE = "auto"; // 20000000000;
const { MNEMONIC, REPORT_GAS } = process.env;
const accounts = { mnemonic: "test test test test test test test test test test test junk", }; // use default accounts

if (!MNEMONIC) {
  warn("MNEMONIC environment variable unset");
} else {
  accounts.mnemonic = MNEMONIC;
}

const config: HardhatUserConfig = {
  solidity: {
    compilers: [
      {
        version: "0.8.3",
        settings: {
          optimizer: {
            enabled: true,
            runs: 800,
          },
          metadata: {
            // do not include the metadata hash, since this is machine dependent
            // and we want all generated code to be deterministic
            // https://docs.soliditylang.org/en/v0.7.6/metadata.html
            bytecodeHash: "none",
          },
        },
      },
    ],
  },

  mocha: {
    timeout: 1000000,
  },
  namedAccounts,

  /*
  paths: {
    deploy: "./scripts/deployment",
    deployments: "./deployments",
    sources: "./contracts",
    tests: "./tests",
    cache: "./cache",
    artifacts: "./artifacts",
  },
  */

  networks: {
    localhost: {
      url: `http://127.0.0.1:8545`,
      forking: {
        url: getAlchemyRpc("mainnet"),
        // blockNumber: 13252206,
      },
      accounts,
      hardfork: "london",
      initialBaseFeePerGas: 0,
    },
    hardhat: {
      forking: {
        url: getAlchemyRpc("mainnet"),
        // blockNumber: 13252206,
      },
      accounts,
      hardfork: "london",
      initialBaseFeePerGas: 0,
    },
    mainnet: {
      url: getAlchemyRpc("mainnet"),
      accounts: process.env.UBQ_ADMIN ? [process.env.UBQ_ADMIN] : accounts,
      gasPrice: GAS_PRICE,
    },
    ropsten: {
      gasPrice: GAS_PRICE,
      url: getAlchemyRpc("ropsten"),
      accounts,
    },
    rinkeby: {
      gasPrice: GAS_PRICE,
      url: getAlchemyRpc("rinkeby"),
      accounts,
    },
  },
  typechain: {
    outDir: "artifacts/types",
    target: "ethers-v5",
  },
  gasReporter: {
    enabled: REPORT_GAS === "true",
    currency: "USD",
    // gasPrice: 20,
    onlyCalledMethods: true,
    coinmarketcap: getKey("COINMARKETCAP"),
  },
  etherscan: {
    // Your API key for Etherscan
    // Obtain one at https://etherscan.io/
    apiKey: getKey("ETHERSCAN"),
  },
};

export default config;

function loadHardHatTasks() {
  if (fs.existsSync(path.join(__dirname, "artifacts/types"))) {
    import("./tasks/index");
  } else {
    warn("Tasks loading skipped until compilation artifacts are available");
  }
}

function getAlchemyRpc(network: "mainnet" | "ropsten" | "rinkeby"): string {
  // This will try and resolve alchemy key related issues
  // first it will read the key value
  // if no value found, then it will attempt to load the .env from above to the .env in the current folder
  // if that fails, then it will throw an error and allow the developer to rectify the issue
  if (process.env.API_KEY_ALCHEMY?.length) {
    return `https://eth-${network}.alchemyapi.io/v2/${process.env.API_KEY_ALCHEMY}`;
  }
  else {
    throw new Error("Please set the API_KEY_ALCHEMY environment variable to your Alchemy API key");
  }
}

function getKey(keyName: "ETHERSCAN" | "COINMARKETCAP") {
  const PREFIX = "API_KEY_";
  const ENV_KEY = PREFIX.concat(keyName);
  if (process.env[ENV_KEY]) {
    return process.env[ENV_KEY] as string
  }
  else {
    warn(`Please set the ${ENV_KEY} environment variable to your ${keyName} API key`)
  }
}

function warn(message: string) {
  console.warn(colorizeText(`\t⚠ ${message}`, "fgYellow"))
}
