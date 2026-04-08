"""
Problem: Valid Anagram
Difficulty: Easy
Topic: Strings / Hashing
LeetCode: #242

Description:
    Given two strings s and t, return true if t is an anagram of s.
    An anagram uses the exact same characters with the same frequencies.

Examples:
    Input:  s = "anagram", t = "nagaram"
    Output: True

    Input:  s = "rat", t = "car"
    Output: False

Constraints:
    - 1 <= s.length, t.length <= 5*10^4
    - s and t consist of lowercase English letters.

Approach:
    Count character frequencies in both strings and compare.
    Quick check: if lengths differ → not anagram.

    "anagram" → {a:3, n:1, g:1, r:1, m:1}
    "nagaram" → {n:1, a:3, g:1, r:1, m:1}
    Equal → True ✓

Time Complexity:  O(n)
Space Complexity: O(1)  (at most 26 distinct chars)
"""

from collections import Counter

def is_anagram(s, t):
    if len(s) != len(t):
        return False
    return Counter(s) == Counter(t)

# Manual version without Counter:
def is_anagram_v2(s, t):
    if len(s) != len(t): return False
    count = [0] * 26
    for a, b in zip(s, t):
        count[ord(a) - ord('a')] += 1
        count[ord(b) - ord('a')] -= 1
    return all(c == 0 for c in count)


if __name__ == "__main__":
    assert is_anagram("anagram", "nagaram") == True
    assert is_anagram("rat", "car")         == False
    assert is_anagram("a", "a")             == True
    print("All tests passed ✓")
