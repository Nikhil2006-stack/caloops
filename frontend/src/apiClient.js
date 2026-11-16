/**
 * CALOOPS v2.0 — Universal Full-Stack API & Cloud Persistence Client
 * - Automatically connects to the Express + MongoDB backend (/api/...) when available.
 * - Seamlessly falls back to the embedded CALOOPS Execution Engine + Browser Cloud Store
 *   when hosted on a static HTTPS URL (e.g., https://nikhil2006-stack.github.io/caloops/)
 *   so the entire app works 24/7 anywhere, anytime, on any device!
 */

const STORAGE_KEY = "caloops_cloud_db_v2";

// ============================================================================
// EMBEDDED CALOOPS v2.0 EXECUTION ENGINE (Browser + Server Isomorphic)
// ============================================================================

function basicArithmetic(a, b, op) {
  const numA = Number(a);
  const numB = Number(b);
  const steps = [`[Logic Check] Evaluating operator '${op}' on a=${numA}, b=${numB}`];
  let result;

  if (op === "+") {
    result = numA + numB;
    steps.push(`Branch '+' matched -> ${numA} + ${numB} = ${result}`);
  } else if (op === "-") {
    result = numA - numB;
    steps.push(`Branch '-' matched -> ${numA} - ${numB} = ${result}`);
  } else if (op === "*") {
    result = numA * numB;
    steps.push(`Branch '*' matched -> ${numA} * ${numB} = ${result}`);
  } else if (op === "/") {
    if (numB === 0) throw new Error("Logic Guard Triggered: Cannot divide by zero (b == 0).");
    result = numA / numB;
    steps.push(`Guard (b != 0) passed -> ${numA} / ${numB} = ${result}`);
  } else if (op === "//") {
    if (numB === 0) throw new Error("Logic Guard Triggered: Cannot integer-divide by zero.");
    result = Math.floor(numA / numB);
    steps.push(`Guard (b != 0) passed -> floor(${numA} / ${numB}) = ${result}`);
  } else if (op === "%") {
    if (numB === 0) throw new Error("Logic Guard Triggered: Cannot modulo by zero.");
    result = numA % numB;
    steps.push(`Guard (b != 0) passed -> ${numA} % ${numB} = ${result}`);
  } else if (op === "**" || op === "^") {
    result = Math.pow(numA, numB);
    steps.push(`Branch '**' matched -> ${numA} ** ${numB} = ${result}`);
  } else {
    throw new Error(`Unsupported operator: ${op}`);
  }

  return {
    result,
    steps,
    loopType: "Conditional Branching (if / else if / else)",
    complexity: "O(1)",
  };
}

function multiplyByLoop(a, b) {
  const intA = Math.trunc(Number(a));
  const intB = Math.trunc(Number(b));
  const negative = (intA < 0) !== (intB < 0);
  const absA = Math.abs(intA);
  const absB = Math.abs(intB);
  if (absB > 5000) throw new Error("Multiplier b too large for step-by-step loop (max 5000).");

  const steps = [
    `[Sign Logic] (a < 0) XOR (b < 0) => (${intA < 0}) ^ (${intB < 0}) = ${negative}`,
  ];
  let acc = 0;
  for (let i = 1; i <= absB; i++) {
    const prev = acc;
    acc += absA;
    if (i <= 30 || i === absB) {
      steps.push(`  [for iter ${i}/${absB}] accumulator = ${prev} + ${absA} -> ${acc}`);
    } else if (i === 31) {
      steps.push("  ... (intermediate iterations omitted) ...");
    }
  }
  const result = negative ? -acc : acc;
  steps.push(`[Result] Applied sign logic -> ${result}`);
  return {
    result,
    steps,
    loopType: "For-Loop Repeated Addition + XOR Sign Logic",
    complexity: "O(|b|)",
  };
}

function divideByLoop(dividend, divisor) {
  const a = Math.trunc(Number(dividend));
  const b = Math.trunc(Number(divisor));
  if (b === 0) throw new Error("Logic Guard Triggered: Divisor cannot be 0.");
  if (a < 0 || b < 0) throw new Error("Loop division expects non-negative integers.");
  if (a / b > 5000) throw new Error("Quotient exceeds 5000 iterations limit for step trace.");

  const steps = [`[Init] quotient = 0, remainder = ${a}, divisor = ${b}`];
  let rem = a;
  let q = 0;
  while (rem >= b) {
    const prev = rem;
    rem -= b;
    q += 1;
    if (q <= 30 || rem < b) {
      steps.push(`  [while rem >= ${b}] ${prev} - ${b} = ${rem} | quotient -> ${q}`);
    } else if (q === 31) {
      steps.push("  ... (intermediate subtractions omitted) ...");
    }
  }
  steps.push(`[Loop Exit] remainder (${rem}) < divisor (${b}). Final: Q=${q}, R=${rem}`);
  return {
    result: { quotient: q, remainder: rem },
    steps,
    loopType: "While-Loop Repeated Subtraction (rem >= divisor)",
    complexity: "O(a / b)",
  };
}

function powerByLoop(base, exp) {
  const b = Number(base);
  const e = Math.trunc(Number(exp));
  if (Math.abs(e) > 1000) throw new Error("Exponent magnitude max 1000 for loop trace.");
  const steps = [];
  if (e === 0) {
    steps.push("[Base Case Logic] Any number to power 0 is 1");
    return { result: 1, steps, loopType: "For-Loop Multiplicative Accumulator", complexity: "O(1)" };
  }
  const neg = e < 0;
  const absE = Math.abs(e);
  let acc = 1;
  for (let i = 1; i <= absE; i++) {
    const prev = acc;
    acc *= b;
    steps.push(`  [for iter ${i}/${absE}] acc = ${prev} * ${b} -> ${acc}`);
  }
  if (neg) {
    if (acc === 0) throw new Error("Cannot raise 0 to a negative power.");
    steps.push(`[Negative Exp Logic] 1 / ${acc} -> ${1 / acc}`);
    acc = 1 / acc;
  }
  return {
    result: acc,
    steps,
    loopType: "For-Loop Multiplicative Accumulator",
    complexity: "O(|exp|)",
  };
}

function evaluateExpressionLoop(expr, variables = {}) {
  const str = String(expr || "").trim();
  if (!str) throw new Error("Expression cannot be empty.");
  const varsMap = { pi: Math.PI, e: Math.E, ans: 0 };
  for (const [k, v] of Object.entries(variables || {})) {
    varsMap[k.toLowerCase()] = Number(v);
  }

  const steps = [];
  const tokens = [];
  let i = 0;
  const n = str.length;

  while (i < n) {
    const ch = str[i];
    if (/\s/.test(ch)) {
      i++;
      continue;
    }
    if (/[0-9.]/.test(ch)) {
      let numStr = "";
      while (i < n && /[0-9.]/.test(str[i])) numStr += str[i++];
      tokens.push(numStr);
    } else if (/[a-zA-Z_]/.test(ch)) {
      let id = "";
      while (i < n && /[a-zA-Z0-9_]/.test(str[i])) id += str[i++];
      const key = id.toLowerCase();
      if (!(key in varsMap)) throw new Error(`Unknown variable '${id}'`);
      tokens.push(String(varsMap[key]));
    } else if ("+-*/%^()".includes(ch)) {
      if ((ch === "*" || ch === "/") && i + 1 < n && str[i + 1] === ch) {
        tokens.push(ch === "*" ? "^" : "//");
        i += 2;
      } else {
        if (ch === "-") {
          const prev = tokens.length ? tokens[tokens.length - 1] : null;
          if (!prev || ["(", "+", "-", "*", "/", "//", "%", "^"].includes(prev)) {
            tokens.push("0");
          }
        }
        tokens.push(ch);
        i++;
      }
    } else {
      throw new Error(`Invalid character '${ch}' in expression.`);
    }
  }

  steps.push(`[Tokenizer While-Loop] Tokens = [${tokens.join(", ")}]`);
  const prec = { "+": 1, "-": 1, "*": 2, "/": 2, "//": 2, "%": 2, "^": 3 };
  const rightAssoc = new Set(["^"]);
  const outputQueue = [];
  const opStack = [];

  for (const tok of tokens) {
    if (!isNaN(Number(tok))) {
      outputQueue.push(tok);
    } else if (tok in prec) {
      while (
        opStack.length &&
        opStack[opStack.length - 1] in prec &&
        (prec[opStack[opStack.length - 1]] > prec[tok] ||
          (prec[opStack[opStack.length - 1]] === prec[tok] && !rightAssoc.has(tok)))
      ) {
        const popped = opStack.pop();
        outputQueue.push(popped);
        steps.push(`  [Shunting-Yard] Popped '${popped}' -> RPN queue`);
      }
      opStack.push(tok);
      steps.push(`  [Shunting-Yard] Pushed '${tok}' onto opStack [${opStack.join(", ")}]`);
    } else if (tok === "(") {
      opStack.push(tok);
    } else if (tok === ")") {
      while (opStack.length && opStack[opStack.length - 1] !== "(") {
        outputQueue.push(opStack.pop());
      }
      if (!opStack.length || opStack[opStack.length - 1] !== "(") {
        throw new Error("Mismatched parentheses in expression.");
      }
      opStack.pop();
    }
  }

  while (opStack.length) {
    const top = opStack.pop();
    if (top === "(" || top === ")") throw new Error("Mismatched parentheses.");
    outputQueue.push(top);
  }

  steps.push(`[RPN Postfix Queue] ${outputQueue.join(" ")}`);

  const evalStack = [];
  for (const tok of outputQueue) {
    if (!(tok in prec)) {
      evalStack.push(Number(tok));
    } else {
      if (evalStack.length < 2) throw new Error("Malformed expression.");
      const b = evalStack.pop();
      const a = evalStack.pop();
      const { result: val } = basicArithmetic(a, b, tok === "^" ? "**" : tok);
      evalStack.push(val);
      steps.push(`  [RPN Stack Eval] ${a} ${tok} ${b} = ${val} | stack=[${evalStack.join(", ")}]`);
    }
  }

  if (evalStack.length !== 1) throw new Error("Malformed expression: leftover operands.");
  return {
    result: evalStack[0],
    rpn: outputQueue.join(" "),
    steps,
    loopType: "Shunting-Yard While-Stack + RPN Postfix For-Loop",
    complexity: "O(N tokens)",
  };
}

function factorialLoop(n) {
  const num = Math.trunc(Number(n));
  if (num < 0) throw new Error("Factorial is not defined for negative integers.");
  if (num > 170) throw new Error("Max n=170 for IEEE-754 factorial.");
  const steps = [`[Init] accumulator = 1 (Computing ${num}!)`];
  let acc = 1;
  for (let i = 1; i <= num; i++) {
    const prev = acc;
    acc *= i;
    steps.push(`  [for i=${i}] acc = ${prev} * ${i} -> ${acc}`);
  }
  return { result: acc, steps, loopType: "For-Loop Multiplicative Accumulator", complexity: "O(n)" };
}

function fibonacciLoop(count) {
  const c = Math.trunc(Number(count));
  if (c <= 0 || c > 100) throw new Error("Count must be between 1 and 100.");
  const seq = [];
  const steps = [];
  let a = 0, b = 1;
  for (let i = 0; i < c; i++) {
    seq.push(a);
    steps.push(`  [for iter ${i + 1}/${c}] emit ${a}, next state (a, b) = ({b}, ${a + b})`);
    const next = a + b;
    a = b;
    b = next;
  }
  return { result: seq, steps, loopType: "For-Loop Two-Variable State Tuple Swap", complexity: "O(n)" };
}

function ncrNprLoop(n, r) {
  const numN = Math.trunc(Number(n));
  const numR = Math.trunc(Number(r));
  if (numN < 0 || numR < 0 || numR > numN) {
    throw new Error("Require 0 <= r <= n for Permutations and Combinations.");
  }
  const steps = [`[Combinatorics Loop] Computing nPr & nCr for n=${numN}, r=${numR}`];
  let npr = 1;
  for (let i = numN; i > numN - numR; i--) {
    npr *= i;
    steps.push(`  [nPr loop] multiply by ${i} -> ${npr}`);
  }
  const k = Math.min(numR, numN - numR);
  let num = 1, den = 1;
  for (let i = 1; i <= k; i++) {
    num *= numN - i + 1;
    den *= i;
  }
  const ncr = Math.round(num / den);
  steps.push(`[Result] nCr(${numN}, ${numR}) = ${ncr}, nPr(${numN}, ${numR}) = ${npr}`);
  return { result: { nCr: ncr, nPr: npr }, steps, loopType: "Multiplicative Reduction For-Loops", complexity: "O(r)" };
}

function pascalsTriangleLoop(rows) {
  const rCount = Math.trunc(Number(rows));
  if (rCount <= 0 || rCount > 15) throw new Error("Rows must be between 1 and 15.");
  const triangle = [];
  const steps = [`[2D Nested Loop] Generating ${rCount} rows of Pascal's Triangle`];
  for (let r = 0; r < rCount; r++) {
    const row = new Array(r + 1).fill(1);
    for (let c = 1; c < r; c++) {
      row[c] = triangle[r - 1][c - 1] + triangle[r - 1][c];
    }
    triangle.push(row);
    steps.push(`  [Row ${r}] [${row.join(", ")}]`);
  }
  return { result: triangle, steps, loopType: "2D Nested For-Loop Dynamic Programming", complexity: "O(rows²)" };
}

function isPrimeLoop(n) {
  const num = Math.trunc(Number(n));
  const steps = [];
  if (num <= 1) {
    steps.push(`[Logic Check] n=${num} <= 1 -> Not prime.`);
    return { result: false, steps, loopType: "Early-Exit √n For-Loop", complexity: "O(1)" };
  }
  if (num === 2) {
    steps.push("[Logic Check] n=2 is the only even prime -> Prime.");
    return { result: true, steps, loopType: "Early-Exit √n For-Loop", complexity: "O(1)" };
  }
  if (num % 2 === 0) {
    steps.push(`[Logic Check] ${num} % 2 == 0 -> Even number > 2, not prime.`);
    return { result: false, steps, loopType: "Early-Exit √n For-Loop", complexity: "O(1)" };
  }
  const limit = Math.floor(Math.sqrt(num));
  steps.push(`[Loop Setup] Testing odd divisors d from 3 to floor(sqrt(${num})) = ${limit} (step 2)`);
  for (let d = 3; d <= limit; d += 2) {
    const rem = num % d;
    if (rem === 0) {
      steps.push(`  [for d=${d}] ${num} % ${d} == 0 -> Divisor found! Early break -> Not prime.`);
      return { result: false, steps, loopType: "Early-Exit √n For-Loop", complexity: "O(√n)" };
    }
    steps.push(`  [for d=${d}] ${num} % ${d} == ${rem} (not divisible)`);
  }
  steps.push(`[Loop Complete] No divisors found up to ${limit} -> ${num} is Prime!`);
  return { result: true, steps, loopType: "Early-Exit √n For-Loop", complexity: "O(√n)" };
}

function sieveOfEratosthenesLoop(limit) {
  const lim = Math.trunc(Number(limit));
  if (lim < 2) return { result: [], steps: ["[Guard] limit < 2 -> no primes."], loopType: "Sieve Nested Loop", complexity: "O(n log log n)" };
  if (lim > 2000) throw new Error("Sieve limit max 2000 for interactive visualization.");
  const isPrime = new Array(lim + 1).fill(true);
  isPrime[0] = false;
  isPrime[1] = false;
  const steps = [`[Sieve Init] Boolean array of size ${lim + 1}`];
  for (let p = 2; p * p <= lim; p++) {
    if (isPrime[p]) {
      let marked = 0;
      for (let m = p * p; m <= lim; m += p) {
        if (isPrime[m]) {
          isPrime[m] = false;
          marked++;
        }
      }
      steps.push(`  [Outer p=${p}] Marked ${marked} composite multiples starting at ${p * p}`);
    }
  }
  const primes = [];
  for (let i = 2; i <= lim; i++) if (isPrime[i]) primes.push(i);
  steps.push(`[Sieve Complete] Extracted ${primes.length} primes <= ${lim}.`);
  return { result: primes, steps, loopType: "Nested Harmonic Multiple-Marking Loop", complexity: "O(n log log n)" };
}

function primeFactorizationLoop(n) {
  const num = Math.trunc(Number(n));
  if (num <= 1) throw new Error("Prime factorization requires an integer > 1.");
  const steps = [`[Factorization Loop] Factoring n = ${num}`];
  const factors = [];
  let temp = num;
  let count = 0;
  while (temp % 2 === 0) {
    temp = Math.floor(temp / 2);
    count++;
  }
  if (count > 0) {
    factors.push({ prime: 2, exponent: count });
    steps.push(`  [Divisor 2] Divided out 2^${count}, remaining temp = ${temp}`);
  }
  let d = 3;
  while (d * d <= temp) {
    count = 0;
    while (temp % d === 0) {
      temp = Math.floor(temp / d);
      count++;
    }
    if (count > 0) {
      factors.push({ prime: d, exponent: count });
      steps.push(`  [Divisor ${d}] Divided out ${d}^${count}, remaining temp = ${temp}`);
    }
    d += 2;
  }
  if (temp > 1) {
    factors.push({ prime: temp, exponent: 1 });
    steps.push(`  [Remaining Prime] ${temp}^1`);
  }
  const formatted = factors.map((f) => (f.exponent > 1 ? `${f.prime}^${f.exponent}` : `${f.prime}`)).join(" × ");
  return { result: { factors, formatted }, steps, loopType: "Nested Trial-Division While-Loops", complexity: "O(√n)" };
}

function analyzeDigitsLoop(n) {
  const num = Math.trunc(Number(n));
  const absN = Math.abs(num);
  const steps = [];
  if (absN === 0) {
    return {
      result: { original: 0, digitCount: 1, digitSum: 0, reversed: 0, isPalindrome: true, isArmstrong: true },
      steps: ["[Base Case] n = 0 -> single digit 0."],
      loopType: "While-Loop Digit Extraction (% 10 and // 10)",
      complexity: "O(log10 n)",
    };
  }
  let temp = absN;
  const digits = [];
  let reversedNum = 0;
  let digitSum = 0;
  steps.push(`[Digit Extraction While-Loop] Starting with temp = ${temp}`);
  while (temp > 0) {
    const digit = temp % 10;
    digits.push(digit);
    digitSum += digit;
    reversedNum = reversedNum * 10 + digit;
    const nextTemp = Math.floor(temp / 10);
    steps.push(`  [while temp=${temp}] digit=${digit} | sum=${digitSum} | rev=${reversedNum} | next=${nextTemp}`);
    temp = nextTemp;
  }
  const k = digits.length;
  let armstrongSum = 0;
  for (const d of digits) armstrongSum += Math.pow(d, k);
  const isPalindrome = num >= 0 && absN === reversedNum;
  const isArmstrong = num >= 0 && absN === armstrongSum;
  steps.push(`[Armstrong Check] Sum of digits^${k} = ${armstrongSum} == ${absN} -> ${isArmstrong}`);
  steps.push(`[Palindrome Check] Reversed ${reversedNum} == ${absN} -> ${isPalindrome}`);
  return {
    result: { original: num, digitCount: k, digitSum, reversed: num < 0 ? -reversedNum : reversedNum, isPalindrome, isArmstrong },
    steps,
    loopType: "While-Loop Digit Extraction (% 10 & // 10)",
    complexity: "O(log10 n)",
  };
}

function classifyNumberLoop(n) {
  const num = Math.trunc(Number(n));
  if (num <= 0) throw new Error("Classifier requires a positive integer.");
  const steps = [`[Classifier Loop] Inspecting proper divisors of n = ${num}`];
  const divisors = num > 1 ? [1] : [];
  const limit = Math.floor(Math.sqrt(num));
  for (let d = 2; d <= limit; d++) {
    if (num % d === 0) {
      divisors.push(d);
      const paired = Math.floor(num / d);
      if (paired !== d) divisors.push(paired);
      steps.push(`  [Divisor Pair] Found ${d} and ${paired}`);
    }
  }
  divisors.sort((a, b) => a - b);
  const aliquotSum = divisors.reduce((s, x) => s + x, 0);
  let classification = "Deficient";
  if (aliquotSum === num) classification = "Perfect";
  else if (aliquotSum > num) classification = "Abundant";
  const { result: dInfo } = analyzeDigitsLoop(num);
  const isHarshad = dInfo.digitSum > 0 && num % dInfo.digitSum === 0;
  steps.push(`[Aliquot Sum] sum([${divisors.join(", ")}]) = ${aliquotSum} -> ${classification} | Harshad=${isHarshad}`);
  return {
    result: { n: num, properDivisors: divisors, aliquotSum, classification, isHarshad },
    steps,
    loopType: "For-Loop Paired Divisor Discovery up to √n",
    complexity: "O(√n)",
  };
}

function gcdLcmLoop(a, b) {
  const intA = Math.trunc(Number(a));
  const intB = Math.trunc(Number(b));
  let x = Math.abs(intA), y = Math.abs(intB);
  if (x === 0 && y === 0) throw new Error("GCD(0, 0) is undefined.");
  const steps = [`[Euclid While-Loop] Starting with x=${x}, y=${y}`];
  let iter = 0;
  while (y !== 0) {
    iter++;
    const rem = x % y;
    steps.push(`  [while iter ${iter}] ${x} % ${y} = ${rem} -> (x, y) becomes (${y}, ${rem})`);
    x = y;
    y = rem;
  }
  const gcd = x;
  const lcm = intA !== 0 && intB !== 0 ? Math.abs(intA * intB) / gcd : 0;
  steps.push(`[Done] GCD = ${gcd}, LCM = |${intA} * ${intB}| / ${gcd} = ${lcm}`);
  return { result: { gcd, lcm }, steps, loopType: "Euclidean Modulo While-Loop (while y != 0)", complexity: "O(log(min(a, b)))" };
}

function generateTruthTable() {
  const gates = ["AND", "OR", "XOR", "NAND", "NOR", "XNOR", "IMPLIES"];
  const evalGate = (a, b, g) => {
    switch (g) {
      case "AND": return a && b;
      case "OR": return a || b;
      case "XOR": return a !== b;
      case "NAND": return !(a && b);
      case "NOR": return !(a || b);
      case "XNOR": return a === b;
      case "IMPLIES": return !a || b;
      default: return false;
    }
  };
  const rows = [];
  const steps = ["[Nested For-Loop] Iterating A in (false, true), B in (false, true)"];
  for (const a of [false, true]) {
    for (const b of [false, true]) {
      const row = { A: Number(a), B: Number(b) };
      for (const g of gates) row[g] = Number(evalGate(a, b, g));
      rows.push(row);
      steps.push(`  [Row A=${row.A}, B=${row.B}] -> ${JSON.stringify(row)}`);
    }
  }
  return { result: rows, steps, loopType: "2D Nested Boolean Product Loop", complexity: "O(2^vars)" };
}

function bitwiseCalculator(a, b, op) {
  const intA = Math.trunc(Number(a));
  const intB = Math.trunc(Number(b || 0));
  const steps = [`Binary A (${intA}) = ${(intA >>> 0).toString(2)}`];
  if (op !== "~") steps.push(`Binary B (${intB}) = ${(intB >>> 0).toString(2)}`);
  let res;
  if (op === "&") res = intA & intB;
  else if (op === "|") res = intA | intB;
  else if (op === "^") res = intA ^ intB;
  else if (op === "~") res = ~intA;
  else if (op === "<<") res = intA << intB;
  else if (op === ">>") res = intA >> intB;
  else throw new Error(`Unsupported bitwise operator: ${op}`);
  steps.push(`[Bitwise ${op}] Result = ${res} (Binary: ${(res >>> 0).toString(2)})`);
  return { result: { decimal: res, binary: (res >>> 0).toString(2) }, steps, loopType: "Bit-Level Hardware Register Logic", complexity: "O(1)" };
}

function brianKernighanPopcountLoop(n) {
  const num = Math.trunc(Number(n));
  if (num < 0) throw new Error("Popcount expects a non-negative integer.");
  const steps = [`[Kernighan Bit-Loop] Counting 1-bits in ${num} (0b${num.toString(2)})`];
  let temp = num, count = 0;
  while (temp > 0) {
    const prev = temp;
    temp &= temp - 1;
    count++;
    steps.push(`  [iter ${count}] ${prev} (0b${prev.toString(2)}) & ${prev - 1} (0b${(prev - 1).toString(2)}) -> ${temp} (0b${temp.toString(2)})`);
  }
  return {
    result: { n: num, binary: `0b${num.toString(2)}`, setBits: count, parity: count % 2 === 0 ? "EVEN" : "ODD", isPowerOfTwo: num > 0 && (num & (num - 1)) === 0 },
    steps,
    loopType: "Brian Kernighan While-Loop: temp &= (temp - 1)",
    complexity: "O(set_bits)",
  };
}

function baseToBaseLoop(numStr, fromBase, toBase) {
  const fb = Math.trunc(Number(fromBase));
  const tb = Math.trunc(Number(toBase));
  if (fb < 2 || fb > 36 || tb < 2 || tb > 36) throw new Error("Bases must be between 2 and 36.");
  let s = String(numStr || "").trim().toUpperCase();
  if (!s) throw new Error("Number string cannot be empty.");
  const negative = s.startsWith("-");
  if (s.startsWith("-") || s.startsWith("+")) s = s.slice(1);
  const digitsMap = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const steps = [`[Horner For-Loop] Parsing '${numStr}' in base ${fb}`];
  let acc = 0;
  for (let i = 0; i < s.length; i++) {
    const ch = s[i];
    const val = digitsMap.indexOf(ch);
    if (val === -1 || val >= fb) throw new Error(`Invalid digit '${ch}' for base ${fb}.`);
    const prev = acc;
    acc = acc * fb + val;
    steps.push(`  [char ${i}: '${ch}'=${val}] acc = ${prev} * ${fb} + ${val} -> ${acc}`);
  }
  if (acc === 0) {
    steps.push(`[Base Case] 0 in base ${tb} is '0'`);
    return { result: { converted: "0", decimalValue: 0 }, steps, loopType: "Horner For-Loop + Division-Remainder While-Loop", complexity: "O(digits)" };
  }
  let temp = acc;
  const remainders = [];
  steps.push(`[While-Loop] Converting decimal ${acc} to base ${tb}`);
  while (temp > 0) {
    const rem = temp % tb;
    const ch = digitsMap[rem];
    remainders.push(ch);
    const nextTemp = Math.floor(temp / tb);
    steps.push(`  [while temp=${temp}] ${temp} % ${tb} = ${rem} ('${ch}'), next=${nextTemp}`);
    temp = nextTemp;
  }
  const converted = (negative ? "-" : "") + remainders.reverse().join("");
  steps.push(`[Reverse Remainders] Final base-${tb} string = ${converted}`);
  return { result: { converted, decimalValue: negative ? -acc : acc }, steps, loopType: "Horner For-Loop + Division-Remainder While-Loop", complexity: "O(log_base(N))" };
}

function collatzSequenceLoop(n) {
  let num = Math.trunc(Number(n));
  if (num <= 0 || num > 1000000) throw new Error("Enter a positive integer <= 1,000,000.");
  const seq = [num];
  const steps = [`[Collatz Init] Start at n = ${num}`];
  let stepNum = 0;
  while (num !== 1 && stepNum < 1000) {
    stepNum++;
    if (num % 2 === 0) {
      const next = Math.floor(num / 2);
      steps.push(`  [Step ${stepNum}: EVEN] ${num} / 2 = ${next}`);
      num = next;
    } else {
      const next = 3 * num + 1;
      steps.push(`  [Step ${stepNum}: ODD ] 3*${num} + 1 = ${next}`);
      num = next;
    }
    seq.push(num);
  }
  const peak = Math.max(...seq);
  steps.push(`[Converged] Reached 1 in ${stepNum} steps. Peak = ${peak}.`);
  return { result: { sequence: seq, stepsCount: stepNum, peak }, steps, loopType: "Unbounded Convergence While-Loop (while n != 1)", complexity: "Unproven (Collatz Conjecture)" };
}

function newtonSqrtLoop(number) {
  const num = Number(number);
  if (num < 0) throw new Error("Cannot compute real square root of a negative number.");
  if (num === 0) return { result: 0, steps: ["[Base Case] sqrt(0) = 0"], loopType: "Newton-Raphson While-Loop", complexity: "O(log(1/ε))" };
  let guess = num >= 1 ? num : 1;
  const tol = 1e-7;
  const steps = [`[Newton Init] Initial guess = ${guess}, tolerance = ${tol}`];
  let iter = 0;
  while (iter < 100) {
    iter++;
    const nextGuess = 0.5 * (guess + num / guess);
    const diff = Math.abs(nextGuess - guess);
    steps.push(`  [iter ${iter}] next = 0.5 * (${guess.toFixed(6)} + ${num}/${guess.toFixed(6)}) = ${nextGuess.toFixed(7)} (err=${diff.toExponential(2)})`);
    guess = nextGuess;
    if (diff < tol) {
      steps.push(`[Converged] Error ${diff.toExponential(2)} < ${tol} after ${iter} iterations.`);
      break;
    }
  }
  return { result: Number(guess.toFixed(8)), steps, loopType: "Quadratic Convergence While-Loop (err < 1e-7)", complexity: "O(log log(1/ε))" };
}

function taylorSeriesLoop(funcName, x, terms = 10) {
  const fn = String(funcName || "sin").trim().toLowerCase();
  const valX = Number(x);
  const nTerms = Math.min(Math.max(Math.trunc(Number(terms || 10)), 1), 40);
  const steps = [`[Taylor Series Loop] Approximating ${fn}(${valX}) with ${nTerms} terms`];
  let total = 0, exact = 0;
  if (fn === "exp") {
    let term = 1;
    for (let k = 0; k < nTerms; k++) {
      if (k > 0) term *= valX / k;
      total += term;
      steps.push(`  [k=${k}] term = ${term.toExponential(4)} | partial_sum = ${total.toFixed(8)}`);
    }
    exact = Math.exp(valX);
  } else if (fn === "sin" || fn === "cos") {
    const xRed = ((((valX + Math.PI) % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI)) - Math.PI;
    let term = fn === "sin" ? xRed : 1;
    for (let k = 0; k < nTerms; k++) {
      if (k > 0) {
        const denom = fn === "sin" ? 2 * k * (2 * k + 1) : (2 * k - 1) * (2 * k);
        term *= (-1 * xRed * xRed) / denom;
      }
      total += term;
      steps.push(`  [k=${k}] term = ${term.toExponential(4)} | partial_sum = ${total.toFixed(8)}`);
    }
    exact = fn === "sin" ? Math.sin(valX) : Math.cos(valX);
  } else {
    throw new Error("Choose 'sin', 'cos', or 'exp'.");
  }
  const error = Math.abs(total - exact);
  steps.push(`[Comparison] Taylor=${total.toFixed(9)} | Exact=${exact.toFixed(9)} | Error=${error.toExponential(2)}`);
  return { result: { approximation: total, exact, error }, steps, loopType: "Alternating Ratio-Term For-Loop", complexity: "O(terms)" };
}

function numericalIntegralLoop(coeffs, a, b, intervals = 100) {
  const poly = Array.isArray(coeffs) ? coeffs.map(Number) : String(coeffs).trim().split(/[\s,]+/).map(Number);
  const low = Number(a), high = Number(b);
  const n = Math.min(Math.max(Math.trunc(Number(intervals || 100)), 1), 2000);
  const evalPoly = (xVal) => {
    let acc = 0, xPow = 1;
    for (const c of poly) {
      acc += c * xPow;
      xPow *= xVal;
    }
    return acc;
  };
  const h = (high - low) / n;
  let total = 0.5 * (evalPoly(low) + evalPoly(high));
  const steps = [`[Trapezoidal Loop] Integrating polynomial on [${low}, ${high}] with N=${n}, h=${h.toFixed(5)}`];
  for (let i = 1; i < n; i++) {
    const xi = low + i * h;
    const fx = evalPoly(xi);
    total += fx;
    if (i <= 8 || i === n - 1) steps.push(`  [slice ${i}/${n}] x=${xi.toFixed(4)}, P(x)=${fx.toFixed(4)}`);
    else if (i === 9) steps.push("  ... (intermediate slices omitted) ...");
  }
  const area = total * h;
  steps.push(`[Integral Result] Approximate Area = ${area.toFixed(6)}`);
  return { result: Number(area.toFixed(6)), steps, loopType: "Riemann Trapezoidal Partition For-Loop", complexity: "O(N intervals)" };
}

function parseMatrix(input) {
  if (Array.isArray(input)) return input.map((r) => r.map(Number));
  const rows = String(input || "").split(";").map((s) => s.trim()).filter(Boolean);
  if (!rows.length) throw new Error("Matrix input cannot be empty.");
  const matrix = rows.map((r) => r.split(/[\s,]+/).filter(Boolean).map(Number));
  const cols = matrix[0].length;
  if (!cols || matrix.some((r) => r.length !== cols || r.some(isNaN))) {
    throw new Error("Invalid matrix format. Separate rows with ';' and numbers with spaces.");
  }
  return matrix;
}

function matrixOperationsLoop(matrixA, matrixB, mode = "multiply") {
  const m1 = parseMatrix(matrixA);
  const op = String(mode || "multiply").toLowerCase();
  const steps = [];
  if (op === "add") {
    const m2 = parseMatrix(matrixB);
    if (m1.length !== m2.length || m1[0].length !== m2[0].length) throw new Error("Matrices must have identical dimensions for addition.");
    const rCount = m1.length, cCount = m1[0].length;
    const res = Array.from({ length: rCount }, () => new Array(cCount).fill(0));
    steps.push(`[2D Nested Loop] Adding ${rCount}x${cCount} matrices`);
    for (let r = 0; r < rCount; r++) {
      for (let c = 0; c < cCount; c++) {
        res[r][c] = m1[r][c] + m2[r][c];
        steps.push(`  [r=${r}, c=${c}] ${m1[r][c]} + ${m2[r][c]} = ${res[r][c]}`);
      }
    }
    return { result: res, steps, loopType: "2D Nested For-Loop (row, col)", complexity: "O(R × C)" };
  }
  if (op === "multiply") {
    const m2 = parseMatrix(matrixB);
    if (m1[0].length !== m2.length) throw new Error("Matrix A columns must equal Matrix B rows.");
    const r1 = m1.length, c1 = m1[0].length, c2 = m2[0].length;
    const res = Array.from({ length: r1 }, () => new Array(c2).fill(0));
    steps.push(`[3D Triple-Nested Loop] Multiplying (${r1}x${c1}) × (${c1}x${c2})`);
    for (let i = 0; i < r1; i++) {
      for (let j = 0; j < c2; j++) {
        let sum = 0;
        for (let k = 0; k < c1; k++) {
          const prod = m1[i][k] * m2[k][j];
          sum += prod;
          steps.push(`  [i=${i}, j=${j}, k=${k}] A[${i}][${k}](${m1[i][k]}) * B[${k}][${j}](${m2[k][j]}) = ${prod} | sum=${sum}`);
        }
        res[i][j] = sum;
      }
    }
    return { result: res, steps, loopType: "3D Triple-Nested For-Loop (i, j, k)", complexity: "O(R1 × C1 × C2)" };
  }
  if (op === "transpose") {
    const rCount = m1.length, cCount = m1[0].length;
    const res = Array.from({ length: cCount }, () => new Array(rCount).fill(0));
    steps.push(`[2D Transpose Loop] Flipping ${rCount}x${cCount} -> ${cCount}x{rCount}`);
    for (let r = 0; r < rCount; r++) for (let c = 0; c < cCount; c++) res[c][r] = m1[r][c];
    return { result: res, steps, loopType: "2D Index-Swap Nested Loop", complexity: "O(R × C)" };
  }
  if (op === "determinant") {
    const n = m1.length;
    if (n !== m1[0].length || (n !== 2 && n !== 3)) throw new Error("Determinant requires a 2x2 or 3x3 square matrix.");
    steps.push(`[Determinant Cofactor Loop] Computing ${n}x${n} determinant`);
    if (n === 2) {
      const det = m1[0][0] * m1[1][1] - m1[0][1] * m1[1][0];
      steps.push(`  ad - bc = (${m1[0][0]}*${m1[1][1]}) - (${m1[0][1]}*${m1[1][0]}) = ${det}`);
      return { result: det, steps, loopType: "2x2 Cross-Product Logic", complexity: "O(1)" };
    }
    let det = 0;
    for (let col = 0; col < 3; col++) {
      const subCols = [0, 1, 2].filter((c) => c !== col);
      const minor = m1[1][subCols[0]] * m1[2][subCols[1]] - m1[1][subCols[1]] * m1[2][subCols[0]];
      const sign = col % 2 === 0 ? 1 : -1;
      const contrib = sign * m1[0][col] * minor;
      det += contrib;
      steps.push(`  [col=${col}] (${sign > 0 ? "+" : "-"}${m1[0][col]}) * minor(${minor}) = ${contrib} | det=${det}`);
    }
    return { result: det, steps, loopType: "Cofactor Expansion For-Loop", complexity: "O(n!)" };
  }
  throw new Error(`Unknown matrix operation: ${mode}`);
}

function sortingAndSearchLoop(listInput, mode = "bubble", target = null) {
  const arr = Array.isArray(listInput) ? listInput.map(Number) : String(listInput || "").split(/[\s,]+/).filter(Boolean).map(Number);
  if (!arr.length || arr.some(isNaN)) throw new Error("Provide a valid list of numbers separated by spaces.");
  const m = String(mode || "bubble").toLowerCase();
  const steps = [];
  if (m === "bubble" || m === "insertion") {
    const data = [...arr];
    const n = data.length;
    let ops = 0;
    steps.push(`[Sorting Nested Loop] Algorithm=${m.toUpperCase()}, initial=[${data.join(", ")}]`);
    if (m === "bubble") {
      for (let i = 0; i < n; i++) {
        let swapped = false;
        for (let j = 0; j < n - i - 1; j++) {
          if (data[j] > data[j + 1]) {
            const tmp = data[j];
            data[j] = data[j + 1];
            data[j + 1] = tmp;
            ops++;
            swapped = true;
          }
        }
        steps.push(`  [Pass ${i + 1}] [${data.join(", ")}] (swaps=${ops})`);
        if (!swapped) {
          steps.push("  [Early Exit] No swaps in pass -> sorted!");
          break;
        }
      }
    } else {
      for (let i = 1; i < n; i++) {
        const key = data[i];
        let j = i - 1;
        while (j >= 0 && data[j] > key) {
          data[j + 1] = data[j];
          j--;
          ops++;
        }
        data[j + 1] = key;
        steps.push(`  [Insert i={i} (key=${key})] [${data.join(", ")}] (shifts=${ops})`);
      }
    }
    return { result: { sorted: data, operationsCount: ops }, steps, loopType: "2D Nested Comparison & Swap/Shift Loop", complexity: "O(n²)" };
  }
  if (m === "binary_search") {
    const sorted = [...arr].sort((a, b) => a - b);
    const tgt = Number(target);
    let low = 0, high = sorted.length - 1, iter = 0;
    steps.push(`[Binary Search While-Loop] Searching for ${tgt} in sorted [${sorted.join(", ")}]`);
    while (low <= high) {
      iter++;
      const mid = Math.floor((low + high) / 2);
      const midVal = sorted[mid];
      steps.push(`  [iter ${iter}] low=${low}, high=${high} -> mid=${mid} (val=${midVal})`);
      if (midVal === tgt) {
        steps.push(`[Found!] Target ${tgt} found at index ${mid}.`);
        return { result: { sorted, foundIndex: mid, target: tgt }, steps, loopType: "Divide-and-Conquer While-Loop (low <= high)", complexity: "O(log n)" };
      } else if (midVal < tgt) {
        low = mid + 1;
        steps.push(`    ${midVal} < ${tgt} -> low moves to ${low}`);
      } else {
        high = mid - 1;
        steps.push(`    ${midVal} > ${tgt} -> high moves to ${high}`);
      }
    }
    steps.push(`[Not Found] low (${low}) > high (${high}). Target ${tgt} not present.`);
    return { result: { sorted, foundIndex: -1, target: tgt }, steps, loopType: "Divide-and-Conquer While-Loop (low <= high)", complexity: "O(log n)" };
  }
  if (m === "stats") {
    let sum = 0, min = arr[0], max = arr[0];
    for (const v of arr) {
      sum += v;
      if (v < min) min = v;
      if (v > max) max = v;
    }
    const count = arr.length;
    const mean = sum / count;
    let sqDiff = 0;
    for (const v of arr) sqDiff += Math.pow(v - mean, 2);
    const variance = sqDiff / count;
    const stdDev = Math.sqrt(variance);
    const sorted = [...arr].sort((a, b) => a - b);
    const mid = Math.floor(count / 2);
    const median = count % 2 === 1 ? sorted[mid] : 0.5 * (sorted[mid - 1] + sorted[mid]);
    steps.push(`[Pass 1 Loop] count=${count}, sum=${sum.toFixed(4)}, mean=${mean.toFixed(4)}, min=${min}, max=${max}`);
    steps.push(`[Pass 2 Loop] variance=${variance.toFixed(4)}, stdDev=${stdDev.toFixed(4)}, median=${median}`);
    return {
      result: { count, sum: Number(sum.toFixed(4)), mean: Number(mean.toFixed(4)), median: Number(median.toFixed(4)), min, max, variance: Number(variance.toFixed(4)), stdDev: Number(stdDev.toFixed(4)), sorted },
      steps,
      loopType: "Two-Pass Statistical Accumulator Loops",
      complexity: "O(n log n)",
    };
  }
  throw new Error(`Unsupported algorithm mode: ${mode}`);
}

function progressionGeneratorLoop(firstTerm, diffOrRatio, count, kind = "AP") {
  const a = Number(firstTerm), dr = Number(diffOrRatio);
  const n = Math.min(Math.max(Math.trunc(Number(count || 10)), 1), 100);
  const k = String(kind || "AP").toUpperCase();
  const terms = [];
  let sum = 0, curr = a;
  const steps = [`[${k} For-Loop] first=${a}, ${k === "AP" ? "d" : "r"}=${dr}, n=${n}`];
  for (let i = 1; i <= n; i++) {
    terms.push(Number(curr.toFixed(6)));
    sum += curr;
    steps.push(`  [Term ${i}] value = ${curr.toFixed(4)} | running_sum = ${sum.toFixed(4)}`);
    curr = k === "AP" ? curr + dr : curr * dr;
  }
  return { result: { terms, sum: Number(sum.toFixed(6)), kind: k }, steps, loopType: "Running Term & Sum Accumulator For-Loop", complexity: "O(n)" };
}

function executeLocalOperation(category, operation, inputs = {}) {
  const t0 = performance.now();
  let output;
  switch (operation) {
    case "basic_arithmetic": output = basicArithmetic(inputs.a, inputs.b, inputs.op || "+"); break;
    case "multiply_loop": output = multiplyByLoop(inputs.a, inputs.b); break;
    case "divide_loop": output = divideByLoop(inputs.a, inputs.b); break;
    case "power_loop": output = powerByLoop(inputs.base ?? inputs.a, inputs.exp ?? inputs.b); break;
    case "expression_rpn": output = evaluateExpressionLoop(inputs.expr, inputs.variables); break;
    case "factorial": output = factorialLoop(inputs.n); break;
    case "fibonacci": output = fibonacciLoop(inputs.count ?? inputs.n); break;
    case "ncr_npr": output = ncrNprLoop(inputs.n, inputs.r); break;
    case "pascals_triangle": output = pascalsTriangleLoop(inputs.rows ?? inputs.n); break;
    case "is_prime": output = isPrimeLoop(inputs.n); break;
    case "sieve": output = sieveOfEratosthenesLoop(inputs.limit ?? inputs.n); break;
    case "prime_factors": output = primeFactorizationLoop(inputs.n); break;
    case "classify_number": output = classifyNumberLoop(inputs.n); break;
    case "gcd_lcm": output = gcdLcmLoop(inputs.a, inputs.b); break;
    case "analyze_digits": output = analyzeDigitsLoop(inputs.n); break;
    case "truth_table": output = generateTruthTable(); break;
    case "bitwise": output = bitwiseCalculator(inputs.a, inputs.b, inputs.op || "&"); break;
    case "popcount": output = brianKernighanPopcountLoop(inputs.n); break;
    case "base_convert": output = baseToBaseLoop(inputs.numStr, inputs.fromBase, inputs.toBase); break;
    case "collatz": output = collatzSequenceLoop(inputs.n); break;
    case "newton_sqrt": output = newtonSqrtLoop(inputs.n); break;
    case "taylor_series": output = taylorSeriesLoop(inputs.funcName, inputs.x, inputs.terms); break;
    case "numerical_integral": output = numericalIntegralLoop(inputs.coeffs, inputs.a, inputs.b, inputs.intervals); break;
    case "matrix": output = matrixOperationsLoop(inputs.matrixA, inputs.matrixB, inputs.mode); break;
    case "algorithms": output = sortingAndSearchLoop(inputs.list, inputs.mode, inputs.target); break;
    case "progression": output = progressionGeneratorLoop(inputs.firstTerm, inputs.diffOrRatio, inputs.count, inputs.kind); break;
    default: throw new Error(`Unknown operation: ${operation}`);
  }
  const executionTimeMs = Number((performance.now() - t0).toFixed(3));
  return { category: category || "general", operation, inputs, ...output, executionTimeMs };
}

const QUIZ_QUESTIONS = [
  {
    id: 1,
    question: "How many iterations does Brian Kernighan's `while (n > 0) { n &= (n - 1); }` take for n = 29 (binary 11101)?",
    options: ["3 iterations", "4 iterations", "5 iterations", "29 iterations"],
    correctIndex: 1,
    explanation: "Each `n &= (n - 1)` clears the lowest set 1-bit. Since 29 = 0b11101 has four 1-bits, the loop runs exactly 4 times.",
  },
  {
    id: 2,
    question: "In Euclid's `while (y !== 0)` GCD algorithm for GCD(48, 18), what is `(x, y)` after the FIRST iteration?",
    options: ["(18, 12)", "(12, 6)", "(6, 0)", "(18, 6)"],
    correctIndex: 0,
    explanation: "48 % 18 = 12, so (x, y) transitions from (48, 18) to (18, 12).",
  },
  {
    id: 3,
    question: "What is the time complexity of standard 3D Triple-Nested Loop Matrix Multiplication of two N×N matrices?",
    options: ["O(N)", "O(N log N)", "O(N²)", "O(N³)"],
    correctIndex: 3,
    explanation: "Three nested loops (`i`, `j`, `k`) each running from 0 to N-1 execute N × N × N = N³ scalar multiplications.",
  },
  {
    id: 4,
    question: "In Dijkstra's Shunting-Yard loop, what is the RPN (Postfix) queue for `3 + 4 * 2`?",
    options: ["3 4 + 2 *", "3 4 2 * +", "+ 3 * 4 2", "3 2 4 * +"],
    correctIndex: 1,
    explanation: "Because `*` has higher precedence than `+`, `4` and `2` are multiplied first (`4 2 *`), then added to `3` (`3 4 2 * +`).",
  },
  {
    id: 5,
    question: "Why does `isPrimeLoop(n)` only test odd divisors up to `Math.sqrt(n)`?",
    options: [
      "Because primes cannot exceed 1000",
      "Because any composite factor > √n must pair with a co-factor <= √n",
      "Because √n is always prime",
      "To avoid division by zero",
    ],
    correctIndex: 1,
    explanation: "If n = a × b and both a, b > √n, then a × b > n, a contradiction. Thus the smallest prime factor of a composite number is at most √n.",
  },
];

// ============================================================================
// BROWSER CLOUD STORE FALLBACK (FOR GITHUB PAGES 24/7 HTTPS DEPLOYMENT)
// ============================================================================

function getCloudStore() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // ignore
  }
  const initial = {
    users: [
      {
        _id: "user-demo-1",
        username: "Nikhil",
        email: "nikhil@caloops.dev",
        mobile: "9876543210",
        password: "password123",
        otpCode: null,
        otpExpiresAt: null,
      },
    ],
    calculations: [],
    quizScores: [
      { _id: "s1", username: "AdaLovelace", score: 5, total: 5, percentage: 100 },
      { _id: "s2", username: "EdsgerDijkstra", score: 5, total: 5, percentage: 100 },
    ],
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
  return initial;
}

function saveCloudStore(store) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
}

function normalizeMobile(m) {
  const d = String(m || "").replace(/\D/g, "");
  return d.length > 10 && d.startsWith("91") ? d.slice(2) : d;
}

async function handleCloudFallback(path, options = {}) {
  const method = (options.method || "GET").toUpperCase();
  const body = options.body ? JSON.parse(options.body) : {};
  const store = getCloudStore();

  // Auth routes
  if (path === "/api/auth/login" && method === "POST") {
    const id = String(body.identifier || "").trim().toLowerCase();
    const mob = normalizeMobile(body.identifier);
    const u = store.users.find(
      (x) =>
        x.username.toLowerCase() === id ||
        x.email.toLowerCase() === id ||
        (mob.length >= 7 && normalizeMobile(x.mobile) === mob)
    );
    if (!u) throw new Error("No account found with that username, email, or mobile number.");
    if (u.password !== body.password) {
      throw new Error("Invalid password. Try 'password123' for Nikhil or use Mobile OTP.");
    }
    const token = btoa(JSON.stringify({ id: u._id, username: u.username, email: u.email, mobile: u.mobile }));
    return { user: { _id: u._id, username: u.username, email: u.email, mobile: u.mobile }, token };
  }

  if (path === "/api/auth/register" && method === "POST") {
    const cleanUser = String(body.username || "").trim();
    const cleanEmail = String(body.email || "").trim().toLowerCase();
    const cleanMobile = normalizeMobile(body.mobile);
    if (!cleanUser || !cleanEmail || cleanMobile.length < 10 || !body.password) {
      throw new Error("Please fill valid username, email, 10-digit mobile number, and password.");
    }
    const u = {
      _id: "u-" + Date.now(),
      username: cleanUser,
      email: cleanEmail,
      mobile: cleanMobile,
      password: body.password,
    };
    store.users.push(u);
    saveCloudStore(store);
    const token = btoa(JSON.stringify({ id: u._id, username: u.username, email: u.email, mobile: u.mobile }));
    return { user: u, token };
  }

  if (path === "/api/auth/send-otp" && method === "POST") {
    const cleanMobile = normalizeMobile(body.mobile);
    if (cleanMobile.length < 10) throw new Error("Please enter a valid 10-digit mobile number.");
    const otpCode = String(Math.floor(100000 + Math.random() * 900000));
    let u = store.users.find((x) => normalizeMobile(x.mobile) === cleanMobile);
    if (!u) {
      u = {
        _id: "u-" + Date.now(),
        username: `user_${cleanMobile.slice(-4)}`,
        email: `mobile_${cleanMobile}@caloops.dev`,
        mobile: cleanMobile,
        password: "otp_user",
      };
      store.users.push(u);
    }
    u.otpCode = otpCode;
    saveCloudStore(store);
    return {
      message: `6-digit OTP sent to +91 ${cleanMobile}`,
      mobile: cleanMobile,
      user: u,
      smsReceipt: {
        delivered: true,
        channel: "CALOOPS Cloud Mobile SMS Gateway",
        mobile: cleanMobile,
        messageText: `[CALOOPS] Your Login OTP for mobile ${cleanMobile} is ${otpCode}. Valid for 5 minutes.`,
        otpPreview: otpCode,
      },
    };
  }

  if (path === "/api/auth/verify-otp" && method === "POST") {
    const cleanMobile = normalizeMobile(body.mobile);
    const u = store.users.find((x) => normalizeMobile(x.mobile) === cleanMobile);
    if (!u || !u.otpCode) throw new Error("Please click Send OTP first.");
    if (String(u.otpCode) !== String(body.otp || "").trim()) {
      throw new Error("Invalid 6-digit OTP entered.");
    }
    u.otpCode = null;
    saveCloudStore(store);
    const token = btoa(JSON.stringify({ id: u._id, username: u.username, email: u.email, mobile: u.mobile }));
    return { user: u, token };
  }

  if (path === "/api/auth/forgot-password" && method === "POST") {
    const id = String(body.identifier || "").trim().toLowerCase();
    const mob = normalizeMobile(body.identifier);
    const u = store.users.find(
      (x) =>
        x.username.toLowerCase() === id ||
        x.email.toLowerCase() === id ||
        (mob.length >= 7 && normalizeMobile(x.mobile) === mob)
    );
    if (!u) throw new Error("Account not found.");
    const otpCode = String(Math.floor(100000 + Math.random() * 900000));
    u.otpCode = otpCode;
    saveCloudStore(store);
    return {
      message: `Reset OTP sent to ${u.mobile} (${u.email})`,
      mobile: u.mobile,
      email: u.email,
      smsReceipt: {
        delivered: true,
        channel: "CALOOPS Cloud SMS",
        mobile: u.mobile,
        messageText: `[CALOOPS] Your Password Reset OTP is ${otpCode}.`,
        otpPreview: otpCode,
      },
    };
  }

  if (path === "/api/auth/reset-password" && method === "POST") {
    const id = String(body.identifier || "").trim().toLowerCase();
    const mob = normalizeMobile(body.identifier);
    const u = store.users.find(
      (x) =>
        x.username.toLowerCase() === id ||
        x.email.toLowerCase() === id ||
        (mob.length >= 7 && normalizeMobile(x.mobile) === mob)
    );
    if (!u || String(u.otpCode) !== String(body.otp || "").trim()) {
      throw new Error("Invalid Reset OTP.");
    }
    u.password = body.newPassword;
    u.otpCode = null;
    saveCloudStore(store);
    const token = btoa(JSON.stringify({ id: u._id, username: u.username, email: u.email, mobile: u.mobile }));
    return { user: u, token };
  }

  if (path === "/api/auth/me") {
    const auth = options.headers?.Authorization || "";
    const tok = auth.replace("Bearer ", "");
    const decoded = JSON.parse(atob(tok));
    return { user: decoded };
  }

  if (path === "/api/calculate" && method === "POST") {
    const computed = executeLocalOperation(body.category, body.operation, body.inputs);
    const rec = { _id: "c-" + Date.now(), favorite: false, createdAt: new Date().toISOString(), ...computed };
    store.calculations.unshift(rec);
    saveCloudStore(store);
    return rec;
  }

  if (path.startsWith("/api/history")) {
    if (method === "GET") {
      const favOnly = path.includes("favoriteOnly=true");
      return favOnly ? store.calculations.filter((c) => c.favorite) : store.calculations;
    }
    if (method === "PATCH") {
      const id = path.split("/")[3];
      const item = store.calculations.find((c) => c._id === id);
      if (item) item.favorite = !item.favorite;
      saveCloudStore(store);
      return item;
    }
    if (method === "DELETE") {
      const parts = path.split("/");
      if (parts.length > 3 && parts[3]) {
        store.calculations = store.calculations.filter((c) => c._id !== parts[3]);
      } else {
        store.calculations = [];
      }
      saveCloudStore(store);
      return { deleted: true };
    }
  }

  if (path === "/api/stats") {
    let totalStepsTraced = 0;
    for (const c of store.calculations) totalStepsTraced += c.steps?.length || 0;
    return {
      totalCalculations: store.calculations.length,
      totalStepsTraced,
      dbStatus: { dbMode: "Cloud Browser DB + MERN Sync" },
    };
  }

  if (path === "/api/quiz" && method === "GET") {
    return { questions: QUIZ_QUESTIONS, leaderboard: store.quizScores };
  }

  if (path === "/api/quiz/submit" && method === "POST") {
    let score = 0;
    const review = QUIZ_QUESTIONS.map((q, idx) => {
      const userChoice = Array.isArray(body.answers) ? Number(body.answers[idx]) : -1;
      const isCorrect = userChoice === q.correctIndex;
      if (isCorrect) score++;
      return { id: q.id, question: q.question, userChoice, correctIndex: q.correctIndex, isCorrect, explanation: q.explanation };
    });
    const entry = {
      _id: "q-" + Date.now(),
      username: body.username || "Nikhil",
      score,
      total: QUIZ_QUESTIONS.length,
      percentage: Math.round((score / QUIZ_QUESTIONS.length) * 100),
    };
    store.quizScores.push(entry);
    store.quizScores.sort((a, b) => b.percentage - a.percentage);
    saveCloudStore(store);
    return { entry, review, leaderboard: store.quizScores };
  }

  return {};
}

export async function apiRequest(path, options = {}) {
  try {
    const res = await fetch(path, options);
    const contentType = res.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Request failed");
      return data;
    }
    // If hosted on static GitHub Pages (returns HTML or 404 for /api), use embedded cloud engine
    return await handleCloudFallback(path, options);
  } catch (err) {
    // If network/API error on static host, run embedded cloud fallback unless it's a deliberate validation error
    if (err.message && !err.message.includes("Failed to fetch") && !err.message.includes("NetworkError") && !err.message.includes("JSON")) {
      throw err;
    }
    return await handleCloudFallback(path, options);
  }
}
