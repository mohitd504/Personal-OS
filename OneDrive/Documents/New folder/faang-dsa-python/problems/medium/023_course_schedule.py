"""
Problem: Course Schedule
Difficulty: Medium
Topic: Graphs / Topological Sort / Cycle Detection
LeetCode: #207

Description:
    There are numCourses courses (0 to n-1). Given prerequisites[][],
    where prerequisites[i]=[a,b] means you must take course b before a,
    determine if it's possible to finish all courses.

Examples:
    Input:  numCourses=2, prerequisites=[[1,0]]   Output: True
    Input:  numCourses=2, prerequisites=[[1,0],[0,1]] Output: False (cycle)

Constraints:
    - 1 <= numCourses <= 2000
    - 0 <= prerequisites.length <= 5000

Approach (DFS Cycle Detection):
    Build directed graph. DFS with 3 states:
    0=unvisited, 1=visiting (in current path), 2=visited (done).
    If we reach a node with state 1 → cycle → return False.

Approach 2 (Kahn's BFS):
    If topological sort completes (processes all nodes), no cycle.

Time Complexity:  O(V+E)
Space Complexity: O(V+E)
"""

from collections import defaultdict, deque

def can_finish(numCourses, prerequisites):
    adj = defaultdict(list)
    in_deg = [0] * numCourses
    for a, b in prerequisites:
        adj[b].append(a)
        in_deg[a] += 1
    q = deque([i for i in range(numCourses) if in_deg[i] == 0])
    processed = 0
    while q:
        node = q.popleft(); processed += 1
        for nei in adj[node]:
            in_deg[nei] -= 1
            if in_deg[nei] == 0: q.append(nei)
    return processed == numCourses

if __name__ == "__main__":
    assert can_finish(2, [[1,0]])        == True
    assert can_finish(2, [[1,0],[0,1]])  == False
    assert can_finish(5, [[1,0],[2,1],[3,2],[4,3]]) == True
    print("All tests passed ✓")
