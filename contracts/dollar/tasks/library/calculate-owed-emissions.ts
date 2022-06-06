import "@nomiclabs/hardhat-waffle";
import "hardhat-deploy";
import { types } from "hardhat/config";
import { Network } from "hardhat/types";
import { ActionType, HardhatRuntimeEnvironment } from "hardhat/types/runtime";
import { contracts } from "../../../../fixtures/ubiquity-dollar-deployment.json";
import { UbiquityGovernance } from "../../artifacts/types/UbiquityGovernance";
import { getAlchemyRpc } from "../../hardhat.config";
import { vestingRange } from "./distributor/";
import blockHeightDater from "./distributor/utils/block-height-dater";
import { verifyMinMaxBlockHeight } from "./distributor/utils/distributor-helpers";
import { TaskArgs } from "./distributor/utils/distributor-types";
import { UbiquityAlgorithmicDollarManager } from "../../artifacts/types/UbiquityAlgorithmicDollarManager";
import { HardhatEthersHelpers } from "@nomiclabs/hardhat-ethers/types";

const ubiquityGovernanceTokenAddress = "0x4e38D89362f7e5db0096CE44ebD021c3962aA9a0";

module.exports = {
  description: "Calculates the amount of owed UBQ emissions since the beginning of the vesting schedule", // { "percent": number, "address": string, "name": string }[]
  optionalParams: {
    token: ["Token address", ubiquityGovernanceTokenAddress, types.string],
  },
  action: (): ActionType<any> => calculateOwedUbqEmissions,
};

async function vestingMath(args, hre) {
  // below comments written on 7 june 2022

  const may2022 = 1651363200000;
  const may2024 = 1714521600000;

  const msTotal = may2024 - may2022; // 63158400000
  const msSinceStart = Date.now() - may2022; // 3177932875;
  const percentVested = msSinceStart / msTotal; // 0.05031686799

  const tenPercentOfTotalSupply = (await getTotalSupply(args, hre)) * 0.1;

  const investorsShouldGet = tenPercentOfTotalSupply * percentVested;
  return investorsShouldGet; // 18,487.0939406307
}

export async function calculateOwedUbqEmissions(taskArgs: TaskArgs, hre: HardhatRuntimeEnvironment) {
  const startingBlock = 14688630; // 2022-05-01T00:00:00.000Z
  const totalStartingSupply = 3336654.633062916928931166; // can run checkMay1StartingSupply(hre) to verify
  return { startingBlock, totalStartingSupply };
}

async function setBlockHeight(network: Network, blockHeight: number) {
  console.log(`Setting block height to ${blockHeight}...`);
  const response = await network.provider.request({
    method: "hardhat_reset",
    params: [
      {
        forking: {
          jsonRpcUrl: getAlchemyRpc("mainnet"),
          blockNumber: blockHeight,
        },
      },
    ],
  });
  console.log(`...done!`);
  return response;
}

interface GetTotalSupply {
  ethers: typeof import("/Users/nv/repos/ubiquity/ubiquity-dollar-development/contracts/dollar/node_modules/ethers/lib/ethers") & HardhatEthersHelpers;
}

async function getTotalSupply(_taskArgs: any, { ethers }: GetTotalSupply) {
  const manager = (await ethers.getContractAt(
    "UbiquityAlgorithmicDollarManager",
    "0x4DA97a8b831C345dBe6d16FF7432DF2b7b776d98"
  )) as UbiquityAlgorithmicDollarManager;
  const ubqTokenAddress = await manager.governanceTokenAddress();
  const ubqToken = (await ethers.getContractAt("UbiquityGovernance", ubqTokenAddress)) as UbiquityGovernance;
  const totalSupply = ethers.utils.formatEther(await ubqToken.totalSupply());
  return parseInt(totalSupply);
}

async function checkMay1StartingSupply(hre: HardhatRuntimeEnvironment) {
  const timestampsDated = await blockHeightDater(vestingRange); // "2022-05-01T00:00:00.000Z" // this should only be one date instead of a range (two)
  const range = await verifyMinMaxBlockHeight(timestampsDated);
  const startingBlock = range[0]?.block;
  await setBlockHeight(hre.network, startingBlock);
  const ubqToken = (await getContractInstance("UbiquityGovernance")) as UbiquityGovernance;
  const totalStartingSupply = hre.ethers.utils.formatEther(await ubqToken.totalSupply());
  return totalStartingSupply; // 14688630

  async function getContractInstance(name: keyof typeof contracts) {
    if (!contracts[name]) {
      throw new Error(`Contract ${name} not found in list ${Object.keys(contracts)}`);
    }
    return await hre.ethers.getContractAt(name, contracts[name].address);
  }
}
