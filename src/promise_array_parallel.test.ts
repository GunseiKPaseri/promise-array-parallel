import {
  assert,
  assertEquals,
  assertRejects,
} from "https://deno.land/std@0.160.0/testing/asserts.ts";

import { PromiseArray } from "./promise_array_parallel.ts";
import { SeedableRandom, sleep } from "./util.ts";

Deno.test("First come, first served", async () => {
  let parallelSizeX = 0;
  let parallelSizeXMax = 0;
  let parallelSizeY = 0;
  let parallelSizeYMax = 0;
  const r = new SeedableRandom();
  let coming = 0;
  let maxComing = 0;
  const t = await PromiseArray
    .from([...new Array(100)].map((_, i) => i))
    .parallelWork(async () => {
      parallelSizeX++;
      parallelSizeXMax = Math.max(parallelSizeXMax, parallelSizeX);
      await sleep(r.int(10, 200));
      parallelSizeX--;
      return coming++;
    }, { parallelDegMax: 20 })
    .parallelWork(async ({ idx, value }) => {
      assertEquals(value, maxComing, "Executed in sequence");
      maxComing++;
      parallelSizeY++;
      parallelSizeYMax = Math.max(parallelSizeYMax, parallelSizeY);
      await sleep(r.int(10, 200));
      parallelSizeY--;
      return idx + 100;
    }, { parallelDegMax: 10, priority: "COME" })
    .all();
  assert(parallelSizeX <= 20);
  assert(parallelSizeY <= 10);
  assertEquals(t, [...new Array(100)].map((_, i) => 100 + i));
});

Deno.test("First index, first served", async () => {
  let parallelSizeX = 0;
  let parallelSizeXMax = 0;
  let parallelSizeY = 0;
  let parallelSizeYMax = 0;
  const r = new SeedableRandom();
  let index = 0;
  const t = await PromiseArray
    .from([...new Array(100)].map((_, i) => i))
    .parallelWork(async () => {
      parallelSizeX++;
      parallelSizeXMax = Math.max(parallelSizeXMax, parallelSizeX);
      await sleep(r.int(10, 200));
      parallelSizeX--;
    }, { parallelDegMax: 20 })
    .parallelWork(async ({ idx }) => {
      assertEquals(idx, index, "Indexes come in order.");
      index++;
      parallelSizeY++;
      parallelSizeYMax = Math.max(parallelSizeYMax, parallelSizeY);
      await sleep(r.int(10, 200));
      parallelSizeY--;
      return idx + 100;
    }, { parallelDegMax: 10, priority: "INDEX" })
    .all();
  assert(parallelSizeX <= 20);
  assert(parallelSizeY <= 10);
  assertEquals(t, [...new Array(100)].map((_, i) => 100 + i));
});

Deno.test("Rejected, all() throw error", async () => {
  const r = new SeedableRandom();
  const x = PromiseArray
    .from([...new Array(100)].map((_, i) => i))
    .parallelWork(async ({ idx }) => {
      if (idx === 50) throw new Error("SOMETHING ERROR!");
      await sleep(r.int(30, 100));
    }, { parallelDegMax: 20 })
    .parallelWork(async ({ idx }) => {
      await sleep(r.int(30, 100));
      return idx + 100;
    }, { parallelDegMax: 10, priority: "INDEX" });
  await assertRejects(() => x.all(), Error, "SOMETHING ERROR!");
});

Deno.test("Rejected, allSettled not throw error", async () => {
  const r = new SeedableRandom();
  const x = PromiseArray
    .from([...new Array(100)].map((_, i) => i))
    .parallelWork(async ({ idx }) => {
      if (idx === 50) throw new Error("SOMETHING ERROR!");
      await sleep(r.int(30, 100));
    }, { parallelDegMax: 20 })
    .parallelWork(async ({ idx }) => {
      await sleep(r.int(30, 100));
      return idx + 100;
    }, { parallelDegMax: 10, priority: "INDEX" });
  const allSettled = await x.allSettled().catch((reason) => {
    console.log(reason);
    return [];
  });
  assertEquals(
    allSettled,
    [...new Array(100)]
      .map<PromiseSettledResult<number>>((_, i) => (
        i === 50
          ? {
            status: "rejected",
            reason: "reason" in allSettled[50] ? allSettled[50].reason : null,
          }
          : { status: "fulfilled", value: 100 + i }
      )),
  );
});

Deno.test("maintain sequence", async () => {
  const r = new SeedableRandom();
  const x = await PromiseArray
    .from([...new Array(100)].map((_, i) => i))
    .parallelWork(async ({ value, idx }) => {
      await sleep(r.int(30, 100));
      return value + idx;
    }, { parallelDegMax: 20, priority: "COME" })
    .parallelWork(async ({ value, idx }) => {
      await sleep(r.int(30, 100));
      return value + idx;
    }, { parallelDegMax: 10, priority: "INDEX" })
    .parallelWork(async ({ value, idx }) => {
      await sleep(r.int(30, 100));
      return value + idx;
    }, { parallelDegMax: 20, priority: "COME" })
    .parallelWork(async ({ value, idx }) => {
      await sleep(r.int(30, 100));
      return value + idx;
    }, { parallelDegMax: 10, priority: "COME" })
    .parallelWork(async ({ value, idx }) => {
      await sleep(r.int(30, 100));
      return value + idx;
    }, { parallelDegMax: 10, priority: "INDEX" })
    .parallelWork(async ({ value, idx }) => {
      await sleep(r.int(30, 100));
      return value + idx;
    }, { parallelDegMax: 10, priority: "INDEX" })
    .all();
  assertEquals(
    x,
    [...new Array(100)].map((_, i) => i * 7),
  );
});

Deno.test("IntervalTime", async () => {
  const r = new SeedableRandom();
  const startTimeA: number[] = [];
  const startTimeB: number[] = [];
  const startTimeC: number[] = [];
  await PromiseArray
    .from([...new Array(100)].map((_, i) => i))
    .parallelWork(async ({ value, idx }) => {
      startTimeA.push(performance.now());
      await sleep(r.int(30, 100));
      return value + idx;
    }, { parallelDegMax: 20, priority: "COME", workIntervalMS: 20 })
    .parallelWork(async ({ value, idx }) => {
      startTimeB.push(performance.now());
      await sleep(r.int(2, 15));
      return value + idx;
    }, { parallelDegMax: 20, priority: "COME", workIntervalMS: 20 })
    .parallelWork(async ({ value, idx }) => {
      startTimeC.push(performance.now());
      await sleep(r.int(30, 100));
      return value + idx;
    }, { parallelDegMax: 20, priority: "INDEX", workIntervalMS: 20 })
    .all();
  const timeIntervalMin = Math.min(
    ...[startTimeA, startTimeB, startTimeC].map((startTime) => (
      startTime
        .map((v, i) => (i === 0 ? Infinity : v - startTime[i - 1]))
        .reduce((prev, cur) => Math.min(prev, cur), Infinity)
    )),
  );
  assert(
    timeIntervalMin + 1 >= 20,
    `MUST timeIntervalMin(${timeIntervalMin}) + 1 >= 20`,
  );
});
