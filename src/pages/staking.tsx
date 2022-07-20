import { FC } from "react";
import { WalletNotConnected } from "src/components/ui";
import StakingSharesExplorer from "src/components/staking/StakingSharesExplorer";
import { useWalletAddress } from "src/components/lib/hooks";

const Staking: FC = (): JSX.Element => {
    const [walletAddress] = useWalletAddress();
    return walletAddress ? <StakingSharesExplorer /> : WalletNotConnected;
};

export default Staking;
