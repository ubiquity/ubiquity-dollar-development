import { useContext, useState, createContext, useEffect } from "react";
import { BigNumber } from "ethers";
import { erc1155BalanceOf } from "@/lib/utils";
import { ERC1155Ubiquity } from "@/dollar-types";
import useManagerManaged from "./contracts/useManagerManaged";
import useWalletAddress from "./useWalletAddress";
import useNamedContracts from "./contracts/useNamedContracts";

export interface Balances {
  uad: BigNumber;
  crv: BigNumber;
  uad3crv: BigNumber;
  ucr: BigNumber;
  ucrNft: BigNumber;
  ubq: BigNumber;
  stakingShares: BigNumber;
  usdc: BigNumber;
}

type RefreshBalances = () => Promise<void>;

export const BalancesContext = createContext<[Balances | null, RefreshBalances]>([null, async () => {}]);

export const BalancesContextProvider: React.FC = ({ children }) => {
  const [balances, setBalances] = useState<Balances | null>(null);
  const [walletAddress] = useWalletAddress();
  const managedContracts = useManagerManaged();
  const namedContracts = useNamedContracts();

  async function refreshBalances() {
    if (walletAddress && managedContracts && namedContracts) {
      const [uad, crv, uad3crv, ucr, ubq, ucrNft, stakingShares, usdc] = await Promise.all([
        managedContracts.uad.balanceOf(walletAddress),
        managedContracts.crvToken.balanceOf(walletAddress),
        managedContracts.metaPool.balanceOf(walletAddress),
        managedContracts.uar.balanceOf(walletAddress),
        managedContracts.ugov.balanceOf(walletAddress),
        erc1155BalanceOf(walletAddress, (managedContracts.debtCouponToken as unknown) as ERC1155Ubiquity),
        erc1155BalanceOf(walletAddress, (managedContracts.stakingToken as unknown) as ERC1155Ubiquity),
        namedContracts.usdc.balanceOf(walletAddress),
      ]);

      setBalances({
        uad,
        crv,
        uad3crv,
        ucr,
        ucrNft,
        ubq,
        stakingShares,
        usdc,
      });
    }
  }

  useEffect(() => {
    refreshBalances();
  }, [walletAddress, managedContracts]);

  return <BalancesContext.Provider value={[balances, refreshBalances]}>{children}</BalancesContext.Provider>;
};

const useBalances = () => useContext(BalancesContext);

export default useBalances;
