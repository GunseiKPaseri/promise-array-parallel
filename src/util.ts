/**
 * Creates a Promise that resolves after a specified delay.
 * This utility function can be used to pause execution in async functions.
 *
 * @param {number} [ms=0] - The delay in milliseconds before the Promise resolves.
 *                         Defaults to 0 if not specified.
 * @returns {Promise<void>} A Promise that resolves after the specified delay.
 *
 * @example
 * // Pause execution for 1 second
 * await sleep(1000);
 *
 * @example
 * // Use in an async function to create delays
 * async function demo() {
 *   console.log('Start');
 *   await sleep(2000); // Wait for 2 seconds
 *   console.log('After 2 seconds');
 * }
 */
export const sleep = (ms = 0) =>
  new Promise<void>((res) => setTimeout(res, ms));

/**
 * A seedable random number generator implementing the xorshift algorithm.
 * This class provides deterministic random number generation based on a seed value.
 *
 * @class
 */
export class SeedableRandom {
  #x: number;
  #y: number;
  #z: number;
  #w: number;

  /**
   * Creates a new seedable random number generator.
   *
   * @param {number} [seed=88675123] - The seed value to initialize the random number generator.
   *                                  Using the same seed will produce the same sequence of random numbers.
   */
  constructor(seed = 88675123) {
    this.#x = 123456789;
    this.#y = 362436069;
    this.#z = 521288629;
    this.#w = seed;
  }

  /**
   * Generates the next random number in the sequence.
   * Uses the xorshift algorithm to produce pseudorandom numbers.
   *
   * @returns {number} A pseudorandom integer.
   */
  rnd() {
    const t = this.#x ^ (this.#x << 11);
    [this.#x, this.#y, this.#z] = [this.#y, this.#z, this.#w];
    return this.#w = (this.#w ^ (this.#w >> 19)) ^ (t ^ (t >> 8));
  }

  /**
   * Generates a random integer within a specified range [l, u).
   * The range is inclusive of the lower bound and exclusive of the upper bound.
   *
   * @param {number} l - The lower bound of the range (inclusive).
   * @param {number} u - The upper bound of the range (exclusive).
   * @returns {number} A random integer within the specified range.
   * @throws {Error} If the lower bound is greater than or equal to the upper bound.
   *
   * @example
   * const random = new SeedableRandom(12345);
   * const value = random.int(1, 100); // Random integer between 1 and 99
   */
  int(l: number, u: number) {
    if (u - l <= 0) throw new Error(`l(${l}) should be smaller than u(${u})`);
    return l + this.rnd() % (u - l);
  }
}

/**
 * Generates a list of unresolved Promises and their corresponding resolve functions.
 *
 * @template T - The type of value that the Promises will resolve to
 * @param {number} length - The number of Promise/resolve pairs to generate
 * @returns {Object} An object containing:
 *   - resolveList: Array of resolve functions that can be called to resolve the corresponding Promise
 *   - promiseList: Array of unresolved Promises that will be resolved when the corresponding resolve function is called
 *
 * @example
 * // Generate 3 unresolved Promises
 * const { resolveList, promiseList } = generatePromiseResolveList<string>(3);
 *
 * // Resolve the first Promise with a value
 * resolveList[0]("First promise resolved");
 *
 * // Wait for all Promises to resolve
 * Promise.all(promiseList).then(values => {
 *   console.log(values); // Will log once all Promises are resolved
 * });
 */
export const generatePromiseResolveList = <T>(length: number) => {
  const resolveList: ((value: T | PromiseLike<T>) => void)[] = [];
  const promiseList = [...new Array(length)].map(() =>
    new Promise<T>((res) => {
      resolveList.push(res);
    })
  );
  return { resolveList, promiseList };
};
