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
var _SeedableRandom_x, _SeedableRandom_y, _SeedableRandom_z, _SeedableRandom_w;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SeedableRandom = exports.sleep = void 0;
const sleep = (ms = 0) => new Promise((res) => setTimeout(res, ms));
exports.sleep = sleep;
/**
 * Seedable random
 */
class SeedableRandom {
    /**
     * Generate RandomNumberGenerator
     * @param seed
     */
    constructor(seed = 88675123) {
        _SeedableRandom_x.set(this, void 0);
        _SeedableRandom_y.set(this, void 0);
        _SeedableRandom_z.set(this, void 0);
        _SeedableRandom_w.set(this, void 0);
        __classPrivateFieldSet(this, _SeedableRandom_x, 123456789, "f");
        __classPrivateFieldSet(this, _SeedableRandom_y, 362436069, "f");
        __classPrivateFieldSet(this, _SeedableRandom_z, 521288629, "f");
        __classPrivateFieldSet(this, _SeedableRandom_w, seed, "f");
    }
    /**
     * Generate Next Random
     * @returns random number
     */
    rnd() {
        var _a, _b, _c;
        const t = __classPrivateFieldGet(this, _SeedableRandom_x, "f") ^ (__classPrivateFieldGet(this, _SeedableRandom_x, "f") << 11);
        _a = this, _b = this, _c = this, [({ set value(_d) { __classPrivateFieldSet(_a, _SeedableRandom_x, _d, "f"); } }).value, ({ set value(_d) { __classPrivateFieldSet(_b, _SeedableRandom_y, _d, "f"); } }).value, ({ set value(_d) { __classPrivateFieldSet(_c, _SeedableRandom_z, _d, "f"); } }).value] = [__classPrivateFieldGet(this, _SeedableRandom_y, "f"), __classPrivateFieldGet(this, _SeedableRandom_z, "f"), __classPrivateFieldGet(this, _SeedableRandom_w, "f")];
        return __classPrivateFieldSet(this, _SeedableRandom_w, (__classPrivateFieldGet(this, _SeedableRandom_w, "f") ^ (__classPrivateFieldGet(this, _SeedableRandom_w, "f") >> 19)) ^ (t ^ (t >> 8)), "f");
    }
    /**
     * Generate Next Random Integer Number [l, r)
     * @param l lower num
     * @param u upper num
     * @returns random number
     */
    int(l, u) {
        if (u - l <= 0)
            throw new Error(`l(${l}) should be smaller than u(${u})`);
        return l + this.rnd() % (u - l);
    }
}
exports.SeedableRandom = SeedableRandom;
_SeedableRandom_x = new WeakMap(), _SeedableRandom_y = new WeakMap(), _SeedableRandom_z = new WeakMap(), _SeedableRandom_w = new WeakMap();
