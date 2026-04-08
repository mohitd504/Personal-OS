"""
Problem: Trapping Rain Water II
Difficulty: Hard
Topic: Graphs / Min-Heap / BFS
LeetCode: #407

Description:
    Given an m×n matrix of heights, compute how much water it can trap.

Examples:
    Input:  [[1,4,3,1,3,2],[3,2,1,3,2,4],[2,3,3,2,3,1]]
    Output: 4

Approach (Min-Heap BFS from boundary):
    Water level at any interior cell is bounded by minimum boundary height.
    Use min-heap initialized with all boundary cells.
    Process cells in order of height; water = max(0, current_level - cell_height).
    Push neighbors with level = max(current_level, neighbor_height).

Time: O(mn log(mn))   Space: O(mn)
"""

import heapq

def trap_rain_water(heightMap):
    if not heightMap or len(heightMap)<3 or len(heightMap[0])<3: return 0
    rows,cols = len(heightMap),len(heightMap[0])
    visited = [[False]*cols for _ in range(rows)]
    heap = []
    for r in range(rows):
        for c in [0,cols-1]:
            heapq.heappush(heap,(heightMap[r][c],r,c)); visited[r][c]=True
    for c in range(cols):
        for r in [0,rows-1]:
            if not visited[r][c]:
                heapq.heappush(heap,(heightMap[r][c],r,c)); visited[r][c]=True
    water = 0
    DIRS=[(0,1),(0,-1),(1,0),(-1,0)]
    while heap:
        level,r,c = heapq.heappop(heap)
        for dr,dc in DIRS:
            nr,nc=r+dr,c+dc
            if 0<=nr<rows and 0<=nc<cols and not visited[nr][nc]:
                visited[nr][nc]=True
                water += max(0, level-heightMap[nr][nc])
                heapq.heappush(heap,(max(level,heightMap[nr][nc]),nr,nc))
    return water

if __name__ == "__main__":
    assert trap_rain_water([[1,4,3,1,3,2],[3,2,1,3,2,4],[2,3,3,2,3,1]]) == 4
    assert trap_rain_water([[3,3,3],[3,1,3],[3,3,3]]) == 2
    print("All tests passed ✓")
