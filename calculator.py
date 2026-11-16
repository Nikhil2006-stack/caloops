#!/usr/bin/env python3
"""
CALOOPS v2.0 — Ultimate Logic, Loops & Algorithmic Scientific Calculator
========================================================================
An interactive, menu-driven Python CLI calculator and algorithmic sandbox
designed to master programming logic, conditional branching, boolean algebra,
bitwise tricks, and every major loop paradigm:
  - For / While / Nested 2D & 3D Loops
  - Stack-based Shunting-Yard Infix-to-RPN Expression Evaluator Loop
  - Taylor Series & Numerical Calculus (Trapezoidal Integration) Loops
  - Matrix Algebra (Triple-Nested Loop Multiplication, Transpose, Determinant)
  - Number Theory (Prime Factorization, Sieve of Eratosthenes, Perfect/Harshad)
  - Combinatorics (nCr, nPr, Pascal's Triangle Nested Loop Pyramid)
  - Bitwise & Brian Kernighan Popcount + Base-2..36 Horner Converter
  - Algorithmic Loops (Binary Search, Bubble/Insertion Sort Pass Visualizer)
  - Statistical Single-Pass & Multi-Pass Loop Analyzer with ASCII Histogram
  - Interactive Loop & Logic Quiz Mode, Memory Registers, and JSON Export
"""

from __future__ import annotations
import json
import math
import os
import sys
from typing import Dict, List, Tuple, Any, Optional


# ============================================================================
# 1. ARITHMETIC VIA LOGIC & LOOPS
# ============================================================================

def basic_arithmetic(a: float, b: float, op: str) -> Tuple[float, List[str]]:
    """
    Demonstrates conditional branching (if / elif / else) and guard clauses
    (e.g., division by zero check).
    """
    steps: List[str] = []
    steps.append(f"[Logic Check] Evaluating operator '{op}' on a={a}, b={b}")

    if op == "+":
        result = a + b
        steps.append(f"Branch '+' matched -> {a} + {b} = {result}")
    elif op == "-":
        result = a - b
        steps.append(f"Branch '-' matched -> {a} - {b} = {result}")
    elif op == "*":
        result = a * b
        steps.append(f"Branch '*' matched -> {a} * {b} = {result}")
    elif op == "/":
        if b == 0:
            raise ZeroDivisionError("Logic Guard Triggered: Cannot divide by zero (b == 0).")
        result = a / b
        steps.append(f"Guard (b != 0) passed -> {a} / {b} = {result}")
    elif op == "//":
        if b == 0:
            raise ZeroDivisionError("Logic Guard Triggered: Cannot integer-divide by zero (b == 0).")
        result = a // b
        steps.append(f"Guard (b != 0) passed -> {a} // {b} = {result}")
    elif op == "%":
        if b == 0:
            raise ZeroDivisionError("Logic Guard Triggered: Cannot modulo by zero (b == 0).")
        result = a % b
        steps.append(f"Guard (b != 0) passed -> {a} % {b} = {result}")
    elif op == "**":
        result = a ** b
        steps.append(f"Branch '**' matched -> {a} ** {b} = {result}")
    else:
        raise ValueError(f"Unsupported operator: {op}")

    return result, steps


def multiply_by_loop(a: int, b: int) -> Tuple[int, List[str]]:
    """
    Multiplies two integers using a `for` loop (repeated addition) and
    XOR sign-handling logic.
    """
    steps: List[str] = []
    negative = (a < 0) ^ (b < 0)
    abs_a, abs_b = abs(a), abs(b)
    steps.append(
        f"[Sign Logic] (a < 0) XOR (b < 0) => ({a < 0}) ^ ({b < 0}) = {negative}"
    )

    accumulator = 0
    for i in range(1, abs_b + 1):
        prev = accumulator
        accumulator += abs_a
        steps.append(f"  [for iter {i}/{abs_b}] accumulator = {prev} + {abs_a} -> {accumulator}")

    result = -accumulator if negative else accumulator
    steps.append(f"[Result] Applied sign logic -> {result}")
    return result, steps


def divide_by_loop(dividend: int, divisor: int) -> Tuple[Tuple[int, int], List[str]]:
    """
    Computes (quotient, remainder) for non-negative integers using a `while`
    loop (repeated subtraction).
    """
    if divisor == 0:
        raise ZeroDivisionError("Logic Guard Triggered: Divisor cannot be 0.")
    if dividend < 0 or divisor < 0:
        raise ValueError("divide_by_loop expects non-negative integers.")

    steps: List[str] = []
    remainder = dividend
    quotient = 0

    steps.append(f"[Init] quotient = 0, remainder = {remainder}, divisor = {divisor}")
    while remainder >= divisor:
        prev_rem = remainder
        remainder -= divisor
        quotient += 1
        steps.append(
            f"  [while remainder >= {divisor}] {prev_rem} - {divisor} = {remainder} | quotient -> {quotient}"
        )

    steps.append(
        f"[Loop Exit] remainder ({remainder}) < divisor ({divisor}). Final: Q={quotient}, R={remainder}"
    )
    return (quotient, remainder), steps


def power_by_loop(base: float, exp: int) -> Tuple[float, List[str]]:
    """
    Computes base ** exp using a `for` loop accumulator and negative-exponent logic.
    """
    steps: List[str] = []
    if exp == 0:
        steps.append("[Base Case Logic] Any number to power 0 is 1.0")
        return 1.0, steps

    is_negative_exp = exp < 0
    abs_exp = abs(exp)
    result = 1.0

    for i in range(1, abs_exp + 1):
        prev = result
        result *= base
        steps.append(f"  [for iter {i}/{abs_exp}] result = {prev} * {base} -> {result}")

    if is_negative_exp:
        if result == 0:
            raise ZeroDivisionError("Cannot raise 0 to a negative power.")
        steps.append(f"[Negative Exp Logic] 1 / {result} -> {1.0 / result}")
        result = 1.0 / result

    return result, steps


# ============================================================================
# 2. SHUNTING-YARD & RPN STACK EXPRESSION EVALUATOR LOOP
# ============================================================================

def evaluate_expression_loop(
    expr: str, variables: Optional[Dict[str, float]] = None
) -> Tuple[float, List[str]]:
    """
    Tokenizes a mathematical expression, converts Infix -> Postfix (RPN) using
    Dijkstra's Shunting-Yard `while` loop, and evaluates the RPN tokens using a
    stack-based `for` loop.
    Supports: +, -, *, /, //, %, ^ (or **), parentheses (), unary -, and variables.
    """
    steps: List[str] = []
    vars_map: Dict[str, float] = {"pi": math.pi, "e": math.e}
    if variables:
        for k, v in variables.items():
            vars_map[k.lower()] = v

    # Step 1: Lexical Tokenization via index-advancing while loop
    tokens: List[str] = []
    i = 0
    n = len(expr)
    while i < n:
        ch = expr[i]
        if ch.isspace():
            i += 1
            continue
        if ch.isdigit() or ch == ".":
            num_chars: List[str] = []
            while i < n and (expr[i].isdigit() or expr[i] == "."):
                num_chars.append(expr[i])
                i += 1
            tokens.append("".join(num_chars))
        elif ch.isalpha() or ch == "_":
            ident_chars: List[str] = []
            while i < n and (expr[i].isalnum() or expr[i] == "_"):
                ident_chars.append(expr[i])
                i += 1
            ident = "".join(ident_chars).lower()
            if ident not in vars_map:
                raise ValueError(f"Unknown variable '{ident}' in expression.")
            tokens.append(str(vars_map[ident]))
        elif ch in "+-*/%^()":
            # Check for '//' or '**'
            if ch in "*/" and i + 1 < n and expr[i + 1] == ch:
                op_tok = ch * 2
                tokens.append("^" if op_tok == "**" else "//")
                i += 2
            else:
                # Handle unary minus by converting `-x` into `0 - x`
                if ch == "-":
                    prev_tok = tokens[-1] if tokens else None
                    if prev_tok is None or prev_tok in ("(", "+", "-", "*", "/", "//", "%", "^"):
                        tokens.append("0")
                tokens.append(ch)
                i += 1
        else:
            raise ValueError(f"Invalid character '{ch}' in expression.")

    if not tokens:
        raise ValueError("Empty expression.")
    steps.append(f"[Tokenizer While-Loop] Tokens = {tokens}")

    # Step 2: Shunting-Yard Infix -> RPN (Postfix)
    precedence = {"+": 1, "-": 1, "*": 2, "/": 2, "//": 2, "%": 2, "^": 3}
    right_associative = {"^"}
    output_queue: List[str] = []
    op_stack: List[str] = []

    for tok in tokens:
        if tok.replace(".", "", 1).lstrip("-").isdigit():
            output_queue.append(tok)
        elif tok in precedence:
            while (
                op_stack
                and op_stack[-1] in precedence
                and (
                    (precedence[op_stack[-1]] > precedence[tok])
                    or (
                        precedence[op_stack[-1]] == precedence[tok]
                        and tok not in right_associative
                    )
                )
            ):
                popped = op_stack.pop()
                output_queue.append(popped)
                steps.append(f"  [Shunting-Yard] Popped higher/equal op '{popped}' -> queue")
            op_stack.append(tok)
            steps.append(f"  [Shunting-Yard] Pushed op '{tok}' onto stack {op_stack}")
        elif tok == "(":
            op_stack.append(tok)
        elif tok == ")":
            while op_stack and op_stack[-1] != "(":
                output_queue.append(op_stack.pop())
            if not op_stack or op_stack[-1] != "(":
                raise ValueError("Mismatched parentheses in expression.")
            op_stack.pop()

    while op_stack:
        top = op_stack.pop()
        if top in ("(", ")"):
            raise ValueError("Mismatched parentheses in expression.")
        output_queue.append(top)

    steps.append(f"[RPN Postfix Queue] {' '.join(output_queue)}")

    # Step 3: Stack-based RPN Evaluation Loop
    eval_stack: List[float] = []
    for tok in output_queue:
        if tok not in precedence:
            eval_stack.append(float(tok))
        else:
            if len(eval_stack) < 2:
                raise ValueError("Malformed expression: insufficient operands.")
            b = eval_stack.pop()
            a = eval_stack.pop()
            op_symbol = "**" if tok == "^" else tok
            val, _ = basic_arithmetic(a, b, op_symbol)
            eval_stack.append(val)
            steps.append(f"  [RPN Eval] {a} {op_symbol} {b} = {val} | stack={eval_stack}")

    if len(eval_stack) != 1:
        raise ValueError("Malformed expression: leftover operands on stack.")

    return eval_stack[0], steps


# ============================================================================
# 3. NUMBER THEORY, COMBINATORICS & DIGIT LOOPS
# ============================================================================

def factorial_loop(n: int) -> Tuple[int, List[str]]:
    """Calculates n! using a `for` loop accumulator."""
    if n < 0:
        raise ValueError("Factorial is not defined for negative integers.")
    steps: List[str] = [f"[Init] accumulator = 1 (Computing {n}!)"]
    acc = 1
    for i in range(1, n + 1):
        prev = acc
        acc *= i
        steps.append(f"  [for i={i}] acc = {prev} * {i} -> {acc}")
    return acc, steps


def ncr_npr_loop(n: int, r: int) -> Tuple[Tuple[int, int], List[str]]:
    """
    Computes (nCr, nPr) using multiplicative reduction loops instead of huge factorials.
    """
    if n < 0 or r < 0 or r > n:
        raise ValueError("Require 0 <= r <= n for Permutations and Combinations.")
    steps: List[str] = [f"[Combinatorics Loop] Computing nPr and nCr for n={n}, r={r}"]
    npr = 1
    for i in range(n, n - r, -1):
        npr *= i
        steps.append(f"  [nPr loop] multiply by {i} -> {npr}")

    k = min(r, n - r)
    ncr_num = 1
    ncr_den = 1
    for i in range(1, k + 1):
        ncr_num *= (n - i + 1)
        ncr_den *= i
    ncr = ncr_num // ncr_den
    steps.append(f"[Result] nPr({n}, {r}) = {npr}, nCr({n}, {r}) = {ncr}")
    return (ncr, npr), steps


def pascals_triangle_loop(rows: int) -> Tuple[List[List[int]], List[str]]:
    """
    Generates `rows` of Pascal's Triangle using nested `for` loops where each
    interior element is `prev_row[j - 1] + prev_row[j]`.
    """
    if rows <= 0:
        raise ValueError("Row count must be positive.")
    triangle: List[List[int]] = []
    steps: List[str] = [f"[Nested Loop] Generating {rows} rows of Pascal's Triangle"]
    for r in range(rows):
        row = [1] * (r + 1)
        for c in range(1, r):
            row[c] = triangle[r - 1][c - 1] + triangle[r - 1][c]
        triangle.append(row)
        steps.append(f"  [Row {r}] {row}")
    return triangle, steps


def fibonacci_loop(count: int) -> Tuple[List[int], List[str]]:
    """Generates the first `count` Fibonacci numbers using state-tuple swapping in a loop."""
    if count <= 0:
        raise ValueError("Count must be a positive integer.")
    steps: List[str] = []
    seq: List[int] = []
    a, b = 0, 1
    for i in range(count):
        seq.append(a)
        steps.append(f"  [for iter {i + 1}/{count}] emit {a}, next state (a, b) = ({b}, {a + b})")
        a, b = b, a + b
    return seq, steps


def is_prime_loop(n: int) -> Tuple[bool, List[str]]:
    """
    Determines whether `n` is prime using early-exit `for` loop logic up to sqrt(n).
    """
    steps: List[str] = []
    if n <= 1:
        steps.append(f"[Logic Check] n={n} <= 1 -> Not prime.")
        return False, steps
    if n == 2:
        steps.append("[Logic Check] n=2 is the only even prime -> Prime.")
        return True, steps
    if n % 2 == 0:
        steps.append(f"[Logic Check] {n} % 2 == 0 -> Even number > 2, not prime.")
        return False, steps

    limit = int(n ** 0.5)
    steps.append(f"[Loop Setup] Testing odd divisors d from 3 to int(sqrt({n})) = {limit} (step 2)")
    for d in range(3, limit + 1, 2):
        rem = n % d
        if rem == 0:
            steps.append(f"  [for d={d}] {n} % {d} == 0 -> Divisor found! Early break -> Not prime.")
            return False, steps
        steps.append(f"  [for d={d}] {n} % {d} == {rem} (not divisible)")

    steps.append(f"[Loop Complete] No divisors found up to {limit} -> {n} is Prime!")
    return True, steps


def primes_in_range(start: int, end: int) -> Tuple[List[int], List[str]]:
    """Finds all prime numbers in [start, end] using nested loops."""
    if start > end:
        start, end = end, start
    primes: List[int] = []
    steps: List[str] = [f"[Nested Loop] Scanning range [{start}, {end}] for primes"]
    for candidate in range(max(2, start), end + 1):
        is_p = True
        for d in range(2, int(candidate ** 0.5) + 1):
            if candidate % d == 0:
                is_p = False
                break
        if is_p:
            primes.append(candidate)
    steps.append(f"[Summary] Found {len(primes)} prime(s): {primes}")
    return primes, steps


def sieve_of_eratosthenes_loop(limit: int) -> Tuple[List[int], List[str]]:
    """
    Finds all primes up to `limit` using the Sieve of Eratosthenes nested loop
    (outer `p` loop up to sqrt(limit), inner multiple-marking loop `range(p*p, limit+1, p)`).
    """
    if limit < 2:
        return [], [f"[Guard] limit={limit} < 2 -> no primes."]
    is_prime = [True] * (limit + 1)
    is_prime[0] = is_prime[1] = False
    steps: List[str] = [f"[Sieve Init] Boolean array of size {limit + 1}"]

    p = 2
    while p * p <= limit:
        if is_prime[p]:
            marked_count = 0
            for multiple in range(p * p, limit + 1, p):
                if is_prime[multiple]:
                    is_prime[multiple] = False
                    marked_count += 1
            steps.append(
                f"  [Outer p={p}] Marked {marked_count} new multiples starting at {p * p}"
            )
        p += 1

    primes = [num for num, flag in enumerate(is_prime) if flag]
    steps.append(f"[Sieve Complete] Extracted {len(primes)} primes up to {limit}.")
    return primes, steps


def prime_factorization_loop(n: int) -> Tuple[List[Tuple[int, int]], List[str]]:
    """
    Computes the prime factorization of `n > 1` as `[(prime, exponent), ...]`
    using nested trial division `while` loops.
    """
    if n <= 1:
        raise ValueError("Prime factorization requires an integer > 1.")
    steps: List[str] = [f"[Factorization Loop] Factoring n = {n}"]
    factors: List[Tuple[int, int]] = []
    temp = n

    # Factor out 2s
    count = 0
    while temp % 2 == 0:
        temp //= 2
        count += 1
    if count > 0:
        factors.append((2, count))
        steps.append(f"  [Divisor 2] Divided out 2^{count}, remaining temp = {temp}")

    # Factor out odd numbers
    d = 3
    while d * d <= temp:
        count = 0
        while temp % d == 0:
            temp //= d
            count += 1
        if count > 0:
            factors.append((d, count))
            steps.append(f"  [Divisor {d}] Divided out {d}^{count}, remaining temp = {temp}")
        d += 2

    if temp > 1:
        factors.append((temp, 1))
        steps.append(f"  [Remaining Prime] {temp}^1")

    return factors, steps


def classify_number_loop(n: int) -> Tuple[Dict[str, Any], List[str]]:
    """
    Uses a divisor-finding loop up to sqrt(n) to sum proper divisors and classify `n`
    as Perfect, Abundant, or Deficient, plus checks if `n` is a Harshad (Niven) number.
    """
    if n <= 0:
        raise ValueError("Number classification requires a positive integer.")
    steps: List[str] = [f"[Classifier Loop] Inspecting divisors of n = {n}"]
    proper_divisors: List[int] = [1] if n > 1 else []

    for d in range(2, int(n ** 0.5) + 1):
        if n % d == 0:
            proper_divisors.append(d)
            paired = n // d
            if paired != d:
                proper_divisors.append(paired)
            steps.append(f"  [Divisor Pair] Found {d} and {paired}")

    proper_divisors.sort()
    aliquot_sum = sum(proper_divisors)
    if aliquot_sum == n:
        classification = "Perfect"
    elif aliquot_sum > n:
        classification = "Abundant"
    else:
        classification = "Deficient"

    digit_info, _ = analyze_digits_loop(n)
    is_harshad = (n % digit_info["digit_sum"] == 0) if digit_info["digit_sum"] > 0 else False
    steps.append(
        f"[Aliquot Sum] sum({proper_divisors}) = {aliquot_sum} -> {classification} | Harshad={is_harshad}"
    )

    return {
        "n": n,
        "proper_divisors": proper_divisors,
        "aliquot_sum": aliquot_sum,
        "classification": classification,
        "is_harshad": is_harshad,
    }, steps


def gcd_lcm_loop(a: int, b: int) -> Tuple[Tuple[int, int], List[str]]:
    """
    Computes (GCD, LCM) using Euclid's algorithm (`while` loop with modulo remainder).
    """
    steps: List[str] = []
    x, y = abs(a), abs(b)
    if x == 0 and y == 0:
        raise ValueError("GCD(0, 0) is undefined.")

    steps.append(f"[Euclid While Loop] Starting with x={x}, y={y}")
    iteration = 0
    while y != 0:
        iteration += 1
        rem = x % y
        steps.append(f"  [while iter {iteration}] {x} % {y} = {rem} -> (x, y) becomes ({y}, {rem})")
        x, y = y, rem

    gcd_val = x
    lcm_val = abs(a * b) // gcd_val if (a != 0 and b != 0) else 0
    steps.append(f"[Done] GCD = {gcd_val}, LCM = |{a} * {b}| // {gcd_val} = {lcm_val}")
    return (gcd_val, lcm_val), steps


def analyze_digits_loop(n: int) -> Tuple[Dict[str, Any], List[str]]:
    """
    Extracts digits of an integer using a `while num > 0` loop (`% 10` and `// 10`)
    to compute digit sum, reversed number, palindrome status, and Armstrong status.
    """
    steps: List[str] = []
    abs_n = abs(n)
    if abs_n == 0:
        info = {
            "original": n,
            "digit_count": 1,
            "digit_sum": 0,
            "reversed": 0,
            "is_palindrome": True,
            "is_armstrong": True,
        }
        steps.append("[Base Case] n = 0 -> single digit 0.")
        return info, steps

    temp = abs_n
    digits: List[int] = []
    reversed_num = 0
    digit_sum = 0

    steps.append(f"[Digit Extraction While Loop] Starting with temp = {temp}")
    while temp > 0:
        digit = temp % 10
        digits.append(digit)
        digit_sum += digit
        reversed_num = reversed_num * 10 + digit
        next_temp = temp // 10
        steps.append(
            f"  [while temp={temp}] digit={digit} | sum={digit_sum} | rev={reversed_num} | temp//10={next_temp}"
        )
        temp = next_temp

    num_digits = len(digits)
    armstrong_sum = 0
    for d in digits:
        armstrong_sum += d ** num_digits

    is_palindrome = (n >= 0) and (abs_n == reversed_num)
    is_armstrong = (n >= 0) and (abs_n == armstrong_sum)

    steps.append(
        f"[Armstrong Check] Sum of digits^{num_digits} = {armstrong_sum} == {abs_n} -> {is_armstrong}"
    )
    steps.append(
        f"[Palindrome Check] Reversed {reversed_num} == {abs_n} (non-negative) -> {is_palindrome}"
    )

    info = {
        "original": n,
        "digit_count": num_digits,
        "digit_sum": digit_sum,
        "reversed": -reversed_num if n < 0 else reversed_num,
        "is_palindrome": is_palindrome,
        "is_armstrong": is_armstrong,
    }
    return info, steps


# ============================================================================
# 4. BOOLEAN LOGIC, BITWISE ALGORITHMS & ARBITRARY BASE CONVERSION
# ============================================================================

def evaluate_boolean_gate(a: bool, b: bool, gate: str) -> bool:
    """Evaluates standard and derived logic gates."""
    g = gate.upper()
    if g == "AND":
        return a and b
    elif g == "OR":
        return a or b
    elif g == "XOR":
        return a ^ b
    elif g == "NAND":
        return not (a and b)
    elif g == "NOR":
        return not (a or b)
    elif g == "XNOR":
        return not (a ^ b)
    elif g == "IMPLIES":
        return (not a) or b
    else:
        raise ValueError(f"Unknown logic gate: {gate}")


def generate_truth_table() -> Tuple[List[Dict[str, Any]], List[str]]:
    """
    Uses nested `for` loops over (False, True) x (False, True) to build a
    complete boolean logic truth table.
    """
    gates = ["AND", "OR", "XOR", "NAND", "NOR", "XNOR", "IMPLIES"]
    rows: List[Dict[str, Any]] = []
    steps: List[str] = ["[Nested For Loop] Iterating A in (False, True), B in (False, True)"]

    for a in (False, True):
        for b in (False, True):
            row: Dict[str, Any] = {"A": int(a), "B": int(b)}
            for g in gates:
                row[g] = int(evaluate_boolean_gate(a, b, g))
            rows.append(row)
            steps.append(f"  [Row A={int(a)}, B={int(b)}] -> {row}")

    return rows, steps


def bitwise_calculator(a: int, b: int, op: str) -> Tuple[int, List[str]]:
    """
    Performs bitwise logic (&, |, ^, ~, <<, >>) and shows binary representations.
    """
    steps: List[str] = []
    steps.append(f"Binary A ({a}) = {bin(a)}")
    if op != "~":
        steps.append(f"Binary B ({b}) = {bin(b)}")

    if op == "&":
        res = a & b
        steps.append(f"[Bitwise AND] {a} & {b} = {res} ({bin(res)})")
    elif op == "|":
        res = a | b
        steps.append(f"[Bitwise OR]  {a} | {b} = {res} ({bin(res)})")
    elif op == "^":
        res = a ^ b
        steps.append(f"[Bitwise XOR] {a} ^ {b} = {res} ({bin(res)})")
    elif op == "~":
        res = ~a
        steps.append(f"[Bitwise NOT] ~{a} = {res} ({bin(res)})  (Two's complement: -(a + 1))")
    elif op == "<<":
        if b < 0:
            raise ValueError("Shift count cannot be negative.")
        res = a << b
        steps.append(f"[Left Shift]  {a} << {b} = {res} ({bin(res)}) (Multiplies by 2^{b})")
    elif op == ">>":
        if b < 0:
            raise ValueError("Shift count cannot be negative.")
        res = a >> b
        steps.append(f"[Right Shift] {a} >> {b} = {res} ({bin(res)}) (Floor-divides by 2^{b})")
    else:
        raise ValueError(f"Unsupported bitwise operator: {op}")

    return res, steps


def brian_kernighan_popcount_loop(n: int) -> Tuple[Dict[str, Any], List[str]]:
    """
    Counts set 1-bits using Brian Kernighan's trick: `while temp > 0: temp &= (temp - 1)`.
    Each iteration clears the lowest set bit in O(set_bits) iterations!
    """
    if n < 0:
        raise ValueError("Popcount expects a non-negative integer.")
    steps: List[str] = [f"[Kernighan Bit-Loop] Counting 1-bits in {n} ({bin(n)})"]
    temp = n
    count = 0
    while temp > 0:
        prev = temp
        temp &= (temp - 1)
        count += 1
        steps.append(
            f"  [iter {count}] {prev} ({bin(prev)}) & {prev - 1} ({bin(prev - 1)}) -> {temp} ({bin(temp)})"
        )

    is_power_of_two = (n > 0) and ((n & (n - 1)) == 0)
    parity = "EVEN" if count % 2 == 0 else "ODD"
    return {
        "n": n,
        "binary": bin(n),
        "set_bits": count,
        "parity": parity,
        "is_power_of_two": is_power_of_two,
    }, steps


def decimal_to_base_loop(n: int, base: int) -> Tuple[str, List[str]]:
    """
    Converts a decimal integer `n` to any base (2..36) using a `while` loop
    that repeatedly extracts `n % base` and updates `n //= base`.
    """
    if not (2 <= base <= 36):
        raise ValueError("Base must be between 2 and 36.")

    digits_map = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ"
    steps: List[str] = []

    if n == 0:
        steps.append(f"[Base Case] 0 in base {base} is '0'")
        return "0", steps

    negative = n < 0
    temp = abs(n)
    remainders: List[str] = []

    steps.append(f"[While Loop] Converting |{n}|={temp} to base {base} via repeated division")
    while temp > 0:
        rem = temp % base
        char = digits_map[rem]
        remainders.append(char)
        next_temp = temp // base
        steps.append(
            f"  [while temp={temp}] {temp} % {base} = {rem} ('{char}'), next temp = {temp} // {base} = {next_temp}"
        )
        temp = next_temp

    reversed_chars: List[str] = []
    for i in range(len(remainders) - 1, -1, -1):
        reversed_chars.append(remainders[i])

    result_str = ("-" if negative else "") + "".join(reversed_chars)
    steps.append(f"[Reverse Remainders] Most-significant digit first -> {result_str}")
    return result_str, steps


def base_to_base_loop(num_str: str, from_base: int, to_base: int) -> Tuple[str, List[str]]:
    """
    Converts `num_str` from `from_base` (2..36) to `to_base` (2..36).
    First uses Horner's method (`acc = acc * from_base + val`) in a `for` loop,
    then calls `decimal_to_base_loop`.
    """
    if not (2 <= from_base <= 36) or not (2 <= to_base <= 36):
        raise ValueError("Bases must be between 2 and 36.")
    s = num_str.strip().upper()
    if not s:
        raise ValueError("Empty number string.")

    negative = s.startswith("-")
    if s[0] in ("+", "-"):
        s = s[1:]

    digits_map = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ"
    steps: List[str] = [f"[Horner For-Loop] Parsing '{num_str}' in base {from_base}"]
    acc = 0
    for idx, ch in enumerate(s):
        val = digits_map.find(ch)
        if val == -1 or val >= from_base:
            raise ValueError(f"Invalid digit '{ch}' for base {from_base}.")
        prev = acc
        acc = acc * from_base + val
        steps.append(f"  [char {idx}: '{ch}'={val}] acc = {prev} * {from_base} + {val} -> {acc}")

    dec_val = -acc if negative else acc
    out_str, sub_steps = decimal_to_base_loop(dec_val, to_base)
    steps.extend(sub_steps)
    return out_str, steps


# ============================================================================
# 5. SERIES, CONVERGENCE & NUMERICAL CALCULUS LOOPS
# ============================================================================

def collatz_sequence_loop(n: int) -> Tuple[List[int], List[str]]:
    """
    Generates the Collatz (3n + 1) hailstone sequence using a `while n != 1` loop
    with even/odd conditional branching inside the loop body.
    """
    if n <= 0:
        raise ValueError("Collatz sequence requires a positive starting integer.")

    seq = [n]
    steps: List[str] = [f"[Collatz Init] Start at n = {n}"]
    step_num = 0

    while n != 1:
        step_num += 1
        if n % 2 == 0:
            next_n = n // 2
            steps.append(f"  [Step {step_num}: EVEN] {n} % 2 == 0 -> {n} // 2 = {next_n}")
        else:
            next_n = 3 * n + 1
            steps.append(f"  [Step {step_num}: ODD ] {n} % 2 != 0 -> 3*{n} + 1 = {next_n}")
        n = next_n
        seq.append(n)

    steps.append(f"[Converged] Reached 1 in {step_num} steps. Peak value = {max(seq)}.")
    return seq, steps


def newton_sqrt_loop(number: float, tolerance: float = 1e-7) -> Tuple[float, List[str]]:
    """
    Approximates sqrt(number) using Newton-Raphson convergence `while` loop:
    guess_next = 0.5 * (guess + number / guess)
    """
    if number < 0:
        raise ValueError("Cannot compute real square root of a negative number.")
    if number == 0:
        return 0.0, ["[Base Case] sqrt(0) = 0.0"]

    guess = number if number >= 1.0 else 1.0
    steps: List[str] = [f"[Newton Init] Initial guess = {guess}, tolerance = {tolerance}"]
    iteration = 0

    while True:
        iteration += 1
        next_guess = 0.5 * (guess + number / guess)
        diff = abs(next_guess - guess)
        steps.append(
            f"  [iter {iteration}] next_guess = 0.5 * ({guess:.7f} + {number}/{guess:.7f}) = {next_guess:.7f} (error={diff:.2e})"
        )
        guess = next_guess
        if diff < tolerance:
            steps.append(f"[Converged] Error {diff:.2e} < {tolerance} after {iteration} iterations.")
            break

    return guess, steps


def taylor_series_loop(
    func_name: str, x: float, terms: int = 12
) -> Tuple[Tuple[float, float], List[str]]:
    """
    Approximates exp(x), sin(x), or cos(x) using a Taylor/Maclaurin series `for` loop
    and compares against Python's `math` library exact value.
    Returns ((approx_value, exact_value), steps).
    """
    if terms <= 0:
        raise ValueError("Number of Taylor terms must be positive.")
    fn = func_name.strip().lower()
    steps: List[str] = [f"[Taylor Series Loop] Approximating {fn}({x}) with {terms} terms"]

    total = 0.0
    if fn == "exp":
        term = 1.0
        for k in range(terms):
            if k > 0:
                term *= x / k
            total += term
            steps.append(f"  [k={k}] term = {term:.8e} | partial_sum = {total:.8f}")
        exact = math.exp(x)
    elif fn == "sin":
        # Reduce angle to [-pi, pi] for fast convergence
        x_red = ((x + math.pi) % (2 * math.pi)) - math.pi
        term = x_red
        for k in range(terms):
            if k > 0:
                term *= -1.0 * (x_red * x_red) / ((2 * k) * (2 * k + 1))
            total += term
            steps.append(f"  [k={k}] term = {term:.8e} | partial_sum = {total:.8f}")
        exact = math.sin(x)
    elif fn == "cos":
        x_red = ((x + math.pi) % (2 * math.pi)) - math.pi
        term = 1.0
        for k in range(terms):
            if k > 0:
                term *= -1.0 * (x_red * x_red) / ((2 * k - 1) * (2 * k))
            total += term
            steps.append(f"  [k={k}] term = {term:.8e} | partial_sum = {total:.8f}")
        exact = math.cos(x)
    else:
        raise ValueError("Unsupported Taylor function. Choose 'exp', 'sin', or 'cos'.")

    steps.append(
        f"[Comparison] Taylor = {total:.10f} | math.{fn} = {exact:.10f} | error = {abs(total - exact):.2e}"
    )
    return (total, exact), steps


def numerical_integral_loop(
    poly_coeffs: List[float], a: float, b: float, intervals: int = 100
) -> Tuple[float, List[str]]:
    """
    Approximates the definite integral of a polynomial P(x) = c_0 + c_1*x + c_2*x^2 + ...
    over [a, b] using the Trapezoidal Rule `for` loop with `intervals` subintervals.
    """
    if intervals <= 0:
        raise ValueError("Intervals must be a positive integer.")

    def eval_poly(x_val: float) -> float:
        acc = 0.0
        x_pow = 1.0
        for c in poly_coeffs:
            acc += c * x_pow
            x_pow *= x_val
        return acc

    h = (b - a) / intervals
    total = 0.5 * (eval_poly(a) + eval_poly(b))
    steps: List[str] = [
        f"[Trapezoidal Loop] Integrating P(x) on [{a}, {b}] with N={intervals}, step h={h:.5f}"
    ]

    for i in range(1, intervals):
        xi = a + i * h
        fx = eval_poly(xi)
        total += fx
        if i <= 5 or i == intervals - 1:
            steps.append(f"  [slice {i}/{intervals}] x_{i}={xi:.4f}, P(x_{i})={fx:.4f}")
        elif i == 6:
            steps.append("  ... (intermediate slices omitted for brevity) ...")

    area = total * h
    steps.append(f"[Integral Result] Area ≈ {area:.8f}")
    return area, steps


def progression_generator_loop(
    first_term: float, diff_or_ratio: float, count: int, kind: str = "AP"
) -> Tuple[Tuple[List[float], float], List[str]]:
    """
    Generates an Arithmetic Progression (AP) or Geometric Progression (GP)
    and accumulates its sum using a `for` loop.
    """
    if count <= 0:
        raise ValueError("Term count must be a positive integer.")

    kind_u = kind.upper()
    if kind_u not in ("AP", "GP"):
        raise ValueError("Kind must be 'AP' or 'GP'.")

    terms: List[float] = []
    total_sum = 0.0
    current = first_term
    steps: List[str] = [
        f"[{kind_u} Loop] first_term={first_term}, {'d' if kind_u == 'AP' else 'r'}={diff_or_ratio}, n={count}"
    ]

    for i in range(1, count + 1):
        terms.append(current)
        total_sum += current
        steps.append(f"  [Term {i}] value = {current} | running_sum = {total_sum}")
        if kind_u == "AP":
            current += diff_or_ratio
        else:
            current *= diff_or_ratio

    return (terms, total_sum), steps


# ============================================================================
# 6. MATRIX ALGEBRA (2D & 3D NESTED LOOPS)
# ============================================================================

Matrix = List[List[float]]


def matrix_add_loop(m1: Matrix, m2: Matrix) -> Tuple[Matrix, List[str]]:
    """Adds two matrices of identical dimensions using a 2D nested `for` loop."""
    if not m1 or not m2 or len(m1) != len(m2) or len(m1[0]) != len(m2[0]):
        raise ValueError("Matrices must be non-empty and have identical dimensions.")
    rows, cols = len(m1), len(m1[0])
    result: Matrix = [[0.0 for _ in range(cols)] for _ in range(rows)]
    steps: List[str] = [f"[2D Nested Loop] Adding {rows}x{cols} matrices"]

    for r in range(rows):
        for c in range(cols):
            result[r][c] = m1[r][c] + m2[r][c]
            steps.append(
                f"  [r={r}, c={c}] {m1[r][c]} + {m2[r][c]} = {result[r][c]}"
            )
    return result, steps


def matrix_multiply_loop(m1: Matrix, m2: Matrix) -> Tuple[Matrix, List[str]]:
    """
    Multiplies an (R1 x C1) matrix by a (C1 x C2) matrix using a classic
    triple-nested `for` loop (`for i`, `for j`, `for k`).
    """
    if not m1 or not m2 or len(m1[0]) != len(m2):
        raise ValueError("Matrix A columns must equal Matrix B rows for multiplication.")
    r1, c1, c2 = len(m1), len(m1[0]), len(m2[0])
    result: Matrix = [[0.0 for _ in range(c2)] for _ in range(r1)]
    steps: List[str] = [f"[3D Triple-Nested Loop] Multiplying ({r1}x{c1}) * ({c1}x{c2})"]

    for i in range(r1):
        for j in range(c2):
            dot_sum = 0.0
            for k in range(c1):
                prod = m1[i][k] * m2[k][j]
                dot_sum += prod
                steps.append(
                    f"  [i={i}, j={j}, k={k}] A[{i}][{k}]({m1[i][k]}) * B[{k}][{j}]({m2[k][j]}) = {prod} | sum={dot_sum}"
                )
            result[i][j] = dot_sum
    return result, steps


def matrix_transpose_loop(m: Matrix) -> Tuple[Matrix, List[str]]:
    """Transposes an R x C matrix into a C x R matrix using a 2D nested loop."""
    if not m or not m[0]:
        raise ValueError("Matrix cannot be empty.")
    rows, cols = len(m), len(m[0])
    transposed: Matrix = [[0.0 for _ in range(rows)] for _ in range(cols)]
    steps: List[str] = [f"[2D Transpose Loop] Flipping {rows}x{cols} -> {cols}x{rows}"]
    for r in range(rows):
        for c in range(cols):
            transposed[c][r] = m[r][c]
    steps.append(f"[Result] Transposed = {transposed}")
    return transposed, steps


def matrix_determinant_loop(m: Matrix) -> Tuple[float, List[str]]:
    """Computes the determinant of a 2x2 or 3x3 square matrix using cofactor expansion loops."""
    if not m or len(m) != len(m[0]) or len(m) not in (2, 3):
        raise ValueError("Determinant supports 2x2 or 3x3 square matrices.")
    n = len(m)
    steps: List[str] = [f"[Determinant Logic] Computing {n}x{n} determinant"]
    if n == 2:
        det = m[0][0] * m[1][1] - m[0][1] * m[1][0]
        steps.append(f"  ad - bc = ({m[0][0]}*{m[1][1]}) - ({m[0][1]}*{m[1][0]}) = {det}")
        return det, steps

    det = 0.0
    for col in range(3):
        sub_cols = [c for c in range(3) if c != col]
        minor = (
            m[1][sub_cols[0]] * m[2][sub_cols[1]]
            - m[1][sub_cols[1]] * m[2][sub_cols[0]]
        )
        sign = 1 if col % 2 == 0 else -1
        contrib = sign * m[0][col] * minor
        det += contrib
        steps.append(
            f"  [col={col}] sign={sign:+} * a[0][{col}]({m[0][col]}) * minor({minor}) = {contrib} | running_det={det}"
        )
    return det, steps


# ============================================================================
# 7. ALGORITHMIC SEARCHING, SORTING & STATISTICAL LOOPS
# ============================================================================

def sorting_visualizer_loop(
    arr: List[float], algorithm: str = "bubble"
) -> Tuple[Tuple[List[float], int], List[str]]:
    """
    Sorts a list of numbers using Bubble Sort or Insertion Sort (nested loops),
    counting total comparisons/swaps and tracing every pass.
    """
    data = list(arr)
    n = len(data)
    algo = algorithm.strip().lower()
    steps: List[str] = [f"[Sorting Nested Loop] Algorithm={algo.upper()}, input={data}"]
    swaps = 0

    if algo == "bubble":
        for i in range(n):
            swapped_in_pass = False
            for j in range(0, n - i - 1):
                if data[j] > data[j + 1]:
                    data[j], data[j + 1] = data[j + 1], data[j]
                    swaps += 1
                    swapped_in_pass = True
            steps.append(f"  [Pass {i + 1}] array={data} (total swaps={swaps})")
            if not swapped_in_pass:
                steps.append("  [Early Exit] No swaps in pass -> array is already sorted!")
                break
    elif algo == "insertion":
        for i in range(1, n):
            key = data[i]
            j = i - 1
            while j >= 0 and data[j] > key:
                data[j + 1] = data[j]
                j -= 1
                swaps += 1
            data[j + 1] = key
            steps.append(f"  [Insert i={i} (key={key})] array={data} (shifts={swaps})")
    else:
        raise ValueError("Algorithm must be 'bubble' or 'insertion'.")

    return (data, swaps), steps


def binary_search_loop(
    sorted_arr: List[float], target: float
) -> Tuple[int, List[str]]:
    """
    Performs Binary Search on a sorted sequence using a `while low <= high` loop.
    Returns (found_index_or_-1, steps).
    """
    low = 0
    high = len(sorted_arr) - 1
    steps: List[str] = [
        f"[Binary Search While-Loop] Searching for {target} in {sorted_arr}"
    ]
    iteration = 0

    while low <= high:
        iteration += 1
        mid = (low + high) // 2
        mid_val = sorted_arr[mid]
        steps.append(
            f"  [iter {iteration}] low={low}, high={high} -> mid={mid} (val={mid_val})"
        )
        if mid_val == target:
            steps.append(f"[Found!] Target {target} located at index {mid}.")
            return mid, steps
        elif mid_val < target:
            low = mid + 1
            steps.append(f"    {mid_val} < {target} -> move low to {low}")
        else:
            high = mid - 1
            steps.append(f"    {mid_val} > {target} -> move high to {high}")

    steps.append(f"[Not Found] low ({low}) > high ({high}). Target {target} not in list.")
    return -1, steps


def statistics_analyzer_loop(values: List[float]) -> Tuple[Dict[str, Any], List[str]]:
    """
    Computes descriptive statistics (count, sum, mean, min, max, median, variance,
    std_dev) using explicit accumulator loops.
    """
    if not values:
        raise ValueError("Statistical analysis requires at least one number.")
    steps: List[str] = [f"[Stats Loop] Analyzing {len(values)} data points"]

    total = 0.0
    min_v = values[0]
    max_v = values[0]
    for v in values:
        total += v
        if v < min_v:
            min_v = v
        if v > max_v:
            max_v = v

    count = len(values)
    mean = total / count
    steps.append(f"  [Pass 1] sum={total:.4f}, mean={mean:.4f}, min={min_v}, max={max_v}")

    sq_diff_sum = 0.0
    for v in values:
        sq_diff_sum += (v - mean) ** 2
    variance = sq_diff_sum / count
    std_dev = variance ** 0.5
    steps.append(f"  [Pass 2] variance={variance:.4f}, std_dev={std_dev:.4f}")

    (sorted_vals, _), _ = sorting_visualizer_loop(values, "insertion")
    mid = count // 2
    if count % 2 == 1:
        median = sorted_vals[mid]
    else:
        median = 0.5 * (sorted_vals[mid - 1] + sorted_vals[mid])

    return {
        "count": count,
        "sum": total,
        "mean": mean,
        "median": median,
        "min": min_v,
        "max": max_v,
        "variance": variance,
        "std_dev": std_dev,
        "sorted": sorted_vals,
    }, steps


# ============================================================================
# 8. INTERACTIVE QUIZ, DEMO & CLI REPL
# ============================================================================

def print_steps(steps: List[str], trace_enabled: bool) -> None:
    """Prints step-by-step logic and loop trace if enabled."""
    if not trace_enabled:
        return
    print("\n  --- [Loop & Logic Trace] ---")
    for line in steps:
        print(f"  {line}")
    print("  ----------------------------")


def run_quiz_mode() -> None:
    """Interactive 5-question Loop & Logic Mastery Quiz."""
    questions = [
        {
            "q": "Q1: How many iterations does `while temp > 0: temp &= (temp - 1)` take for temp = 29 (binary 11101)?",
            "ans": "4",
            "explain": "Brian Kernighan's loop runs once per set 1-bit. 29 is 0b11101, which has four 1-bits!",
        },
        {
            "q": "Q2: In Euclidean GCD(48, 18), what is the remainder after the FIRST `48 % 18` step?",
            "ans": "12",
            "explain": "48 = 2 * 18 + 12, so 48 % 18 == 12.",
        },
        {
            "q": "Q3: What is `(True ^ True) or (not False and True)` as 1 or 0?",
            "ans": "1",
            "explain": "True ^ True is False (0), but (not False and True) is True (1). False or True => 1.",
        },
        {
            "q": "Q4: How many steps does the Collatz (3n+1) loop take to reach 1 starting from n = 6?",
            "ans": "8",
            "explain": "6 -> 3 -> 10 -> 5 -> 16 -> 8 -> 4 -> 2 -> 1 (8 transitions).",
        },
        {
            "q": "Q5: What is the sum of proper divisors of 28 (making it a Perfect number)?",
            "ans": "28",
            "explain": "Proper divisors of 28 are 1 + 2 + 4 + 7 + 14 = 28.",
        },
    ]
    print("\n" + "=" * 64)
    print("  WELCOME TO THE CALOOPS LOGIC & LOOPS MASTERY QUIZ!")
    print("=" * 64)
    score = 0
    for item in questions:
        print(f"\n{item['q']}")
        user_ans = input("Your answer: ").strip()
        if user_ans == item["ans"]:
            score += 1
            print(f"  [Correct!] {item['explain']}")
        else:
            print(f"  [Not quite] Correct answer: {item['ans']}. {item['explain']}")
    print(f"\n=> Final Quiz Score: {score}/{len(questions)}")


def run_demo() -> None:
    """Runs a non-interactive showcase of all 16+ logic & loop modules."""
    print("=" * 72)
    print("  CALOOPS v2.0 — Ultimate Logic & Loops Calculator (Automated Showcase)")
    print("=" * 72)

    # 1. Multiply & Divide by loop
    res, steps = multiply_by_loop(6, -4)
    print(f"\n1. Loop Multiplication (6 * -4) = {res}")
    print_steps(steps, True)

    (q, r), steps = divide_by_loop(29, 5)
    print(f"\n2. While-Loop Division (29 // 5, 29 % 5) -> Quotient={q}, Remainder={r}")
    print_steps(steps, True)

    # 3. Shunting-Yard RPN Expression Evaluator
    expr_str = "3 + 4 * 2 / (1 - 5) ^ 2 + ans"
    val, steps = evaluate_expression_loop(expr_str, {"ans": 10.0})
    print(f"\n3. Shunting-Yard RPN Evaluator ('{expr_str}' with ans=10) = {val}")
    print_steps(steps, True)

    # 4. Number Theory: Sieve, Prime Factors, Perfect/Harshad Classifier
    factors, steps = prime_factorization_loop(360)
    print(f"\n4. Prime Factorization While-Loop (360) -> {factors}")
    print_steps(steps, True)

    cls_info, steps = classify_number_loop(28)
    print(f"\n5. Proper Divisor Classifier Loop (28) -> {cls_info}")
    print_steps(steps, True)

    # 6. Combinatorics & Pascal's Triangle
    (ncr, npr), steps = ncr_npr_loop(6, 2)
    tri, _ = pascals_triangle_loop(5)
    print(f"\n6. Combinatorics Loop: 6C2={ncr}, 6P2={npr} | Pascal(5 rows)={tri}")

    # 7. Bitwise & Brian Kernighan Popcount + Base-to-Base Horner Loop
    pop_info, steps = brian_kernighan_popcount_loop(29)
    print(f"\n7. Brian Kernighan Bit-Clearing Loop (29) -> {pop_info}")
    print_steps(steps, True)

    conv, steps = base_to_base_loop("FF", 16, 2)
    print(f"\n8. Horner Base-to-Base Converter ('FF' base 16 -> base 2) = {conv}")
    print_steps(steps, True)

    # 9. Taylor Series & Numerical Integration
    (approx_sin, exact_sin), steps = taylor_series_loop("sin", math.pi / 6, terms=6)
    print(f"\n9. Taylor Series Loop sin(pi/6) -> approx={approx_sin:.8f}, exact={exact_sin:.8f}")
    print_steps(steps, True)

    area, steps = numerical_integral_loop([0.0, 0.0, 1.0], 0.0, 3.0, intervals=50)
    print(f"\n10. Trapezoidal Integration Loop of x^2 on [0, 3] (exact=9.0) -> {area:.6f}")

    # 11. Matrix Triple-Nested Loop Multiplication & Determinant
    m_a = [[1.0, 2.0], [3.0, 4.0]]
    m_b = [[5.0, 6.0], [7.0, 8.0]]
    m_prod, steps = matrix_multiply_loop(m_a, m_b)
    det_a, _ = matrix_determinant_loop(m_a)
    print(f"\n11. Matrix 3D Loop Product = {m_prod} | det(A) = {det_a}")
    print_steps(steps, True)

    # 12. Sorting, Binary Search & Statistics
    (sorted_arr, swaps), steps = sorting_visualizer_loop([12, 4, 19, 1, 8], "bubble")
    idx, b_steps = binary_search_loop(sorted_arr, 12)
    stats, _ = statistics_analyzer_loop(sorted_arr)
    print(f"\n12. Bubble Sort = {sorted_arr} ({swaps} swaps) | BinarySearch(12) idx={idx} | Mean={stats['mean']}")
    print_steps(b_steps, True)
    print("\n" + "=" * 72)


def interactive_menu() -> None:
    """Main REPL while-loop driving the interactive CLI calculator."""
    trace_enabled = True
    history: List[str] = []
    memory: Dict[str, float] = {"ans": 0.0, "m": 0.0}

    while True:
        print("\n" + "=" * 70)
        print("        CALOOPS v2.0: ULTIMATE LOGIC & LOOPS SCIENTIFIC CALCULATOR")
        print(
            f"        [Trace: {'ON' if trace_enabled else 'OFF'} | ANS={memory['ans']:.4g} | M={memory['m']:.4g} | History: {len(history)}]"
        )
        print("=" * 70)
        print("  [1]  Basic Arithmetic (+, -, *, /, //, %, **)       (if/elif/else)")
        print("  [2]  Multiply / Divide / Power via Loops            (for & while)")
        print("  [3]  Shunting-Yard Expression Evaluator (RPN Stack) (infix -> RPN)")
        print("  [4]  Factorial, Fibonacci, nCr/nPr & Pascal Pyramid (combinatorics)")
        print("  [5]  Primes, Sieve, Prime Factors & Classifier      (number theory)")
        print("  [6]  GCD & LCM Calculator                           (Euclid while)")
        print("  [7]  Digit Analyzer (Sum, Reverse, Armstrong)       (while n > 0)")
        print("  [8]  Boolean Logic Truth Table Generator            (nested loops)")
        print("  [9]  Bitwise Logic & Brian Kernighan Popcount       (bit tricks)")
        print("  [10] Arbitrary Base-to-Base Converter (Bases 2..36) (Horner loop)")
        print("  [11] Collatz 3n+1 & Newton-Raphson Square Root      (convergence)")
        print("  [12] Taylor Series (sin/cos/exp) & Integral Engine  (calculus loops)")
        print("  [13] Matrix Algebra (Add, 3D Multiply, Transpose, Det)")
        print("  [14] Sorting Visualizer, Binary Search & Statistics (algorithms)")
        print("  [15] Arithmetic & Geometric Progressions (AP / GP)")
        print("  [M]  Memory & Variable Manager (M+, M-, MC, set var)")
        print("  [Q]  Interactive Logic & Loops Mastery Quiz")
        print("  [T]  Toggle Step-by-Step Loop/Logic Trace")
        print("  [H]  View / Export Session History (JSON)")
        print("  [D]  Run Full Automated Showcase Demo")
        print("  [0]  Exit Calculator")
        print("=" * 70)

        choice = input("Select an option: ").strip().upper()

        if choice in ("0", "EXIT"):
            print("Exiting CALOOPS v2.0. Keep mastering logic and loops!")
            break
        elif choice == "T":
            trace_enabled = not trace_enabled
            print(f"-> Step-by-Step Trace is now {'ENABLED' if trace_enabled else 'DISABLED'}.")
            continue
        elif choice == "Q":
            run_quiz_mode()
            continue
        elif choice == "H":
            print("\n--- Session Calculation History ---")
            if not history:
                print("  (No calculations recorded yet.)")
            else:
                for idx, entry in enumerate(history, start=1):
                    print(f"  {idx}. {entry}")
                save = input("\nExport history to 'caloops_history.json'? (y/N): ").strip().lower()
                if save == "y":
                    with open("caloops_history.json", "w", encoding="utf-8") as fh:
                        json.dump({"memory": memory, "history": history}, fh, indent=2)
                    print("  -> Saved to caloops_history.json")
            continue
        elif choice == "D":
            run_demo()
            continue
        elif choice == "M":
            print(f"\nCurrent Variables & Memory: {memory}")
            cmd = input("Choose (A)dd ANS to M, (C)lear M, or (S)et custom variable: ").strip().upper()
            if cmd == "A":
                memory["m"] += memory["ans"]
                print(f"-> M updated to {memory['m']}")
            elif cmd == "C":
                memory["m"] = 0.0
                print("-> Memory M cleared to 0.0")
            elif cmd == "S":
                vname = input("Variable name (letters only): ").strip().lower()
                vval = float(input(f"Value for {vname}: "))
                memory[vname] = vval
                print(f"-> Stored {vname} = {vval}")
            continue

        try:
            if choice == "1":
                a = float(input("Enter first number (a): "))
                op = input("Enter operator (+, -, *, /, //, %, **): ").strip()
                b = float(input("Enter second number (b): "))
                res, steps = basic_arithmetic(a, b, op)
                memory["ans"] = float(res)
                print(f"\n=> Result: {a} {op} {b} = {res}")
                print_steps(steps, trace_enabled)
                history.append(f"Basic: {a} {op} {b} = {res}")

            elif choice == "2":
                sub = input("Choose (M)ultiply loop, (D)ivide loop, or (P)ower loop: ").strip().upper()
                if sub == "M":
                    a = int(input("Enter integer a: "))
                    b = int(input("Enter integer b: "))
                    res, steps = multiply_by_loop(a, b)
                    memory["ans"] = float(res)
                    print(f"\n=> Loop Multiplication: {a} * {b} = {res}")
                    print_steps(steps, trace_enabled)
                    history.append(f"LoopMul: {a} * {b} = {res}")
                elif sub == "D":
                    a = int(input("Enter non-negative dividend: "))
                    b = int(input("Enter positive divisor: "))
                    (q, r), steps = divide_by_loop(a, b)
                    memory["ans"] = float(q)
                    print(f"\n=> Loop Division: {a} ÷ {b} -> Quotient = {q}, Remainder = {r}")
                    print_steps(steps, trace_enabled)
                    history.append(f"LoopDiv: {a} ÷ {b} = Q:{q}, R:{r}")
                elif sub == "P":
                    base = float(input("Enter base: "))
                    exp = int(input("Enter integer exponent: "))
                    res, steps = power_by_loop(base, exp)
                    memory["ans"] = float(res)
                    print(f"\n=> Loop Power: {base} ** {exp} = {res}")
                    print_steps(steps, trace_enabled)
                    history.append(f"LoopPow: {base} ** {exp} = {res}")

            elif choice == "3":
                print(f"Available variables: {memory} (plus pi, e)")
                expr = input("Enter infix expression (e.g. 3 + 4 * (2 - 1)^3 + ans): ")
                res, steps = evaluate_expression_loop(expr, memory)
                memory["ans"] = res
                print(f"\n=> Expression Result: {res}")
                print_steps(steps, trace_enabled)
                history.append(f"Expr: {expr} = {res}")

            elif choice == "4":
                sub = input("Choose (F)actorial, F(I)bonacci, (C)ombinatorics nCr/nPr, or (P)ascal's Triangle: ").strip().upper()
                if sub == "F":
                    n = int(input("Enter non-negative integer n: "))
                    res, steps = factorial_loop(n)
                    memory["ans"] = float(res)
                    print(f"\n=> {n}! = {res}")
                    print_steps(steps, trace_enabled)
                    history.append(f"Factorial: {n}! = {res}")
                elif sub == "I":
                    count = int(input("How many Fibonacci terms? "))
                    seq, steps = fibonacci_loop(count)
                    print(f"\n=> Fibonacci ({count} terms): {seq}")
                    print_steps(steps, trace_enabled)
                    history.append(f"Fibonacci({count}): {seq}")
                elif sub == "C":
                    n = int(input("Enter n: "))
                    r = int(input("Enter r: "))
                    (ncr, npr), steps = ncr_npr_loop(n, r)
                    memory["ans"] = float(ncr)
                    print(f"\n=> nCr({n}, {r}) = {ncr} | nPr({n}, {r}) = {npr}")
                    print_steps(steps, trace_enabled)
                    history.append(f"Combinatorics({n},{r}): nCr={ncr}, nPr={npr}")
                elif sub == "P":
                    rows = int(input("Enter number of Pascal rows: "))
                    tri, steps = pascals_triangle_loop(rows)
                    print("\n=> Pascal's Triangle:")
                    for r_vals in tri:
                        print("  " + " ".join(str(x) for x in r_vals).center(rows * 4))
                    print_steps(steps, trace_enabled)
                    history.append(f"Pascal({rows} rows)")

            elif choice == "5":
                sub = input("Choose (C)heck prime, (R)ange, (S)ieve of Eratosthenes, (F)actorize, or (N)umber Classifier: ").strip().upper()
                if sub == "C":
                    n = int(input("Enter integer: "))
                    is_p, steps = is_prime_loop(n)
                    print(f"\n=> {n} is {'PRIME' if is_p else 'NOT PRIME'}")
                    print_steps(steps, trace_enabled)
                    history.append(f"PrimeCheck({n}) = {is_p}")
                elif sub == "R":
                    s = int(input("Start: "))
                    e = int(input("End: "))
                    primes, steps = primes_in_range(s, e)
                    print(f"\n=> Primes in [{s}, {e}]: {primes}")
                    print_steps(steps, trace_enabled)
                    history.append(f"Primes[{s}..{e}]: {len(primes)} found")
                elif sub == "S":
                    lim = int(input("Sieve upper limit: "))
                    primes, steps = sieve_of_eratosthenes_loop(lim)
                    print(f"\n=> Sieve Primes <= {lim} ({len(primes)} found): {primes}")
                    print_steps(steps, trace_enabled)
                    history.append(f"Sieve({lim}): {len(primes)} primes")
                elif sub == "F":
                    n = int(input("Enter integer > 1 to factorize: "))
                    factors, steps = prime_factorization_loop(n)
                    formatted = " * ".join(f"{p}^{e}" if e > 1 else f"{p}" for p, e in factors)
                    print(f"\n=> Prime Factorization of {n} = {formatted}")
                    print_steps(steps, trace_enabled)
                    history.append(f"PrimeFactors({n}) = {formatted}")
                elif sub == "N":
                    n = int(input("Enter positive integer to classify: "))
                    info, steps = classify_number_loop(n)
                    print(f"\n=> Classification of {n}: {info}")
                    print_steps(steps, trace_enabled)
                    history.append(f"Classify({n}): {info['classification']}")

            elif choice == "6":
                a = int(input("Enter first integer: "))
                b = int(input("Enter second integer: "))
                (g, l), steps = gcd_lcm_loop(a, b)
                memory["ans"] = float(g)
                print(f"\n=> GCD({a}, {b}) = {g} | LCM({a}, {b}) = {l}")
                print_steps(steps, trace_enabled)
                history.append(f"GCD/LCM({a}, {b}) = GCD:{g}, LCM:{l}")

            elif choice == "7":
                n = int(input("Enter an integer to analyze its digits: "))
                info, steps = analyze_digits_loop(n)
                print("\n=> Digit Analysis:")
                for k, v in info.items():
                    print(f"   {k}: {v}")
                print_steps(steps, trace_enabled)
                history.append(f"DigitAnalysis({n}): sum={info['digit_sum']}, rev={info['reversed']}")

            elif choice == "8":
                rows, steps = generate_truth_table()
                print("\n=> Complete Boolean Logic Truth Table:")
                header = "  A  B | AND OR XOR NAND NOR XNOR IMPLIES"
                print(header)
                print("  " + "-" * (len(header) - 2))
                for row in rows:
                    print(
                        f"  {row['A']}  {row['B']} |  {row['AND']}   {row['OR']}  {row['XOR']}    "
                        f"{row['NAND']}   {row['NOR']}    {row['XNOR']}      {row['IMPLIES']}"
                    )
                print_steps(steps, trace_enabled)
                history.append("Generated Boolean Truth Table")

            elif choice == "9":
                sub = input("Choose (B)itwise Operator or (K)ernighan Set-Bit Popcount: ").strip().upper()
                if sub == "B":
                    a = int(input("Enter integer A: "))
                    op = input("Enter bitwise operator (&, |, ^, ~, <<, >>): ").strip()
                    b = 0 if op == "~" else int(input("Enter integer B: "))
                    res, steps = bitwise_calculator(a, b, op)
                    memory["ans"] = float(res)
                    print(f"\n=> Bitwise Result: {res} (Binary: {bin(res)})")
                    print_steps(steps, trace_enabled)
                    history.append(f"Bitwise: {a} {op} {b if op != '~' else ''} = {res}")
                elif sub == "K":
                    n = int(input("Enter non-negative integer: "))
                    info, steps = brian_kernighan_popcount_loop(n)
                    print(f"\n=> Popcount & Parity Info: {info}")
                    print_steps(steps, trace_enabled)
                    history.append(f"Popcount({n}) = {info['set_bits']} bits")

            elif choice == "10":
                num_s = input("Enter number string (e.g. 255, FF, 1011): ").strip()
                fb = int(input("Enter source base (2..36): "))
                tb = int(input("Enter target base (2..36): "))
                conv, steps = base_to_base_loop(num_s, fb, tb)
                print(f"\n=> {num_s} (base {fb}) = {conv} (base {tb})")
                print_steps(steps, trace_enabled)
                history.append(f"BaseConv: {num_s} (b{fb}) -> {conv} (b{tb})")

            elif choice == "11":
                sub = input("Choose (C)ollatz 3n+1 sequence or (N)ewton-Raphson Sqrt: ").strip().upper()
                if sub == "C":
                    n = int(input("Enter positive starting integer: "))
                    seq, steps = collatz_sequence_loop(n)
                    print(f"\n=> Collatz Sequence ({len(seq) - 1} steps): {seq}")
                    print_steps(steps, trace_enabled)
                    history.append(f"Collatz({n}): {len(seq) - 1} steps")
                elif sub == "N":
                    num = float(input("Enter non-negative number for square root: "))
                    root, steps = newton_sqrt_loop(num)
                    memory["ans"] = root
                    print(f"\n=> Newton-Raphson sqrt({num}) ≈ {root:.8f}")
                    print_steps(steps, trace_enabled)
                    history.append(f"NewtonSqrt({num}) = {root:.8f}")

            elif choice == "12":
                sub = input("Choose (T)aylor Series (sin/cos/exp) or (I)ntegration (Trapezoidal): ").strip().upper()
                if sub == "T":
                    fn = input("Function (sin, cos, exp): ").strip()
                    x = float(input("Enter x (in radians for sin/cos): "))
                    terms = int(input("Number of Taylor terms (e.g. 10): "))
                    (approx, exact), steps = taylor_series_loop(fn, x, terms)
                    memory["ans"] = approx
                    print(f"\n=> Taylor {fn}({x}) ≈ {approx:.10f} (Exact: {exact:.10f})")
                    print_steps(steps, trace_enabled)
                    history.append(f"Taylor {fn}({x}) = {approx:.8f}")
                elif sub == "I":
                    raw = input("Enter polynomial coefficients c0 c1 c2 ... (for c0 + c1*x + c2*x^2): ")
                    coeffs = [float(c) for c in raw.split()]
                    a = float(input("Lower bound a: "))
                    b = float(input("Upper bound b: "))
                    n_int = int(input("Subintervals N (e.g. 100): "))
                    area, steps = numerical_integral_loop(coeffs, a, b, n_int)
                    memory["ans"] = area
                    print(f"\n=> Definite Integral Area ≈ {area:.8f}")
                    print_steps(steps, trace_enabled)
                    history.append(f"Integral on [{a},{b}] = {area:.6f}")

            elif choice == "13":
                print("Enter Matrix A rows separated by ';', numbers by space (e.g. '1 2; 3 4'):")
                raw_a = input("Matrix A: ")
                m_a = [[float(x) for x in r.split()] for r in raw_a.split(";") if r.strip()]
                op = input("Operation: (A)dd, (M)ultiply, (T)ranspose, (D)eterminant: ").strip().upper()
                if op in ("A", "M"):
                    raw_b = input("Matrix B: ")
                    m_b = [[float(x) for x in r.split()] for r in raw_b.split(";") if r.strip()]
                    res_m, steps = (
                        matrix_add_loop(m_a, m_b)
                        if op == "A"
                        else matrix_multiply_loop(m_a, m_b)
                    )
                    print(f"\n=> Result Matrix: {res_m}")
                    print_steps(steps, trace_enabled)
                    history.append(f"Matrix {op}: {res_m}")
                elif op == "T":
                    res_m, steps = matrix_transpose_loop(m_a)
                    print(f"\n=> Transposed Matrix: {res_m}")
                    print_steps(steps, trace_enabled)
                    history.append(f"Matrix Transpose: {res_m}")
                elif op == "D":
                    det, steps = matrix_determinant_loop(m_a)
                    memory["ans"] = det
                    print(f"\n=> Determinant = {det}")
                    print_steps(steps, trace_enabled)
                    history.append(f"Matrix Det = {det}")

            elif choice == "14":
                raw = input("Enter numbers separated by spaces: ")
                nums = [float(x) for x in raw.split()]
                sub = input("Choose (S)ort Visualizer, (B)inary Search, or (D)escriptive Statistics: ").strip().upper()
                if sub == "S":
                    algo = input("Algorithm (bubble / insertion): ").strip()
                    (sorted_arr, swaps), steps = sorting_visualizer_loop(nums, algo)
                    print(f"\n=> Sorted: {sorted_arr} (Total operations: {swaps})")
                    print_steps(steps, trace_enabled)
                    history.append(f"Sort({algo}): {sorted_arr}")
                elif sub == "B":
                    (sorted_arr, _), _ = sorting_visualizer_loop(nums, "insertion")
                    target = float(input(f"Sorted array is {sorted_arr}. Enter target to search: "))
                    idx, steps = binary_search_loop(sorted_arr, target)
                    print(f"\n=> Binary Search Index: {idx}")
                    print_steps(steps, trace_enabled)
                    history.append(f"BinSearch({target}) -> index {idx}")
                elif sub == "D":
                    stats, steps = statistics_analyzer_loop(nums)
                    print("\n=> Statistical Summary:")
                    for k, v in stats.items():
                        print(f"   {k}: {v}")
                    print_steps(steps, trace_enabled)
                    history.append(f"Stats(n={stats['count']}): mean={stats['mean']:.4f}")

            elif choice == "15":
                kind = input("Choose progression type (AP or GP): ").strip().upper()
                first = float(input("Enter first term (a): "))
                dr = float(input(f"Enter common {'difference (d)' if kind == 'AP' else 'ratio (r)'}: "))
                count = int(input("Enter number of terms (n): "))
                (terms, total), steps = progression_generator_loop(first, dr, count, kind)
                memory["ans"] = total
                print(f"\n=> {kind} Terms: {terms}")
                print(f"=> Sum of {count} terms: {total}")
                print_steps(steps, trace_enabled)
                history.append(f"{kind}(a={first}, dr={dr}, n={count}) sum={total}")

            else:
                print("Unrecognized menu option. Please choose a valid option from the menu.")

        except (ValueError, ZeroDivisionError) as exc:
            print(f"\n[Error] {exc}")


if __name__ == "__main__":
    if "--demo" in sys.argv:
        run_demo()
    else:
        interactive_menu()
