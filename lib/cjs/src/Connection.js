const { ethers } = require("ethers");

const Respont = require("../constants/index.js");
const sapphire = require("@oasisprotocol/sapphire-paratime");

const privacyABI = require("../../../contract/abi/privacy/main.json");
const storageABI = require("../../../contract/abi/storage/main.json");

class Connect {
  constructor(key, network, isMainnet = false) {
    if (!network || (network.length <= 8 && !network.includes("https://")))
      throw new Error(`invalidRPC: Please provide https JSON-RPC.`);

    const storageProvider = new ethers.providers.JsonRpcProvider({
      url: network,
    });

    return storageProvider
      .getNetwork()
      .then((data) => {
        if (
          !Object.keys(
            Respont.Networks[isMainnet ? "mainnet" : "testnet"]
          ).includes(`0x${data.chainId.toString(16)}`)
        )
          throw new Error(
            `invalidChainID: RPC provided is not supported. Supported networks: ${Object.keys(
              Respont.Networks[isMainnet ? "mainnet" : "testnet"]
            )
              .filter((network) => network !== "privacy")
              .join(" ")}`
          );

        let providers = {
          _privacy: sapphire.wrap(
            new ethers.providers.JsonRpcProvider(
              Respont.Networks[isMainnet ? "mainnet" : "testnet"].privacy.RPC
            )
          ),
          storage: storageProvider,
        };

        let wallets = {};
        let wallet;
        if (key && key.includes(" ")) {
          if (key.split(" ").length % 3 === 0) {
            wallet = ethers.Wallet.fromMnemonic(key, "m/44'/60'/0'/0/1'");

            wallets._privacy = sapphire.wrap(
              new ethers.Wallet(wallet.privateKey, providers._privacy)
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
              isMainnet ? "mainnet" : "testnet"
            ].privacy.contract,
            privacyABI,
            wallets._privacy
          ),
          storage: new ethers.Contract(
            Respont.Networks[isMainnet ? "mainnet" : "testnet"][
              `0x${data.chainId.toString(16)}`
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
            return wallet.mnemonic ? wallet.mnemonic.phrase : null;
          },
        };
      })
      .catch((e) => {
        console.log(e);
        if (e.message.includes("invalidChainID")) throw new Error(e.message);
        else throw new Error("timeoutRPC: connection timeout to rpc.");
      });
  }
}

module.exports = { Connect };
