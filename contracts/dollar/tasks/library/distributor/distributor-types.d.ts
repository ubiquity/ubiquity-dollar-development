import { Wallet } from "ethers";

export interface TaskArgs {
  recipients: string; // path to json file containing a list of recipients
  token: string; // address of the token
  // sender: Wallet; // Account that is sending the tokens
}

export interface Recipient {
  name: string; // name of the recipient
  address: string; // Address of the recipient
  // received: number; // how many tokens the recipient has already received
  // amount?: number; // how many tokens the sender is sending
  percent: number; // percentage of the emissions that the recipient is receiving
}

export interface VerifiedRecipient extends Recipient {
  received: number;
}
