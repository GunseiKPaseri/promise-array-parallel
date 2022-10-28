"use strict";
var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _PromiseArray_array;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PromiseArray = void 0;
const util_js_1 = require("./util.js");
/**
 * promise array object
 */
class PromiseArray {
    /**
     * @param `array` promise array
     */
    constructor(array) {
        _PromiseArray_array.set(this, void 0);
        __classPrivateFieldSet(this, _PromiseArray_array, array, "f");
    }
    /**
     * make resolved Promise object
     * @param `array` using array
     * @returns `PromiseArray`
     */
    static from(array) {
        return new PromiseArray(array.map((value, idx) => Promise.resolve({ idx, value, rejected: false }) // deno-lint-ignore no-explicit-any
        ));
    }
    /**
     * `Promise[]` raw object
     */
    get raw() {
        return Object.freeze(__classPrivateFieldGet(this, _PromiseArray_array, "f"));
    }
    /**
     * solve like `Promise.all`
     * @returns solved array
     */
    all() {
        return Promise.all(__classPrivateFieldGet(this, _PromiseArray_array, "f"))
            .then((x) => new Promise((resolve, reject) => {
            const t = x.map((y) => {
                if (y.rejected) {
                    reject(y.reason);
                    return;
                }
                return y.value;
            });
            resolve(t);
        }));
    }
    /**
     * solve like `Promise.allSettled`
     * @returns solved array
     */
    allSettled() {
        return Promise.allSettled(__classPrivateFieldGet(this, _PromiseArray_array, "f")).then((x) => (x.map((y) => y.status === "fulfilled" && !y.value.rejected
            ? {
                status: "fulfilled",
                value: y.value.value,
            }
            : {
                status: "rejected",
                reason: (y.status === "fulfilled" ? y.value.rejected : y.reason),
            })));
    }
    /**
     * Execute works in parallel
     * @param `work` async func
     * @param `options`
     * @returns `PromiseArray`
     */
    parallelWork(work, options) {
        // initialize
        const { parallelDegMax = Infinity, priority = "COME", workIntervalMS = 0 } = options ?? {};
        const chunkSize = Math.max(Math.min(parallelDegMax, __classPrivateFieldGet(this, _PromiseArray_array, "f").length), 1);
        const iter = priority === "COME" ? this.fcfs() : this.fifs();
        // 処理開始を待つタスク
        const waitingTaskQueue = [];
        // 並列実行中の処理についてのユニークキー
        let workspace = [];
        // ユニークキーを削除
        const releaceWorkspaceUnique = (uniqueKey) => {
            workspace = workspace.filter((key) => key !== uniqueKey);
            //待機中の処理を実行
            tryNextTask();
        };
        const { resolveList, promiseList } = (0, util_js_1.generatePromiseResolveList)(__classPrivateFieldGet(this, _PromiseArray_array, "f").length);
        // 実行できるならworkを実行
        const tryNextTask = () => {
            if (workspace.length >= chunkSize)
                return;
            const nextTask = waitingTaskQueue.shift();
            if (!nextTask)
                return;
            // ユニークキーを発行、登録
            const workspaceKey = Symbol();
            workspace.push(workspaceKey);
            const wrappedWork = async () => {
                if (nextTask.rejected)
                    return nextTask;
                try {
                    return {
                        idx: nextTask.idx,
                        value: await work(nextTask),
                        rejected: false,
                    };
                }
                catch (e) {
                    return { idx: nextTask.idx, reason: e, rejected: true };
                }
            };
            wrappedWork().then((result) => {
                // タスクが完了したらユニークキー登録を解除
                releaceWorkspaceUnique(workspaceKey);
                // 結果を通知
                resolveList[nextTask.idx](result);
            });
        };
        // 順次並列処理に投げる
        (async () => {
            for await (const nextTarget of iter) {
                waitingTaskQueue.push(nextTarget);
                tryNextTask();
                await (0, util_js_1.sleep)(workIntervalMS);
            }
        })();
        return new PromiseArray(promiseList);
    }
    /**
     * First-Come-First-Served
     */
    async *fcfs() {
        const { resolveList, promiseList: fcfslize } = (0, util_js_1.generatePromiseResolveList)(__classPrivateFieldGet(this, _PromiseArray_array, "f").length);
        // fcfs resolve
        let i = 0;
        __classPrivateFieldGet(this, _PromiseArray_array, "f").map((x) => x.then((v) => {
            resolveList[i++](v);
        }));
        for await (const x of fcfslize) {
            yield x;
        }
    }
    /**
     * First-Index-First-Served
     */
    async *fifs() {
        const { resolveList, promiseList: fifslize } = (0, util_js_1.generatePromiseResolveList)(__classPrivateFieldGet(this, _PromiseArray_array, "f").length);
        // fifs resolve
        __classPrivateFieldGet(this, _PromiseArray_array, "f").map((x) => x.then((v) => {
            resolveList[v.idx](v);
        }));
        for await (const x of fifslize) {
            yield x;
        }
    }
}
exports.PromiseArray = PromiseArray;
_PromiseArray_array = new WeakMap();
