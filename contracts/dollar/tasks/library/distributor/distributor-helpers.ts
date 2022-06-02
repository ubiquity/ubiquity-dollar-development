import { Recipient } from "./distributor-types";

/**
 * @param pathToJson
 * @description this loads the recipients from a json file and verifies that the json file has the correct properties
 * @returns an array of Recipients
 */
export async function getRecipients(pathToJson: string): Promise<Recipient[]> {
  const recipients = (await import(pathToJson)).default;
  // console.log({ recipients });
  recipients.forEach(checkEachForProperties);
  return recipients;
}

// function calculateAmountToSend(recipient: Recipient): number {
//   return amountAlreadySent(recipient) * total - recipient.percent;
// }

// export function calculateAmountToReceive(recipient: Recipient, total: number): number {
//   return recipient.percent * total - recipient.received;
// }

export function checkEachForProperties(recipient: Recipient) {
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
