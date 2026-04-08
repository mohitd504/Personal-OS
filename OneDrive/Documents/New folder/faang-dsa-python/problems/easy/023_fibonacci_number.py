"""
Problem: Fibonacci Number
Difficulty: Easy
Topic: Dynamic Programming / Recursion
LeetCode: #509

Description:
    F(0)=0, F(1)=1, F(n) = F(n-1) + F(n-2)
    Given n, calculate F(n).

Examples:
    Input: n=2 → 1
    Input: n=3 → 2
    Input: n=10 → 55

Constraints:
    - 0 <= n <= 30

Approaches Compared:
    1. Naive Recursion: O(2^n) time — exponential, TLE for large n
    2. Memoization:     O(n) time, O(n) space
    3. Tabulation:      O(n) time, O(n) space
    4. Space-optimized: O(n) time, O(1) space  ← best
    5. Matrix Exponent: O(log n) time — for very large n

Time Complexity:  O(n)
Space Complexity: O(1)
"""

def fib(n):
    """Space-optimized bottom-up DP."""
    if n <= 1: return n
    a, b = 0, 1
    for _ in range(2, n + 1):
        a, b = b, a + b
    return b


if __name__ == "__main__":
    expected = [0,1,1,2,3,5,8,13,21,34,55]
    for i, e in enumerate(expected):
        assert fib(i) == e, f"fib({i}) should be {e}"
    print("All tests passed ✓")
