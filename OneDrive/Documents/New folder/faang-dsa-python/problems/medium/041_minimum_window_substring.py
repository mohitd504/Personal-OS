"""
Problem: Minimum Window Substring
Difficulty: Medium (Hard-leaning)
Topic: Strings / Sliding Window
LeetCode: #76

Description:
    Given strings s and t, return the minimum window substring of s
    that contains all characters of t. Return "" if not possible.

Examples:
    Input:  s="ADOBECODEBANC", t="ABC"   Output: "BANC"
    Input:  s="a", t="a"                  Output: "a"
    Input:  s="a", t="aa"                 Output: ""

Constraints:
    - 1 <= s.length <= 10^5
    - 1 <= t.length <= 10^4

Approach:
    Sliding window. Track "need" (freq of t chars) and "have" (window freq).
    "formed" counts how many unique chars meet their required frequency.
    Expand R until window is valid, then shrink L.

Time Complexity:  O(|s| + |t|)
Space Complexity: O(|s| + |t|)
"""

from collections import Counter

def min_window(s, t):
    if not t or not s: return ""
    need = Counter(t)
    required = len(need)
    have, formed = {}, 0
    best = ""
    L = 0
    for R, ch in enumerate(s):
        have[ch] = have.get(ch, 0) + 1
        if ch in need and have[ch] == need[ch]:
            formed += 1
        while formed == required:
            window = s[L:R+1]
            if not best or len(window) < len(best):
                best = window
            have[s[L]] -= 1
            if s[L] in need and have[s[L]] < need[s[L]]:
                formed -= 1
            L += 1
    return best

if __name__ == "__main__":
    assert min_window("ADOBECODEBANC","ABC") == "BANC"
    assert min_window("a","a")               == "a"
    assert min_window("a","aa")              == ""
    print("All tests passed ✓")
