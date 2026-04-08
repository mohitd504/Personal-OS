"""
Problem: Regular Expression Matching
Difficulty: Hard
Topic: Dynamic Programming / Recursion
LeetCode: #10

Description:
    Implement regular expression matching with '.' and '*'.
    '.' matches any single character.
    '*' matches zero or more of the preceding element.

Examples:
    Input:  s="aa",   p="a"     Output: False
    Input:  s="aa",   p="a*"    Output: True  (a* = "aa")
    Input:  s="ab",   p=".*"    Output: True  (.* = any)
    Input:  s="aab",  p="c*a*b" Output: True

Constraints:
    - 1 <= s.length <= 20
    - 1 <= p.length <= 30

Approach (DP):
    dp[i][j] = True if s[:i] matches p[:j]
    Base: dp[0][0] = True
    Pattern '*': dp[i][j] = dp[i][j-2]              (zero occurrences)
                           OR (match char AND dp[i-1][j]) (one+ occurrences)
    Pattern '.'/char: dp[i][j] = char matches AND dp[i-1][j-1]

Time Complexity:  O(m*n)
Space Complexity: O(m*n)
"""

def is_match(s, p):
    m, n = len(s), len(p)
    dp = [[False]*(n+1) for _ in range(m+1)]
    dp[0][0] = True
    for j in range(2, n+1):
        if p[j-1] == '*':
            dp[0][j] = dp[0][j-2]
    for i in range(1, m+1):
        for j in range(1, n+1):
            if p[j-1] == '*':
                dp[i][j] = dp[i][j-2]   # zero of preceding
                if p[j-2] == '.' or p[j-2] == s[i-1]:
                    dp[i][j] = dp[i][j] or dp[i-1][j]  # one+ of preceding
            elif p[j-1] == '.' or p[j-1] == s[i-1]:
                dp[i][j] = dp[i-1][j-1]
    return dp[m][n]

if __name__ == "__main__":
    assert is_match("aa","a")     == False
    assert is_match("aa","a*")    == True
    assert is_match("ab",".*")    == True
    assert is_match("aab","c*a*b")== True
    assert is_match("mississippi","mis*is*p*.") == False
    print("All tests passed ✓")
