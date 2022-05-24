import "@nomiclabs/hardhat-waffle";
import { Signer } from "ethers";
import { ActionType } from "hardhat/types/runtime";
import accounts from "../../../../fixtures/named-accounts.json";
import deployment from "../../../../fixtures/ubiquity-dollar-deployment.json";
import { UbiquityGovernance } from "../../artifacts/types/UbiquityGovernance";
// import { dryRunner } from "../library/price-reset/dryRunner";

const ubiquityGovernanceAddress = deployment.contracts.UbiquityGovernance.address;

module.exports = {
  description: "Distributes investor emissions",
  action:
    (): ActionType<any> =>
    async (_taskArgs, { ethers, network }) => {
      const results = dryRunner({
        network: await ethers.provider.getNetwork(),
        ethers,
      });

      console.log(results);

      const ubqToken = (await ethers.getContractAt("UbiquityGovernance", ubiquityGovernanceAddress)) as UbiquityGovernance;
      const tx = await ubqToken.transfer(accounts.ubq, 1);

      console.log({ tx });
    },
};

interface Params {
  network: any;
  ethers: any;
}

async function dryRunner({ network, ethers }: Params) {
  const impersonate = async (account: string): Promise<Signer> => {
    await network.provider.request({
      method: "hardhat_impersonateAccount",
      params: [account],
    });
    return ethers.provider.getSigner(account);
  };
  const admin = await impersonate(ubiquityGovernanceAddress);
  return { adminAdr: ubiquityGovernanceAddress, admin };
}
