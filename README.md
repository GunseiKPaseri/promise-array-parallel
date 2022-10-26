# promise_array_parallel

## What does this do?

- Manage `Promise[]`.
  - Parallel execution of async function
  - Semaphore

There are no dependent packages, so it can be used in both Deno & Node environments.

## Example

See promise-array.test.ts

## Develop This package

This package is developed in Deno; it is recommended to install Deno.

### Test

```bash
deno test
```

### Lint / Format

```bash
deno lint
deno fmt
```

### Generate NPM Package

```bash
deno run -A build_npm.ts [version]
```

## LICENSE

MIT
