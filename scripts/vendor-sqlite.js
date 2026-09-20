const fs = require("fs");
const path = require("path");

// expo-sqlite's Android gradle task downloads this exact file from
// sqlite.org during the build. That download is flaky on EAS Build
// workers ("Network is unreachable"), so this hook (run via the
// "eas-build-post-install" npm script) pre-populates Gradle's download
// cache with a vendored copy, and the gradle task (overwrite(false))
// reuses it instead of hitting the network.
const SQLITE_VERSION = "3450300";
const FILENAME = `sqlite-amalgamation-${SQLITE_VERSION}.zip`;

const source = path.join(__dirname, "..", "vendor", FILENAME);
const destDir = path.join(
  __dirname,
  "..",
  "node_modules",
  "expo-sqlite",
  "android",
  "build",
  "downloads"
);
const dest = path.join(destDir, FILENAME);

if (!fs.existsSync(source)) {
  console.log(`[vendor-sqlite] ${source} not found, skipping.`);
  process.exit(0);
}

fs.mkdirSync(destDir, { recursive: true });
fs.copyFileSync(source, dest);
console.log(`[vendor-sqlite] Copied ${FILENAME} into expo-sqlite's Gradle download cache.`);
