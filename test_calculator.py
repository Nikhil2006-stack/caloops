#!/usr/bin/env python3
"""
Unit tests for CALOOPS — Master Logic & Loops Calculator.
"""

import unittest
from calculator import (
    basic_arithmetic,
    multiply_by_loop,
    divide_by_loop,
    power_by_loop,
    factorial_loop,
    fibonacci_loop,
    is_prime_loop,
    primes_in_range,
    gcd_lcm_loop,
    analyze_digits_loop,
    evaluate_boolean_gate,
    generate_truth_table,
    bitwise_calculator,
    decimal_to_base_loop,
    collatz_sequence_loop,
    newton_sqrt_loop,
    progression_generator_loop,
)


class TestCaloopsCalculator(unittest.TestCase):
    def test_basic_arithmetic(self):
        self.assertEqual(basic_arithmetic(10, 5, "+")[0], 15)
        self.assertEqual(basic_arithmetic(10, 5, "-")[0], 5)
        self.assertEqual(basic_arithmetic(10, 5, "*")[0], 50)
        self.assertEqual(basic_arithmetic(10, 4, "/")[0], 2.5)
        self.assertEqual(basic_arithmetic(10, 4, "//")[0], 2)
        self.assertEqual(basic_arithmetic(10, 4, "%")[0], 2)
        self.assertEqual(basic_arithmetic(2, 4, "**")[0], 16)
        with self.assertRaises(ZeroDivisionError):
            basic_arithmetic(10, 0, "/")

    def test_multiply_divide_power_by_loop(self):
        self.assertEqual(multiply_by_loop(7, 6)[0], 42)
        self.assertEqual(multiply_by_loop(-7, 6)[0], -42)
        self.assertEqual(multiply_by_loop(-7, -6)[0], 42)
        self.assertEqual(multiply_by_loop(0, 99)[0], 0)

        self.assertEqual(divide_by_loop(29, 5)[0], (5, 4))
        self.assertEqual(divide_by_loop(20, 5)[0], (4, 0))
        with self.assertRaises(ZeroDivisionError):
            divide_by_loop(10, 0)

        self.assertEqual(power_by_loop(2, 5)[0], 32.0)
        self.assertEqual(power_by_loop(5, 0)[0], 1.0)
        self.assertAlmostEqual(power_by_loop(2, -2)[0], 0.25)

    def test_factorial_and_fibonacci(self):
        self.assertEqual(factorial_loop(0)[0], 1)
        self.assertEqual(factorial_loop(5)[0], 120)
        with self.assertRaises(ValueError):
            factorial_loop(-1)

        self.assertEqual(fibonacci_loop(7)[0], [0, 1, 1, 2, 3, 5, 8])

    def test_primes_and_gcd_lcm(self):
        self.assertFalse(is_prime_loop(1)[0])
        self.assertTrue(is_prime_loop(2)[0])
        self.assertTrue(is_prime_loop(97)[0])
        self.assertFalse(is_prime_loop(100)[0])
        self.assertEqual(primes_in_range(10, 20)[0], [11, 13, 17, 19])

        self.assertEqual(gcd_lcm_loop(48, 18)[0], (6, 144))
        self.assertEqual(gcd_lcm_loop(17, 13)[0], (1, 221))

    def test_analyze_digits_loop(self):
        info_153, _ = analyze_digits_loop(153)
        self.assertEqual(info_153["digit_count"], 3)
        self.assertEqual(info_153["digit_sum"], 9)
        self.assertEqual(info_153["reversed"], 351)
        self.assertFalse(info_153["is_palindrome"])
        self.assertTrue(info_153["is_armstrong"])

        info_121, _ = analyze_digits_loop(121)
        self.assertTrue(info_121["is_palindrome"])

    def test_boolean_and_bitwise_and_bases(self):
        self.assertTrue(evaluate_boolean_gate(True, True, "AND"))
        self.assertFalse(evaluate_boolean_gate(True, True, "XOR"))
        self.assertFalse(evaluate_boolean_gate(True, False, "IMPLIES"))
        rows, _ = generate_truth_table()
        self.assertEqual(len(rows), 4)

        self.assertEqual(bitwise_calculator(12, 10, "&")[0], 8)
        self.assertEqual(bitwise_calculator(12, 10, "|")[0], 14)
        self.assertEqual(bitwise_calculator(12, 10, "^")[0], 6)
        self.assertEqual(bitwise_calculator(5, 2, "<<")[0], 20)

        self.assertEqual(decimal_to_base_loop(255, 2)[0], "11111111")
        self.assertEqual(decimal_to_base_loop(255, 16)[0], "FF")
        self.assertEqual(decimal_to_base_loop(0, 8)[0], "0")

    def test_collatz_newton_and_progressions(self):
        self.assertEqual(collatz_sequence_loop(6)[0], [6, 3, 10, 5, 16, 8, 4, 2, 1])
        root, _ = newton_sqrt_loop(49.0)
        self.assertAlmostEqual(root, 7.0, places=6)

        (ap_terms, ap_sum), _ = progression_generator_loop(2, 3, 4, "AP")
        self.assertEqual(ap_terms, [2, 5, 8, 11])
        self.assertEqual(ap_sum, 26)

        (gp_terms, gp_sum), _ = progression_generator_loop(2, 3, 4, "GP")
        self.assertEqual(gp_terms, [2, 6, 18, 54])
        self.assertEqual(gp_sum, 80)


if __name__ == "__main__":
    unittest.main()
