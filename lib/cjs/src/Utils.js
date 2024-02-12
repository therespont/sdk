module.exports = function HTTPSChecker(uri) {
  try {
    uri = new URL(uri);
  } catch (_) {
    return false;
  }

  return uri.protocol === "https:";
};
