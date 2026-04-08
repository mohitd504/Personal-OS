"""
Problem: Unique Paths
Difficulty: Medium
Topic: Dynamic Programming (2D)
LeetCode: #62

Description:
    A robot starts at top-left corner of an m×n grid.
    It can only move right or down. How many unique paths to bottom-right?

Examples:
    Input:  m=3, n=7   Output: 28
    Input:  m=3, n=2   Output: 3

Constraints:
    - 1 <= m, n <= 100

Approach:
    dp[j] = number of paths to reach current row, column j.
    dp[j] += dp[j-1]  (paths from left + paths from above)
    Initial: all 1s (only one way to reach any cell in first row/col).

    m=3, n=3:
    Row 0: [1, 1, 1]
    Row 1: [1, 2, 3]   (dp[j] = dp[j] + dp[j-1])
    Row 2: [1, 3, 6]   ← answer

Time Complexity:  O(m*n)
Space Complexity: O(n)
"""

def unique_paths(m, n):
    dp = [1] * n
    for _ in range(1, m):
        for j in range(1, n):
            dp[j] += dp[j-1]
    return dp[-1]

# Mathematical formula: C(m+n-2, m-1)
def unique_paths_math(m, n):
    from math import comb
    return comb(m + n - 2, m - 1)

if __name__ == "__main__":
    assert unique_paths(3, 7) == 28
    assert unique_paths(3, 2) == 3
    assert unique_paths(1, 1) == 1
    assert unique_paths_math(3, 7) == 28
    print("All tests passed ✓")
