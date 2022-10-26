import {
  assert,
  assertEquals,
} from "https://deno.land/std@0.160.0/testing/asserts.ts";

import { PromiseArray } from "./promise-array.ts";
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
      await sleep(r.int(30, 1000));
      parallelSizeX--;
      return coming++;
    }, { parallelDegMax: 20 })
    .parallelWork(async ({ idx, value }) => {
      assertEquals(value, maxComing, "Executed in sequence");
      maxComing++;
      parallelSizeY++;
      parallelSizeYMax = Math.max(parallelSizeYMax, parallelSizeY);
      await sleep(r.int(30, 1000));
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
      await sleep(r.int(30, 1000));
      parallelSizeX--;
    }, { parallelDegMax: 20 })
    .parallelWork(async ({ idx }) => {
      assertEquals(idx, index, "Indexes come in order.");
      index++;
      parallelSizeY++;
      parallelSizeYMax = Math.max(parallelSizeYMax, parallelSizeY);
      await sleep(r.int(30, 1000));
      parallelSizeY--;
      return idx + 100;
    }, { parallelDegMax: 10, priority: "INDEX" })
    .all();
  assert(parallelSizeX <= 20);
  assert(parallelSizeY <= 10);
  assertEquals(t, [...new Array(100)].map((_, i) => 100 + i));
});
