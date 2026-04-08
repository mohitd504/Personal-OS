"""
Problem: Decode Ways
Difficulty: Medium
Topic: Dynamic Programming
LeetCode: #91

Description:
    A message of digits maps to letters: '1'→'A', '2'→'B',...,'26'→'Z'.
    Given a string of digits, return the number of ways to decode it.

Examples:
    Input:  s = "12"    Output: 2   ("AB" or "L")
    Input:  s = "226"   Output: 3   ("BZ","VF","BBF")
    Input:  s = "06"    Output: 0   (no mapping for "06")

Constraints:
    - 1 <= s.length <= 100
    - s contains only digits, may contain leading zeros.

Approach:
    dp[i] = number of ways to decode s[:i]
    dp[0] = 1 (empty), dp[1] = 0 if s[0]=='0' else 1.
    For each i:
    - Single digit s[i-1]: valid if '1'-'9' → dp[i] += dp[i-1]
    - Two digits s[i-2:i]: valid if 10-26 → dp[i] += dp[i-2]

    "226":
    dp[0]=1, dp[1]=1 ('2' valid)
    dp[2]: '2' valid → dp[2]+=dp[1]=1; '22' valid(10-26) → dp[2]+=dp[0]=1 → dp[2]=2
    dp[3]: '6' valid → dp[3]+=dp[2]=2; '26' valid → dp[3]+=dp[1]=1 → dp[3]=3 ✓

Time Complexity:  O(n)
Space Complexity: O(1)
"""

def num_decodings(s):
    if not s or s[0] == '0': return 0
    prev2, prev1 = 1, 1
    for i in range(1, len(s)):
        curr = 0
        if s[i] != '0':
            curr += prev1
        two = int(s[i-1:i+1])
        if 10 <= two <= 26:
            curr += prev2
        prev2, prev1 = prev1, curr
    return prev1

if __name__ == "__main__":
    assert num_decodings("12")  == 2
    assert num_decodings("226") == 3
    assert num_decodings("06")  == 0
    assert num_decodings("11106") == 2
    print("All tests passed ✓")
