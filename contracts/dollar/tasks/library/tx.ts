import "@nomiclabs/hardhat-waffle";
import { ActionType } from "hardhat/types";
interface TaskArgs { hash: string }

module.exports = {
  "description": "Prints the detail for the transaction hash",
  "params": { "hash": "The transaction's hash" },
  "action": (): ActionType<any> => async function main(taskArgs: TaskArgs, { ethers }) {
    const provider = ethers.providers.getDefaultProvider();
    let receipt = await provider.getTransactionReceipt(taskArgs.hash) as any;
    delete receipt.logsBloom as any
    console.table(receipt);
  }
}
