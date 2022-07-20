import { useEffect, useState } from "react";

import { getNetworkName } from "src/components/lib/utils";
import { useWeb3Provider } from "src/components/lib/hooks";

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
        <div className="rounded-bl-lg border-l border-b border-solid border-accent/60 bg-white/10 px-4 py-2 font-special text-xs uppercase text-white/75">
            {network}
        </div>
    );
};

export default Network;
