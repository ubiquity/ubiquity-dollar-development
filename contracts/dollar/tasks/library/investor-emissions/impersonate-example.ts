import { abi as ubqTokenABI } from "../../../artifacts/contracts/UbiquityGovernance.sol/UbiquityGovernance.json";

const address = {
  ubqToken: "0x4e38D89362f7e5db0096CE44ebD021c3962aA9a0",
  toImpersonate: "0xefC0e701A824943b469a694aC564Aa1efF7Ab7dd",
  toFund: "0x4007CE2083c7F3E18097aeB3A39bb8eC149a341d",
};

export async function impersonate(_taskArgs: any, { ethers, network }: any) {
  await network.provider.request({
    method: "hardhat_impersonateAccount",
    params: [address.toImpersonate],
  });
  const signer = await ethers.getSigner(address.toImpersonate);

  const ubqContract = new ethers.Contract(address.ubqToken, ubqTokenABI, signer);
  const ubqBalance = await ubqContract.balanceOf(address.toImpersonate);
  console.log("whale ubq balance", ubqBalance / 1e18);

  console.log("transferring to", address.toFund);

  await ubqContract.connect(signer).transfer(address.toFund, ubqBalance);
  const accountBalance = await ubqContract.balanceOf(address.toFund);

  console.log("transfer complete");
  console.log("funded account balance", accountBalance / 1e18);

  const whaleBalanceAfter = await ubqContract.balanceOf(address.toImpersonate);
  console.log("whale ubq balance after", whaleBalanceAfter / 1e18);
}
