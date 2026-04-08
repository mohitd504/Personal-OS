"""
Problem: Number of Islands
Difficulty: Medium
Topic: Graphs / Matrix DFS/BFS
LeetCode: #200

Description:
    Given an m×n 2D binary grid ('1'=land, '0'=water), return the
    number of islands. An island is surrounded by water and formed by
    connecting adjacent lands horizontally or vertically.

Examples:
    Input:
    [["1","1","1","1","0"],
     ["1","1","0","1","0"],
     ["1","1","0","0","0"],
     ["0","0","0","0","0"]]
    Output: 1

    Input:
    [["1","1","0","0","0"],
     ["1","1","0","0","0"],
     ["0","0","1","0","0"],
     ["0","0","0","1","1"]]
    Output: 3

Approach:
    DFS from each unvisited land cell. Mark visited cells to avoid revisiting.
    Each DFS call "sinks" an entire island. Count DFS calls.

Time Complexity:  O(m*n)
Space Complexity: O(m*n) recursion stack worst case
"""

def num_islands(grid):
    if not grid: return 0
    rows, cols = len(grid), len(grid[0])
    count = 0

    def dfs(r, c):
        if r < 0 or r >= rows or c < 0 or c >= cols or grid[r][c] != '1':
            return
        grid[r][c] = '#'   # mark visited
        for dr, dc in [(0,1),(0,-1),(1,0),(-1,0)]:
            dfs(r+dr, c+dc)

    for r in range(rows):
        for c in range(cols):
            if grid[r][c] == '1':
                dfs(r, c)
                count += 1
    return count

if __name__ == "__main__":
    g1=[["1","1","1","1","0"],["1","1","0","1","0"],["1","1","0","0","0"],["0","0","0","0","0"]]
    assert num_islands(g1) == 1
    g2=[["1","1","0","0","0"],["1","1","0","0","0"],["0","0","1","0","0"],["0","0","0","1","1"]]
    assert num_islands(g2) == 3
    print("All tests passed ✓")
