
# Respont SDK
[Website](https://respont.net/)
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
import * as Respont from "@respont/app";
```
  
### Connection
```
const respont = new Respont.Connect(walletKey, hexChainId);
```
**Optional**: `Connect()` first parameter can be filled with private key or mnemonic phrases.

### Interactions
```
const interact = new Interactions(respont);
```
  
The functions
- `GenerateKeyLocation`
-  `Opponents`: Get a list of contacts you've interacted with before.
-  `Message`: Get messages of an address. *Required*: The address of the referred interlocutor.
-  `SendMessage`: Send a message. *Required*: Address of the intended interlocutor, String for the message you want to send. *Optional*: Array of media attachment (on this version is only image supported to be shown), *should be https link*.
-  `GetPicture`: Get profile picture of an address. *Required*: The address of the profile photo want to get.
-  `ChangePicture`: Change the owner profile picture. *Required*: String of https link.
-  `GetBlocked`: Get blocked addresses.
-  `AddBlockList` and `RemoveBlockList`: Block or unblock an address. *Required*: The address of the profile want to blocked.
  
Return of get message is object:
```
{
	FromAddress,
	ToAddress,
	MessageText,
	MediaLink,
	MessageTimestamp,
	BlockHeight,
}
```

### Events Handler
```
const listen = new Respont.Listen(respont);
listen.on(eventName, functionEventHandler);
```

| Event Name       | Argument              |
| ---------------- | --------------------- |
| PictureChanged   | Owner, MediaLink      |
| Sent             | Sender, Receiver      |
| BlockListAdded   | Owner, BlockedAddress |
| BlockListRemoved | Owner, BlockedAddress |
| block            | blockNumber           |

Detail: [Github](https://github.com/therespont/sdk) / [Documentation](https://github.com/therespont/sdk/blob/main/README.md)