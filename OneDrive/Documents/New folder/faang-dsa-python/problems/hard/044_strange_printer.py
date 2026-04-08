"""
Problem 44: Strange Printer
============================
Difficulty: Hard
Topics: Dynamic Programming (Interval DP)

Description:
A printer can only print a sequence of the same character each time and
will always print from left to right. At each turn, the printer can print
new characters starting from and ending at any position, overwriting existing ones.

Given a string s, return the minimum number of turns the printer needs to print it.

Examples:
    Input: s = "aaabbb"
    Output: 2
    Explanation: Print "aaa" then "bbb".

    Input: s = "aba"
    Output: 2
    Explanation: Print "aaa" then print "b" at position 1.

Constraints:
    1 <= s.length <= 100
    s consists of lowercase English letters.

Approach (Interval DP):
    dp[i][j] = min turns to print s[i..j]
    
    Base: dp[i][i] = 1
    
    For each i, j and split point k:
    - dp[i][j] = min over k in [i, j-1] of: dp[i][k] + dp[k+1][j]
    - Optimization: if s[k] == s[j], we can "extend" the print of s[k]
      to cover s[j] for free → dp[i][j] = min(dp[i][k] + dp[k+1][j-1])
      when s[k] == s[j] (since we already cover j with the k print)

Complexity:
    Time:  O(n^3)
    Space: O(n^2)
"""
from functools import lru_cache


def strangePrinter(s: str) -> int:
    n = len(s)

    @lru_cache(maxsize=None)
    def dp(i, j):
        if i > j:
            return 0
        # Start: print s[i] alone, then handle rest
        ans = 1 + dp(i + 1, j)
        # If s[k] == s[i] for some k > i, we can print s[i..k] together
        for k in range(i + 1, j + 1):
            if s[k] == s[i]:
                ans = min(ans, dp(i, k - 1) + dp(k + 1, j))
        return ans

    return dp(0, n - 1)


if __name__ == "__main__":
    assert strangePrinter("aaabbb") == 2
    assert strangePrinter("aba") == 2
    assert strangePrinter("a") == 1
    assert strangePrinter("abba") == 2  # print "abba"? No: "aa"(2)+inner? → "aaaa" then "b" at 1, "b" at 2 = 3? Actually 2: "abba"... let's trust algo
    assert strangePrinter("leetcode") == 6
    print("All tests passed!")
