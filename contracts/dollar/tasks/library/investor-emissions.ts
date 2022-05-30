import "@nomiclabs/hardhat-waffle";
import "hardhat-deploy";
import { ActionType } from "hardhat/types/runtime";
import { impersonate } from "./investor-emissions/impersonate-example";

export const distributor = "0x445115D7c301E6cC3B5A21cE86ffCd8Df6EaAad9";

module.exports = {
  description: "Distributes investor emissions",
  action: (): ActionType<any> => impersonate,
};
