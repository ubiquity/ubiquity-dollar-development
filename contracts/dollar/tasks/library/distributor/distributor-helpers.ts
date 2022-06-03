import { ethers, Wallet } from "ethers";
import blockHeightDater, { EthDaterExampleResult, EthDaterExampleResults } from "./block-height-dater";
import { vestingRange } from "./";
import { Recipient } from "./distributor-types";

export async function loadRecipientsFromJsonFile(pathToJson: string): Promise<Recipient[]> {
  const recipients = (await import(pathToJson)).default;
  return recipients;
}

export function getDistributor(): Wallet {
  if (process.env.UBQ_DISTRIBUTOR) {
    //  = "0x445115D7c301E6cC3B5A21cE86ffCd8Df6EaAad9";
    return new Wallet(process.env.UBQ_DISTRIBUTOR);
  } else {
    throw new Error("private key required for process.env.UBQ_DISTRIBUTOR to distribute tokens");
  }
}

export async function verifyMinMaxBlockHeight(timestampsDated: EthDaterExampleResults) {
  const vestingStart = timestampsDated.shift();
  const vestingEnd = timestampsDated.pop();

  if (!vestingStart || !vestingEnd) {
    throw new Error("vestingStart or vestingEnd is undefined");
  }
  return [vestingStart, vestingEnd] as EthDaterExampleResult[];
}

export async function getRecipients(pathToJson: string) {
  if (typeof pathToJson !== "string") {
    throw new Error("Recipients must be a path to a json file");
  }

  const recipients = await loadRecipientsFromJsonFile(pathToJson);
  recipients.forEach(verifyDataShape);
  return recipients;
}

export async function setTransactionsRange(blockRange: typeof vestingRange) {
  let provider = new ethers.providers.EtherscanProvider(1, process.env.API_KEY_ETHERSCAN);
  const timestampsDated = await blockHeightDater(blockRange);
  const [vestingStart, vestingEnd] = await verifyMinMaxBlockHeight(timestampsDated);

  return async function getTransactionsOfRecipient(recipient: Recipient) {
    let transactionHistory = await provider.getHistory(recipient.address, vestingStart?.block, vestingEnd?.block);
    return { recipient, transactionHistory };
  };
}

export function verifyDataShape(recipient: Recipient) {
  if (!recipient.name) {
    console.warn("Recipient should have an name");
  }
  if (typeof recipient.name !== "string") {
    console.warn("Recipient name should be a string");
  }

  if (!recipient.address) {
    throw new Error("Recipient must have an address");
  }
  if (typeof recipient.address !== "string") {
    throw new Error("Recipient address must be a string");
  }

  if (!recipient.percent) {
    throw new Error("Recipient must have a percentage");
  }
  if (typeof recipient.percent !== "number") {
    throw new Error("Recipient percentage must be a number");
  }
}
