import info from "../info.json" assert { type: "json" };

const result = {
  "$schema": "https://x.nest.land/eggs@0.3.4/src/schema.json",
  "name": info.name,
  "entry": "./mod.ts",
  "description": info.description,
  "homepage": info.bugs.url,
  "version": Deno.args[0]?.replace(/^v/g, ""),
  "files": [
    "./**/*.ts",
    "./**/*.js",
    "README.md"
  ],
  "ignore": [
    ".github",
    ".vscode",
    "npm",
    "scripts",
    "examples"
  ],
  "checkFormat": false,
  "checkTests": false,
  "checkInstallation": false,
  "check": true,
  "unlisted": false
}

console.log(JSON.stringify(result, null, '  '))