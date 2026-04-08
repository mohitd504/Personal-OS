"""
Problem: Edit Distance
Difficulty: Hard
Topic: Dynamic Programming (2D)
LeetCode: #72

Description:
    Given strings word1 and word2, return the minimum number of operations
    (insert, delete, replace) to convert word1 to word2.

Examples:
    Input:  word1="horse", word2="ros"   Output: 3
    Input:  word1="intention", word2="execution" Output: 5

Constraints:
    - 0 <= word1.length, word2.length <= 500

Approach:
    dp[i][j] = min ops to convert word1[:i] to word2[:j]
    if chars match: dp[i][j] = dp[i-1][j-1]
    else: dp[i][j] = 1 + min(dp[i-1][j],   # delete
                              dp[i][j-1],   # insert
                              dp[i-1][j-1]) # replace
    Base: dp[i][0]=i, dp[0][j]=j (delete/insert all)

    Space-optimize to O(n) using rolling array.

Time Complexity:  O(m*n)
Space Complexity: O(n)
"""

def min_distance(word1, word2):
    m, n = len(word1), len(word2)
    dp = list(range(n + 1))
    for i in range(1, m + 1):
        prev = dp[0]
        dp[0] = i
        for j in range(1, n + 1):
            temp = dp[j]
            if word1[i-1] == word2[j-1]:
                dp[j] = prev
            else:
                dp[j] = 1 + min(prev, dp[j], dp[j-1])
            prev = temp
    return dp[n]

if __name__ == "__main__":
    assert min_distance("horse","ros")          == 3
    assert min_distance("intention","execution") == 5
    assert min_distance("","")                   == 0
    assert min_distance("a","")                  == 1
    print("All tests passed ✓")
