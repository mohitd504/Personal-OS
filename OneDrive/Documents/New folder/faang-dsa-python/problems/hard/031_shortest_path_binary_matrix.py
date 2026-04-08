"""
Problem: Shortest Path in Binary Matrix
Difficulty: Hard (Medium-Hard)
Topic: Graphs / BFS
LeetCode: #1091

Description:
    In an n×n binary matrix, find the shortest clear path from top-left (0,0)
    to bottom-right (n-1,n-1). Clear path: all cells are 0, 8-directional.
    Return length of path or -1.

Examples:
    Input:  [[0,1],[1,0]]   Output: 2
    Input:  [[0,0,0],[1,1,0],[1,1,0]]   Output: 4

Approach: BFS — shortest path in unweighted grid.
Time: O(n²)   Space: O(n²)
"""

from collections import deque

def shortest_path_binary_matrix(grid):
    n = len(grid)
    if grid[0][0] == 1 or grid[n-1][n-1] == 1: return -1
    q = deque([(0,0,1)])
    grid[0][0] = 1
    DIRS = [(r,c) for r in [-1,0,1] for c in [-1,0,1] if (r,c)!=(0,0)]
    while q:
        r,c,dist = q.popleft()
        if r==n-1 and c==n-1: return dist
        for dr,dc in DIRS:
            nr,nc = r+dr,c+dc
            if 0<=nr<n and 0<=nc<n and grid[nr][nc]==0:
                grid[nr][nc]=1; q.append((nr,nc,dist+1))
    return -1

if __name__ == "__main__":
    assert shortest_path_binary_matrix([[0,1],[1,0]])          == 2
    assert shortest_path_binary_matrix([[0,0,0],[1,1,0],[1,1,0]]) == 4
    assert shortest_path_binary_matrix([[1,0,0],[1,1,0],[1,1,0]]) == -1
    print("All tests passed ✓")
