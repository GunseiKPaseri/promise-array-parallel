"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const dntShim = __importStar(require("../_dnt.test_shims.js"));
const asserts_js_1 = require("../deps/deno.land/std@0.160.0/testing/asserts.js");
const promise_array_parallel_js_1 = require("./promise_array_parallel.js");
const util_js_1 = require("./util.js");
dntShim.Deno.test("First come, first served", async () => {
    let parallelSizeX = 0;
    let parallelSizeXMax = 0;
    let parallelSizeY = 0;
    let parallelSizeYMax = 0;
    const r = new util_js_1.SeedableRandom();
    let coming = 0;
    let maxComing = 0;
    const t = await promise_array_parallel_js_1.PromiseArray
        .from([...new Array(100)].map((_, i) => i))
        .parallelWork(async () => {
        parallelSizeX++;
        parallelSizeXMax = Math.max(parallelSizeXMax, parallelSizeX);
        await (0, util_js_1.sleep)(r.int(10, 200));
        parallelSizeX--;
        return coming++;
    }, { parallelDegMax: 20 })
        .parallelWork(async ({ idx, value }) => {
        (0, asserts_js_1.assertEquals)(value, maxComing, "Executed in sequence");
        maxComing++;
        parallelSizeY++;
        parallelSizeYMax = Math.max(parallelSizeYMax, parallelSizeY);
        await (0, util_js_1.sleep)(r.int(10, 200));
        parallelSizeY--;
        return idx + 100;
    }, { parallelDegMax: 10, priority: "COME" })
        .all();
    (0, asserts_js_1.assert)(parallelSizeX <= 20);
    (0, asserts_js_1.assert)(parallelSizeY <= 10);
    (0, asserts_js_1.assertEquals)(t, [...new Array(100)].map((_, i) => 100 + i));
});
dntShim.Deno.test("First index, first served", async () => {
    let parallelSizeX = 0;
    let parallelSizeXMax = 0;
    let parallelSizeY = 0;
    let parallelSizeYMax = 0;
    const r = new util_js_1.SeedableRandom();
    let index = 0;
    const t = await promise_array_parallel_js_1.PromiseArray
        .from([...new Array(100)].map((_, i) => i))
        .parallelWork(async () => {
        parallelSizeX++;
        parallelSizeXMax = Math.max(parallelSizeXMax, parallelSizeX);
        await (0, util_js_1.sleep)(r.int(10, 200));
        parallelSizeX--;
    }, { parallelDegMax: 20 })
        .parallelWork(async ({ idx }) => {
        (0, asserts_js_1.assertEquals)(idx, index, "Indexes come in order.");
        index++;
        parallelSizeY++;
        parallelSizeYMax = Math.max(parallelSizeYMax, parallelSizeY);
        await (0, util_js_1.sleep)(r.int(10, 200));
        parallelSizeY--;
        return idx + 100;
    }, { parallelDegMax: 10, priority: "INDEX" })
        .all();
    (0, asserts_js_1.assert)(parallelSizeX <= 20);
    (0, asserts_js_1.assert)(parallelSizeY <= 10);
    (0, asserts_js_1.assertEquals)(t, [...new Array(100)].map((_, i) => 100 + i));
});
dntShim.Deno.test("Rejected, all() throw error", async () => {
    const r = new util_js_1.SeedableRandom();
    const x = promise_array_parallel_js_1.PromiseArray
        .from([...new Array(100)].map((_, i) => i))
        .parallelWork(async ({ idx }) => {
        if (idx === 50)
            throw new Error("SOMETHING ERROR!");
        await (0, util_js_1.sleep)(r.int(30, 100));
    }, { parallelDegMax: 20 })
        .parallelWork(async ({ idx }) => {
        await (0, util_js_1.sleep)(r.int(30, 100));
        return idx + 100;
    }, { parallelDegMax: 10, priority: "INDEX" });
    await (0, asserts_js_1.assertRejects)(() => x.all(), Error, "SOMETHING ERROR!");
});
dntShim.Deno.test("Rejected, allSettled not throw error", async () => {
    const r = new util_js_1.SeedableRandom();
    const x = promise_array_parallel_js_1.PromiseArray
        .from([...new Array(100)].map((_, i) => i))
        .parallelWork(async ({ idx }) => {
        if (idx === 50)
            throw new Error("SOMETHING ERROR!");
        await (0, util_js_1.sleep)(r.int(30, 100));
    }, { parallelDegMax: 20 })
        .parallelWork(async ({ idx }) => {
        await (0, util_js_1.sleep)(r.int(30, 100));
        return idx + 100;
    }, { parallelDegMax: 10, priority: "INDEX" });
    const allSettled = await x.allSettled().catch((reason) => {
        console.log(reason);
        return [];
    });
    (0, asserts_js_1.assertEquals)(allSettled, [...new Array(100)]
        .map((_, i) => (i === 50
        ? {
            status: "rejected",
            reason: "reason" in allSettled[50] ? allSettled[50].reason : null,
        }
        : { status: "fulfilled", value: 100 + i })));
});
dntShim.Deno.test("maintain sequence", async () => {
    const r = new util_js_1.SeedableRandom();
    const x = await promise_array_parallel_js_1.PromiseArray
        .from([...new Array(100)].map((_, i) => i))
        .parallelWork(async ({ value, idx }) => {
        await (0, util_js_1.sleep)(r.int(30, 100));
        return value + idx;
    }, { parallelDegMax: 20, priority: "COME" })
        .parallelWork(async ({ value, idx }) => {
        await (0, util_js_1.sleep)(r.int(30, 100));
        return value + idx;
    }, { parallelDegMax: 10, priority: "INDEX" })
        .parallelWork(async ({ value, idx }) => {
        await (0, util_js_1.sleep)(r.int(30, 100));
        return value + idx;
    }, { parallelDegMax: 20, priority: "COME" })
        .parallelWork(async ({ value, idx }) => {
        await (0, util_js_1.sleep)(r.int(30, 100));
        return value + idx;
    }, { parallelDegMax: 10, priority: "COME" })
        .parallelWork(async ({ value, idx }) => {
        await (0, util_js_1.sleep)(r.int(30, 100));
        return value + idx;
    }, { parallelDegMax: 10, priority: "INDEX" })
        .parallelWork(async ({ value, idx }) => {
        await (0, util_js_1.sleep)(r.int(30, 100));
        return value + idx;
    }, { parallelDegMax: 10, priority: "INDEX" })
        .all();
    (0, asserts_js_1.assertEquals)(x, [...new Array(100)].map((_, i) => i * 7));
});
