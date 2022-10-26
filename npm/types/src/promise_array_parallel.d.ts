/**
 * index & value
 */
declare type IdxValue<U> = {
    idx: number;
    value: U;
};
export declare type ParallelWorkOptions = {
    parallelDegMax: number;
    priority: "COME" | "INDEX";
    workIntervalMS: number;
};
/**
 * promise array object
 */
export declare class PromiseArray<T> {
    #private;
    /**
     * make resolved Promise object
     * @param `array` using array
     * @returns `PromiseArray`
     */
    static from<U>(array: U[]): PromiseArray<U>;
    /**
     * @param `array` promise array
     */
    constructor(array: Promise<IdxValue<T>>[]);
    /**
     * `Promise[]` raw object
     */
    get raw(): readonly Promise<IdxValue<T>>[];
    /**
     * solve like `Promise.all`
     * @returns solved array
     */
    all(): Promise<T[]>;
    /**
     * Execute works in parallel
     * @param `work` async func
     * @param `options`
     * @returns `PromiseArray`
     */
    parallelWork<U>(work: (idxval: IdxValue<T>) => Promise<U>, options?: Partial<ParallelWorkOptions>): PromiseArray<U>;
    /**
     * First-Come-First-Served
     */
    fcfs(): AsyncGenerator<IdxValue<T>, void, unknown>;
    /**
     * First-Index-First-Served
     */
    fifs(): AsyncGenerator<IdxValue<T>, void, unknown>;
}
export {};
