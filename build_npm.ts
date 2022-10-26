// ex. scripts/build_npm.ts
import { build, emptyDir } from "https://deno.land/x/dnt@0.31.0/mod.ts";

await emptyDir("./npm");

await build({
  entryPoints: ["./mod.ts"],
  outDir: "./npm",
  shims: {
    // see JS docs for overview and more options
    deno: true,
  },
  package: {
    // package.json properties
    name: "promise-array",
    version: Deno.args[0],
    description: "Manage arrays of Promise",
    license: "MIT",
    repository: {
      type: "git",
      url: "git+https://github.com/GunseiKPaseri/promise-array.git",
    },
    bugs: {
      url: "https://github.com/GunseiKPaseri/promise-array/issues",
    },
  },
});

// post build steps
Deno.copyFileSync("LICENSE", "npm/LICENSE");
Deno.copyFileSync("README.md", "npm/README.md");