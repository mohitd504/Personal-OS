"""
Problem: Pacific Atlantic Water Flow
Difficulty: Medium
Topic: Graphs / DFS / BFS
LeetCode: #417

Description:
    Pacific Ocean touches top and left edges; Atlantic touches bottom and right.
    Water flows from cell to adjacent cell if height >=.
    Return list of cells from which water can flow to BOTH oceans.

Examples:
    Input: heights=[[1,2,2,3,5],[3,2,3,4,4],[2,4,5,3,1],[6,7,1,4,5],[5,1,1,2,4]]
    Output: [[0,4],[1,3],[1,4],[2,2],[3,0],[3,1],[4,0]]

Approach:
    Reverse the flow: start BFS from ocean borders and find all reachable cells.
    Pacific-reachable: from top row and left col.
    Atlantic-reachable: from bottom row and right col.
    Answer: intersection.

Time Complexity:  O(m*n)
Space Complexity: O(m*n)
"""

from collections import deque

def pacific_atlantic(heights):
    rows, cols = len(heights), len(heights[0])
    DIRS = [(0,1),(0,-1),(1,0),(-1,0)]

    def bfs(starts):
        visited = set(starts)
        q = deque(starts)
        while q:
            r, c = q.popleft()
            for dr, dc in DIRS:
                nr, nc = r+dr, c+dc
                if (0<=nr<rows and 0<=nc<cols and
                    (nr,nc) not in visited and
                    heights[nr][nc] >= heights[r][c]):
                    visited.add((nr,nc))
                    q.append((nr,nc))
        return visited

    pac = [(0,c) for c in range(cols)] + [(r,0) for r in range(1,rows)]
    atl = [(rows-1,c) for c in range(cols)] + [(r,cols-1) for r in range(rows-1)]
    return sorted(pac_reachable & atl_reachable
                  for pac_reachable, atl_reachable in [(bfs(pac), bfs(atl))])

def pacific_atlantic_v2(heights):
    rows, cols = len(heights), len(heights[0])
    DIRS = [(0,1),(0,-1),(1,0),(-1,0)]
    def bfs(starts):
        vis = set(starts); q = deque(starts)
        while q:
            r,c = q.popleft()
            for dr,dc in DIRS:
                nr,nc=r+dr,c+dc
                if 0<=nr<rows and 0<=nc<cols and (nr,nc) not in vis and heights[nr][nc]>=heights[r][c]:
                    vis.add((nr,nc)); q.append((nr,nc))
        return vis
    pac_s = [(0,c) for c in range(cols)] + [(r,0) for r in range(1,rows)]
    atl_s = [(rows-1,c) for c in range(cols)] + [(r,cols-1) for r in range(rows-1)]
    return sorted([r,c] for r,c in bfs(pac_s) & bfs(atl_s))

if __name__ == "__main__":
    h=[[1,2,2,3,5],[3,2,3,4,4],[2,4,5,3,1],[6,7,1,4,5],[5,1,1,2,4]]
    assert pacific_atlantic_v2(h) == [[0,4],[1,3],[1,4],[2,2],[3,0],[3,1],[4,0]]
    print("All tests passed ✓")
