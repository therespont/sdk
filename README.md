# Respont SDK

[![npm (tag)](https://img.shields.io/npm/v/@respont/app)](https://www.npmjs.com/package/@respont/app)
[![Twitter Follow](https://img.shields.io/twitter/follow/respont_?style=social)](https://twitter.com/respont_)

Another way to interact to [Respont](https://respont.net) smart contract. [Respont](https://respont.net) is fully decentralized app for secure communication for each people.

## Installing
Using [Node.js](https://nodejs.org/)
```
npm install @respont/app
```

## Usage
### Import
```
import { Respont } from "@respont/app";
```

### Connection
```
const respont = new Respont.Connect();
```
**Optional**: `Connect()` parameter can be filled with web3 wallet provider. Empty means will using the provider from window.ethereum if detected, otherwise an error will occur.

### Event Listener
Initialize `Listeners` class.
```
import { Respont, Listeners } from "@respont/app";

const respont = new Respont.Connect();
const listener = new Listeners(respont);
```

Emit
There are three types of events:
- Ethereum: These are events fetched from web3 providers, such as [Metamask](https://docs.metamask.io/guide/ethereum-provider.html#events). So you need to know the events of the provider you are using.
```
listener.ethereum("accountsChanged");

listener.ethereum("accountsChanged", false); //Stop listening to 'accountsChanged'
```
- Provider: This is an event from [Ethers](https://docs.ethers.org/v5/api/providers/provider/#Provider--event-methods). The example can be used to emit a `block` event, so it will listen if a new block is mined.
```
listener.provider("block");

listener.provider("block", false); //Stop listening to 'block'
```
- Contract: This is an event to listen to the Response contract, such as listening if there is a new message, blocking address, profile picture changed, and so on.
```
listener.contract("Sent"); //Listen to new messages (incoming message/message sent successfully)
listener.contract("PictureChanged"); //Listen to addresses that have successfully changed profile pictures
listener.contract("BlockListAdded"); //Listen for addresses that have successfully blocked other addresses
listener.contract("BlockListRemoved"); //Listen for addresses that have successfully unblocked other addresses

listener.contract("Sent", false); //Stop listening to 'Sent'
listener.contract("PictureChanged", false); //Stop listening to 'PictureChanged'
listener.contract("BlockListAdded", false); //Stop listening to 'BlockListAdded'
listener.contract("BlockListRemoved", false); //Stop listening to 'BlockListRemoved'
```

Handler
```
listener.listener(eventName, (data) => {
  //Your code here.
})
```

Return value
For ethereum and provider events return value, can be reffered to documentation of web3 wallet you are using, like [Metamask docs](https://docs.metamask.io/guide/ethereum-provider.html#events) and [Ethers docs](https://docs.ethers.org/v5/api/providers/provider/#Provider--event-methods).
For contract event type:
- `Sent`: The returns values are Sender and Receiver of message.
- `PictureChanged`: The return value is address of changed picture
- `BlockListAdded` and `BlockListRemoved`: The returns values are blocker and blocked/unblocked address

**Tips**
You can set the events while initializing. Example:
```
const respont = new Respont.Connect();
const listener = new Listeners(respont, [
  {
    type: "provider", //type of the event
    name: "block" //name of the event
  }
]); //Array of events
```

### Transaction
Initializing
```
import { Respont, Transactions } from "@respont/app";

const respont = new Respont.Connect();
const transaction = new Transactions(respont);
```

The functions
- `Opponents`: Get a list of contacts you've interacted with before.
- `Message`: Get messages of an address. *Required*: The address of the referred interlocutor.
- `SendMessage`: Send a message. *Required*: Address of the intended interlocutor, String for the message you want to send. *Optional*: Array of media attachment (on this version is only image supported to be shown), *should be https link*.
- `GetPicture`: Get profile picture of an address. *Required*: The address of the profile photo want to get.
- `ChangePicture`: Change the owner profile picture. *Required*: String of https link.
- `GetBlocked`: Get blocked addresses.
- `AddBlockList` and `RemoveBlockList`: Block or unblock an address. *Required*: The address of the profile photo want to blocked.

Return of get message please reffered to [Utils](https://github.com/therespont/sdk/blob/be5d3ac89cf7a4b13666c89dd7c9eb31c1ba8d3a/src/Utils.js#L13).
