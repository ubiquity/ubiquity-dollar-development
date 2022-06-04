import "@nomiclabs/hardhat-waffle";
import "hardhat-deploy";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { ActionType } from "hardhat/types/runtime";
import tranches from "../../distributor-transactions.json";
import addressBook from "./distributor/address-book.json";
import { TaskArgs } from "./distributor/distributor-types";

module.exports = {
  description: "total the amount sent to recipients from a list of transactions",
  action: (): ActionType<any> => aggregateTransactions,
};

type AddressBookContact = typeof addressBook[0];
interface ContactWithPayments extends AddressBookContact {
  totalSent: number;
  transactions: string[];
}

export async function aggregateTransactions(taskArgs: TaskArgs, hre: HardhatRuntimeEnvironment) {
  const aggregatedTransactions = addressBook.map((_contact) => {
    const contact = _contact as ContactWithPayments; // type casting

    tranches.forEach((tranche) => {
      if (!contact.totalSent) {
        contact.totalSent = 0;
      }

      if (!contact.transactions) {
        contact.transactions = [];
      }

      if (tranche.name === contact.name) {
        contact.totalSent += tranche.amount;
        contact.transactions.push(tranche.hash);
      }
    });
    return contact;
  });
  console.log(aggregatedTransactions);
  return aggregatedTransactions;
}
