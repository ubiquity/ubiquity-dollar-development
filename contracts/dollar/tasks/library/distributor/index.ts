import { LogDescription } from "@ethersproject/abi";
import { Log } from "@ethersproject/providers";
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
  fs.writeFileSync("./transaction-histories.json", JSON.stringify(transactionHistories, null, 2));

  const transfersOnly = transactionHistories.filter(({ events }) => {
    if (events.topic === "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef") return true;
    else if (events.signature === "Transfer(address,address,uint256)") return true;
    else if (events.name === "Transfer") return true;
  });

  const mintsOnly = transactionHistories.filter(({ events }) => {
    if (events.topic === "0xb1233017d63154bc561d57c16f7b6a55e2e1acd7fcac94045a9f35fb31a850ca") return true;
    else if (events.signature === "Minting(address,address,uint256)") return true;
    else if (events.name === "Minting") return true;
  });
  fs.writeFileSync("./mints-histories.json", JSON.stringify(mintsOnly, null, 2));

  const transfersToContactsOnly = transfersOnly.map(transfersToContactsFilter(recipients)).filter(Boolean);
  fs.writeFileSync("./distributor-transactions.json", JSON.stringify(transfersToContactsOnly, null, 2));
}

function transfersToContactsFilter(recipients: Recipient[]) {
  return (txEmits: { events: LogDescription; log: Log }) => {
    const to = txEmits.events.args[1] as string;
    const _amount = txEmits.events.args[2]._hex as string;
    const amount = parseInt(_amount) / 1e18;

    // very fast way to see if the recipient is in the address book
    let x = recipients.length;
    while (x--) {
      if (recipients[x].address === to) {
        return {
          name: recipients[x].name,
          hash: txEmits.log.transactionHash,
          from: txEmits.events.args[0],
          to: txEmits.events.args[1],
          amount,
        };
      }
    }
  };
}
