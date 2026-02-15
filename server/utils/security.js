const hashlib = require("js-hash-encoding");

function CreateHashKey(string) {
    return `${hashlib.hash(string)}:${hashlib.getHashCode(string)}:${string}`;
}

function CheckHashKey(key) {
    const partsKey = key.split(":");
    const sockIdPart = partsKey[2];
    const originalKey = `${hashlib.hash(sockIdPart)}:${hashlib.getHashCode(sockIdPart)}:${sockIdPart}`;

    return (key === originalKey ? true : false);
}

module.exports = {
    CreateHashKey,
    CheckHashKey
}