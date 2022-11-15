# promise_array_parallel

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Created by GunseiKPaseri](https://img.shields.io/badge/created%20by-@GunseiKPaseri-00ACEE.svg)](https://twitter.com/GunseiKPaseri)
![GitHub issues](https://img.shields.io/github/issues/GunseiKPaseri/promise_array_parallel)
![GitHub last commit](https://img.shields.io/github/last-commit/GunseiKPaseri/promise_array_parallel)
[![CodeFactor](https://www.codefactor.io/repository/github/gunseikpaseri/promise_array_parallel/badge)](https://www.codefactor.io/repository/github/gunseikpaseri/promise_array_parallel)

![denoland/deno](https://img.shields.io/badge/Deno-v1.26.x-informational?logo=deno)
![denoland/deno](https://img.shields.io/badge/Deno-v1.27.x-informational?logo=deno)
![denoland/deno](https://img.shields.io/badge/Deno-v1.28.x-informational?logo=deno)

![node.js](https://img.shields.io/badge/Node.js-16.x-informational?logo=node.js)
![node.js](https://img.shields.io/badge/Node.js-18.x-informational?logo=node.js)
![node.js](https://img.shields.io/badge/Node.js-19.x-informational?logo=node.js)

- Manage `Promise[]`.
  - Parallel execution of async function
  - Semaphore

There are no dependent packages, so it can be used in both Deno & npm environments.

## Example

See [./src/promise_array_parallel.test.ts](./src/promise_array_parallel.test.ts)

### Node

[![npm version](https://img.shields.io/npm/v/promise_array_parallel?logo=npm)](https://www.npmjs.com/package/promise_array_parallel)
![npm](https://img.shields.io/npm/dw/promise_array_parallel?logo=npm)

```bash
npm install promise_array_parallel
```

make `example.js`

```js
const PromiseArray = require('promise_array_parallel').PromiseArray

const sleep = (ms = 0) =>
  new Promise((res) => setTimeout(res, ms));

PromiseArray
    .from([...new Array(40)].map((_, i) => i < 20 ? 20 - i : i - 20))
    .parallelWork(async({idx, value}) => {
        await sleep(value * 10)
        console.log(idx)
    })
    .parallelWork(async({idx}) => {
        console.log("    " + idx)
    }, { priority: "INDEX" })
    
```

```bash
node ./example.js
```

### Deno

[![deno.land/x](https://img.shields.io/endpoint?url=https%3A%2F%2Fdeno-visualizer.danopia.net%2Fshields%2Flatest-version%2Fx%2Fpromise_array_parallel%2Fmod.ts)](https://doc.deno.land/https/deno.land/x/promise_array_parallel)
[![deno doc](https://doc.deno.land/badge.svg)](https://doc.deno.land/https://deno.land/x/promise_array_parallel/mod.ts)
[![Package Dependencies Maintaind?](https://img.shields.io/endpoint?url=https%3A%2F%2Fdeno-visualizer.danopia.net%2Fshields%2Fupdates%2Fx%2Fpromise_array_parallel%2Fmod.ts)](https://deno-visualizer.danopia.net/shields/setup/https/deno.land/x/promise_array_parallel/mod.ts)
[![nest.land](https://nest.land/badge.svg)](https://nest.land/package/promise_array_parallel)

```ts
import {PromiseArray} from 'https://deno.land/x/promise_array_parallel/mod.ts'

const sleep = (ms = 0) =>
  new Promise((res) => setTimeout(res, ms));


PromiseArray
    .from([...new Array(40)].map((_, i) => i < 20 ? 20 - i : i - 20))
    .parallelWork(async({idx, value}) => {
        await sleep(value * 10)
        console.log(idx)
    })
    .parallelWork(async({idx}) => {
        console.log("    " + idx)
    }, { priority: "INDEX" })
    
```

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
