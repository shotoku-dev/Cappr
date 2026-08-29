import { existsSync } from "node:fs";
import { execSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const marker = join(root, "node_modules", "react-router-dom", "package.json");

if (!existsSync(marker)) {
  console.log("Missing dependencies (react-router-dom). Running npm install…");
  execSync("npm install", { cwd: root, stdio: "inherit" });
}
