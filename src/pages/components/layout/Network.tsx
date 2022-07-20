import { useEffect, useState } from "react";

import { getNetworkName } from "src/pages/components/lib/utils";
import { useWeb3Provider } from "src/pages/components/lib/hooks";

const Network = () => {
    const web3Provider = useWeb3Provider();
    const [network, setNetwork] = useState("");

    useEffect(() => {
        if (web3Provider) {
            const networkName = getNetworkName(web3Provider);
            setNetwork(networkName);
        }
    }, [web3Provider]);

    if (!web3Provider) {
        return null;
    }

    return (
        <div className="border-accent/60 font-special rounded-bl-lg border-l border-b border-solid bg-white/10 px-4 py-2 text-xs uppercase text-white/75">
            {network}
        </div>
    );
};

export default Network;
