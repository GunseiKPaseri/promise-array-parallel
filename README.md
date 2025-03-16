# promise-array-parallel

[![JSR](https://jsr.io/badges/@gunseikpaseri/promise-array-parallel)](https://jsr.io/@gunseikpaseri/promise-array-parallel)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Created by GunseiKPaseri](https://img.shields.io/badge/created%20by-@GunseiKPaseri-00ACEE.svg)](https://twitter.com/GunseiKPaseri)
![GitHub issues](https://img.shields.io/github/issues/GunseiKPaseri/promise_array_parallel)
![GitHub last commit](https://img.shields.io/github/last-commit/GunseiKPaseri/promise_array_parallel)
[![CodeFactor](https://www.codefactor.io/repository/github/gunseikpaseri/promise_array_parallel/badge)](https://www.codefactor.io/repository/github/gunseikpaseri/promise_array_parallel)

- Manage `Promise[]`.
  - Parallel execution of async function
  - Semaphore (Limitation on the number of parallels)

There are no dependent packages, so it can be used in both Deno & npm environments.

## Example

See [./src/promise_array_parallel.test.ts](./src/promise_array_parallel.test.ts)

### Deno

```ts
import { PromiseArray } from "jsr:@gunseikpaseri/promise-array-parallel";

const sleep = (ms = 0) => new Promise((res) => setTimeout(res, ms));

PromiseArray
  .from([...new Array(40)].map((_, i) => i < 20 ? 20 - i : i - 20))
  .parallelWork(async ({ idx, value }) => {
    await sleep(value * 10);
    console.log(idx);
  })
  .parallelWork(async ({ idx }) => {
    console.log("    " + idx);
  }, { priority: "INDEX" });
```

## Develop This package

This package is developed in Deno; it is recommended to install Deno.

### Lint / Format / test

```bash
deno task test
```
