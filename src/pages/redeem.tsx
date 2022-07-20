import { FC, useState } from "react";
import { ethers } from "ethers";

import { DisabledBlurredMessage, Container, Title, SubTitle, WalletNotConnected } from "src/components/ui";

import MigrateButton from "src/components/redeem/MigrateButton";
import DollarPrice from "src/components/redeem/DollarPrice";
import UarRedeem from "src/components/redeem/UarRedeem";
import DebtCouponDeposit from "src/components/redeem/DebtCouponDeposit";
import DebtCouponRedeem from "src/components/redeem/DebtCouponRedeem";
import { useManagerManaged, useWalletAddress, useEffectAsync } from "src/components/lib/hooks";

const PriceStabilization: FC = (): JSX.Element => {
    const [twapPrice, setTwapPrice] = useState<ethers.BigNumber | null>(null);
    const [walletAddress] = useWalletAddress();
    const managedContracts = useManagerManaged();

    useEffectAsync(async () => {
        if (managedContracts) {
            setTwapPrice(await managedContracts.twapOracle.consult(managedContracts.uad.address));
        }
    }, [managedContracts]);

    const twapGt1 = twapPrice?.gte(ethers.utils.parseEther("1")) ?? false;

    return walletAddress ? (
        <>
            <Container>
                <Title text="uAD Price" />
                <DollarPrice />
                <MigrateButton />
            </Container>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Container className="w-full">
                    <Title text="Mint Ubiquity Credits" />
                    <SubTitle text="When TWAP < 1" />
                    <DisabledBlurredMessage disabled={twapGt1} content="Disabled while TWAP > 1">
                        <DebtCouponDeposit />
                        {/* <UarDeposit /> */}
                    </DisabledBlurredMessage>
                </Container>
                <Container className="w-full">
                    <Title text="Redeem Ubiquity Credits" />
                    <SubTitle text="When TWAP > 1" />
                    <DisabledBlurredMessage disabled={!twapGt1} content="Disabled while TWAP < 1">
                        <div className="grid gap-4">
                            <UarRedeem />
                            <DebtCouponRedeem />
                        </div>
                    </DisabledBlurredMessage>
                </Container>
            </div>
        </>
    ) : (
        WalletNotConnected
    );
};

export default PriceStabilization;
