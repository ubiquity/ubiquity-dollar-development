import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { HardhatEthersHelpers } from "@nomiclabs/hardhat-ethers/types";
import { Contract } from "ethers";
import { Network } from "hardhat/types";

export interface Balance {
  bigNumber: number;
  decimal: number;
}
export class Account {
  balance: Balance = { bigNumber: -1, decimal: -1 };
  address: string | undefined;
  contract: Contract | null = null;
  signer: SignerWithAddress | null = null;
}

export interface Impersonate {
  ethers: typeof import("/Users/nv/repos/ubiquity/ubiquity-dollar-development/contracts/dollar/node_modules/ethers/lib/ethers") & HardhatEthersHelpers;
  network: Network;
}
