import "@nomiclabs/hardhat-waffle";
import { ActionType } from "hardhat/types/runtime";
import { UbiquityAlgorithmicDollarManager } from "../../artifacts/types/UbiquityAlgorithmicDollarManager";

module.exports = {
  description: "Get info about manager contract's address",
  action:
    (): ActionType<any> =>
    async (_taskArgs, { ethers }) => {
      const network = await ethers.provider.getNetwork();
      const managerAdr = "0x4DA97a8b831C345dBe6d16FF7432DF2b7b776d98";
      const debtCouponMgrAdr = "0x432120Ad63779897A424f7905BA000dF38A74554";
      if (network.name === "hardhat") {
        console.warn("You are running the   task with Hardhat network");
      }
      console.log(`net chainId: ${network.chainId}  `);
      const manager = (await ethers.getContractAt("UbiquityAlgorithmicDollarManager", managerAdr)) as UbiquityAlgorithmicDollarManager;

      const spreadsheet = {
        [await manager.twapOracleAddress()]: "mgrtwapOracleAddress",
        [await manager.debtCouponAddress()]: "mgrdebtCouponAddress",
        [await manager.dollarTokenAddress()]: "mgrDollarTokenAddress",
        [await manager.couponCalculatorAddress()]: "mgrcouponCalculatorAddress",
        [await manager.dollarMintingCalculatorAddress()]: "mgrdollarMintingCalculatorAddress",
        [await manager.bondingShareAddress()]: "mgrbondingShareAddress",
        [await manager.bondingContractAddress()]: "mgrbondingContractAddress",
        [await manager.stableSwapMetaPoolAddress()]: "mgrstableSwapMetaPoolAddress",
        [await manager.curve3PoolTokenAddress()]: "mgrcurve3PoolTokenAddress",
        [await manager.treasuryAddress()]: "mgrtreasuryAddress",
        [await manager.governanceTokenAddress()]: "mgruGOVTokenAddress",
        [await manager.sushiSwapPoolAddress()]: "mgrsushiSwapPoolAddress",
        [await manager.masterChefAddress()]: "mgrmasterChefAddress",
        [await manager.formulasAddress()]: "mgrformulasAddress",
        [await manager.autoRedeemTokenAddress()]: "mgrautoRedeemTokenAddress",
        [await manager.uarCalculatorAddress()]: "mgruarCalculatorAddress",
        [await manager.getExcessDollarsDistributor(debtCouponMgrAdr)]: "mgrExcessDollarsDistributor",
      };

      console.table(spreadsheet);
    },
};
