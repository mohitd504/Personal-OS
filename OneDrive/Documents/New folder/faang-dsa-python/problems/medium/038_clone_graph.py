"""
Problem: Clone Graph
Difficulty: Medium
Topic: Graphs / BFS / DFS / Hashing
LeetCode: #133

Description:
    Given a reference of a node in a connected undirected graph, return
    a deep copy (clone) of the graph.

Examples:
    Input:  adjList = [[2,4],[1,3],[2,4],[1,3]]
    Output: deep copy of the same graph

Constraints:
    - 1 <= Node.val <= 100
    - No repeated edges or self-loops.

Approach (BFS with HashMap):
    Use a dict {original_node: cloned_node}.
    BFS from start: for each node, clone it, add its neighbors to queue.

Time Complexity:  O(V+E)
Space Complexity: O(V)
"""

class Node:
    def __init__(self, val=0, neighbors=None):
        self.val = val
        self.neighbors = neighbors if neighbors else []

def clone_graph(node):
    if not node: return None
    from collections import deque
    clones = {node: Node(node.val)}
    q = deque([node])
    while q:
        curr = q.popleft()
        for nei in curr.neighbors:
            if nei not in clones:
                clones[nei] = Node(nei.val)
                q.append(nei)
            clones[curr].neighbors.append(clones[nei])
    return clones[node]

if __name__ == "__main__":
    # Build: 1--2--3--4--1 (cycle)
    n1,n2,n3,n4 = Node(1),Node(2),Node(3),Node(4)
    n1.neighbors=[n2,n4]; n2.neighbors=[n1,n3]
    n3.neighbors=[n2,n4]; n4.neighbors=[n1,n3]
    clone = clone_graph(n1)
    assert clone is not n1
    assert clone.val == 1
    assert len(clone.neighbors) == 2
    print("All tests passed ✓")
