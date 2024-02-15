const { EventEmitter } = require("events");

class Listen {
  constructor(respont) {
    if (!respont)
      throw new Error(
        "invalidProvider: Provider parameter must be respont connection."
      );

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
        this._listeners.emit(eventName, ...data);
      });
    });

    chainEvents.forEach((eventName) => {
      respont._providers.storage.on(eventName, (...data) => {
        this._listeners.emit(eventName, ...data);
      });
    });

    chainEvents.forEach((eventName) => {
      respont._providers._privacy.on(eventName, (_) => {});
    });

    return this._listeners;
  }
}

module.exports = { Listen };
