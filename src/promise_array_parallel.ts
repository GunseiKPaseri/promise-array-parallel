import { generatePromiseResolveList, sleep } from "./util.ts";

/**
 * index & value
 */
type IdxValue<T> = { idx: number; value: T; rejected: false };
type RejectableIdxValue<T> = IdxValue<T> | {
  idx: number;
  reason: unknown;
  rejected: true;
};
type PromiseIdxValueArray<T extends readonly unknown[]> = {
  [P in keyof T]: Promise<RejectableIdxValue<T[P]>>;
};

export type ParallelWorkOptions = {
  parallelDegMax: number;
  priority: "COME" | "INDEX";
  workIntervalMS: number;
};

/**
 * promise array object
 */
export class PromiseArray<T extends readonly unknown[]> {
  /**
   * make resolved Promise object
   * @param `array` using array
   * @returns `PromiseArray`
   */
  static from<T extends readonly unknown[]>(array: T): PromiseArray<T> {
    return new PromiseArray<T>(
      array.map((value, idx) => Promise.resolve({ idx, value, rejected: false }) // deno-lint-ignore no-explicit-any
      ) as any,
    );
  }

  /**
   * @param `array` promise array
   */
  constructor(array: PromiseIdxValueArray<T>) {
    this.#array = array;
  }

  #array: PromiseIdxValueArray<T>;

  /**
   * `Promise[]` raw object
   */
  get raw() {
    return Object.freeze(this.#array);
  }

  /**
   * solve like `Promise.all`
   * @returns solved array
   */
  all() {
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
          resolve(t);
        })
      );
  }

  /**
   * solve like `Promise.allSettled`
   * @returns solved array
   */
  allSettled(): Promise<PromiseSettledResult<T[number]>[]> {
    return Promise.allSettled(this.#array).then((x) => (
      x.map((y) =>
        y.status === "fulfilled" && !y.value.rejected
          ? {
            status: "fulfilled" as const,
            value: y.value.value,
          }
          : {
            status: "rejected" as const,
            reason: (y.status === "fulfilled" ? y.value.rejected : y.reason),
          }
      )
    ));
  }

  /**
   * Execute works in parallel
   * @param `work` async func
   * @param `options`
   * @returns `PromiseArray`
   */
  parallelWork<U>(
    work: <V extends T[number]>(idxval: IdxValue<V>) => Promise<U>,
    options?: Partial<ParallelWorkOptions>,
  ) {
    // initialize
    const { parallelDegMax = Infinity, priority = "COME", workIntervalMS = 0 } =
      options ?? {};

    const chunkSize = Math.max(Math.min(parallelDegMax, this.#array.length), 1);

    const iter = priority === "COME" ? this.fcfs() : this.fifs();

    // 処理開始を待つタスク
    const waitingTaskQueue: RejectableIdxValue<T[number]>[] = [];
    // 並列実行中の処理についてのユニークキー・利用可能になるまでのpromise
    let workspace: [symbol, Promise<void>][] = [];

    // ユニークキーを削除
    const releaceWorkspaceUnique = (uniqueKey: symbol) => {
      workspace = workspace.filter((key) => key[0] !== uniqueKey);
      //待機中の処理を実行
      tryNextTask();
    };

    const { resolveList, promiseList } = generatePromiseResolveList<
      RejectableIdxValue<U>
    >(this.#array.length);

    let nextUsable = Promise.resolve();
    // 実行できるならworkを実行
    const tryNextTask = () => {
      if (workspace.length >= chunkSize) return;
      const nextTask = waitingTaskQueue.shift();
      if (!nextTask) return;
      // ユニークキーを発行、登録
      const workspaceKey = Symbol();
      const usable = nextUsable;
      workspace.push([workspaceKey, usable]);
      nextUsable = nextUsable.then(() => sleep(workIntervalMS));

      const wrappedWork = async (): Promise<RejectableIdxValue<U>> => {
        if (nextTask.rejected) return nextTask;
        await usable;
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
      }
    })();

    return new PromiseArray(promiseList);
  }

  /**
   * First-Come-First-Served
   */
  async *fcfs() {
    const { resolveList, promiseList: fcfslize } = generatePromiseResolveList<
      RejectableIdxValue<T[number]>
    >(this.#array.length);

    // fcfs resolve
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
   * First-Index-First-Served
   */
  async *fifs() {
    const { resolveList, promiseList: fifslize } = generatePromiseResolveList<
      RejectableIdxValue<T[number]>
    >(this.#array.length);

    // fifs resolve
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
