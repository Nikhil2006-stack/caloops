#!/usr/bin/env python3
"""
Comprehensive unit tests for CALOOPS v2.0 — Ultimate Logic & Loops Calculator.
"""

import math
import unittest
from calculator import (
    basic_arithmetic,
    multiply_by_loop,
    divide_by_loop,
    power_by_loop,
    evaluate_expression_loop,
    factorial_loop,
    ncr_npr_loop,
    pascals_triangle_loop,
    fibonacci_loop,
    is_prime_loop,
    primes_in_range,
    sieve_of_eratosthenes_loop,
    prime_factorization_loop,
    classify_number_loop,
    gcd_lcm_loop,
    analyze_digits_loop,
    evaluate_boolean_gate,
    generate_truth_table,
    bitwise_calculator,
    brian_kernighan_popcount_loop,
    decimal_to_base_loop,
    base_to_base_loop,
    collatz_sequence_loop,
    newton_sqrt_loop,
    taylor_series_loop,
    numerical_integral_loop,
    progression_generator_loop,
    matrix_add_loop,
    matrix_multiply_loop,
    matrix_transpose_loop,
    matrix_determinant_loop,
    sorting_visualizer_loop,
    binary_search_loop,
    statistics_analyzer_loop,
)


class TestCaloopsCalculatorV2(unittest.TestCase):
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

    def test_shunting_yard_expression_evaluator(self):
        val, _ = evaluate_expression_loop("3 + 4 * 2 / (1 - 5) ^ 2")
        self.assertAlmostEqual(val, 3.5)
        val_vars, _ = evaluate_expression_loop("-5 + 2 * ans", {"ans": 10.0})
        self.assertAlmostEqual(val_vars, 15.0)
        with self.assertRaises(ValueError):
            evaluate_expression_loop("3 + (4 * 2")

    def test_combinatorics_and_pascal(self):
        self.assertEqual(factorial_loop(0)[0], 1)
        self.assertEqual(factorial_loop(5)[0], 120)
        self.assertEqual(ncr_npr_loop(6, 2)[0], (15, 30))
        tri, _ = pascals_triangle_loop(4)
        self.assertEqual(tri, [[1], [1, 1], [1, 2, 1], [1, 3, 3, 1]])
        self.assertEqual(fibonacci_loop(7)[0], [0, 1, 1, 2, 3, 5, 8])

    def test_primes_sieve_factorization_and_classifier(self):
        self.assertFalse(is_prime_loop(1)[0])
        self.assertTrue(is_prime_loop(2)[0])
        self.assertTrue(is_prime_loop(97)[0])
        self.assertFalse(is_prime_loop(100)[0])
        self.assertEqual(primes_in_range(10, 20)[0], [11, 13, 17, 19])
        self.assertEqual(sieve_of_eratosthenes_loop(20)[0], [2, 3, 5, 7, 11, 13, 17, 19])
        self.assertEqual(prime_factorization_loop(360)[0], [(2, 3), (3, 2), (5, 1)])

        perf_28, _ = classify_number_loop(28)
        self.assertEqual(perf_28["classification"], "Perfect")
        abund_12, _ = classify_number_loop(12)
        self.assertEqual(abund_12["classification"], "Abundant")
        self.assertTrue(abund_12["is_harshad"])

        self.assertEqual(gcd_lcm_loop(48, 18)[0], (6, 144))

    def test_analyze_digits_loop(self):
        info_153, _ = analyze_digits_loop(153)
        self.assertEqual(info_153["digit_count"], 3)
        self.assertEqual(info_153["digit_sum"], 9)
        self.assertEqual(info_153["reversed"], 351)
        self.assertFalse(info_153["is_palindrome"])
        self.assertTrue(info_153["is_armstrong"])

        info_121, _ = analyze_digits_loop(121)
        self.assertTrue(info_121["is_palindrome"])

    def test_boolean_bitwise_popcount_and_bases(self):
        self.assertTrue(evaluate_boolean_gate(True, True, "AND"))
        self.assertFalse(evaluate_boolean_gate(True, True, "XOR"))
        self.assertFalse(evaluate_boolean_gate(True, False, "IMPLIES"))
        rows, _ = generate_truth_table()
        self.assertEqual(len(rows), 4)

        self.assertEqual(bitwise_calculator(12, 10, "&")[0], 8)
        self.assertEqual(bitwise_calculator(12, 10, "|")[0], 14)
        self.assertEqual(bitwise_calculator(12, 10, "^")[0], 6)
        self.assertEqual(bitwise_calculator(5, 2, "<<")[0], 20)

        pop_29, _ = brian_kernighan_popcount_loop(29)
        self.assertEqual(pop_29["set_bits"], 4)
        self.assertFalse(pop_29["is_power_of_two"])
        self.assertTrue(brian_kernighan_popcount_loop(16)[0]["is_power_of_two"])

        self.assertEqual(decimal_to_base_loop(255, 2)[0], "11111111")
        self.assertEqual(decimal_to_base_loop(255, 16)[0], "FF")
        self.assertEqual(base_to_base_loop("FF", 16, 2)[0], "11111111")
        self.assertEqual(base_to_base_loop("1010", 2, 10)[0], "10")

    def test_calculus_and_convergence_loops(self):
        self.assertEqual(collatz_sequence_loop(6)[0], [6, 3, 10, 5, 16, 8, 4, 2, 1])
        root, _ = newton_sqrt_loop(49.0)
        self.assertAlmostEqual(root, 7.0, places=6)

        (sin_approx, sin_exact), _ = taylor_series_loop("sin", math.pi / 6, terms=8)
        self.assertAlmostEqual(sin_approx, sin_exact, places=7)
        (cos_approx, cos_exact), _ = taylor_series_loop("cos", math.pi / 3, terms=8)
        self.assertAlmostEqual(cos_approx, cos_exact, places=7)
        (exp_approx, exp_exact), _ = taylor_series_loop("exp", 1.0, terms=12)
        self.assertAlmostEqual(exp_approx, exp_exact, places=7)

        # Integral of x^2 from 0 to 3 is 9.0
        area, _ = numerical_integral_loop([0.0, 0.0, 1.0], 0.0, 3.0, intervals=500)
        self.assertAlmostEqual(area, 9.0, places=3)

        (ap_terms, ap_sum), _ = progression_generator_loop(2, 3, 4, "AP")
        self.assertEqual(ap_terms, [2, 5, 8, 11])
        self.assertEqual(ap_sum, 26)

    def test_matrix_algebra_loops(self):
        a = [[1.0, 2.0], [3.0, 4.0]]
        b = [[5.0, 6.0], [7.0, 8.0]]
        self.assertEqual(matrix_add_loop(a, b)[0], [[6.0, 8.0], [10.0, 12.0]])
        self.assertEqual(matrix_multiply_loop(a, b)[0], [[19.0, 22.0], [43.0, 50.0]])
        self.assertEqual(matrix_transpose_loop(a)[0], [[1.0, 3.0], [2.0, 4.0]])
        self.assertAlmostEqual(matrix_determinant_loop(a)[0], -2.0)

        m3 = [[6.0, 1.0, 1.0], [4.0, -2.0, 5.0], [2.0, 8.0, 7.0]]
        self.assertAlmostEqual(matrix_determinant_loop(m3)[0], -306.0)

    def test_sorting_binary_search_and_statistics(self):
        arr = [12.0, 4.0, 19.0, 1.0, 8.0]
        (b_sorted, _), _ = sorting_visualizer_loop(arr, "bubble")
        (i_sorted, _), _ = sorting_visualizer_loop(arr, "insertion")
        self.assertEqual(b_sorted, [1.0, 4.0, 8.0, 12.0, 19.0])
        self.assertEqual(i_sorted, [1.0, 4.0, 8.0, 12.0, 19.0])

        self.assertEqual(binary_search_loop(b_sorted, 12.0)[0], 3)
        self.assertEqual(binary_search_loop(b_sorted, 99.0)[0], -1)

        stats, _ = statistics_analyzer_loop([2.0, 4.0, 4.0, 4.0, 5.0, 5.0, 7.0, 9.0])
        self.assertAlmostEqual(stats["mean"], 5.0)
        self.assertAlmostEqual(stats["variance"], 4.0)
        self.assertAlmostEqual(stats["std_dev"], 2.0)
        self.assertAlmostEqual(stats["median"], 4.5)


if __name__ == "__main__":
    unittest.main()
