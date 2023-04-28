import { ethers } from "ethers";
import * as Respont from "../contants/index.js";

import ABI from "../contract/abi/core.json";

class Connect {
  constructor(provider = window.ethereum ? window.ethereum : {}) {
    if (!provider && !window.ethereum)
      throw new Error("providerNotDetected: Web3 provider is not detected.");

    this._provider = new ethers.providers.Web3Provider(provider);
    this._contract = new ethers.Contract(
      Respont.Contract,
      ABI,
      this._provider.getSigner()
    );

    return {
      _ethereum: provider,
      _ethers: this._provider,
      _contract: this._contract,
      accounts: async function () {
        const accounts = await this._ethers.send("eth_requestAccounts", []);

        return accounts[0];
      },
      network: async function () {
        return await this._ethers.getNetwork();
      },
      switchChain: async function () {
        try {
          await provider.send("wallet_addEthereumChain", [
            {
              chainId: "0xE704",
              chainName: "Linea Goerli",
              rpcUrls: ["https://rpc.goerli.linea.build"],
            },
          ]);
        } catch (e) {
          throw new Error(
            "failedSwitchChain: Failed to switch chain on provider."
          );
        }
      },
    };
  }
}

export { Connect };
