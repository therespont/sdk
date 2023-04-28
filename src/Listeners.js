import { EventEmitter } from "events";

class Listeners {
  constructor(provider, listen = []) {
    this._listeners = {
      listener: new EventEmitter(),
      provider: function (eventName, isListen = true) {
        if (isListen)
          provider._ethers.on(eventName, (...data) => {
            this.listener.emit(eventName, ...data);
          });
        else provider._ethers.removeListener(eventName);
      },
      ethereum: function (eventName, isListen = true) {
        if (isListen)
          provider._ethereum.on(eventName, (...data) => {
            this.listener.emit(eventName, ...data);
          });
        else provider._ethereum.removeListener(eventName);
      },
      contract: function (eventName, isListen = true) {
        if (isListen)
          provider._contract.on(eventName, (...data) => {
            this.listener.emit(eventName, ...data);
          });
        else provider._contract.removeListener(eventName);
      },
    };

    listen.forEach((events) => {
      if (
        (events.type.toLowerCase() === "provider" ||
          events.type.toLowerCase() === "contract" ||
          events.type.toLowerCase() === "ethereum") &&
        events.name
      ) {
        if (events.type === "provider") this._listeners.provider(events.name);
        else if (events.type === "contract")
          this._listeners.contract(events.name);
        else this._listeners.ethereum(events.name);
      } else {
        throw new Error(
          "unsupportedEventType: Only 'provider', 'contract', or 'ethereum' type is accepted"
        );
      }
    });

    return this._listeners;
  }
}

export default Listeners;
