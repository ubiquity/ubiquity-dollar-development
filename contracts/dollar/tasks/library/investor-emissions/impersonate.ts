import { abi as tokenABI } from "../../../artifacts/contracts/UbiquityGovernance.sol/UbiquityGovernance.json";
import { addressBook, Impersonate, account, Balance } from "./impersonate-types";

export async function impersonate(taskArgs: typeof addressBook, { ethers, network }: Impersonate) {
  console.log(`impersonating ${taskArgs.sender}`);
  await network.provider.request({ method: "hardhat_impersonateAccount", params: [taskArgs.sender] }); // impersonate

  // initialize
  account.sender.signer = await ethers.getSigner(taskArgs.sender);
  account.receiver.signer = await ethers.getSigner(taskArgs.receiver);
  account.token.contract = new ethers.Contract(taskArgs.token, tokenABI, account.sender.signer);

  await printAllBalances();

  // perform the transfer
  const transferAmount = await getBalanceOf(taskArgs.sender);
  console.log(shortenAddress(taskArgs.sender), transferAmount.decimal, `UBQ`, `=>`, shortenAddress(taskArgs.receiver));
  await account.token.contract.connect(account.sender.signer).transfer(taskArgs.receiver, transferAmount.bigNumber);

  await printAllBalances();

  async function getBalanceOf(address: string): Promise<Balance> {
    const bigNumber = await account.token.contract?.balanceOf(address);
    return {
      bigNumber,
      decimal: bigNumber / 1e18,
    };
  }
  async function printAllBalances() {
    const balances = {
      [shortenAddress(taskArgs.sender)]: (account.sender.balance = await getBalanceOf(taskArgs.sender)).decimal,
      [shortenAddress(taskArgs.receiver)]: (account.receiver.balance = await getBalanceOf(taskArgs.receiver)).decimal,
      // [taskArgs.token]: (account.token.balance = await getBalanceOf(taskArgs.token)).decimal,
    };

    console.table(balances);
  }
}

function shortenAddress(address: string) {
  return address.slice(0, 6) + "..." + address.slice(-4);
}
