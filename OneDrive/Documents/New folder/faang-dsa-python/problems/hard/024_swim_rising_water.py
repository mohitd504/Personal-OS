"""
Problem: Swim in Rising Water
Difficulty: Hard
Topic: Graphs / Dijkstra / Binary Search + BFS
LeetCode: #778

Description:
    n×n grid where grid[i][j] is the elevation. At time t, you can swim
    to adjacent cells if both elevations <= t. Starting at (0,0), find
    the minimum time to reach (n-1,n-1).

Examples:
    Input:  [[0,2],[1,3]]   Output: 3
    Input:  [[0,1,2,3,4],[24,23,22,21,5],...] Output: 16

Approach (Dijkstra / Min-Heap):
    Priority queue stores (max_elevation_so_far, r, c).
    At each step, pick minimum elevation bottleneck.
    dist[r][c] = min bottleneck to reach (r,c).

Time: O(n² log n)   Space: O(n²)
"""

import heapq

def swim_in_water(grid):
    n = len(grid)
    visited = set()
    heap = [(grid[0][0], 0, 0)]
    DIRS = [(0,1),(0,-1),(1,0),(-1,0)]
    while heap:
        t, r, c = heapq.heappop(heap)
        if (r,c) in visited: continue
        visited.add((r,c))
        if r == n-1 and c == n-1: return t
        for dr,dc in DIRS:
            nr,nc = r+dr, c+dc
            if 0<=nr<n and 0<=nc<n and (nr,nc) not in visited:
                heapq.heappush(heap, (max(t, grid[nr][nc]), nr, nc))
    return -1

if __name__ == "__main__":
    assert swim_in_water([[0,2],[1,3]]) == 3
    g=[[0,1,2,3,4],[24,23,22,21,5],[12,13,14,15,16],[11,17,18,19,20],[10,9,8,7,6]]
    assert swim_in_water(g) == 16
    print("All tests passed ✓")
