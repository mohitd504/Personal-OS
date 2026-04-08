"""
Problem: Count Different Palindromic Subsequences
Difficulty: Hard
Topic: Dynamic Programming
LeetCode: #730

Description:
    Given string s, return the number of different non-empty palindromic
    subsequences. Answer modulo 10^9+7.

Examples:
    Input:  s="bccb"    Output: 6  (b,c,bb,cc,bcb,bccb)
    Input:  s="abcdabcdabcdabcdabcdabcdabcdabcddcbadcbadcbadcbadcbadcbadcbadcba"
    Output: 104860361

Approach:
    dp[i][j] = # distinct palindromic subsequences in s[i..j].
    For each s[i]==s[j]==c:
      Find leftmost and rightmost c inside (i,j) as l,r.
      If no c inside: dp[i][j] += dp[i+1][j-1]*2 + 2
      If l==r:       dp[i][j] += dp[i+1][j-1]*2 + 1
      Else:          dp[i][j] += dp[i+1][j-1]*2 - dp[l+1][r-1]

Time: O(n²)   Space: O(n²)
"""

def count_palindromic_subsequences(s):
    MOD = 10**9+7
    n = len(s)
    dp = [[0]*n for _ in range(n)]
    for i in range(n): dp[i][i]=1
    for length in range(2,n+1):
        for i in range(n-length+1):
            j=i+length-1
            if s[i]!=s[j]:
                dp[i][j]=(dp[i+1][j]+dp[i][j-1]-dp[i+1][j-1])%MOD
            else:
                l,r=i+1,j-1
                while l<=r and s[l]!=s[i]: l+=1
                while l<=r and s[r]!=s[j]: r-=1
                if l>r:   dp[i][j]=(dp[i+1][j-1]*2+2)%MOD
                elif l==r:dp[i][j]=(dp[i+1][j-1]*2+1)%MOD
                else:     dp[i][j]=(dp[i+1][j-1]*2-dp[l+1][r-1])%MOD
    return dp[0][n-1]%MOD

if __name__ == "__main__":
    assert count_palindromic_subsequences("bccb") == 6
    assert count_palindromic_subsequences("abcdabcdabcdabcdabcdabcdabcdabcddcbadcbadcbadcbadcbadcbadcbadcba") == 104860361
    print("All tests passed ✓")
