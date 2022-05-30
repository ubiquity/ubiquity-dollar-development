import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { contracts } from "../../../../../fixtures/ubiquity-dollar-deployment.json";
import { UbiquityAlgorithmicDollarManager } from "../../../artifacts/types/UbiquityAlgorithmicDollarManager";
import { UbiquityGovernance } from "../../../artifacts/types/UbiquityGovernance";
import { distributor } from "../investor-emissions";

export async function original(_taskArgs, { ethers, network }) {
  const manager = (await getContractInstance("UbiquityAlgorithmicDollarManager", ethers)) as UbiquityAlgorithmicDollarManager;
  const treasuryAddress = await manager.treasuryAddress();

  let surrogate = {
    treasury: await impersonate({ ethers, network, address: treasuryAddress }),
    distributor: await impersonate({ ethers, network, address: distributor }),
  };

  const UBQ = (await getContractInstance("UbiquityGovernance", ethers)) as UbiquityGovernance;
  // const tx = await UBQ.transfer(treasuryAddress, ethers.utils.parseEther("1"));
  // async function transfer({ ethers }) {
  const _signers = await ethers.getSigners();
  // const [owner, addr1, addr2] = await ethers.getSigners();
  const signers = [surrogate.treasury, surrogate.distributor, _signers.pop() as SignerWithAddress];
  console.log({ signers });
  await exampleTransferTokens(UBQ, signers);
  // exampleTransferTokens()
  // const addr1 = distributor;
  // await UBQ.transfer(addr1.address, 50);
  // await UBQ.connect(addr1).transfer(addr2.address, 50);
  // }
  // console.log({ tx });
  interface Impersonate {
    ethers: any;
    network: any;
    address: string;
  }

  async function impersonate({ ethers, network, address }: Impersonate) {
    const _impersonate = async (account: string): Promise<SignerWithAddress> => {
      await network.provider.request({
        method: "hardhat_impersonateAccount",
        params: [account],
      });
      return ethers.provider.getSigner(account);
    };
    const surrogate = await _impersonate(address);
    return surrogate;
  }

  async function getContractInstance(name: keyof typeof contracts, ethers: any) {
    if (!contracts[name]) {
      throw new Error(`Contract ${name} not found in list ${Object.keys(contracts)}`);
    }
    return await ethers.getContractAt(name, contracts[name].address);
  }

  async function exampleTransferTokens(ubiquityToken: UbiquityGovernance, [owner, addr1, addr2]: SignerWithAddress[]) {
    const ownerBalance = await ubiquityToken.balanceOf(owner.address);
    console.log({ ownerBalance });

    // Transfer 50 tokens from owner to addr1
    await ubiquityToken.transfer(addr1.address, 50);
    const addr1Balance = await ubiquityToken.balanceOf(addr1.address);
    console.log({ addr1Balance }); // .to.equal(50);

    // Transfer 50 tokens from addr1 to addr2
    // We use .connect(signer) to send a transaction from another account
    await ubiquityToken.connect(addr1).transfer(addr2.address, 50);
    const addr2Balance = await ubiquityToken.balanceOf(addr2.address);
    console.log({ addr2Balance }); // .to.equal(50);
  }
}
