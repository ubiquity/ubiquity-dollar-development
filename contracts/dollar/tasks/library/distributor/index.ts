import * as fs from "fs";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { getRecipients } from "./distributor-helpers";
import { Recipient, TaskArgs } from "./distributor-types";
import { readContractTransactionHistory } from "./read-contract-transaction-history";

export const vestingRange = ["2022-05-01T00:00:00.000Z", "2024-05-01T00:00:00.000Z"];

/**
 * distributor needs to do the following:
 * * 1. load the recipients from a json file
 * * 2. verify the amount sent to each recipient within the vesting range
 * * 3. distribute according to the vesting schedule to each recipient, and subtract the amount already sent
 * * 4. transfer the tokens to each recipient
 */
export async function _distributor(taskArgs: TaskArgs, hre: HardhatRuntimeEnvironment) {
  const recipients = await getRecipients(taskArgs.recipients); // 1
  // const distributor = getDistributor();
  // const getTransactionsInRange = await setTransactionsRange(vestingRange);
  // const toReadRecipientsTransactions = recipients.map(getTransactionsInRange);
  // const transactionHistories = await Promise.all(toReadRecipientsTransactions);

  const transactionHistories = await readContractTransactionHistory(taskArgs.token, vestingRange);
  const transfersOnly = transactionHistories.filter(({ events }) => {
    if (events.topic === "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef") return true;
    else if (events.signature === "Transfer(address,address,uint256)") return true;
    else if (events.name === "Transfer") return true;
  });

  const logout = transfersOnly.map(({ events, log }) => {
    const to = events.args[1] as string;
    const _amount = events.args[2]._hex as string;
    // console.log(events.args);
    const amount = parseInt(_amount) / 1e18;

    let x = recipients.length;
    while (--x) if (recipients[x].address === to) break;

    return {
      name: recipients[x].name,
      hash: log.transactionHash,
      args: events.args,
      amount,
    };
  });

  // eventsAndLogs[33].events.args[2].hex = '0x02335b0d2273bfdaa0'
  // parseInt('0x02335b0d2273bfdaa0') / 1e18 = 40.5940541078561

  // const filteredRecipients = [] as TransactionResponse[][];

  // transactionHistories.forEach((recipient: TransactionResponse[]) => {
  //   const filtered = recipient.filter(fn);

  //   function fn(transaction: TransactionResponse) {
  //     return transaction.from === distributor.address;
  //   }

  //   filteredRecipients.push(filtered);
  // });

  writeToDisk(logout);
}
function writeToDisk(transactionHistories: any) {
  fs.writeFileSync("./distributor-transactions.json", JSON.stringify(transactionHistories, null, 2));
  console.log("./distributor-transactions.json written");
}
