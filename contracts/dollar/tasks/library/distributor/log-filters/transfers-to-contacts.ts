import { LogDescription } from "@ethersproject/abi";
import { Log } from "@ethersproject/providers";
import { Recipient } from "../utils/distributor-types";

export function transfersToContactsFilter(recipients: Recipient[]) {
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
