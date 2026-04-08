"""
Problem: Word Break
Difficulty: Medium
Topic: Dynamic Programming / Hashing
LeetCode: #139

Description:
    Given a string s and a dictionary of strings wordDict, return true if
    s can be segmented into a space-separated sequence of dictionary words.

Examples:
    Input:  s="leetcode", wordDict=["leet","code"]   Output: True
    Input:  s="applepenapple", wordDict=["apple","pen"] Output: True
    Input:  s="catsandog", wordDict=["cats","dog","sand","and","cat"] Output: False

Constraints:
    - 1 <= s.length <= 300
    - wordDict has no duplicates.

Approach:
    dp[i] = True if s[0..i-1] can be segmented.
    dp[0] = True (empty string).
    For each position i, check all j<i: if dp[j] and s[j:i] in dict → dp[i]=True.

    s="leetcode", dict={"leet","code"}
    dp=[T,F,F,F,F,F,F,F,F]
    i=1..3: no word matches
    i=4: s[0:4]="leet" in dict, dp[0]=T → dp[4]=T
    i=5..7: no new matches
    i=8: s[4:8]="code" in dict, dp[4]=T → dp[8]=T
    dp[8]=True ✓

Time Complexity:  O(n²)
Space Complexity: O(n)
"""

def word_break(s, wordDict):
    word_set = set(wordDict)
    n = len(s)
    dp = [False] * (n + 1)
    dp[0] = True
    for i in range(1, n + 1):
        for j in range(i):
            if dp[j] and s[j:i] in word_set:
                dp[i] = True
                break
    return dp[n]

if __name__ == "__main__":
    assert word_break("leetcode", ["leet","code"])                   == True
    assert word_break("applepenapple", ["apple","pen"])              == True
    assert word_break("catsandog",["cats","dog","sand","and","cat"]) == False
    print("All tests passed ✓")
