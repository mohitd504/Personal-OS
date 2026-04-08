"""
Problem: Palindrome Partitioning II
Difficulty: Hard
Topic: Dynamic Programming
LeetCode: #132

Description:
    Given a string s, partition it so that every substring is a palindrome.
    Return the minimum number of cuts needed.

Examples:
    Input:  s="aab"    Output: 1  ("a"|"ab"? No. "aa"|"b" = 1 cut)
    Input:  s="a"      Output: 0
    Input:  s="ab"     Output: 1

Approach:
    is_pal[i][j] = True if s[i..j] is palindrome (expand around center).
    cuts[i] = min cuts for s[:i+1].
    If s[0..i] is palindrome: cuts[i]=0.
    Else: cuts[i] = min(cuts[j] + 1) for all j where s[j+1..i] is palindrome.

Time: O(n²)   Space: O(n²)
"""

def min_cut(s):
    n = len(s)
    is_pal = [[False]*n for _ in range(n)]
    for center in range(n):
        # odd
        l,r = center,center
        while l>=0 and r<n and s[l]==s[r]: is_pal[l][r]=True; l-=1; r+=1
        # even
        l,r = center,center+1
        while l>=0 and r<n and s[l]==s[r]: is_pal[l][r]=True; l-=1; r+=1
    cuts = list(range(-1, n-1))   # cuts[i] = i (worst: cut every char)
    for i in range(1, n):
        if is_pal[0][i]: cuts[i]=0; continue
        for j in range(1, i+1):
            if is_pal[j][i]:
                cuts[i] = min(cuts[i], cuts[j-1]+1)
    return cuts[n-1]

if __name__ == "__main__":
    assert min_cut("aab") == 1
    assert min_cut("a")   == 0
    assert min_cut("ab")  == 1
    assert min_cut("aaabaa") == 1
    print("All tests passed ✓")
