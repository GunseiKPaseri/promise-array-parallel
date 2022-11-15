// ex. scripts/build_npm.ts
import { build, emptyDir } from "https://deno.land/x/dnt@0.31.0/mod.ts";
import info from "../info.json" assert { type: "json" };

await emptyDir("./npm");

await build({
  entryPoints: ["./mod.ts"],
  outDir: "./npm",
  shims: {
    deno: true,
    customDev: [{
      package: {
        name: "perf_hooks"
      },
      globalNames: ["performance"]
    }]
  },
  package: {
    // package.json properties
    ...info,
    version: Deno.args[0]?.replace(/^v/g, ""),
  },
  scriptModule: "umd"
});

// post build steps
Deno.copyFileSync("LICENSE", "npm/LICENSE");
Deno.copyFileSync("README.md", "npm/README.md");