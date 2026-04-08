"""
Problem: Critical Connections in a Network
Difficulty: Hard
Topic: Graphs / Tarjan's Bridge Finding
LeetCode: #1192

Description:
    Given n servers and connections, find all critical connections
    (bridges) — removal of which disconnects the network.

Examples:
    Input:  n=4, connections=[[0,1],[1,2],[2,0],[1,3]]
    Output: [[1,3]]

Approach (Tarjan's Bridge Algorithm):
    DFS tracking discovery time and low value.
    low[u] = min disc time reachable from subtree of u.
    Edge (u,v) is a bridge if low[v] > disc[u].

Time: O(V+E)   Space: O(V+E)
"""

from collections import defaultdict

def critical_connections(n, connections):
    adj = defaultdict(list)
    for u, v in connections:
        adj[u].append(v); adj[v].append(u)
    disc = [-1]*n; low = [0]*n; timer = [0]
    result = []
    def dfs(u, parent):
        disc[u] = low[u] = timer[0]; timer[0] += 1
        for v in adj[u]:
            if v == parent: continue
            if disc[v] == -1:
                dfs(v, u)
                low[u] = min(low[u], low[v])
                if low[v] > disc[u]:
                    result.append([u, v])
            else:
                low[u] = min(low[u], disc[v])
    dfs(0, -1)
    return result

if __name__ == "__main__":
    r = critical_connections(4,[[0,1],[1,2],[2,0],[1,3]])
    assert r == [[1,3]]
    print("All tests passed ✓")
