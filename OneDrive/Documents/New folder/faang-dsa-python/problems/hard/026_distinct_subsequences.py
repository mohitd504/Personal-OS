"""
Problem: Distinct Subsequences
Difficulty: Hard
Topic: Dynamic Programming (2D)
LeetCode: #115

Description:
    Given strings s and t, return the number of distinct subsequences of s
    which equals t.

Examples:
    Input:  s="rabbbit", t="rabbit"   Output: 3
    Input:  s="babgbag", t="bag"      Output: 5

Approach:
    dp[i][j] = # ways to form t[:j] from s[:i]
    if s[i-1]==t[j-1]: dp[i][j] = dp[i-1][j-1] + dp[i-1][j]
    else:              dp[i][j] = dp[i-1][j]

Time: O(m*n)   Space: O(n) rolling array
"""

def num_distinct(s, t):
    m, n = len(s), len(t)
    dp = [0]*(n+1); dp[0] = 1
    for i in range(1, m+1):
        for j in range(n, 0, -1):  # reverse to avoid overwrite
            if s[i-1] == t[j-1]:
                dp[j] += dp[j-1]
    return dp[n]

if __name__ == "__main__":
    assert num_distinct("rabbbit","rabbit") == 3
    assert num_distinct("babgbag","bag")    == 5
    assert num_distinct("a","b")            == 0
    print("All tests passed ✓")
