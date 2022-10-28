/**
 * gen wait promise
 * @param ms time
 * @returns
 */
export declare const sleep: (ms?: number) => Promise<void>;
/**
 * Seedable random
 */
export declare class SeedableRandom {
    #private;
    /**
     * Generate RandomNumberGenerator
     * @param seed
     */
    constructor(seed?: number);
    /**
     * Generate Next Random
     * @returns random number
     */
    rnd(): number;
    /**
     * Generate Next Random Integer Number [l, r)
     * @param l lower num
     * @param u upper num
     * @returns random number
     */
    int(l: number, u: number): number;
}
export declare const generatePromiseResolveList: <T>(length: number) => {
    resolveList: ((value: T | PromiseLike<T>) => void)[];
    promiseList: Promise<T>[];
};
