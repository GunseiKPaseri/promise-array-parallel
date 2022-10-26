export const sleep = (ms = 0) =>
  new Promise<void>((res) => setTimeout(res, ms));

/**
 * Seedable random
 */
export class SeedableRandom {
  #x: number;
  #y: number;
  #z: number;
  #w: number;

  /**
   * Generate RandomNumberGenerator
   * @param seed
   */
  constructor(seed = 88675123) {
    this.#x = 123456789;
    this.#y = 362436069;
    this.#z = 521288629;
    this.#w = seed;
  }

  /**
   * Generate Next Random
   * @returns random number
   */
  rnd() {
    const t = this.#x ^ (this.#x << 11);
    [this.#x, this.#y, this.#z] = [this.#y, this.#z, this.#w];
    return this.#w = (this.#w ^ (this.#w >> 19)) ^ (t ^ (t >> 8));
  }

  /**
   * Generate Next Random Integer Number [l, r)
   * @param l lower num
   * @param u upper num
   * @returns random number
   */
  int(l: number, u: number) {
    if (u - l <= 0) throw new Error(`l(${l}) should be smaller than u(${u})`);
    return l + this.rnd() % (u - l);
  }
}
