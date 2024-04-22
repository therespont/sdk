const { ethers } = require("ethers");
const {
  signTypedData,
  SignTypedDataVersion,
} = require("@metamask/eth-sig-util");
const Axios = require("axios");

const { HTTPSChecker } = require("./Utils.js");
const { relayer } = require("../constants");
const keyABI = require("../../../contract/abi/privacy/key.json");

const EIP712_Data = async (provider, prepareTransactionData, privateKey) => {
  const { chainId } = await provider.getNetwork();

  const getDomain = await Axios.post(`${relayer}/relay/${chainId}/domain`, {
    signer: prepareTransactionData.from,
  });
  const { domain, nonce, primaryType, types } = getDomain.data;

  const deadline = parseInt(Date.now() / 1000, 10) + 300;

  const messageEip712 = {
    ...prepareTransactionData,
    value: 0,
    nonce: parseInt(nonce.toString(), 10),
    deadline,
  };

  const signature = signTypedData({
    privateKey: privateKey.substring(2),
    data: {
      domain,
      types,
      primaryType,
      message: messageEip712,
    },
    version: SignTypedDataVersion.V4,
  });

  const ForwardRequestData = {
    ...prepareTransactionData,
    value: 0,
    deadline,
    signature,
  };

  const execute = await Axios.post(`${relayer}/relay/${chainId}/execute`, {
    ForwarderRequestData: JSON.stringify(ForwardRequestData),
  });

  const wait = async (hash) => {
    return await provider.waitForTransaction(hash);
  };

  return {
    ...execute.data,
    wait: async function () {
      return await wait(execute.data.hash);
    },
  };
};

class Interactions {
  constructor(provider, useRelayer = false) {
    if (!provider)
      throw new Error(
        "invalidProvider: Provider parameter must be respont connection."
      );

    this._provider = provider;
    this.useRelayer = useRelayer;
  }

  async GenerateKeyLocation(key, addressPair) {
    if (key.length === 0)
      throw new Error("undefinedKey: Please provide a key value.");

    if (!ethers.utils.isAddress(addressPair))
      throw new Error(
        "invalidAddress: parameter must be an ethereum address (starting with 0x)"
      );

    if (this.useRelayer) {
      const populateTransaction =
        await this._provider._contract._privacy.populateTransaction.GenerateKeyLocation(
          key,
          addressPair,
          this._provider.address
        );

      const gasLimit =
        await this._provider._contract._privacy.estimateGas.GenerateKeyLocation(
          key,
          addressPair,
          this._provider.address
        );

      return EIP712_Data(
        this._provider._providers._privacy,
        {
          ...populateTransaction,
          gas: parseInt(gasLimit.toString(), 10),
        },
        this._provider.privateKey()
      );
    } else {
      return await this._provider._contract._privacy.GenerateKeyLocation(
        key,
        addressPair,
        this._provider.address
      );
    }
  }

  async GetKeyLocation(addressPair) {
    if (!ethers.utils.isAddress(addressPair)) return false;

    const key = await this._provider._contract._privacy.GetKeyLocation(
      addressPair
    );

    return key.length > 0;
  }

  async Opponents(BeforeHeight = 0, Limit = 50) {
    const opponents = await this._provider._contract.storage.Opponents(
      BeforeHeight,
      Limit
    );
    const parsed = opponents.map(async (data) => {
      if (data[1][0] !== ethers.constants.AddressZero) {
        const key = new ethers.Contract(
          data[1][6],
          keyABI,
          this._provider._wallets._privacy
        );

        let message;
        let media;
        try {
          message = (await key.Text(data[1][2])).replace(
            /[^A-Za-z 0-9 \.,\?""!@#\$%\^&\*\(\)-_=\+;:<>\/\\\|\}\{\[\]`~]*/g,
            ""
          );
        } catch {
          message = message = {
            error: "Error while decode string of text message.",
          };
        }

        try {
          media = JSON.parse(
            (await key.Text(data[1][3])).replace(
              /[^A-Za-z 0-9 \.,\?""!@#\$%\^&\*\(\)-_=\+;:<>\/\\\|\}\{\[\]`~]*/g,
              ""
            )
          );
        } catch (e) {
          media = [];
        }

        return {
          FromAddress: data[1][0],
          ToAddress: data[1][1],
          MessageText: message,
          MediaLink: media,
          MessageTimestamp: parseInt(data[1][4]),
          BlockHeight: parseInt(data[1][5]),
        };
      }
    });

    return Promise.all(parsed).then((data) => {
      return data.filter((data) => data);
    });
  }

  async AMessage(address) {
    if (!ethers.utils.isAddress(address))
      throw new Error(
        "invalidAddress: parameter must be an ethereum address (starting with 0x)"
      );

    if (address.toLowerCase() === (await this._provider.address).toLowerCase())
      throw new Error(
        "invalidAddress: to parameter must be different with account address"
      );

    const messages = await this._provider._contract.storage.AMessage(address);

    const key = new ethers.Contract(
      messages[6],
      keyABI,
      this._provider._wallets._privacy
    );

    let message;
    let media;
    try {
      message = (await key.Text(messages[2])).replace(
        /[^A-Za-z 0-9 \.,\?""!@#\$%\^&\*\(\)-_=\+;:<>\/\\\|\}\{\[\]`~]*/g,
        ""
      );
    } catch {
      message = { error: "Error while decode string of text message." };
    }

    try {
      media = JSON.parse(
        (await key.Text(messages[3])).replace(
          /[^A-Za-z 0-9 \.,\?""!@#\$%\^&\*\(\)-_=\+;:<>\/\\\|\}\{\[\]`~]*/g,
          ""
        )
      );
    } catch {
      media = [];
    }

    return {
      FromAddress: messages[0],
      ToAddress: messages[1],
      MessageText: await message,
      MediaLink: await media,
      MessageTimestamp: parseInt(messages[4]),
      BlockHeight: parseInt(messages[5]),
    };
  }

  async Message(address, BeforeHeight = 0, Limit = 50) {
    if (!ethers.utils.isAddress(address))
      throw new Error(
        "invalidAddress: parameter must be an ethereum address (starting with 0x)"
      );

    if (address.toLowerCase() === (await this._provider.address).toLowerCase())
      throw new Error(
        "invalidAddress: to parameter must be different with account address"
      );

    const messages = await this._provider._contract.storage.Message(
      address,
      BeforeHeight,
      Limit
    );

    const parsed = messages.map(async (data) => {
      if (data[0] !== ethers.constants.AddressZero) {
        const key = new ethers.Contract(
          data[6],
          keyABI,
          this._provider._wallets._privacy
        );

        let message;
        let media;
        try {
          message = (await key.Text(data[2])).replace(
            /[^A-Za-z 0-9 \.,\?""!@#\$%\^&\*\(\)-_=\+;:<>\/\\\|\}\{\[\]`~]*/g,
            ""
          );
        } catch {
          message = { error: "Error while decode string of text message." };
        }

        try {
          media = JSON.parse(
            (await key.Text(data[3])).replace(
              /[^A-Za-z 0-9 \.,\?""!@#\$%\^&\*\(\)-_=\+;:<>\/\\\|\}\{\[\]`~]*/g,
              ""
            )
          );
        } catch {
          media = [];
        }

        return {
          FromAddress: data[0],
          ToAddress: data[1],
          MessageText: await message,
          MediaLink: await media,
          MessageTimestamp: parseInt(data[4]),
          BlockHeight: parseInt(data[5]),
        };
      }
    });

    return Promise.all(parsed).then((data) => {
      return data.filter((data) => data);
    });
  }

  async SendMessage(to, message, media = []) {
    if (!ethers.utils.isAddress(to))
      throw new Error(
        "invalidToAddress: to parameter must be an ethereum address (starting with 0x)"
      );

    if (to.toLowerCase() === (await this._provider.address).toLowerCase())
      throw new Error(
        "invalidToAddress: to parameter must be different with account address"
      );

    if (media.length > 0)
      media.forEach((uri) => {
        if (!HTTPSChecker(uri))
          throw new Error("invalidMedia: media must be an valid https uri");
      });

    const keyLocations = await this._provider._contract._privacy.GetKeyLocation(
      to
    );

    if (keyLocations.length === 0)
      throw new Error(
        "missingKeyLocation: Cannot find key location. Please create a new one use GenerateKeyLocation."
      );

    const key = new ethers.Contract(
      keyLocations[keyLocations.length - 1],
      keyABI,
      this._provider._wallets._privacy
    );

    message = await key.Bytes(message);
    media = await key.Bytes(JSON.stringify(media));

    if (this.useRelayer) {
      const populateTransaction =
        await this._provider._contract.storage.populateTransaction.SendMessage(
          to,
          message,
          media,
          keyLocations[keyLocations.length - 1]
        );

      const gasLimit =
        await this._provider._contract.storage.estimateGas.SendMessage(
          to,
          message,
          media,
          keyLocations[keyLocations.length - 1]
        );

      return EIP712_Data(
        this._provider._providers.storage,
        {
          ...populateTransaction,
          gas: parseInt(gasLimit.toString(), 10),
        },
        this._provider.privateKey()
      );
    } else {
      return await this._provider._contract.storage.SendMessage(
        to,
        message,
        media,
        keyLocations[keyLocations.length - 1]
      );
    }
  }

  async GetPicture(address) {
    if (!ethers.utils.isAddress(address))
      throw new Error(
        "invalidAddress: parameter must be an ethereum address (starting with 0x)"
      );

    return await this._provider._contract.storage.GetPicture(address);
  }

  async ChangePicture(media) {
    if (!HTTPSChecker(media))
      throw new Error("invalidMedia: media must be an valid https uri");

    if (this.useRelayer) {
      const populateTransaction =
        await this._provider._contract.storage.populateTransaction.ChangePicture(
          media
        );

      const gasLimit =
        await this._provider._contract.storage.estimateGas.ChangePicture(media);

      return EIP712_Data(
        this._provider._providers.storage,
        {
          ...populateTransaction,
          gas: parseInt(gasLimit.toString(), 10),
        },
        this._provider.privateKey()
      );
    } else {
      return await this._provider._contract.storage.ChangePicture(media);
    }
  }

  async GetBlocked() {
    return await this._provider._contract.storage.GetBlockList();
  }

  async AddBlockList(address) {
    if (!ethers.utils.isAddress(address))
      throw new Error(
        "invalidAddress: parameter must be an ethereum address (starting with 0x)"
      );

    if (this.useRelayer) {
      const populateTransaction =
        await this._provider._contract.storage.populateTransaction.AddBlockList(
          address
        );

      const gasLimit =
        await this._provider._contract.storage.estimateGas.AddBlockList(
          address
        );

      return EIP712_Data(
        this._provider._providers.storage,
        {
          ...populateTransaction,
          gas: parseInt(gasLimit.toString(), 10),
        },
        this._provider.privateKey()
      );
    } else {
      return await this._provider._contract.storage.AddBlockList(address);
    }
  }

  async RemoveBlockList(address) {
    if (!ethers.utils.isAddress(address))
      throw new Error(
        "invalidAddress: parameter must be an ethereum address (starting with 0x)"
      );

    if (this.useRelayer) {
      const populateTransaction =
        await this._provider._contract.storage.populateTransaction.RemoveBlockList(
          address
        );

      const gasLimit =
        await this._provider._contract.storage.estimateGas.RemoveBlockList(
          address
        );

      return EIP712_Data(
        this._provider._providers.storage,
        {
          ...populateTransaction,
          gas: parseInt(gasLimit.toString(), 10),
        },
        this._provider.privateKey()
      );
    } else {
      return await this._provider._contract.storage.RemoveBlockList(address);
    }
  }
}

module.exports = { Interactions };
