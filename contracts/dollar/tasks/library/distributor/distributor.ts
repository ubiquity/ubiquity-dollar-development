import { ethers, Wallet } from "ethers";
import { Impersonate } from "../investor-emissions/impersonate-types";
import blockHeightDater from "./block-height-dater";
import { getRecipients } from "./distributor-helpers";
import { Recipient, TaskArgs } from "./distributor-types";

function getDistributor() {
  if (process.env.UBQ_DISTRIBUTOR) {
    //  = "0x445115D7c301E6cC3B5A21cE86ffCd8Df6EaAad9";
    return new Wallet(process.env.UBQ_DISTRIBUTOR);
  } else {
    throw new Error("private key required for process.env.UBQ_DISTRIBUTOR to distribute tokens");
  }
}

const vestingRange = {
  vestingStart: "2022-05-01T00:00:00.000Z",
  vestingEnd: "2024-05-01T00:00:00.000Z",
};

export async function _distributor(taskArgs: TaskArgs, { ethers, network }: Impersonate) {
  const sender = getDistributor();

  if (typeof taskArgs.recipients !== "string") {
    throw new Error("Recipients must be a path to a json file");
  }

  const recipients = await getRecipients(taskArgs.recipients);

  recipients.forEach(verifyReceived);
  //
  // await verifyReceived(recipients);
  const verifiedReceiveAmounts = recipients.map(verifyReceived);
  // console.log({ verifiedReceiveAmounts });

  // const functionThatReturnsAPromise = item => { //a function that returns a promise
  //   return Promise.resolve('ok')
  // }

  // const doSomethingAsync = async item => {
  //   return functionThatReturnsAPromise(item)
  // }

  // const getData = async () => {
  //   return Promise.all(recipients.map(item => doSomethingAsync(item)))
  // }

  // getData().then(data => {
  //   console.log(data)
  // })

  // return verifiedReceiveAmounts;
}

let provider = new ethers.providers.EtherscanProvider();
// TODO: verify the already sent amount reading the chain
export async function verifyReceived(recipient: Recipient) {
  // : Promise<VerifiedRecipient>

  const { vestingStart, vestingEnd } = await getMinMaxBlockHeight();

  // console.log({ timeStamps: blockHeights });

  let history = await provider.getHistory(recipient.address, vestingStart?.block, vestingEnd?.block);
  console.log({ name: recipient.name, history });
  return history;
  // history[0].from
  // const verifiedRecipient = recipient as VerifiedRecipient;
  // verifiedRecipient.received = -1; // TODO: read the chain
  // return await verifiedRecipient;
}

async function getMinMaxBlockHeight() {
  const timestampsDated = await blockHeightDater(vestingRange);

  const vestingStart = timestampsDated.shift();
  const vestingEnd = timestampsDated.pop();

  if (!vestingStart || !vestingEnd) {
    throw new Error("vestingStart or vestingEnd is undefined");
  }
  return { vestingStart, vestingEnd };
}
