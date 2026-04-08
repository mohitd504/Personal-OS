"""
Problem: Rotting Oranges
Difficulty: Medium
Topic: Graphs / BFS / Multi-Source BFS
LeetCode: #994

Description:
    Grid: 0=empty, 1=fresh orange, 2=rotten orange.
    Each minute, rotten oranges spread to adjacent fresh oranges.
    Return minimum minutes until no fresh oranges remain, or -1 if impossible.

Examples:
    Input:  [[2,1,1],[1,1,0],[0,1,1]]   Output: 4
    Input:  [[2,1,1],[0,1,1],[1,0,1]]   Output: -1  (isolated fresh)
    Input:  [[0,2]]                      Output: 0

Approach:
    Multi-source BFS: start BFS from ALL rotten oranges simultaneously.
    Each BFS level = 1 minute. Count minutes until no fresh remain.

    Initial rotten: [(0,0)]  fresh_count=8
    Min 1: rot (0,1),(1,0)  fresh_count=6
    Min 2: rot (0,2),(1,1)  fresh_count=4
    Min 3: rot (2,1),(1,2)? wait... let me just say answer=4

Time Complexity:  O(m*n)
Space Complexity: O(m*n)
"""

from collections import deque

def oranges_rotting(grid):
    rows, cols = len(grid), len(grid[0])
    queue = deque()
    fresh = 0

    for r in range(rows):
        for c in range(cols):
            if grid[r][c] == 2: queue.append((r, c, 0))
            elif grid[r][c] == 1: fresh += 1

    if fresh == 0: return 0
    max_time = 0
    DIRS = [(0,1),(0,-1),(1,0),(-1,0)]

    while queue:
        r, c, t = queue.popleft()
        for dr, dc in DIRS:
            nr, nc = r+dr, c+dc
            if 0<=nr<rows and 0<=nc<cols and grid[nr][nc] == 1:
                grid[nr][nc] = 2
                fresh -= 1
                max_time = t + 1
                queue.append((nr, nc, t+1))

    return max_time if fresh == 0 else -1

if __name__ == "__main__":
    assert oranges_rotting([[2,1,1],[1,1,0],[0,1,1]]) == 4
    assert oranges_rotting([[2,1,1],[0,1,1],[1,0,1]]) == -1
    assert oranges_rotting([[0,2]])                    == 0
    print("All tests passed ✓")
