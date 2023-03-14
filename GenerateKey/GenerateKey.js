import NodeRSA from "node-rsa";
import crypto from "crypto";

import fs from "fs";

const { privateKey, publicKey } = crypto.generateKeyPairSync("rsa", {
  modulusLength: 2048,
});

console.log(
  "privateKey, publicKey=> ",
  privateKey,
  " publicKey ==>",
  publicKey
);

fs.writeFileSync(
  "../keys/privateKey",
  privateKey.export({ type: "pkcs1", format: "pem" })
);
fs.writeFileSync(
  "../keys/publicKey",
  publicKey.export({ type: "pkcs1", format: "pem" })
);
