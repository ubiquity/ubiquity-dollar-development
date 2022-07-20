import { FC } from "react";
import DebtCoupon from "src/components/redeem/DebtCoupon";
import { useWalletAddress } from "src/components/lib/hooks";

const DebtCouponPage: FC = (): JSX.Element => {
    const [walletAddress] = useWalletAddress();
    return <div>{walletAddress && <DebtCoupon />}</div>;
};

export default DebtCouponPage;
