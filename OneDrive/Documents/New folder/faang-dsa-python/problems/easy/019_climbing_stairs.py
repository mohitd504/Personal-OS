"""
Problem: Climbing Stairs
Difficulty: Easy
Topic: Dynamic Programming (1D)
LeetCode: #70

Description:
    You are climbing a staircase with n steps. Each time you can climb
    1 or 2 steps. How many distinct ways can you reach the top?

Examples:
    Input:  n = 2    Output: 2   (1+1 or 2)
    Input:  n = 3    Output: 3   (1+1+1, 1+2, 2+1)
    Input:  n = 5    Output: 8

Constraints:
    - 1 <= n <= 45

Approach:
    dp[i] = ways to reach step i
    dp[i] = dp[i-1] + dp[i-2]  (come from step below, or 2 below)
    This is exactly the Fibonacci sequence!

    n: 1  2  3  4  5  6  7
    f: 1  2  3  5  8  13 21

    Space-optimize: only keep previous 2 values.

Time Complexity:  O(n)
Space Complexity: O(1)
"""

def climb_stairs(n):
    if n <= 2: return n
    a, b = 1, 2
    for _ in range(3, n + 1):
        a, b = b, a + b
    return b


if __name__ == "__main__":
    assert climb_stairs(1) == 1
    assert climb_stairs(2) == 2
    assert climb_stairs(3) == 3
    assert climb_stairs(5) == 8
    assert climb_stairs(10)== 89
    print("All tests passed ✓")
