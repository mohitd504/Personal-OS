"""
Problem: Substring with Concatenation of All Words
Difficulty: Hard
Topic: Strings / Sliding Window / Hashing
LeetCode: #30

Description:
    Given string s and array words (all same length), return starting indices
    of all substrings that are a concatenation of all words (any order).

Examples:
    Input:  s="barfoothefoobarman", words=["foo","bar"]
    Output: [0,9]

    Input:  s="wordgoodgoodgoodbestword", words=["word","good","best","word"]
    Output: []

Approach:
    Slide a window of size len(words)*word_len.
    For each start position (0 to word_len-1), slide by word_len.
    Use frequency map comparison.

Time: O(n * word_len)   Space: O(total words)
"""

from collections import Counter, defaultdict

def find_substring(s, words):
    if not s or not words: return []
    wl = len(words[0]); wc = len(words); total = wl*wc
    need = Counter(words); result = []
    for start in range(wl):
        have = defaultdict(int); formed = 0; left = start
        for right in range(start, len(s)-wl+1, wl):
            w = s[right:right+wl]
            if w in need:
                have[w] += 1
                if have[w] == need[w]: formed += 1
                while have[w] > need[w]:
                    lw = s[left:left+wl]
                    if have[lw] == need[lw]: formed -= 1
                    have[lw] -= 1; left += wl
                if formed == len(need) and right-left+wl == total:
                    result.append(left)
            else:
                have.clear(); formed = 0; left = right+wl
    return result

if __name__ == "__main__":
    assert sorted(find_substring("barfoothefoobarman",["foo","bar"])) == [0,9]
    assert find_substring("wordgoodgoodgoodbestword",["word","good","best","word"]) == []
    print("All tests passed ✓")
