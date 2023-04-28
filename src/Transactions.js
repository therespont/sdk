import { ethers } from "ethers";

import { HTTPSChecker, MessageParser } from "./Utils.js";

class Transactions {
  constructor(provider) {
    this._provider = provider;
  }

  async Opponents() {
    const opponents = await this._provider._contract.Opponents();
    const parsed = [];

    opponents.forEach((data) => {
      parsed.push(MessageParser(data));
    });

    return parsed;
  }

  async Message(address) {
    if (!ethers.utils.isAddress(address))
      throw new Error(
        "invalidAddress: parameter must be an ethereum address (starting with 0x)"
      );

    if (
      address.toLowerCase() === (await this._provider.accounts()).toLowerCase()
    )
      throw new Error(
        "invalidAddress: to parameter must be different with account address"
      );

    const messages = await this._provider._contract.Message(address);
    const parsed = [];

    messages.forEach((data) => {
      parsed.push(MessageParser(data));
    });

    return parsed;
  }

  async SendMessage(to, message, media = []) {
    if (!ethers.utils.isAddress(to))
      throw new Error(
        "invalidToAddress: to parameter must be an ethereum address (starting with 0x)"
      );

    if (to.toLowerCase() === (await this._provider.accounts()).toLowerCase())
      throw new Error(
        "invalidToAddress: to parameter must be different with account address"
      );

    if (media.length > 0)
      media.forEach((uri) => {
        if (!HTTPSChecker(uri))
          throw new Error("invalidMedia: media must be an valid https uri");
      });

    message = await this._provider._contract.GenerateText(encodeURI(message));

    return await this._provider._contract.SendMessage(to, message, media);
  }

  async GetPicture(address) {
    if (!ethers.utils.isAddress(address))
      throw new Error(
        "invalidAddress: parameter must be an ethereum address (starting with 0x)"
      );

    return await this._provider._contract.GetPicture(address);
  }

  async ChangePicture(media) {
    if (!HTTPSChecker(media))
      throw new Error("invalidMedia: media must be an valid https uri");

    return await this._provider._contract.ChangePicture(media);
  }

  async GetBlocked() {
    return await this._provider._contract.GetBlockList();
  }

  async AddBlockList(address) {
    if (!ethers.utils.isAddress(address))
      throw new Error(
        "invalidAddress: parameter must be an ethereum address (starting with 0x)"
      );

    return await this._provider._contract.AddBlockList(address);
  }

  async RemoveBlockList(address) {
    if (!ethers.utils.isAddress(address))
      throw new Error(
        "invalidAddress: parameter must be an ethereum address (starting with 0x)"
      );

    return await this._provider._contract.RemoveBlockList(address);
  }
}

export default Transactions;
