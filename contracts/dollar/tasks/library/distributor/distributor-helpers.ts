import { ethers, Wallet } from "ethers";
import blockHeightDater, { EthDaterExampleResults } from "./block-height-dater";
import { Recipient } from "./distributor-types";

/**
 * @param pathToJson
 * @description this loads the recipients from a json file and verifies that the json file has the correct properties
 * @returns an array of Recipients
 */
export async function loadRecipientsFromJsonFile(pathToJson: string): Promise<Recipient[]> {
  const recipients = (await import(pathToJson)).default;

  return recipients;
}

// function calculateAmountToSend(recipient: Recipient): number {
//   return amountAlreadySent(recipient) * total - recipient.percent;
// }

// export function calculateAmountToReceive(recipient: Recipient, total: number): number {
//   return recipient.percent * total - recipient.received;
// }

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
  return [vestingStart, vestingEnd];
}
