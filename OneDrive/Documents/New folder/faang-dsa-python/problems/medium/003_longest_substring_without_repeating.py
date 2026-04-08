"""
Problem: Longest Substring Without Repeating Characters
Difficulty: Medium
Topic: Strings / Sliding Window / Hashing
LeetCode: #3

Description:
    Given a string s, find the length of the longest substring without
    repeating characters.

Examples:
    Input:  s = "abcabcbb"   Output: 3  ("abc")
    Input:  s = "bbbbb"      Output: 1  ("b")
    Input:  s = "pwwkew"     Output: 3  ("wke")

Constraints:
    - 0 <= s.length <= 5*10^4
    - s consists of English letters, digits, symbols, and spaces.

Approach:
    Sliding window with hash map storing last seen index of each character.
    When a duplicate is found, move L pointer past its previous occurrence.

    "abcabcbb":
    R=0(a): map={a:0}, window=[a], len=1
    R=1(b): map={a:0,b:1}, window=[ab], len=2
    R=2(c): map={..c:2}, window=[abc], len=3
    R=3(a): a seen at 0, L=max(L,0+1)=1, map[a]=3, window=[bca], len=3
    R=4(b): b seen at 1, L=max(1,1+1)=2, map[b]=4, window=[cab], len=3
    R=5(c): c seen at 2, L=max(2,2+1)=3, map[c]=5, window=[abc], len=3
    R=6(b): b seen at 4, L=max(3,4+1)=5, window=[cb], len=2
    R=7(b): b seen at 6, L=max(5,6+1)=7, window=[b], len=1
    Answer: 3

Time Complexity:  O(n)
Space Complexity: O(min(n,m)) where m=charset size
"""

def length_of_longest_substring(s):
    last_seen = {}
    L = best = 0
    for R, ch in enumerate(s):
        if ch in last_seen and last_seen[ch] >= L:
            L = last_seen[ch] + 1
        last_seen[ch] = R
        best = max(best, R - L + 1)
    return best

if __name__ == "__main__":
    assert length_of_longest_substring("abcabcbb") == 3
    assert length_of_longest_substring("bbbbb")    == 1
    assert length_of_longest_substring("pwwkew")   == 3
    assert length_of_longest_substring("")         == 0
    print("All tests passed ✓")
