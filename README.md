# CALOOPS — Master Logic & Loops Calculator

An interactive, menu-driven Python CLI calculator crafted to help you **master programming logic and loops** with live, step-by-step execution traces.

Every operation in **CALOOPS** prints not only the final answer, but also a **Loop & Logic Trace** showing each iteration (`for` / `while`), accumulator update, guard clause, and boolean condition evaluation.

---

## Core Concepts Covered

| Category | Operations Included | Logic & Loop Patterns Demonstrated |
| :--- | :--- | :--- |
| **1. Basic Arithmetic** | `+`, `-`, `*`, `/`, `//`, `%`, `**` | `if / elif / else` dispatch, zero-division guard clauses |
| **2. Loop-Driven Math** | Multiply, Divide (`Q, R`), Power | `for` accumulator loop, `while remainder >= divisor` subtraction loop, XOR sign logic `(a < 0) ^ (b < 0)` |
| **3. Sequence & Accumulators** | Factorial ($n!$), Fibonacci Sequence | Multiplicative accumulator `for` loop, two-variable state swapping `a, b = b, a + b` |
| **4. Primes & Nested Loops** | Single Prime Check, Primes in Range $[a, b]$ | Early-exit `break`/`return` up to $\sqrt{n}$, nested `for` loop filtering |
| **5. Euclidean Algorithm** | GCD & LCM Calculator | `while y != 0: x, y = y, x % y` modulo convergence loop |
| **6. Digit Extraction** | Digit Count, Sum, Reverse, Palindrome, Armstrong | `while temp > 0` using `temp % 10` (peel last digit) and `temp // 10` (strip last digit) |
| **7. Boolean Algebra** | Complete Truth Table Generator | Nested `for` loops over `(False, True)` evaluating `AND`, `OR`, `XOR`, `NAND`, `NOR`, `XNOR`, `IMPLIES` |
| **8. Bitwise Logic** | `&`, `\|`, `^`, `~`, `<<`, `>>` | Binary representation inspection, two's complement, bit-shift multiplication/division |
| **9. Number Base Converter** | Decimal to Base $2..16$ (Bin/Oct/Hex) | Repeated division-remainder `while` loop + index reversal loop |
| **10. Convergence Loops** | Collatz ($3n+1$) & Newton-Raphson $\sqrt{x}$ | Unbounded `while` loops with parity branching (`n % 2 == 0`) and epsilon tolerance (`abs(diff) < 1e-7`) |
| **11. Series & Progressions** | Arithmetic (AP) & Geometric (GP) | Running term & running sum accumulator loops |

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

### 3. Run Unit Tests
```bash
python -m unittest discover -v
```
