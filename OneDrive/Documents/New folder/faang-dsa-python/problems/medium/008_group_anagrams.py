"""
Problem: Group Anagrams
Difficulty: Medium
Topic: Strings / Hashing
LeetCode: #49

Description:
    Given an array of strings, group the anagrams together.
    Order of output doesn't matter.

Examples:
    Input:  ["eat","tea","tan","ate","nat","bat"]
    Output: [["bat"],["nat","tan"],["ate","eat","tea"]]

Constraints:
    - 1 <= strs.length <= 10^4
    - 0 <= strs[i].length <= 100
    - strs[i] consists of lowercase letters.

Approach:
    Use sorted string as the canonical "anagram key".
    Group all strings with the same key.

    "eat" → sorted → "aet"
    "tea" → sorted → "aet"  (same group)
    "tan" → sorted → "ant"
    "ate" → sorted → "aet"  (same group as eat, tea)
    ...

    Alternative: use character count tuple as key (faster for long strings).

Time Complexity:  O(n * k log k) where k = max string length
Space Complexity: O(n * k)
"""

from collections import defaultdict

def group_anagrams(strs):
    groups = defaultdict(list)
    for s in strs:
        key = tuple(sorted(s))
        groups[key].append(s)
    return list(groups.values())

if __name__ == "__main__":
    result = group_anagrams(["eat","tea","tan","ate","nat","bat"])
    result_sorted = [sorted(g) for g in result]
    expected = [sorted(g) for g in [["bat"],["nat","tan"],["ate","eat","tea"]]]
    assert sorted(result_sorted) == sorted(expected)
    print("All tests passed ✓")
