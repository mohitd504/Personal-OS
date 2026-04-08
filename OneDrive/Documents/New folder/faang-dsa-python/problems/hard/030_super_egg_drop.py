"""
Problem: Super Egg Drop
Difficulty: Hard
Topic: Dynamic Programming / Binary Search
LeetCode: #887

Description:
    You have k eggs and n floors. Find minimum moves to determine the
    critical floor (highest floor from which egg doesn't break).
    In worst case.

Examples:
    Input:  k=1, n=2   Output: 2  (must try floor 1, then 2)
    Input:  k=2, n=6   Output: 3
    Input:  k=3, n=14  Output: 4

Approach (DP reframed):
    dp[m][k] = max floors we can check with m moves and k eggs.
    dp[m][k] = dp[m-1][k-1] + dp[m-1][k] + 1
    (egg breaks: check dp[m-1][k-1] floors below; doesn't break: dp[m-1][k] above)
    Find min m such that dp[m][k] >= n.

Time: O(k log n)   Space: O(k)
"""

def super_egg_drop(k, n):
    dp = [0] * (k+1)   # dp[j] = floors checkable with current moves and j eggs
    m = 0
    while dp[k] < n:
        m += 1
        for j in range(k, 0, -1):
            dp[j] = dp[j-1] + dp[j] + 1
    return m

if __name__ == "__main__":
    assert super_egg_drop(1, 2)  == 2
    assert super_egg_drop(2, 6)  == 3
    assert super_egg_drop(3, 14) == 4
    assert super_egg_drop(2, 100)== 14
    print("All tests passed ✓")
