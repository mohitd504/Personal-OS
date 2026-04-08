"""
Problem: Find the Shortest Superstring
Difficulty: Hard
Topic: Bitmask DP / TSP
LeetCode: #943

Description:
    Given words, find the shortest string that is a superstring
    (every word is a substring). Use bitmask DP.

Examples:
    Input:  ["alex","loves","leetcode"]   Output: "alexlovesleetcode"
    Input:  ["catg","ctaagt","gcta","ttca","atgcatc"]
    Output: "gctaagttcatgcatc"

Approach:
    overlap[i][j] = length of longest suffix of words[i] that is prefix of words[j].
    dp[mask][i] = min length to cover words in mask, ending at word i.
    Reconstruct path.

Time: O(n² * 2^n)   Space: O(n * 2^n)
"""

def shortest_superstring(words):
    n = len(words)
    overlap = [[0]*n for _ in range(n)]
    for i in range(n):
        for j in range(n):
            if i!=j:
                m = min(len(words[i]),len(words[j]))
                for k in range(m,0,-1):
                    if words[i].endswith(words[j][:k]):
                        overlap[i][j]=k; break

    INF = float('inf')
    dp = [[INF]*n for _ in range(1<<n)]
    parent = [[-1]*n for _ in range(1<<n)]
    for i in range(n): dp[1<<i][i] = len(words[i])

    for mask in range(1<<n):
        for last in range(n):
            if not (mask>>last&1) or dp[mask][last]==INF: continue
            for nxt in range(n):
                if mask>>nxt&1: continue
                nmask = mask|(1<<nxt)
                new_len = dp[mask][last]+len(words[nxt])-overlap[last][nxt]
                if new_len < dp[nmask][nxt]:
                    dp[nmask][nxt]=new_len; parent[nmask][nxt]=last

    full = (1<<n)-1
    last = min(range(n), key=lambda i: dp[full][i])
    path=[]; mask=full
    while last!=-1:
        path.append(last); prev=parent[mask][last]
        mask^=(1<<last); last=prev
    path.reverse()
    result = words[path[0]]
    for k in range(1,len(path)):
        result += words[path[k]][overlap[path[k-1]][path[k]]:]
    return result

if __name__ == "__main__":
    r = shortest_superstring(["alex","loves","leetcode"])
    assert all(w in r for w in ["alex","loves","leetcode"])
    print("All tests passed ✓")
