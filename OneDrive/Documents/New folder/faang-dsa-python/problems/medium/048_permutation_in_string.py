"""
Problem: Permutation in String
Difficulty: Medium
Topic: Strings / Sliding Window
LeetCode: #567

Description:
    Given strings s1 and s2, return true if s2 contains a permutation of s1.
    (i.e., one of s1's permutations is a substring of s2)

Examples:
    Input:  s1="ab", s2="eidbaooo"   Output: True   ("ba" at index 3)
    Input:  s1="ab", s2="eidboaoo"   Output: False

Constraints:
    - 1 <= s1.length, s2.length <= 10^4
    - lowercase English letters

Approach:
    Sliding window of size len(s1) over s2.
    Compare character frequency counts using 26-element arrays.

Time Complexity:  O(n)
Space Complexity: O(1)
"""

def check_inclusion(s1, s2):
    if len(s1) > len(s2): return False
    need = [0] * 26
    have = [0] * 26
    for ch in s1: need[ord(ch)-97] += 1
    for i, ch in enumerate(s2):
        have[ord(ch)-97] += 1
        if i >= len(s1):
            have[ord(s2[i-len(s1)])-97] -= 1
        if need == have: return True
    return False

if __name__ == "__main__":
    assert check_inclusion("ab","eidbaooo") == True
    assert check_inclusion("ab","eidboaoo") == False
    assert check_inclusion("adc","dcda")    == True
    print("All tests passed ✓")
