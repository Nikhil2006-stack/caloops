const test = require("node:test");
const assert = require("node:assert/strict");
const { executeOperation } = require("../engine/caloopsEngine");

test("Shunting-Yard RPN Expression Evaluator Loop", () => {
  const res = executeOperation("expression", "expression_rpn", {
    expr: "3 + 4 * 2 / (1 - 5) ^ 2 + ans",
    variables: { ans: 10 },
  });
  assert.equal(res.result, 13.5);
  assert.ok(res.steps.length > 3);
});

test("Loop Multiplication, Division & Power", () => {
  assert.equal(executeOperation("loop", "multiply_loop", { a: -6, b: 7 }).result, -42);
  const div = executeOperation("loop", "divide_loop", { a: 29, b: 5 }).result;
  assert.deepEqual(div, { quotient: 5, remainder: 4 });
  assert.equal(executeOperation("loop", "power_loop", { base: 2, exp: 5 }).result, 32);
});

test("Number Theory: Primes, Sieve, Factors, Classifier, GCD/LCM", () => {
  assert.equal(executeOperation("primes", "is_prime", { n: 97 }).result, true);
  assert.deepEqual(executeOperation("primes", "sieve", { limit: 15 }).result, [2, 3, 5, 7, 11, 13]);
  assert.equal(executeOperation("primes", "prime_factors", { n: 360 }).result.formatted, "2^3 × 3^2 × 5");
  assert.equal(executeOperation("primes", "classify_number", { n: 28 }).result.classification, "Perfect");
  assert.deepEqual(executeOperation("primes", "gcd_lcm", { a: 48, b: 18 }).result, { gcd: 6, lcm: 144 });
});

test("Bitwise, Brian Kernighan Popcount & Base-to-Base Horner Loop", () => {
  assert.equal(executeOperation("bitwise", "popcount", { n: 29 }).result.setBits, 4);
  assert.equal(
    executeOperation("bitwise", "base_convert", { numStr: "FF", fromBase: 16, toBase: 2 }).result.converted,
    "11111111"
  );
});

test("Matrix 3D Loop Multiplication & Determinant", () => {
  const mul = executeOperation("matrix", "matrix", {
    matrixA: "1 2; 3 4",
    matrixB: "5 6; 7 8",
    mode: "multiply",
  });
  assert.deepEqual(mul.result, [
    [19, 22],
    [43, 50],
  ]);

  const det = executeOperation("matrix", "matrix", {
    matrixA: "6 1 1; 4 -2 5; 2 8 7",
    mode: "determinant",
  });
  assert.equal(det.result, -306);
});

test("Sorting, Binary Search & Statistical Loops", () => {
  const sortRes = executeOperation("algorithms", "algorithms", {
    list: "12 4 19 1 8",
    mode: "bubble",
  });
  assert.deepEqual(sortRes.result.sorted, [1, 4, 8, 12, 19]);

  const binRes = executeOperation("algorithms", "algorithms", {
    list: "12 4 19 1 8",
    mode: "binary_search",
    target: 12,
  });
  assert.equal(binRes.result.foundIndex, 3);
});
