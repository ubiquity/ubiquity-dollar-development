import { createContext, useContext, useState } from "react";
import { ethers } from "ethers";
import { JsonRpcSigner, Web3Provider, JsonRpcProvider } from "@ethersproject/providers";
import WalletConnect from "@walletconnect/client";
import QRCodeModal from "@walletconnect/qrcode-modal";
import WalletConnectProvider from "@walletconnect/web3-provider";
import useLocalStorage from "./useLocalStorage";
import { useEffect } from "react";

const IS_DEV = process.env.NODE_ENV == "development";
const LOCAL_NODE_ADDRESS = "http://localhost:8545";

export type PossibleProviders = Web3Provider | JsonRpcProvider | null;

export type Web3State = {
  metamaskInstalled: boolean;
  jsonRpcEnabled: boolean;
  providerMode: "none" | "metamask" | "jsonrpc" | "walletconnect";
  provider: any;
  connecting: boolean;
  walletAddress: null | string;
  signer: null | JsonRpcSigner;
};

type Web3Actions = {
  connectMetamask: () => Promise<void>;
  connectWalletconnect: () => Promise<void>;
  connectJsonRpc: (address: string) => Promise<void>;
  disconnect: () => Promise<void>;
};

const metamaskInstalled = typeof window !== "undefined" ? !!(window as any)?.ethereum?.request : false;
const DEFAULT_WEB3_STATE: Web3State = {
  metamaskInstalled,
  jsonRpcEnabled: IS_DEV,
  providerMode: "none",
  provider: null,
  connecting: false,
  walletAddress: null,
  signer: null,
};

const DEFAULT_WEB3_ACTIONS: Web3Actions = {
  connectMetamask: async () => {},
  connectWalletconnect: async () => {},
  connectJsonRpc: async () => {},
  disconnect: async () => {},
};

export const Web3Context = createContext<[Web3State, Web3Actions]>([DEFAULT_WEB3_STATE, DEFAULT_WEB3_ACTIONS]);

export const UseWeb3Provider: React.FC = ({ children }) => {
  const [storedWallet, setStoredWallet] = useLocalStorage<null | string>("storedWallet", null);
  const [storedProviderMode, setStoredProviderMode] = useLocalStorage<Web3State["providerMode"]>("storedProviderMode", "none");
  const [web3State, setWeb3State] = useState<Web3State>(DEFAULT_WEB3_STATE);

  useEffect(() => {
    switch (storedProviderMode) {
      case "jsonrpc":
        if (storedWallet) connectJsonRpc(storedWallet);
        return;

      case "metamask":
        connectMetamask();
        return;

      case "walletconnect":
        connectWalletconnect();
        return;

      default:
        return;
    }
  }, []);

  async function connectMetamask() {
    if (metamaskInstalled) {
      const newProvider = new ethers.providers.Web3Provider((window as any).ethereum);
      setWeb3State({ ...web3State, connecting: true });
      const addresses = (await newProvider.send("eth_requestAccounts", [])) as string[];
      if (addresses.length > 0) {
        console.log("Connected wallet ", addresses[0]);
        const newWalletAddress = addresses[0];
        const newSigner = newProvider.getSigner(newWalletAddress);
        setStoredWallet(newWalletAddress);
        setStoredProviderMode("metamask");
        setWeb3State({ ...web3State, connecting: false, providerMode: "metamask", provider: newProvider, walletAddress: newWalletAddress, signer: newSigner });
      } else {
        alert("No accounts found");
        setWeb3State({ ...web3State, connecting: false });
      }
    }
  }

  async function connectWalletconnect() {
    const bridge = "https://bridge.walletconnect.org";
    const connector = new WalletConnect({ bridge, qrcodeModal: QRCodeModal });

    if (!connector.connected) {
      await connector.createSession();
    }

    connector.on("connect", async (error, payload) => {
      if (error) throw error;

      const { chainId, accounts } = payload.params[0];
      setStoredProviderMode("walletconnect");
      const newWalletAddress = accounts[0];
      const newProvider = new WalletConnectProvider({
        infuraId: process.env.API_KEY_ALCHEMY,
      });
      const web3Provider = new ethers.providers.Web3Provider(newProvider);
      await newProvider.enable();

      const newSigner = web3Provider.getSigner(newWalletAddress);
      setWeb3State({
        ...web3State,
        connecting: false,
        providerMode: "walletconnect",
        provider: web3Provider,
        walletAddress: newWalletAddress,
        signer: newSigner,
      });
    });
  }

  async function connectJsonRpc(newWalletAddress: string) {
    setWeb3State({ ...web3State, connecting: true });
    const newProvider = new ethers.providers.JsonRpcProvider(LOCAL_NODE_ADDRESS);
    await newProvider.send("hardhat_impersonateAccount", [newWalletAddress]);
    const newSigner = newProvider.getSigner(newWalletAddress);
    setStoredWallet(newWalletAddress);
    setStoredProviderMode("jsonrpc");
    setWeb3State({ ...web3State, connecting: false, providerMode: "jsonrpc", provider: newProvider, walletAddress: newWalletAddress, signer: newSigner });
  }

  async function disconnect() {
    setWeb3State({ ...web3State, walletAddress: null, signer: null });
  }

  return <Web3Context.Provider value={[web3State, { connectMetamask, connectWalletconnect, connectJsonRpc, disconnect }]}>{children}</Web3Context.Provider>;
};

const useWeb3 = () => useContext(Web3Context);

export default useWeb3;
