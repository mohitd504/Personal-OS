"""
Problem: Counting Bits
Difficulty: Medium (Easy leaning)
Topic: Dynamic Programming / Bit Manipulation
LeetCode: #338

Description:
    Given an integer n, return an array ans of length n+1 where ans[i]
    is the number of 1s in the binary representation of i.

Examples:
    Input:  n = 2    Output: [0,1,1]
    Input:  n = 5    Output: [0,1,1,2,1,2]

Constraints:
    - 0 <= n <= 10^5

Approach (DP):
    dp[i] = dp[i >> 1] + (i & 1)
    (number of 1s in i = number of 1s in i//2, plus 1 if i is odd)

    i=0: dp[0]=0
    i=1: dp[0] + 1 = 1
    i=2: dp[1] + 0 = 1
    i=3: dp[1] + 1 = 2
    i=4: dp[2] + 0 = 1
    i=5: dp[2] + 1 = 2

Time Complexity:  O(n)
Space Complexity: O(n)
"""

def count_bits(n):
    dp = [0] * (n + 1)
    for i in range(1, n + 1):
        dp[i] = dp[i >> 1] + (i & 1)
    return dp

if __name__ == "__main__":
    assert count_bits(2) == [0,1,1]
    assert count_bits(5) == [0,1,1,2,1,2]
    assert count_bits(0) == [0]
    print("All tests passed ✓")
