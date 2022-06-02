import { HardhatRuntimeEnvironment } from "hardhat/types";
import { getDistributor, getRecipients, setTransactionsRange } from "./distributor-helpers";
import { TaskArgs } from "./distributor-types";

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

  const distributor = getDistributor();

  const getTransactionsInRange = setTransactionsRange(vestingRange);

  const toReadRecipientsTransactions = recipients.map(getTransactionsInRange);
  const transactionHistories = await Promise.all(toReadRecipientsTransactions);

  const distributorAddress = distributor.address;

  const transactionsFromDistributor = transactionHistories.filter((recipients) => recipients.filter(({ from }) => from === distributorAddress));
  console.log(transactionsFromDistributor);
}
