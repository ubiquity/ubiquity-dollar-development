import "@nomiclabs/hardhat-waffle";
import { ActionType } from "hardhat/types";


interface TaskArgs { mnemonic: string }

module.exports = {
  "description": "prints the first few accounts of a mnemonic",
  "params": { mnemonic: "The mnemonic used for BIP39 key derivation: See https://iancoleman.io/bip39" },
  "action": (): ActionType<any> => async function main(taskArgs: TaskArgs, { ethers }) {
    const accounts = await ethers.getSigners();
    accounts.forEach((account) => console.log(account.address));
  }
}
