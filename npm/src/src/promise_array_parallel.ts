import { sleep } from "./util.js";

/**
 * index & value
 */
type IdxValue<U> = { idx: number; value: U };

export type ParallelWorkOptions = {
  parallelDegMax: number;
  priority: "COME" | "INDEX";
  workIntervalMS: number;
};

/**
 * promise array object
 */
export class PromiseArray<T> {
  /**
   * make resolved Promise object
   * @param `array` using array
   * @returns `PromiseArray`
   */
  static from<U>(array: U[]) {
    return new PromiseArray(
      array.map((value, idx) => Promise.resolve({ idx, value })),
    );
  }

  /**
   * @param `array` promise array
   */
  constructor(array: Promise<IdxValue<T>>[]) {
    this.#array = array;
  }

  #array: Promise<IdxValue<T>>[];

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
    return Promise.all(this.#array).then((x) =>
      x.sort((a, b) => a.idx - b.idx).map((x) => x.value)
    );
  }

  /**
   * Execute works in parallel
   * @param `work` async func
   * @param `options`
   * @returns `PromiseArray`
   */
  parallelWork<U>(
    work: (idxval: IdxValue<T>) => Promise<U>,
    options?: Partial<ParallelWorkOptions>,
  ) {
    const { parallelDegMax = Infinity, priority = "COME", workIntervalMS = 0 } =
      options ?? {};

    const chunkSize = Math.max(Math.min(parallelDegMax, this.#array.length), 1);

    const iter = priority === "COME" ? this.fcfs() : this.fifs();

    // 処理開始を待つタスク
    const waitingTaskQueue: IdxValue<T>[] = [];
    // 並列実行中の処理についてのユニークキー
    let workspace: symbol[] = [];
    let intervalPromise: Promise<void> = Promise.resolve();

    // ユニークキーを削除
    const releaceWorkspaceUnique = (uniqueKey: symbol) => {
      workspace = workspace.filter((key) => key !== uniqueKey);
      //待機中の処理を実行
      tryNextTask();
    };

    let i = 0;
    const resolveList:
      ((value: IdxValue<U> | PromiseLike<IdxValue<U>>) => void)[] = [];
    const workPromise = [...new Array(this.#array.length)].map(() =>
      new Promise<IdxValue<U>>((res) => {
        resolveList.push(res);
      })
    );

    // 実行できるならworkを実行
    const tryNextTask = () => {
      if (workspace.length >= chunkSize) return;
      const nextTask = waitingTaskQueue.shift();
      if (!nextTask) return;
      // ユニークキーを発行、登録
      const workspaceKey = Symbol();
      workspace.push(workspaceKey);
      Promise.all([intervalPromise, work(nextTask)]).then((result) => {
        // 次のタスクとのインターバルを設定
        intervalPromise = sleep(workIntervalMS);
        // タスクが完了したらユニークキー登録を解除
        releaceWorkspaceUnique(workspaceKey);
        // 結果を通知
        resolveList[i++]({ idx: nextTask.idx, value: result[1] });
      });
    };

    // 順次並列処理に投げる
    (async () => {
      for await (const nextTarget of iter) {
        waitingTaskQueue.push(nextTarget);
        tryNextTask();
      }
    })();

    return new PromiseArray(workPromise);
  }

  /**
   * First-Come-First-Served
   */
  async *fcfs() {
    const resolveList:
      ((value: IdxValue<T> | PromiseLike<IdxValue<T>>) => void)[] = [];
    const fcfslize = [...new Array(this.#array.length)].map(() =>
      new Promise<IdxValue<T>>((res) => {
        resolveList.push(res);
      })
    );
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
    const resolveList:
      ((value: IdxValue<T> | PromiseLike<IdxValue<T>>) => void)[] = [];
    const fcfslize = [...new Array(this.#array.length)].map(() =>
      new Promise<IdxValue<T>>((res) => {
        resolveList.push(res);
      })
    );
    // fifs resolve
    this.#array.map((x) =>
      x.then((v) => {
        resolveList[v.idx](v);
      })
    );
    for await (const x of fcfslize) {
      yield x;
    }
  }
}
