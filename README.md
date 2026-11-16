# CALOOPS v2.0 — Ultimate Logic, Loops & Algorithmic Scientific Calculator

An interactive, menu-driven Python CLI calculator and algorithmic sandbox crafted to help you **master programming logic, boolean algebra, bitwise tricks, and every major loop paradigm** with live, step-by-step execution traces.

Every operation in **CALOOPS v2.0** outputs both the final answer and a **Loop & Logic Trace** detailing each iteration (`for`, `while`, 2D/3D nested loops), stack state, accumulator update, guard clause, and boolean condition evaluation.

---

## All 15+ Modules & Loop/Logic Patterns

| # | Module | Operations Included | Logic & Loop Paradigms Demonstrated |
| :- | :--- | :--- | :--- |
| **1** | **Basic Arithmetic** | `+`, `-`, `*`, `/`, `//`, `%`, `**` | `if / elif / else` dispatch, zero-division guard clauses |
| **2** | **Loop-Driven Math** | Multiply, Divide (`Q, R`), Power | `for` accumulator loop, `while remainder >= divisor` subtraction loop, XOR sign logic `(a < 0) ^ (b < 0)` |
| **3** | **Shunting-Yard Expression Evaluator** | Infix expressions with `()`, `^`, unary `-`, variables (`ans`, `m`, `pi`, `e`) | Lexical scanner `while` loop, Dijkstra's Shunting-Yard `while` operator-stack loop, RPN postfix evaluation loop |
| **4** | **Combinatorics & Sequences** | Factorial ($n!$), Fibonacci, $nCr$ / $nPr$, Pascal's Triangle | Multiplicative reduction loops, 2D nested `for` loop pyramid builder (`row[c] = prev[c-1] + prev[c]`) |
| **5** | **Number Theory & Primes** | Prime Check, Prime Range, Sieve of Eratosthenes, Prime Factorization, Perfect/Abundant/Deficient/Harshad Classifier | Early-exit $\sqrt{n}$ loop, Sieve boolean marking nested loop, trial-division `while` loop, proper-divisor aliquot sum loop |
| **6** | **Euclidean Algorithm** | GCD & LCM Calculator | `while y != 0: x, y = y, x % y` modulo convergence loop |
| **7** | **Digit Extraction Engine** | Digit Count, Sum, Reverse, Palindrome, Armstrong | `while temp > 0` peeling digits via `temp % 10` and `temp // 10` |
| **8** | **Boolean Algebra** | Complete Truth Table Generator | Nested `for` loops over `(False, True)` evaluating `AND`, `OR`, `XOR`, `NAND`, `NOR`, `XNOR`, `IMPLIES` |
| **9** | **Bitwise & Kernighan Popcount** | `&`, `\|`, `^`, `~`, `<<`, `>>`, Set-Bit Counter, Parity & Power-of-2 Check | Brian Kernighan's `while temp > 0: temp &= (temp - 1)` loop clearing lowest set bit in $O(\text{set bits})$ |
| **10** | **Arbitrary Base Converter** | Any Base $2..36 \leftrightarrow$ Any Base $2..36$ | Horner's method `for` loop (`acc = acc * base + digit`) + repeated division-remainder `while` loop |
| **11** | **Convergence Loops** | Collatz ($3n+1$) & Newton-Raphson $\sqrt{x}$ | Unbounded `while` loops with parity branching (`n % 2 == 0`) and epsilon tolerance (`abs(diff) < 1e-7`) |
| **12** | **Calculus & Taylor Series** | Maclaurin Series ($\sin x, \cos x, e^x$) & Trapezoidal Definite Integral | Alternating sign/factorial ratio term loop & Riemann/Trapezoidal $N$-slice summation `for` loop |
| **13** | **Matrix Algebra** | 2D Add, 3D Matrix Multiply, Transpose, $2\times 2$ & $3\times 3$ Determinant | Double-nested (`r, c`) and triple-nested (`i, j, k`) loops + cofactor expansion loop |
| **14** | **Algorithms & Statistics** | Bubble/Insertion Sort Visualizer, Binary Search, Descriptive Statistics | Nested sorting pass loops with early-exit flag, `while low <= high` pointer halving, multi-pass mean/variance loops |
| **15** | **Series & Progressions** | Arithmetic (AP) & Geometric (GP) | Running term & running sum accumulator loops |
| **M/Q/H** | **Extras** | Memory Registers (`ANS`, `M`, custom variables), Interactive 5-Question Mastery Quiz, JSON History Export | Interactive REPL state management & automated self-testing |

---

## Quick Start

### 1. Run Interactive Menu Mode
```bash
python calculator.py
```

### 2. Run Automated Showcase / Demo Mode
```bash
python calculator.py --demo
```

### 3. Run Comprehensive Unit Test Suite
```bash
python -m unittest discover -v
```
