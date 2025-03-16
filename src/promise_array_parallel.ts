import { generatePromiseResolveList, sleep } from "./util.ts";

/**
 * Pair of index and value for an array element.
 * @template T - The type of value that the Promises will resolve to
 */
export type IdxValue<T> = {
  /** The index of the array element */
  idx: number;
  /** The value of the array element */
  value: T;
  rejected: false
};

/**
 * Pair of index and value for an array element, with an additional property for the rejection reason.
 */
export type RejectedIdxValue = {
  /** The index of the array element */
  idx: number;
  /** The rejection reason for the array element */
  reason: unknown;
  rejected: true
};

/**
 * Pair of index and value for an array element, with an additional property for the rejection reason.
 * @template T - The type of value that the Promises will resolve to
 */
export type RejectableIdxValue<T> = IdxValue<T> | RejectedIdxValue;

/**
 * Array of promises, each resolving to an object containing the index and value of the original array element.
 * @template T - The type of value that the Promises will resolve to
 */
export type PromiseIdxValueArray<T extends readonly unknown[]> = {
  [P in keyof T]: Promise<RejectableIdxValue<T[P]>>;
};

/**
 * Options for parallel work execution.
 */
export type ParallelWorkOptions = {
  /** The maximum number of tasks to execute in parallel. Defaults to Infinity. */
  maxExecutionSlots: number;
  /** The priority for task execution. `"COME"` executes tasks in the order they are completed, while `"INDEX"` maintains the original index order. Defaults to `"COME"`. */
  priority: "COME" | "INDEX";
  /** The interval (in milliseconds) between the start of each task. Defaults to 0. */
  executionIntervalMS: number;
};

/**
 * A utility class for executing asynchronous tasks in parallel.  Provides methods for managing parallel execution, controlling concurrency, and handling errors.
 * @template T - The type of values in the array.
 */
export class PromiseArray<T extends readonly unknown[]> {
  /**
   * Creates a new PromiseArray instance from an array of values.
   * @param {T} array - The input array of values.
   * @returns {PromiseArray<T>} - A new PromiseArray instance.
   * @example Initialize with an array of values
   * ```ts
   * const arr = PromiseArray.from([1, 2, 3, 4, 5]);
   * ```
   */
  static from<T extends readonly unknown[]>(array: T): PromiseArray<T> {
    return new PromiseArray<T>(
      array.map((value, idx) => Promise.resolve({ idx, value, rejected: false }) // deno-lint-ignore no-explicit-any
      ) as any,
    );
  }

  #array: PromiseIdxValueArray<T>;

  /**
   * Creates a new PromiseArray instance.
   * @param {PromiseIdxValueArray<T>} array - An array of promises, each resolving to an object containing the index and value of the original array element.
   */
  constructor(array: PromiseIdxValueArray<T>) {
    this.#array = array;
  }

  /**
   * Returns the underlying array of promises.
   * @returns {PromiseIdxValueArray<T>} - The array of promises.
   */
  get raw(): PromiseIdxValueArray<T> {
    return Object.freeze(this.#array);
  }

  /**
   * Executes all promises in the array and returns an array of resolved values.  Rejects if any promise rejects.  Similar to `Promise.all`.
   * @returns {Promise<T>} - A promise that resolves to an array of resolved values.
   * @example
   * ```ts
   * const arr = PromiseArray.from([1, 2, 3]);
   * const result = await arr.all(); // result: [1, 2, 3]
   * ```
   */
  all(): Promise<T> {
    return Promise.all(this.#array)
      .then((x) =>
        new Promise((resolve, reject) => {
          const t = x.map((y) => {
            if (y.rejected) {
              reject(y.reason);
              return;
            }
            return y.value;
          });
          // deno-lint-ignore no-explicit-any
          resolve(t as any as T);
        })
      );
  }

  /**
   * Executes all promises in the array and returns an array of PromiseSettledResult objects.  Handles both fulfilled and rejected promises. Similar to `Promise.allSettled`.
   * @returns {Promise<PromiseSettledResult<T[number]>[]>} - A promise that resolves to an array of PromiseSettledResult objects.
   * @example
   * ```ts
   * const arr = PromiseArray.from([1, 2, 3]);
   * const result = await arr.asyncMap(funcitonFoo).allSettled();
   * // result: [
   * //   { status: 'fulfilled', value: 1 },
   * //   { status: 'rejected', reason: 'error' },
   * //   { status: 'fulfilled', value: 3 }
   * // ]
   * ```
   */
  allSettled(): Promise<PromiseSettledResult<T[number]>[]> {
    return Promise.allSettled(this.#array).then((x) =>
      x.map((y) =>
        y.status === "fulfilled" && !y.value.rejected
          ? {
            status: "fulfilled" as const,
            value: y.value.value,
          }
          : {
            status: "rejected" as const,
            reason: y.status === "fulfilled" ? y.value.rejected : y.reason,
          }
      )
    );
  }

  /**
   * Executes an asynchronous function on each element of the array in parallel, with a configurable maximum number of concurrent executions.
   * @template U - The return type of the asynchronous function.
   * @template V - The type of value that the asynchronous function will receive.
   * @param {<V extends T[number]>(idxval: IdxValue<V>) => Promise<U>} work - The asynchronous function to execute on each element.  Receives an object with the index and value of the element.
   * @param {Partial<ParallelWorkOptions>} [options] - Options for parallel work execution.
   * @returns {PromiseArray<U[]>} - A new PromiseArray instance containing the results of the asynchronous function.
   * @example Basic Usage
   * ```ts
   * const arr = PromiseArray.from([1, 2, 3, 4, 5]);
   * const doubled = await arr.asyncMap(async (item) => item * 2); // doubled: [2, 4, 6, 8, 10]
   * ```
   * @example Limit the number of parallels
   * ```ts
   * const arr = PromiseArray.from([1, 2, 3, 4, 5]);
   * const doubled = await arr.asyncMap(async(item) => {
   *   await sleep(Math.random() * 1000);
   *   return item;
   * }).asyncMap(async (item) => {
   *   await sleep(100);
   *   if (item === 3) throw new Error("SOMETHING ERROR!");
   *   return item * 2;
   * }, { maxExecutionSlots: 2 }); // max 2 parallel, Priority is given to the one that finished first in the previous function.
   * // doubled: [2, 4, 6, 8, 10]
   * ```
   * @example Execute functions in the order of the original array
   * ```ts
   * const arr = PromiseArray.from([1, 2, 3, 4, 5]);
   * const doubled = await arr.asyncMap(async(item) => {
   *   await sleep(Math.random() * 1000);
   *   return item;
   * }).asyncMap(async (item) => {
   *   await sleep(100);
   *   if (item === 3) throw new Error("SOMETHING ERROR!");
   *   return item * 2;
   * }, { priority: "INDEX" }); // Execute functions maintaining index order
   * // doubled: [2, 4, Error: SOMETHING ERROR!, 8, 10]
   */
  asyncMap<U>(
    work: <V extends T[number]>(idxval: IdxValue<V>) => Promise<U>,
    options?: Partial<ParallelWorkOptions>,
  ): PromiseArray<U[]> {
    // Initialize options
    const {
      maxExecutionSlots = Infinity,
      priority = "COME",
      executionIntervalMS = 0,
    } = options ?? {};

    const chunkSize = Math.max(
      Math.min(maxExecutionSlots, this.#array.length),
      1,
    );

    const iter = priority === "COME" ? this.fcfs() : this.fifs();

    // 処理開始を待つタスクキュー
    const waitingTaskQueue: RejectableIdxValue<T[number]>[] = [];
    // スロットに紐づく実行中タスクのユニークキーと、スロットが利用可能になるのを待機するPromise
    let slots: [symbol, Promise<void>][] = [];

    // スロットを解放する（タスク終了時に実行）
    const releaseSlotUnique = (uniqueKey: symbol) => {
      slots = slots.filter((key) => key[0] !== uniqueKey);
      tryNextTask();
    };

    const { resolveList, promiseList } = generatePromiseResolveList<
      RejectableIdxValue<U>
    >(this.#array.length);

    let nextSlotRelease = Promise.resolve();
    // 実行可能な状態だったら次のタスクを実行する
    const tryNextTask = () => {
      if (slots.length >= chunkSize) return;
      const nextTask = waitingTaskQueue.shift();
      if (!nextTask) return;
      // タスクにユニークキーを発行して、スロットに実行中のタスクとして登録
      const slotKey = Symbol();
      const slotRelease = nextSlotRelease;
      slots.push([slotKey, slotRelease]);
      nextSlotRelease = nextSlotRelease.then(() => sleep(executionIntervalMS));

      const wrappedWork = async (): Promise<RejectableIdxValue<U>> => {
        if (nextTask.rejected) return nextTask;
        await slotRelease;
        try {
          return {
            idx: nextTask.idx,
            value: await work(nextTask),
            rejected: false,
          };
        } catch (e) {
          return { idx: nextTask.idx, reason: e, rejected: true };
        }
      };
      wrappedWork().then((result) => {
        // タスクが終了したらスロットを解放
        releaseSlotUnique(slotKey);
        // 結果の通知
        resolveList[nextTask.idx](result);
      });
    };

    // タスクのイテレータを回して順次並列処理に投げる
    (async () => {
      for await (const nextTarget of iter) {
        waitingTaskQueue.push(nextTarget);
        tryNextTask();
      }
    })();

    return new PromiseArray(promiseList);
  }

  /**
   * First-Come-First-Served iterator for processing tasks.
   * @returns {AsyncGenerator<RejectableIdxValue<T[number]>, void, void>} - An asynchronous generator that yields tasks in the order they are completed.
   * @example Use iterator
   * ```ts
   * const arr = PromiseArray.from([1, 2, 3]).asyncMap(functionFoo);
   * for await (const item of arr.fcfs()) {
   *   console.log(item); // Output: { idx: 0, value: 1, rejected: false }, { idx: 1, value: 2, rejected: false }, { idx: 2, value: 3, rejected: false }
   * }
   * ```
   */
  async *fcfs(): AsyncGenerator<RejectableIdxValue<T[number]>, void, void> {
    const { resolveList, promiseList: fcfslize } = generatePromiseResolveList<
      RejectableIdxValue<T[number]>
    >(this.#array.length);

    let i = 0;
    this.#array.map((x) =>
      x.then((v) => {
        resolveList[i++](v);
      })
    );
    for await (const x of fcfslize) {
      yield x;
    }
  }

  /**
   * First-Index-First-Served iterator for processing tasks.
   * @returns {AsyncGenerator<RejectableIdxValue<T[number]>, void, void>} - An asynchronous generator that yields tasks in their original index order.
   * @example Use iterator
   * ```ts
   * const arr = PromiseArray.from([1, 2, 3]).asyncMap(functionFoo);
   * for await (const item of arr.fifs()) {
   *   console.log(item); // Output: { idx: 0, value: 1, rejected: false }, { idx: 1, value: 2, rejected: false }, { idx: 2, value: 3, rejected: false }
   * }
   * ```
   */
  async *fifs(): AsyncGenerator<RejectableIdxValue<T[number]>, void, void> {
    const { resolveList, promiseList: fifslize } = generatePromiseResolveList<
      RejectableIdxValue<T[number]>
    >(this.#array.length);

    this.#array.map((x) =>
      x.then((v) => {
        resolveList[v.idx](v);
      })
    );
    for await (const x of fifslize) {
      yield x;
    }
  }
}
