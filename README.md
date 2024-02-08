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
const respont = new Respont.Connect(walletKey, JSON_RPC);
```

**Note**: `Connect()` first parameter can be filled with private key or mnemonic phrases.
We are now only supported mumbai polygon testnet (`80001` / `13881`)

### Interactions

```
const interact = new Interactions(respont);
```

**What can do:**

#### GetKeyLocation

Function to get key location in Oasis Privacy Layer with confidential contract.
Return [Address](#return-address)

#### AMessage

Function to get one last message from/to an address.
Parameter: [Address](#Address)
Return [Message](#message)

#### Opponents

Function to get interlocutors.
Parameters: [BeforeHeight](#BeforeHeight) and [Limit](#Limit)
Return array of [Message](#return-message)

#### Message

Function to get messages from a interlocutor.
Parameters: [BeforeHeight](#BeforeHeight) and [Limit](#Limit)
Return array of [Message](#return-message)

### SendMessage

Function to send a message to a interlocutor.
Parameters: To ([Address](#address)), message (string), and [Media](#media)
Return: Please refer to [ethers transaction return in their documentation](https://docs.ethers.org/v5/api/providers/types/#types--transactions)

### GetPicture

Function to get profile picture of a address.
Parameters: [Address](#address)
Return: String with format _https_ url format.

### ChangePicture

Function to get change profile picture of [connected address](#connection).
Parameters: [Media](#media)
Return: Please refer to [ethers transaction return in their documentation](https://docs.ethers.org/v5/api/providers/types/#types--transactions)

### GetBlocked

Function to get interlocutors address blocked by [connected address](#connection).
Return: Array [Address](#address)

### AddBlockList

Function to block a interlocutor address.
Parameter: [Address](#address)
Return: Please refer to [ethers transaction return in their documentation](https://docs.ethers.org/v5/api/providers/types/#types--transactions)

### RemoveBlockList

Function to unblock a interlocutor address.
Parameter: [Address](#address)
Return: Please refer to [ethers transaction return in their documentation](https://docs.ethers.org/v5/api/providers/types/#types--transactions)

## Parameters

### Address

Parameter basically is a string but with 42-character hexadecimal. Please refer to [ethers.js documentation](https://docs.ethers.org/v5/api/utils/address/#address-formats).

### BeforeHeight

Parameter with type data integer. The functional is for cursor due to resource efficiency. Example of use is last BlockHeight from [Message](#return-message) return

### Media

Parameter with type data array contain string which the urls of media (image, file, etc). **Note** the media urls accepted format is _https_ url.

## Return

### Return Address

It is a string with 42-character hexadecimal. Please refer to [ethers.js documentation](https://docs.ethers.org/v5/api/utils/address/#address-formats).

### Return Message

It is human-read message object. Object contents:

- FromAddress: [Address](#return-address)
- ToAddress: [Address](#return-address)
- MessageText: string
- MediaLink: Array [Media](#return-media)
- MessageTimestamp: Integer
- BlockHeight: Integer

### Return Media

It is a string with _https_ urls format.

### Events

```
const listen = new Respont.Listen(respont);
listen.on(eventName, functionEventHandler);
```

| Event Name       | Argument                                                                            | Description                                                              |
| ---------------- | ----------------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| PictureChanged   | Owner([Address](#return-address)), MediaLink([Media](#return-media))                | Notify every address changed their profile picture.                      |
| Sent             | Sender([Address](#return-address)), Receiver([Address](#return-address))            | Notify a new message from/to [connected address](#connection).           |
| BlockListAdded   | Owner([Address](#return-address)), BlockedAddress(Array [Address](#return-address)) | Notify every blocked interlocutor by [connected address](#connection).   |
| BlockListRemoved | Owner([Address](#return-address)), BlockedAddress([Address](#return-address))       | Notify every ubblocked interlocutor by [connected address](#connection). |
| block            | blockNumber(Integer)                                                                | Notify every new generated block.                                        |

Detail: [Github](https://github.com/therespont/sdk) / [SDK Documentation](https://github.com/therespont/sdk/blob/main/README.md) / [Architecture Documentation](https://docs.respont.net/)
