"""
Problem: Min Cost to Connect All Points
Difficulty: Hard (Medium-Hard)
Topic: Graphs / Prim's MST
LeetCode: #1584

Description:
    Given points on a plane, connect all with minimum total Manhattan distance.
    Cost(i,j) = |xi-xj| + |yi-yj|.  Return minimum cost to connect all.

Examples:
    Input:  [[0,0],[2,2],[3,10],[5,2],[7,0]]   Output: 20

Approach (Prim's MST with min-heap):
    Start from any node. Greedily add the cheapest edge connecting
    a new node to the existing MST.

Time: O(n² log n)   Space: O(n)
"""

import heapq

def min_cost_connect_points(points):
    n = len(points)
    visited = set()
    heap = [(0, 0)]   # (cost, point_index)
    total = 0
    while len(visited) < n:
        cost, i = heapq.heappop(heap)
        if i in visited: continue
        visited.add(i); total += cost
        for j in range(n):
            if j not in visited:
                dist = abs(points[i][0]-points[j][0]) + abs(points[i][1]-points[j][1])
                heapq.heappush(heap, (dist, j))
    return total

if __name__ == "__main__":
    assert min_cost_connect_points([[0,0],[2,2],[3,10],[5,2],[7,0]]) == 20
    assert min_cost_connect_points([[3,12],[-2,5],[-4,1]]) == 18
    assert min_cost_connect_points([[0,0]]) == 0
    print("All tests passed ✓")
