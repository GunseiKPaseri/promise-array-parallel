# promise-array-parallel

[![JSR](https://jsr.io/badges/@gunseikpaseri/promise-array-parallel)](https://jsr.io/@gunseikpaseri/promise-array-parallel)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Created by GunseiKPaseri](https://img.shields.io/badge/created%20by-@GunseiKPaseri-00ACEE.svg)](https://twitter.com/GunseiKPaseri)
![GitHub issues](https://img.shields.io/github/issues/GunseiKPaseri/promise_array_parallel)
![GitHub last commit](https://img.shields.io/github/last-commit/GunseiKPaseri/promise_array_parallel)
[![CodeFactor](https://www.codefactor.io/repository/github/gunseikpaseri/promise_array_parallel/badge)](https://www.codefactor.io/repository/github/gunseikpaseri/promise_array_parallel)

## Language Support
- [English](/README.md)
- [日本語](/README-ja.md)

## 概要

PromiseArrayParallelは、`Promise.all()`や`.map()`の操作感で非同期タスクを簡単に並列実行するためのユーティリティライブラリです。このライブラリは複数の非同期処理を効率的に管理し、並列度や実行順序を制御することができます。

主な機能
- 非同期タスクの並列実行
- 処理ごとの並列実行数の制限
- 実行順序の制御（「先着順」または「インデックス順」）
- タスク間のインターバル設定
- エラーハンドリング

## インストール

### npm

```bash
npx jsr add @gunseikpaseri/promise-array-parallel
```

### Deno

```bash
deno add jsr:@gunseikpaseri/promise-array-parallel
```

## 使い方

### 基本的な使い方

```typescript
import { PromiseArray } from "./promise_array_parallel.ts";

// 配列からPromiseArrayインスタンスを作成
const result = await PromiseArray
  .from([1, 2, 3, 4, 5])
  // 配列に対する何らかの非同期処理
  .parallelWork(async ({ value, idx }) => {
    return value * 2;
  }, { parallelDegMax: 3 }) // 最大3つのタスクを並列実行
  .all(); // すべての結果を取得

console.log(result); // [2, 4, 6, 8, 10]
```

### 複数の処理パイプライン

```typescript
const result = await PromiseArray
  .from([1, 2, 3, 4, 5])
  .parallelWork(async ({ value }) => {
    // 1つ目の処理
    return value * 2;
  }, { parallelDegMax: 3 })
  .parallelWork(async ({ value }) => {
    // 2つ目の処理（1つ目の結果を受け取る）
    return value + 10;
  }, { parallelDegMax: 2 }) // 異なる並列度で実行
  .all();

console.log(result); // [12, 14, 16, 18, 20]
```

### 実行順の制御

#### 先着順(`COME`)
`priority: "COME"` オプションを使用すると、タスクが完了した順に次のタスクが実行されます。

```typescript
const result = await PromiseArray
  .from(data)
  .parallelWork(async () => {
    // 処理
  }, { parallelDegMax: 20 })
  .parallelWork(async ({ value }) => {
    // 前の処理が完了した順に実行
  }, { parallelDegMax: 10, priority: "COME" })
  .all();
```

#### インデックス順(`INDEX`)
`priority: "INDEX"` オプションを使用すると、タスク配列のインデックス順に実行されます。

```typescript
const result = await PromiseArray
  .from(data)
  .parallelWork(async () => {
    // 処理
  }, { parallelDegMax: 20 })
  .parallelWork(async ({ value }) => {
    // インデックス順に実行
  }, { parallelDegMax: 10, priority: "INDEX" })
  .all();
```

### エラーハンドリング

`PromiseArray.all()`はどれか一つでも失敗すると全て中断してしまいます。`Promise.all([...])`に対する`Promise.allSettled([...])`のように、`PromiseArray.allSettled()`エラーハンドリングを行うことができます。

```typescript
const results = await PromiseArray
  .from(data)
  .parallelWork(async ({ idx }) => {
    if (condition) throw new Error("エラー発生");
    // 処理
  })
  .allSettled();

// 成功したタスクと失敗したタスクの両方の結果が含まれる
results.forEach((result, index) => {
  if (result.status === "fulfilled") {
    console.log(`タスク ${index} 成功:`, result.value);
  } else {
    console.log(`タスク ${index} 失敗:`, result.reason);
  }
});
```

### インターバルの設定

タスク開始間にインターバルを設定することで、タスクの開始時間をずらすことができます。

```typescript
const result = await PromiseArray
  .from(data)
  .parallelWork(async () => {
    // 処理
  }, { parallelDegMax: 20, workIntervalMS: 20 }) // タスク開始間に20msのインターバル
  .all();
```


