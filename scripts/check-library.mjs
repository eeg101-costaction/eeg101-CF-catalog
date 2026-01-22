// scripts/check-library.mjs
import api from "zotero-api-client";
import dotenv from "dotenv";

// Load environment from .env if present
dotenv.config({ path: ".env" });

// Normalize env values (trim whitespace to avoid parsing issues)
const KEY = process.env.ZOTERO_KEY && process.env.ZOTERO_KEY.trim();
const LIB_TYPE = process.env.ZOTERO_LIBRARY_TYPE || "user";
const LIB_ID = process.env.ZOTERO_LIBRARY_ID
  ? Number(process.env.ZOTERO_LIBRARY_ID.trim())
  : NaN;

// Print the env-derived configuration (masked key) to help debugging
console.log("Using environment:");
console.log(
  "  ZOTERO_KEY: ",
  KEY ? `${KEY.slice(0, 6)}... (masked)` : "(missing)"
);
console.log("  ZOTERO_LIBRARY_TYPE:", LIB_TYPE);
console.log("  ZOTERO_LIBRARY_ID:", LIB_ID);

if (!KEY || !LIB_ID) {
  console.error(
    "Please set ZOTERO_KEY and ZOTERO_LIBRARY_ID in .env (or environment)"
  );
  process.exit(1);
}
// Verify key access and list collections for configured library
async function run() {
  // Resolve api factory from import shape
  let createApi = api;
  if (typeof createApi !== "function") {
    if (createApi && typeof createApi.default === "function")
      createApi = createApi.default;
    else if (createApi && typeof createApi.api === "function")
      createApi = createApi.api;
    else {
      console.error(
        "zotero-api-client import did not expose a callable factory."
      );
      process.exit(1);
    }
  }

  try {
    const apiFactory = createApi(KEY);

    // 1) Verify key access (shows which groups the key can access)
    const verifyRes = await apiFactory.verifyKeyAccess().get();
    console.log("\nverifyKeyAccess result:");
    console.dir(verifyRes.getData(), { depth: 2 });

    // 2) Bind to configured library and fetch collections
    console.log(`\nFetching collections for ${LIB_TYPE}/${LIB_ID} ...`);
    const client = apiFactory.library(LIB_TYPE, LIB_ID);
    const collectionsRes = await client
      .collections()
      .get({ format: "json", limit: 200 });
    const collections = collectionsRes.getData();

    console.log(`Collections returned: ${collections.length}`);
    // Print compact list: key and name
    const compact = collections.map((c) => ({
      key: c.key || c.data?.key,
      name: c.data?.name || c.name,
    }));
    console.dir(compact, { depth: 2 });

    process.exit(0);
  } catch (err) {
    console.error("\nError while calling Zotero API:");
    if (err && err.response) {
      console.error(
        "Response status:",
        err.response.status,
        err.response.statusText
      );
      if (typeof err.response.text === "function") {
        const text = await err.response.text();
        console.error("Response body:", text);
      } else {
        console.error(err.response);
      }
    } else {
      console.error(err);
    }
    process.exit(1);
  }
}

run();
