"""
Problem: Alien Dictionary
Difficulty: Hard
Topic: Graphs / Topological Sort / DFS
LeetCode: #269 (Premium)

Description:
    Given a sorted list of words in an alien language, determine the order
    of characters in the alien alphabet. Return the character order string,
    or "" if the order is invalid (cycle).

Examples:
    Input:  words=["wrt","wrf","er","ett","rftt"]
    Output: "wertf"

    Input:  words=["z","x"]
    Output: "zx"

    Input:  words=["z","x","z"]
    Output: ""   (cycle: z→x→z)

Approach:
    1. Build graph: compare adjacent words char-by-char to find ordering.
    2. Topological sort (DFS, detect cycles).

Time Complexity:  O(C) where C = total characters in all words
Space Complexity: O(1) — at most 26 nodes
"""

from collections import defaultdict

def alien_order(words):
    adj = defaultdict(set)
    in_deg = {ch:0 for w in words for ch in w}

    for i in range(len(words)-1):
        w1, w2 = words[i], words[i+1]
        min_len = min(len(w1), len(w2))
        if len(w1) > len(w2) and w1[:min_len] == w2[:min_len]:
            return ""  # invalid: longer word comes first
        for j in range(min_len):
            if w1[j] != w2[j]:
                if w2[j] not in adj[w1[j]]:
                    adj[w1[j]].add(w2[j])
                    in_deg[w2[j]] += 1
                break

    from collections import deque
    q = deque([ch for ch in in_deg if in_deg[ch] == 0])
    result = []
    while q:
        ch = q.popleft(); result.append(ch)
        for nei in adj[ch]:
            in_deg[nei] -= 1
            if in_deg[nei] == 0: q.append(nei)
    return "".join(result) if len(result) == len(in_deg) else ""

if __name__ == "__main__":
    assert alien_order(["wrt","wrf","er","ett","rftt"]) == "wertf"
    assert alien_order(["z","x"])                       == "zx"
    assert alien_order(["z","x","z"])                   == ""
    print("All tests passed ✓")
