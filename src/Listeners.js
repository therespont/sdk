import { EventEmitter } from "events";
import { ethers } from "ethers";

import * as Respont from "../contants/index.js";

class Listen {
  constructor(respont) {
    this._listeners = new EventEmitter();

    const contractEvents = [
      "PictureChanged",
      "Sent",
      "BlockListAdded",
      "BlockListRemoved",
    ];

    const chainEvents = ["block"];

    contractEvents.forEach((eventName) => {
      respont._contract.storage.on(eventName, (...data) => {
        this._listeners.emit(eventName, { eventName, ...data });
      });
    });

    chainEvents.forEach((eventName) => {
      respont._providers.storage.on(eventName, (...data) => {
        this._listeners.emit(eventName, { eventName, ...data });
      });
    });

    return this._listeners;
  }
}

export default Listen;
