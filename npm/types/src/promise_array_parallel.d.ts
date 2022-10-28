/**
 * index & value
 */
declare type IdxValue<T> = {
    idx: number;
    value: T;
    rejected: false;
};
declare type RejectableIdxValue<T> = IdxValue<T> | {
    idx: number;
    reason: any;
    rejected: true;
};
declare type PromiseIdxValueArray<T extends readonly unknown[]> = {
    [P in keyof T]: Promise<RejectableIdxValue<T[P]>>;
};
export declare type ParallelWorkOptions = {
    parallelDegMax: number;
    priority: "COME" | "INDEX";
    workIntervalMS: number;
};
/**
 * promise array object
 */
export declare class PromiseArray<T extends readonly unknown[]> {
    #private;
    /**
     * make resolved Promise object
     * @param `array` using array
     * @returns `PromiseArray`
     */
    static from<T extends readonly unknown[]>(array: T): PromiseArray<T>;
    /**
     * @param `array` promise array
     */
    constructor(array: PromiseIdxValueArray<T>);
    /**
     * `Promise[]` raw object
     */
    get raw(): Readonly<PromiseIdxValueArray<T>>;
    /**
     * solve like `Promise.all`
     * @returns solved array
     */
    all(): Promise<unknown>;
    /**
     * solve like `Promise.allSettled`
     * @returns solved array
     */
    allSettled(): Promise<PromiseSettledResult<T[number]>[]>;
    /**
     * Execute works in parallel
     * @param `work` async func
     * @param `options`
     * @returns `PromiseArray`
     */
    parallelWork<U>(work: <V extends T[number]>(idxval: IdxValue<V>) => Promise<U>, options?: Partial<ParallelWorkOptions>): PromiseArray<U[]>;
    /**
     * First-Come-First-Served
     */
    fcfs(): AsyncGenerator<RejectableIdxValue<T[number]>, void, unknown>;
    /**
     * First-Index-First-Served
     */
    fifs(): AsyncGenerator<RejectableIdxValue<T[number]>, void, unknown>;
}
export {};
