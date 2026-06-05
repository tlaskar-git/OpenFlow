const { execFileSync } = require("child_process");
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const dist = path.join(root, "dist");
const source = path.join(dist, "win-unpacked");
const sevenZip = path.join(root, "node_modules", "7zip-bin", "win", "x64", "7za.exe");
const archive = path.join(dist, "OpenFlow_v_0.1.0_Fast.7z");
const checksum = `${archive}.sha256`;

if (!fs.existsSync(source)) {
  throw new Error(`Missing unpacked app folder: ${source}`);
}

if (!fs.existsSync(sevenZip)) {
  throw new Error(`Missing 7-Zip binary: ${sevenZip}`);
}

for (const output of [archive, checksum]) {
  if (fs.existsSync(output)) fs.rmSync(output, { force: true });
}

execFileSync(sevenZip, [
  "a",
  "-t7z",
  "-mx=9",
  archive,
  path.join(source, "*")
], {
  cwd: root,
  stdio: "inherit",
  windowsHide: true
});

const hash = crypto
  .createHash("sha256")
  .update(fs.readFileSync(archive))
  .digest("hex")
  .toUpperCase();

fs.writeFileSync(checksum, `${hash}  OpenFlow_v_0.1.0_Fast.7z\n`);
