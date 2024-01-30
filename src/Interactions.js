import { ethers } from "ethers";

import { HTTPSChecker } from "./Utils.js";
import keyABI from "../contract/abi/privacy/key.json";

class Interactions {
  constructor(provider) {
    this._provider = provider;
  }

  async GenerateKeyLocation(key, addressPair) {
    if (key.length === 0)
      throw new Error("undefinedKey: Please provide a key value.");

    return await this._provider._contract._privacy.GenerateKeyLocation(
      key,
      addressPair,
      this._provider.address
    );
  }

  async Opponents() {
    const opponents = await this._provider._contract.storage.Opponents();
    const parsed = opponents.map(async (data) => {
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
        media = JSON.parse(await key.Text(data[1][3])).replace(
          /[^A-Za-z 0-9 \.,\?""!@#\$%\^&\*\(\)-_=\+;:<>\/\\\|\}\{\[\]`~]*/g,
          ""
        );
      } catch {
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
    });

    return Promise.all(parsed).then((data) => {
      return data;
    });
  }

  async Message(address) {
    if (!ethers.utils.isAddress(address))
      throw new Error(
        "invalidAddress: parameter must be an ethereum address (starting with 0x)"
      );

    if (address.toLowerCase() === (await this._provider.address).toLowerCase())
      throw new Error(
        "invalidAddress: to parameter must be different with account address"
      );

    const messages = await this._provider._contract.storage.Message(address);

    const parsed = messages.map(async (data) => {
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
        media = JSON.parse(await key.Text(data[3])).replace(
          /[^A-Za-z 0-9 \.,\?""!@#\$%\^&\*\(\)-_=\+;:<>\/\\\|\}\{\[\]`~]*/g,
          ""
        );
      } catch {
        media = [];
      }

      return {
        FromAddress: data[0],
        ToAddress: data[1],
        MessageText: message,
        MediaLink: media,
        MessageTimestamp: parseInt(data[4]),
        BlockHeight: parseInt(data[5]),
      };
    });

    return Promise.all(parsed).then((data) => {
      return data;
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

    return await this._provider._contract.storage.SendMessage(
      to,
      message,
      media,
      keyLocations[keyLocations.length - 1]
    );
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

    return await this._provider._contract.storage.ChangePicture(media);
  }

  async GetBlocked() {
    return await this._provider._contract.storage.GetBlockList();
  }

  async AddBlockList(address) {
    if (!ethers.utils.isAddress(address))
      throw new Error(
        "invalidAddress: parameter must be an ethereum address (starting with 0x)"
      );

    return await this._provider._contract.storage.AddBlockList(address);
  }

  async RemoveBlockList(address) {
    if (!ethers.utils.isAddress(address))
      throw new Error(
        "invalidAddress: parameter must be an ethereum address (starting with 0x)"
      );

    return await this._provider._contract.storage.RemoveBlockList(address);
  }
}

export default Interactions;
