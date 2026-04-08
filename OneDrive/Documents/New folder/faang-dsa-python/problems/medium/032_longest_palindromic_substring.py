"""
Problem: Longest Palindromic Substring
Difficulty: Medium
Topic: Strings / DP / Two Pointers
LeetCode: #5

Description:
    Given a string s, return the longest palindromic substring.

Examples:
    Input:  s = "babad"   Output: "bab" or "aba"
    Input:  s = "cbbd"    Output: "bb"

Constraints:
    - 1 <= s.length <= 1000
    - s consists of digits and English letters.

Approach (Expand Around Center):
    For each character (and each pair of adjacent chars for even palindromes),
    expand outward as long as characters match.

    "babad":
    Center 'b': expand → "b"
    Center 'a': expand → "bab" (3 chars)
    Center 'b': expand → "aba" starts 'a'...'a' → "aba"? No wait:
       b[1]=a, expand left=0('b'), right=2('b') match → "bab"
    ...
    Longest: "bab" ✓

Time Complexity:  O(n²)
Space Complexity: O(1)
"""

def longest_palindrome(s):
    def expand(l, r):
        while l >= 0 and r < len(s) and s[l] == s[r]:
            l -= 1; r += 1
        return s[l+1:r]

    best = ""
    for i in range(len(s)):
        odd  = expand(i, i)
        even = expand(i, i+1)
        if len(odd)  > len(best): best = odd
        if len(even) > len(best): best = even
    return best

if __name__ == "__main__":
    result = longest_palindrome("babad")
    assert result in ["bab", "aba"]
    assert longest_palindrome("cbbd") == "bb"
    assert longest_palindrome("a")    == "a"
    assert longest_palindrome("racecar") == "racecar"
    print("All tests passed ✓")
