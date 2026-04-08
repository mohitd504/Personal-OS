"""
Problem: Find All Anagrams in a String
Difficulty: Medium
Topic: Strings / Sliding Window
LeetCode: #438

Description:
    Given strings s and p, return a list of all start indices of p's
    anagrams in s.

Examples:
    Input:  s="cbaebabacd", p="abc"   Output: [0,6]
    Input:  s="abab", p="ab"          Output: [0,1,2]

Constraints:
    - 1 <= s.length, p.length <= 3*10^4
    - lowercase English letters

Approach:
    Fixed-size sliding window of length len(p).
    Compare character frequency counts.
    Slide window: add s[R], remove s[L], compare counts.

    Use array of 26 instead of Counter for O(1) comparison.

Time Complexity:  O(n)
Space Complexity: O(1) — fixed size arrays
"""

def find_anagrams(s, p):
    if len(p) > len(s): return []
    p_count = [0] * 26
    s_count = [0] * 26
    for ch in p: p_count[ord(ch)-ord('a')] += 1
    result = []
    for i, ch in enumerate(s):
        s_count[ord(ch)-ord('a')] += 1
        if i >= len(p):
            s_count[ord(s[i-len(p)])-ord('a')] -= 1
        if s_count == p_count:
            result.append(i - len(p) + 1)
    return result

if __name__ == "__main__":
    assert find_anagrams("cbaebabacd","abc") == [0,6]
    assert find_anagrams("abab","ab")        == [0,1,2]
    print("All tests passed ✓")
