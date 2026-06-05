const { execFileSync } = require("child_process");
const fs = require("fs");
const path = require("path");

exports.default = async function afterPack(context) {
  if (context.electronPlatformName !== "win32") return;

  const root = context.packager.projectDir;
  const rcedit = path.join(root, "node_modules", "electron-winstaller", "vendor", "rcedit.exe");
  const icon = path.join(root, "assets", "icons", "openflow-mark.ico");
  const exe = path.join(context.appOutDir, "OpenFlow.exe");

  for (const requiredPath of [rcedit, icon, exe]) {
    if (!fs.existsSync(requiredPath)) {
      throw new Error(`Missing required file: ${requiredPath}`);
    }
  }

  execFileSync(rcedit, [
    exe,
    "--set-icon", icon,
    "--set-version-string", "FileDescription", "OpenFlow",
    "--set-version-string", "ProductName", "OpenFlow",
    "--set-version-string", "InternalName", "OpenFlow",
    "--set-version-string", "OriginalFilename", "OpenFlow.exe",
    "--set-version-string", "CompanyName", "OpenFlow"
  ], { stdio: "inherit" });
};
