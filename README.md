# promise_array_parallel

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=square)](https://makeapullrequest.com)
[![Created by GunseiKPaseri](https://img.shields.io/badge/created%20by-@GunseiKPaseri-00ACEE.svg)](https://twitter.com/GunseiKPaseri)

![GitHub issues](https://img.shields.io/github/issues/GunseiKPaseri/promise_array_parallel)
![GitHub last commit](https://img.shields.io/github/last-commit/GunseiKPaseri/promise_array_parallel)

[![deno.land/x](https://img.shields.io/endpoint?url=https%3A%2F%2Fdeno-visualizer.danopia.net%2Fshields%2Flatest-version%2Fx%2Fpromise_array_parallel%2Fmod.ts)](https://doc.deno.land/https/deno.land/x/promise_array_parallel)
[![deno doc](https://doc.deno.land/badge.svg)](https://doc.deno.land/https://deno.land/x/promise_array_parallel/mod.ts)
![Package Dependencies Maintaind?](https://img.shields.io/endpoint?url=https%3A%2F%2Fdeno-visualizer.danopia.net%2Fshields%2Fupdates%2Fx%2Fpromise_array_parallel%2Fmod.ts)
[![nest.land](https://nest.land/badge.svg)](https://nest.land/package/promise_array_parallel)

[![npm version](https://img.shields.io/npm/v/promise_array_parallel?logo=npm)](https://badge.fury.io/js/promise_array_parallel)
![npm](https://img.shields.io/npm/dw/promise_array_parallel?logo=npm)

- Manage `Promise[]`.
  - Parallel execution of async function
  - Semaphore

There are no dependent packages, so it can be used in both Deno & npm environments.

## Example

See [./src/promise_array_parallel.test.ts](./src/promise_array_parallel.test.ts)

## Develop This package

This package is developed in Deno; it is recommended to install Deno.

### Lint / Format / test

```bash
deno task test
```

### Generate NPM Package & Publish

```bash
deno task dnt
```

Automatically published when you push the tagged main branch
