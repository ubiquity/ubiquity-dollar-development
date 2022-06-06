import "@nomiclabs/hardhat-waffle";
import "hardhat-deploy";
import tranches from "../../../../distributor-transactions.json"; // TODO: pass these in as arguments
import addressBook from "../address-book.json"; // TODO: pass these in as arguments

// module.exports = {
//   description: "total the amount sent to recipients from a list of transactions",
//   action: () => sumTotalSentToContacts,
// };

type AddressBookContact = typeof addressBook[0];
interface ContactWithTransfers extends AddressBookContact {
  transferred: number;
  transactions: string[];
}

export function sumTotalSentToContacts() {
  const transferAmountsToContacts = addressBook.map((_contact) => {
    const contact = _contact as ContactWithTransfers; // type casting

    tranches.forEach((tranche) => {
      if (!contact.transferred) {
        contact.transferred = 0;
      }

      if (!contact.transactions) {
        contact.transactions = [];
      }

      if (tranche.name === contact.name) {
        contact.transferred += tranche.amount;
        contact.transactions.push(tranche.hash);
      }
    });
    return contact;
  });
  console.log(transferAmountsToContacts);
  return transferAmountsToContacts;
}
