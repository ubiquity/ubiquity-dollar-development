import { ethers } from "ethers";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import blockHeightDater from "./block-height-dater";
import { getDistributor, verifyMinMaxBlockHeight, loadRecipientsFromJsonFile, verifyDataShape } from "./distributor-helpers";
import { Recipient, TaskArgs } from "./distributor-types";

export const vestingRange = ["2022-05-01T00:00:00.000Z", "2024-05-01T00:00:00.000Z"];
const getTransactionsInRange = setTransactionsRange(vestingRange);

/**
 * distributor needs to do the following:
 * * 1. load the recipients from a json file
 * * 2. verify the amount sent to each recipient within the vesting range
 * * 3. distribute according to the vesting schedule to each recipient, and subtract the amount already sent
 * * 4. transfer the tokens to each recipient
 */
export async function _distributor(taskArgs: TaskArgs, hre: HardhatRuntimeEnvironment) {
  const recipients = await getRecipients(taskArgs.recipients); // 1

  const promisesToReadRecipientsTransactionsInDefinedRange = recipients.map(getTransactionsInRange);
  const transactionHistories = await Promise.all(promisesToReadRecipientsTransactionsInDefinedRange);

  // const verifiedReceiveAmounts = transactionHistories.map(verifyReceived);
  console.log({ transactionHistories });
}

async function getRecipients(pathToJson: string) {
  if (typeof pathToJson !== "string") {
    throw new Error("Recipients must be a path to a json file");
  }

  // const sender = getDistributor();
  const recipients = await loadRecipientsFromJsonFile(pathToJson);
  recipients.forEach(verifyDataShape);
  return recipients;
}

function setTransactionsRange(_blockRange: typeof vestingRange) {
  let provider = new ethers.providers.EtherscanProvider();
  return async function getTransactions(recipient: Recipient) {
    const timestampsDated = await blockHeightDater(_blockRange);
    const [vestingStart, vestingEnd] = await verifyMinMaxBlockHeight(timestampsDated);

    let transactionHistory = await provider.getHistory(recipient.address, vestingStart?.block, vestingEnd?.block);
    console.log({ name: recipient.name, transactionHistory });

    return transactionHistory;
  };
}
