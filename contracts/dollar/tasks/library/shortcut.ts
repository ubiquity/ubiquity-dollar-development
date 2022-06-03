import "@nomiclabs/hardhat-waffle";
import * as fs from "fs";
import "hardhat-deploy";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { ActionType } from "hardhat/types/runtime";
import addressBook from "./distributor/address-book.json";
import { TaskArgs } from "./distributor/distributor-types";

import tranches from "../../distributor-transactions.json";

module.exports = {
  description: "temporary shortcut to run the distributor",
  action: (): ActionType<any> => action,
};

type AddressBookContact = typeof addressBook[0];
interface ContactWithTotalSent extends AddressBookContact {
  totalSent: number;
}

export async function action(taskArgs: TaskArgs, hre: HardhatRuntimeEnvironment) {
  const totals = addressBook.map((_contact) => {
    const contact = _contact as ContactWithTotalSent; // typecasting

    tranches.forEach((tranche) => {
      if (!contact.totalSent) {
        contact.totalSent = 0;
      }

      if (tranche.name === contact.name) {
        contact.totalSent += tranche.amount;
      }
    });
    return contact;
  });
  console.log(totals);
}

function writeToDisk(transactionHistories: any) {
  fs.writeFileSync("./shortcut-output.json", JSON.stringify(transactionHistories, null, 2));
  console.log("./shortcut-output.json written");
}
