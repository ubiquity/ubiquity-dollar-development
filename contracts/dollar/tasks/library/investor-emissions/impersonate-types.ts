import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { HardhatEthersHelpers } from "@nomiclabs/hardhat-ethers/types";
import { Contract } from "ethers";
import { Network } from "hardhat/types";

export interface Balance {
  bigNumber: number;
  decimal: number;
}
class Account {
  balance: Balance = { bigNumber: -1, decimal: -1 };
  address: string | undefined;
  contract: Contract | null = null;
  signer: SignerWithAddress | null = null;
}

export const addressBook = {
  token: "0x4e38D89362f7e5db0096CE44ebD021c3962aA9a0",
  sender: "0xefC0e701A824943b469a694aC564Aa1efF7Ab7dd",
  receiver: "0x4007CE2083c7F3E18097aeB3A39bb8eC149a341d",
};

export const account = {
  token: new Account(),
  sender: new Account(),
  receiver: new Account(),
} as { [key: string]: Account };

export interface Impersonate {
  ethers: typeof import("/Users/nv/repos/ubiquity/ubiquity-dollar-development/contracts/dollar/node_modules/ethers/lib/ethers") & HardhatEthersHelpers;
  network: Network;
}
