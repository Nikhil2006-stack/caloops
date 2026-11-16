# CALOOPS v2.0 — Requirements (`REQUIREMENTS.md`)

## Core Engine Requirements
- **`REQ-CORE-01` (Loop & Logic Algorithms)**: Support 25+ operations across basic arithmetic, loop-based multiply/divide/power, Shunting-Yard RPN evaluation, combinatorics ($n!$, Fibonacci, $nCr$, $nPr$, Pascal's Triangle), number theory (Primes, Sieve, Prime Factors, Perfect/Abundant/Harshad, GCD/LCM, Digit extraction), boolean truth tables, bitwise & Brian Kernighan popcount, Horner base conversion ($2..36$), calculus/convergence (Collatz, Newton $\sqrt{x}$, Taylor series, Trapezoidal integral), 2D/3D matrix loops, and sorting/binary search/statistics.
- **`REQ-CORE-02` (Step-by-Step Trace Output)**: Every operation must emit an ordered `steps` array tracing each loop iteration and conditional check.

## Full-Stack MERN & Auth Requirements
- **`REQ-AUTH-01` (Multi-Identifier Password Login & Registration)**: Support registration and login using Username, Email, or 10-digit Mobile Number + Password.
- **`REQ-AUTH-02` (Mobile OTP Verification Flow)**: Clicking Mobile No (OTP) sends a 6-digit OTP to the entered mobile number (via SMS gateway + interactive notification banner) and logs the user in upon 6-digit verification.
- **`REQ-AUTH-03` (Forgot Password Reset via OTP)**: Allow password recovery using a 6-digit OTP sent to the user's registered mobile/email.
- **`REQ-CLOUD-01` (24/7 HTTPS Availability)**: Serve the production React bundle over HTTPS via GitHub Pages (`https://nikhil2006-stack.github.io/caloops/`) with an isomorphic client fallback.
