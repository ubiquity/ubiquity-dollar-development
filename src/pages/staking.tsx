import { FC } from "react";
import { WalletNotConnected } from "src/pages/components/ui";
import StakingSharesExplorer from "src/pages/components/staking/StakingSharesExplorer";
import { useWalletAddress } from "src/pages/components/lib/hooks";

const Staking: FC = (): JSX.Element => {
    const [walletAddress] = useWalletAddress();
    return walletAddress ? <StakingSharesExplorer /> : WalletNotConnected;
};

export default Staking;
