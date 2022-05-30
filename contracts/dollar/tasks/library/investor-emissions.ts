import "@nomiclabs/hardhat-waffle";
import { Wallet } from "ethers";
import "hardhat-deploy";
import { ActionType } from "hardhat/types/runtime";
import { impersonate as action } from "./investor-emissions/impersonate";

let distributor = "0x445115D7c301E6cC3B5A21cE86ffCd8Df6EaAad9";

if (process.env.UBQ_DISTRIBUTOR) {
  distributor = new Wallet(process.env.UBQ_DISTRIBUTOR).address;
}

export const addressBook = {
  token: "0x4e38D89362f7e5db0096CE44ebD021c3962aA9a0", // Ubiquity Governance
  sender: distributor, // Distributor
  receiver: "0x4007CE2083c7F3E18097aeB3A39bb8eC149a341d", // Investor
};

module.exports = {
  description: "Distributes investor emissions",
  params: addressBook,
  // optionalParams: {
  //   token: "0x4e38D89362f7e5db0096CE44ebD021c3962aA9a0", // Ubiquity Governance
  // },
  action: (): ActionType<any> => action,
};
