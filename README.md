# promise_array_parallel

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
![GitHub issues](https://img.shields.io/github/issues/GunseiKPaseri/promise_array_parallel)
![GitHub last commit](https://img.shields.io/github/last-commit/GunseiKPaseri/promise_array_parallel)

[![Custom badge](https://img.shields.io/endpoint?url=https%3A%2F%2Fdeno-visualizer.danopia.net%2Fshields%2Flatest-version%2Fx%2Fpromise_array_parallel%2Fmod.ts)](https://doc.deno.land/https/deno.land/x/promise_array_parallel/mod.ts)
[![deno doc](https://doc.deno.land/badge.svg)](https://doc.deno.land/https://deno.land/x/promise_array_parallel/mod.ts)
![Custom badge](https://img.shields.io/endpoint?url=https%3A%2F%2Fdeno-visualizer.danopia.net%2Fshields%2Fdep-count%2Fx%2Fpromise_array_parallel%2Fmod.ts)
![Custom badge](https://img.shields.io/endpoint?url=https%3A%2F%2Fdeno-visualizer.danopia.net%2Fshields%2Fupdates%2Fx%2Fpromise_array_parallel%2Fmod.ts)

[![npm version](https://badge.fury.io/js/promise_array_parallel.svg)](https://badge.fury.io/js/promise_array_parallel)
![npm](https://img.shields.io/npm/dw/promise_array_parallel)

- Manage `Promise[]`.
  - Parallel execution of async function
  - Semaphore

There are no dependent packages, so it can be used in both Deno & npm environments.

## Example

See promise-array.test.ts

## Develop This package

This package is developed in Deno; it is recommended to install Deno.

### Test

```bash
deno check ./mod.ts
deno test
```

### Lint / Format

```bash
deno lint
deno fmt
```

### Generate NPM Package & Publish

```bash
deno run -A build_npm.ts 0.0.1
git commit -m 'hogehoge'
git push
git tag -a 0.0.1 -m 'hogehoge'
git push origin 0.0.1
npm publish
```
