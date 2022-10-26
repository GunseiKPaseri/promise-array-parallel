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

### Generate NPM Package & Publish

```bash
deno run -A build_npm.ts v0.0.1
git commit -m 'hogehoge'
git push
git tag -a v0.0.1 -m 'hogehoge'
git push origin v0.0.1
npm publish
```

## LICENSE

MIT
