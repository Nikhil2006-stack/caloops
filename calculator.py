#!/usr/bin/env python3
"""
CALOOPS — Master Logic & Loops Calculator
=========================================
An interactive, menu-driven Python CLI calculator designed to teach and
demonstrate core programming logic (conditionals, boolean algebra, bitwise
operators) and loop paradigms (for loops, while loops, nested loops,
accumulators, digit extraction, and convergence loops).
"""

from __future__ import annotations
import sys
from typing import Dict, List, Tuple, Any


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
    sign-handling logic.
    """
    steps: List[str] = []
    negative = (a < 0) ^ (b < 0)  # XOR logic: negative if exactly one operand is negative
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
# 2. NUMBER THEORY & LOOP MASTERY
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
# 3. BOOLEAN LOGIC, BITWISE OPERATIONS & NUMBER BASES
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


def decimal_to_base_loop(n: int, base: int) -> Tuple[str, List[str]]:
    """
    Converts a decimal integer `n` to any base (2..16) using a `while` loop
    that repeatedly extracts `n % base` and updates `n //= base`.
    """
    if not (2 <= base <= 16):
        raise ValueError("Base must be between 2 and 16.")

    digits_map = "0123456789ABCDEF"
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

    # Reverse remainders using a loop to demonstrate index reversal
    reversed_chars: List[str] = []
    for i in range(len(remainders) - 1, -1, -1):
        reversed_chars.append(remainders[i])

    result_str = ("-" if negative else "") + "".join(reversed_chars)
    steps.append(f"[Reverse Remainders] Most-significant digit first -> {result_str}")
    return result_str, steps


# ============================================================================
# 4. SERIES, CONVERGENCE & ALGORITHMIC LOOPS
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
# 5. INTERACTIVE CLI & TRACE DISPLAY
# ============================================================================

def print_steps(steps: List[str], trace_enabled: bool) -> None:
    """Prints step-by-step logic and loop trace if enabled."""
    if not trace_enabled:
        return
    print("\n  --- [Loop & Logic Trace] ---")
    for line in steps:
        print(f"  {line}")
    print("  ----------------------------")


def run_demo() -> None:
    """Runs a non-interactive showcase of all logic & loop features."""
    print("=" * 68)
    print("  CALOOPS — Master Logic & Loops Calculator (Automated Showcase)")
    print("=" * 68)

    # 1. Multiply by loop
    res, steps = multiply_by_loop(6, -4)
    print(f"\n1. Loop Multiplication (6 * -4) = {res}")
    print_steps(steps, True)

    # 2. Divide by loop
    (q, r), steps = divide_by_loop(29, 5)
    print(f"\n2. While-Loop Division (29 // 5, 29 % 5) -> Quotient={q}, Remainder={r}")
    print_steps(steps, True)

    # 3. Prime check & GCD
    is_p, steps = is_prime_loop(97)
    print(f"\n3. Early-Exit Prime Loop (97) -> is_prime={is_p}")
    print_steps(steps, True)

    (g, l), steps = gcd_lcm_loop(48, 18)
    print(f"\n4. Euclidean While-Loop GCD & LCM (48, 18) -> GCD={g}, LCM={l}")
    print_steps(steps, True)

    # 5. Digit extraction
    d_info, steps = analyze_digits_loop(153)
    print(f"\n5. Digit Extraction While-Loop (153) -> {d_info}")
    print_steps(steps, True)

    # 6. Truth table
    rows, _ = generate_truth_table()
    print("\n6. Nested-Loop Boolean Logic Truth Table:")
    header = "  A  B | AND OR XOR NAND NOR XNOR IMPLIES"
    print(header)
    print("  " + "-" * (len(header) - 2))
    for row in rows:
        print(
            f"  {row['A']}  {row['B']} |  {row['AND']}   {row['OR']}  {row['XOR']}    "
            f"{row['NAND']}   {row['NOR']}    {row['XNOR']}      {row['IMPLIES']}"
        )

    # 7. Base conversion
    hex_str, steps = decimal_to_base_loop(255, 16)
    bin_str, _ = decimal_to_base_loop(255, 2)
    print(f"\n7. Base Conversion Loop (255) -> Binary={bin_str}, Hex={hex_str}")
    print_steps(steps, True)

    # 8. Collatz & Newton-Raphson
    c_seq, steps = collatz_sequence_loop(6)
    print(f"\n8. Collatz 3n+1 While-Loop (start=6) -> {c_seq}")
    print_steps(steps, True)

    root, steps = newton_sqrt_loop(25.0)
    print(f"\n9. Newton-Raphson Sqrt Convergence Loop (25.0) -> {root:.7f}")
    print_steps(steps, True)
    print("\n" + "=" * 68)


def interactive_menu() -> None:
    """Main REPL while-loop driving the interactive CLI calculator."""
    trace_enabled = True
    history: List[str] = []

    while True:
        print("\n" + "=" * 64)
        print("        CALOOPS: MASTER LOGIC & LOOPS CALCULATOR")
        print(f"        [Step-by-Step Trace: {'ON' if trace_enabled else 'OFF'} | History Items: {len(history)}]")
        print("=" * 64)
        print("  [1] Basic Arithmetic (+, -, *, /, //, %, **)   (if/elif/else)")
        print("  [2] Multiply / Divide / Power via Loops        (for & while)")
        print("  [3] Factorial & Fibonacci Generator            (accumulator)")
        print("  [4] Prime Checker & Prime Range Finder         (nested loops)")
        print("  [5] GCD & LCM Calculator                       (Euclid while)")
        print("  [6] Digit Analyzer (Sum, Reverse, Armstrong)   (while n > 0)")
        print("  [7] Boolean Logic Truth Table Generator        (nested loops)")
        print("  [8] Bitwise Logic (&, |, ^, ~, <<, >>)         (binary logic)")
        print("  [9] Number Base Converter (Bin / Oct / Hex)    (division loop)")
        print("  [10] Collatz 3n+1 & Newton Square Root         (convergence)")
        print("  [11] Arithmetic & Geometric Progressions (AP/GP)")
        print("  [T] Toggle Step-by-Step Loop/Logic Trace")
        print("  [H] View Session History")
        print("  [D] Run Full Automated Demo")
        print("  [0] Exit Calculator")
        print("=" * 64)

        choice = input("Select an option: ").strip().upper()

        if choice in ("0", "Q", "EXIT"):
            print("Exiting CALOOPS. Keep mastering logic and loops!")
            break
        elif choice == "T":
            trace_enabled = not trace_enabled
            print(f"-> Step-by-Step Trace is now {'ENABLED' if trace_enabled else 'DISABLED'}.")
            continue
        elif choice == "H":
            print("\n--- Session Calculation History ---")
            if not history:
                print("  (No calculations recorded yet.)")
            else:
                for idx, entry in enumerate(history, start=1):
                    print(f"  {idx}. {entry}")
            continue
        elif choice == "D":
            run_demo()
            continue

        try:
            if choice == "1":
                a = float(input("Enter first number (a): "))
                op = input("Enter operator (+, -, *, /, //, %, **): ").strip()
                b = float(input("Enter second number (b): "))
                res, steps = basic_arithmetic(a, b, op)
                print(f"\n=> Result: {a} {op} {b} = {res}")
                print_steps(steps, trace_enabled)
                history.append(f"Basic: {a} {op} {b} = {res}")

            elif choice == "2":
                sub = input("Choose (M)ultiply loop, (D)ivide loop, or (P)ower loop: ").strip().upper()
                if sub == "M":
                    a = int(input("Enter integer a: "))
                    b = int(input("Enter integer b: "))
                    res, steps = multiply_by_loop(a, b)
                    print(f"\n=> Loop Multiplication: {a} * {b} = {res}")
                    print_steps(steps, trace_enabled)
                    history.append(f"LoopMul: {a} * {b} = {res}")
                elif sub == "D":
                    a = int(input("Enter non-negative dividend: "))
                    b = int(input("Enter positive divisor: "))
                    (q, r), steps = divide_by_loop(a, b)
                    print(f"\n=> Loop Division: {a} ÷ {b} -> Quotient = {q}, Remainder = {r}")
                    print_steps(steps, trace_enabled)
                    history.append(f"LoopDiv: {a} ÷ {b} = Q:{q}, R:{r}")
                elif sub == "P":
                    base = float(input("Enter base: "))
                    exp = int(input("Enter integer exponent: "))
                    res, steps = power_by_loop(base, exp)
                    print(f"\n=> Loop Power: {base} ** {exp} = {res}")
                    print_steps(steps, trace_enabled)
                    history.append(f"LoopPow: {base} ** {exp} = {res}")
                else:
                    print("Invalid sub-option.")

            elif choice == "3":
                sub = input("Choose (F)actorial or (I)bonacci sequence: ").strip().upper()
                if sub == "F":
                    n = int(input("Enter non-negative integer n: "))
                    res, steps = factorial_loop(n)
                    print(f"\n=> {n}! = {res}")
                    print_steps(steps, trace_enabled)
                    history.append(f"Factorial: {n}! = {res}")
                elif sub == "I":
                    count = int(input("How many Fibonacci terms? "))
                    seq, steps = fibonacci_loop(count)
                    print(f"\n=> Fibonacci ({count} terms): {seq}")
                    print_steps(steps, trace_enabled)
                    history.append(f"Fibonacci({count}): {seq}")
                else:
                    print("Invalid sub-option.")

            elif choice == "4":
                sub = input("Choose (C)heck single number or (R)ange of primes: ").strip().upper()
                if sub == "C":
                    n = int(input("Enter integer to test for primality: "))
                    is_p, steps = is_prime_loop(n)
                    print(f"\n=> {n} is {'PRIME' if is_p else 'NOT PRIME'}")
                    print_steps(steps, trace_enabled)
                    history.append(f"PrimeCheck({n}) = {is_p}")
                elif sub == "R":
                    s = int(input("Enter start of range: "))
                    e = int(input("Enter end of range: "))
                    primes, steps = primes_in_range(s, e)
                    print(f"\n=> Primes in [{s}, {e}]: {primes}")
                    print_steps(steps, trace_enabled)
                    history.append(f"Primes[{s}..{e}]: {len(primes)} found")
                else:
                    print("Invalid sub-option.")

            elif choice == "5":
                a = int(input("Enter first integer: "))
                b = int(input("Enter second integer: "))
                (g, l), steps = gcd_lcm_loop(a, b)
                print(f"\n=> GCD({a}, {b}) = {g} | LCM({a}, {b}) = {l}")
                print_steps(steps, trace_enabled)
                history.append(f"GCD/LCM({a}, {b}) = GCD:{g}, LCM:{l}")

            elif choice == "6":
                n = int(input("Enter an integer to analyze its digits: "))
                info, steps = analyze_digits_loop(n)
                print("\n=> Digit Analysis:")
                for k, v in info.items():
                    print(f"   {k}: {v}")
                print_steps(steps, trace_enabled)
                history.append(f"DigitAnalysis({n}): sum={info['digit_sum']}, rev={info['reversed']}")

            elif choice == "7":
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

            elif choice == "8":
                a = int(input("Enter integer A: "))
                op = input("Enter bitwise operator (&, |, ^, ~, <<, >>): ").strip()
                b = 0 if op == "~" else int(input("Enter integer B: "))
                res, steps = bitwise_calculator(a, b, op)
                print(f"\n=> Bitwise Result: {res} (Binary: {bin(res)})")
                print_steps(steps, trace_enabled)
                history.append(f"Bitwise: {a} {op} {b if op != '~' else ''} = {res}")

            elif choice == "9":
                n = int(input("Enter decimal integer: "))
                base = int(input("Enter target base (2=Binary, 8=Octal, 16=Hex, or any 2..16): "))
                conv, steps = decimal_to_base_loop(n, base)
                print(f"\n=> {n} (base 10) = {conv} (base {base})")
                print_steps(steps, trace_enabled)
                history.append(f"BaseConv: {n} -> base {base} = {conv}")

            elif choice == "10":
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
                    print(f"\n=> Newton-Raphson sqrt({num}) ≈ {root:.8f}")
                    print_steps(steps, trace_enabled)
                    history.append(f"NewtonSqrt({num}) = {root:.8f}")
                else:
                    print("Invalid sub-option.")

            elif choice == "11":
                kind = input("Choose progression type (AP or GP): ").strip().upper()
                first = float(input("Enter first term (a): "))
                dr = float(input(f"Enter common {'difference (d)' if kind == 'AP' else 'ratio (r)'}: "))
                count = int(input("Enter number of terms (n): "))
                (terms, total), steps = progression_generator_loop(first, dr, count, kind)
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
