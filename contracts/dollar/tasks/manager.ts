import { task } from "hardhat/config";
import "@nomiclabs/hardhat-waffle";
import { UbiquityAlgorithmicDollarManager } from "../artifacts/types/UbiquityAlgorithmicDollarManager";
// This file is only here to make interacting with the Dapp easier,
// feel free to ignore it if you don't need it.

task("manager", "Get info about manager contract's address").setAction(
  async (taskArgs: { receiver: string; manager: string }, { ethers }) => {
    const net = await ethers.provider.getNetwork();
    const managerAdr = "0x4DA97a8b831C345dBe6d16FF7432DF2b7b776d98";
    const debtCouponMgrAdr = "0x432120Ad63779897A424f7905BA000dF38A74554";
    if (net.name === "hardhat") {
      console.warn("You are running the   task with Hardhat network");
    }
    console.log(`net chainId: ${net.chainId}  `);
    const manager = (await ethers.getContractAt(
      "UbiquityAlgorithmicDollarManager",
      managerAdr
    )) as UbiquityAlgorithmicDollarManager;


    const spreadsheet = {
      "mgrtwapOracleAddress": await manager.twapOracleAddress(),
      "mgrdebtCouponAddress": await manager.debtCouponAddress(),
      "mgrDollarTokenAddress": await manager.dollarTokenAddress(),
      "mgrcouponCalculatorAddress": await manager.couponCalculatorAddress(),
      "mgrdollarMintingCalculatorAddress": await manager.dollarMintingCalculatorAddress(),
      "mgrbondingShareAddress": await manager.bondingShareAddress(),
      "mgrbondingContractAddress": await manager.bondingContractAddress(),
      "mgrstableSwapMetaPoolAddress": await manager.stableSwapMetaPoolAddress(),
      "mgrcurve3PoolTokenAddress": await manager.curve3PoolTokenAddress() /* 3CRV */,
      "mgrtreasuryAddress": await manager.treasuryAddress(),
      "mgruGOVTokenAddress": await manager.governanceTokenAddress(),
      "mgrsushiSwapPoolAddress": await manager.sushiSwapPoolAddress() /* sushi pool uAD-uGOV */,
      "mgrmasterChefAddress": await manager.masterChefAddress(),
      "mgrformulasAddress": await manager.formulasAddress(),
      "mgrautoRedeemTokenAddress": await manager.autoRedeemTokenAddress() /* uAR */,
      "mgruarCalculatorAddress": await manager.uarCalculatorAddress() /* uAR calculator */,
      "mgrExcessDollarsDistributor": await manager.getExcessDollarsDistributor(debtCouponMgrAdr)
    };

    console.table(spreadsheet);

  }
);
