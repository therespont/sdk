export const HTTPSChecker = (uri) => {
  try {
    uri = new URL(uri);
  } catch (_) {
    return false;
  }

  return uri.protocol === "https:";
};

export const MessageParser = (message) => {
  return {
    ToAddress: typeof message[1] === "object" ? message[1][0] : message[1],
    FromAddress: typeof message[1] === "object" ? message[1][1] : message[0],
    MessageText:
      typeof message[1] === "object"
        ? decodeURI(message[1][2])
        : decodeURI(message[2]),
    MediaLink: typeof message[1] === "object" ? message[1][3] : message[3],
    MessageTimestamp:
      typeof message[1] === "object"
        ? parseInt(message[1][4]._hex, 16)
        : parseInt(message[4]._hex, 16),
    BlockHeight:
      typeof message[1] === "object"
        ? parseInt(message[1][5]._hex, 16)
        : parseInt(message[5]._hex, 16),
  };
};
