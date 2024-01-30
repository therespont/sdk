import { ethers } from "ethers";

import * as Respont from "../contants/index.js";
import * as sapphire from "@oasisprotocol/sapphire-paratime";

import privacyABI from "../contract/abi/privacy/main.json";
import storageABI from "../contract/abi/storage/main.json";

class Connect {
  constructor(key, network, isMainnet = false) {
    if (
      network === "privacy" ||
      !Object.keys(
        Respont.Networks[isMainnet === true ? "mainnet" : "testnet"]
      ).includes(network)
    )
      throw new Error(
        `invalidNetwork: Network is not supported. Accepted network: ${Object.keys(
          Respont.Networks[isMainnet === true ? "mainnet" : "testnet"]
        )
          .slice(1)
          .join(" ")}`
      );

    network = network.substring(0, 2) !== "0x" ? "0x" + network : network;
    const providers = {
      _privacy: sapphire.wrap(
        new ethers.providers.JsonRpcProvider(
          Respont.Networks[
            isMainnet === true ? "mainnet" : "testnet"
          ].privacy.RPC
        )
      ),
      storage: new ethers.providers.JsonRpcProvider(
        Respont.Networks[isMainnet === true ? "mainnet" : "testnet"][
          network
        ].RPC
      ),
    };

    let wallets = {};
    let wallet;
    if (key && key.includes(" ")) {
      if (key.split(" ").length % 3 === 0) {
        wallet = new ethers.Wallet.fromMnemonic(key, "m/44'/60'/0'/0/1'");

        wallets._privacy = sapphire.wrap(
          new ethers.Wallet.fromMnemonic(
            key,
            "m/44'/60'/0'/0/1'",
            providers._privacy
          )
        );
        wallets.storage = wallet.connect(providers.storage);
      } else {
        throw new Error(
          "invalidMnemonic: Mnemonic phrases format provided is invalid. Accepted multiple of three long phrases."
        );
      }
    } else if (key) {
      if (
        (key.substring(0, 2) === "0x" && key.length === 66) ||
        (key.substring(0, 2) !== "0x" && key.length === 64)
      ) {
        wallet = new ethers.Wallet(key);

        wallets._privacy = sapphire.wrap(
          new ethers.Wallet(key, providers._privacy)
        );
        wallets.storage = wallet.connect(providers.storage);
      } else {
        throw new Error(
          "invalidPrivateKey: Private key format provided is invalid."
        );
      }
    } else {
      wallet = new ethers.Wallet.createRandom();

      wallets._privacy = sapphire.wrap(
        new ethers.Wallet(wallet.privateKey, providers._privacy)
      );
      wallets.storage = wallet.connect(providers.storage);
    }

    const contracts = {
      _privacy: new ethers.Contract(
        Respont.Networks[
          isMainnet === true ? "mainnet" : "testnet"
        ].privacy.contract,
        privacyABI,
        wallets._privacy
      ),
      storage: new ethers.Contract(
        Respont.Networks[isMainnet === true ? "mainnet" : "testnet"][
          network
        ].contract,
        storageABI,
        wallets.storage
      ),
    };

    return {
      _contract: contracts,
      _providers: providers,
      _wallets: wallets,
      address: wallet.address,
      publicKey: wallet.publicKey,
      privateKey: function () {
        return wallet.privateKey;
      },
      mnemonic: function () {
        return wallet.mnemonic;
      },
    };
  }
}

export default Connect;
