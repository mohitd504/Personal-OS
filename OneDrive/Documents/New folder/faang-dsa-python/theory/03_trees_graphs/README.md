# 📘 Theory: Trees & Graphs

---

## 1. Tree Fundamentals

A **tree** is a connected acyclic graph with a designated root node.
Every node (except root) has exactly one parent.

```
         1          ← root (depth 0)
        / \
       2   3        ← depth 1
      / \   \
     4   5   6      ← depth 2  (leaves: 4, 5, 6)
```

**Key Terms**:
- **Height**: longest path from node to leaf
- **Depth**: distance from root to node
- **Degree**: number of children
- **Leaf**: node with no children
- **Height of tree** = height of root

```python
class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right
```

---

## 2. Binary Tree Traversals

### DFS Traversals (Recursive)

```
Tree:     1
         / \
        2   3
       / \
      4   5

Inorder   (L→Root→R): [4, 2, 5, 1, 3]
Preorder  (Root→L→R): [1, 2, 4, 5, 3]  ← good for serialization
Postorder (L→R→Root): [4, 5, 2, 3, 1]  ← good for deletion
```

```python
def inorder(root):      # O(n)
    return inorder(root.left) + [root.val] + inorder(root.right) if root else []

def preorder(root):
    return [root.val] + preorder(root.left) + preorder(root.right) if root else []

def postorder(root):
    return postorder(root.left) + postorder(root.right) + [root.val] if root else []
```

### Iterative Inorder (Interview Favorite)
```python
def inorder_iter(root):
    result, stack, curr = [], [], root
    while curr or stack:
        while curr: stack.append(curr); curr = curr.left
        curr = stack.pop()
        result.append(curr.val)
        curr = curr.right
    return result
# Time: O(n)  Space: O(h)
```

### BFS — Level Order Traversal
```
Queue approach — process level by level:
Level 0: [1]
Level 1: [2, 3]
Level 2: [4, 5]
```

```python
from collections import deque
def level_order(root):
    if not root: return []
    result, queue = [], deque([root])
    while queue:
        level = []
        for _ in range(len(queue)):   # process entire level
            node = queue.popleft()
            level.append(node.val)
            if node.left:  queue.append(node.left)
            if node.right: queue.append(node.right)
        result.append(level)
    return result
# Time: O(n)  Space: O(w) — w = max width
```

---

## 3. Binary Tree — Essential Algorithms

### Height & Balance
```python
def height(root):       # O(n)
    if not root: return 0
    return 1 + max(height(root.left), height(root.right))

def is_balanced(root):  # O(n) — check height and balance in one pass
    def dfs(node):      # returns -1 if unbalanced, else height
        if not node: return 0
        L = dfs(node.left);  if L == -1: return -1
        R = dfs(node.right); if R == -1: return -1
        return -1 if abs(L - R) > 1 else 1 + max(L, R)
    return dfs(root) != -1
```

### Lowest Common Ancestor (LCA)
```
Tree:   3
       / \
      5   1
     / \ / \
    6  2 0  8
      / \
     7   4

LCA(5, 1) = 3
LCA(5, 4) = 5  (5 is ancestor of 4)
LCA(6, 4) = 5
```

```python
def lca(root, p, q):   # O(n)
    if not root or root == p or root == q: return root
    L = lca(root.left, p, q)
    R = lca(root.right, p, q)
    return root if L and R else L or R
```

### Diameter of Binary Tree
```
Diameter = longest path between ANY two nodes (may not pass through root)

        1
       / \
      2   3
     / \
    4   5

Diameter = 3 (path: 4→2→5 or 4→2→1→3)
```

```python
def diameter(root):    # O(n)
    best = [0]
    def depth(node):
        if not node: return 0
        L, R = depth(node.left), depth(node.right)
        best[0] = max(best[0], L + R)
        return 1 + max(L, R)
    depth(root)
    return best[0]
```

### Serialize & Deserialize
```python
def serialize(root):       # preorder with "null" markers
    if not root: return "N"
    return f"{root.val},{serialize(root.left)},{serialize(root.right)}"

def deserialize(data):
    vals = iter(data.split(","))
    def build():
        v = next(vals)
        if v == "N": return None
        node = TreeNode(int(v))
        node.left = build(); node.right = build()
        return node
    return build()
# Time: O(n)  Space: O(n)
```

---

## 4. Binary Search Tree (BST)

In a BST: **all left descendants < node < all right descendants**.

```
       8
      / \
     3   10
    / \    \
   1   6   14
      / \  /
     4   7 13

Inorder traversal always gives sorted order: [1,3,4,6,7,8,10,13,14]
```

### BST Operations
```python
def search(root, val):   # O(h)
    while root:
        if val == root.val: return root
        root = root.left if val < root.val else root.right
    return None

def insert(root, val):   # O(h)
    if not root: return TreeNode(val)
    if val < root.val:   root.left  = insert(root.left, val)
    elif val > root.val: root.right = insert(root.right, val)
    return root

def delete(root, val):   # O(h)
    if not root: return None
    if val < root.val:   root.left  = delete(root.left, val)
    elif val > root.val: root.right = delete(root.right, val)
    else:
        if not root.left:  return root.right
        if not root.right: return root.left
        # Replace with inorder successor (min of right subtree)
        succ = root.right
        while succ.left: succ = succ.left
        root.val = succ.val
        root.right = delete(root.right, succ.val)
    return root
```

### Validate BST
```python
def is_valid_bst(root, lo=float('-inf'), hi=float('inf')):
    if not root: return True
    if not (lo < root.val < hi): return False
    return (is_valid_bst(root.left, lo, root.val) and
            is_valid_bst(root.right, root.val, hi))
```

### Kth Smallest — Inorder
```python
def kth_smallest(root, k):
    stack, curr = [], root
    while stack or curr:
        while curr: stack.append(curr); curr = curr.left
        curr = stack.pop(); k -= 1
        if k == 0: return curr.val
        curr = curr.right
```

---

## 5. Trie (Prefix Tree)

Efficient for string prefix operations. Each node has up to 26 children (alphabet).

```
Insert: "apple", "app", "apt"

root
 └─'a'
    └─'p'
       ├─'p' [END]
       │   └─'l'
       │      └─'e' [END]
       └─'t' [END]
```

```python
class TrieNode:
    def __init__(self):
        self.children = {}
        self.end = False

class Trie:
    def __init__(self): self.root = TrieNode()

    def insert(self, word):       # O(m)
        node = self.root
        for ch in word:
            if ch not in node.children:
                node.children[ch] = TrieNode()
            node = node.children[ch]
        node.end = True

    def search(self, word):       # O(m)
        node = self.root
        for ch in word:
            if ch not in node.children: return False
            node = node.children[ch]
        return node.end

    def starts_with(self, prefix): # O(m)
        node = self.root
        for ch in prefix:
            if ch not in node.children: return False
            node = node.children[ch]
        return True
```

---

## 6. Graph Representations

### Adjacency List (most common)
```
Graph:  0 ─ 1 ─ 3
        |   |
        2   4

adj = {
  0: [1, 2],
  1: [0, 3, 4],
  2: [0],
  3: [1],
  4: [1]
}
```

```python
from collections import defaultdict
graph = defaultdict(list)
for u, v in edges:
    graph[u].append(v)
    graph[v].append(u)  # undirected
```

### Adjacency Matrix
```python
n = 5
matrix = [[0]*n for _ in range(n)]
matrix[u][v] = 1  # edge u→v
# Space: O(n²)  Edge lookup: O(1)
```

---

## 7. Graph BFS

Shortest path (unweighted), level-by-level exploration.

```
Graph: 0─1─3
       |
       2─4

BFS(0): Queue[0] → visit 0 → enqueue 1,2
        Queue[1,2] → visit 1 → enqueue 3
                   → visit 2 → enqueue 4
        Queue[3,4] → visit all
Distances from 0: {0:0, 1:1, 2:1, 3:2, 4:2}
```

```python
def bfs(graph, start):
    from collections import deque
    dist = {start: 0}
    queue = deque([start])
    while queue:
        node = queue.popleft()
        for neighbor in graph[node]:
            if neighbor not in dist:
                dist[neighbor] = dist[node] + 1
                queue.append(neighbor)
    return dist
# Time: O(V+E)  Space: O(V)
```

### BFS on Grid
```python
def bfs_grid(grid, start):
    rows, cols = len(grid), len(grid[0])
    queue = deque([start])
    visited = {start}
    DIRS = [(0,1),(0,-1),(1,0),(-1,0)]
    while queue:
        r, c = queue.popleft()
        for dr, dc in DIRS:
            nr, nc = r+dr, c+dc
            if 0<=nr<rows and 0<=nc<cols and (nr,nc) not in visited and grid[nr][nc] != '#':
                visited.add((nr,nc))
                queue.append((nr,nc))
```

---

## 8. Graph DFS

Explore as deep as possible before backtracking. Used for:
cycle detection, connected components, topological sort, path finding.

```python
def dfs(graph, node, visited=None):
    if visited is None: visited = set()
    visited.add(node)
    for neighbor in graph[node]:
        if neighbor not in visited:
            dfs(graph, neighbor, visited)
    return visited

def dfs_iter(graph, start):  # iterative
    visited, stack = set(), [start]
    while stack:
        node = stack.pop()
        if node not in visited:
            visited.add(node)
            stack.extend(graph[node])
```

---

## 9. Topological Sort

**Only for Directed Acyclic Graphs (DAGs)**.
Linear ordering of vertices such that for every edge u→v, u comes before v.

### Kahn's Algorithm (BFS-based)
```
Compute in-degrees. Start with all 0-in-degree nodes.
Graph: 5→2, 5→0, 4→0, 4→1, 2→3, 3→1

in-degree: {0:2, 1:2, 2:1, 3:1, 4:0, 5:0}
Queue: [4, 5]
Process 4 → reduce in-degree of 0,1 → in-degree: {0:1, 1:1, ...}
Process 5 → reduce 2,0 → in-degree: {0:0, 1:1, 2:0,...} → queue: [0,2]
...
Result: [4,5,0,2,3,1] or similar valid ordering
```

```python
from collections import deque
def topo_kahn(n, edges):
    adj = defaultdict(list)
    in_deg = [0] * n
    for u, v in edges:
        adj[u].append(v); in_deg[v] += 1
    q = deque([i for i in range(n) if in_deg[i] == 0])
    order = []
    while q:
        node = q.popleft(); order.append(node)
        for nei in adj[node]:
            in_deg[nei] -= 1
            if in_deg[nei] == 0: q.append(nei)
    return order if len(order) == n else []  # empty = cycle
# Time: O(V+E)  Space: O(V+E)
```

### DFS-based Topological Sort
```python
def topo_dfs(n, edges):
    adj = defaultdict(list)
    for u, v in edges: adj[u].append(v)
    visited, stack = set(), []
    def dfs(node):
        visited.add(node)
        for nei in adj[node]:
            if nei not in visited: dfs(nei)
        stack.append(node)
    for i in range(n):
        if i not in visited: dfs(i)
    return stack[::-1]
```

---

## 10. Union-Find (Disjoint Set Union)

Efficiently answers: "Are nodes X and Y in the same component?"

```
Initially: {0} {1} {2} {3} {4}  (5 separate sets)
union(0,1): {0,1} {2} {3} {4}
union(2,3): {0,1} {2,3} {4}
union(0,2): {0,1,2,3} {4}
find(1)==find(3)? YES ✓
find(1)==find(4)? NO  ✓
```

```python
class UnionFind:
    def __init__(self, n):
        self.parent = list(range(n))
        self.rank = [0] * n
        self.count = n   # number of components

    def find(self, x):   # O(α(n)) ≈ O(1)
        if self.parent[x] != x:
            self.parent[x] = self.find(self.parent[x])  # path compression
        return self.parent[x]

    def union(self, x, y):
        px, py = self.find(x), self.find(y)
        if px == py: return False
        if self.rank[px] < self.rank[py]: px, py = py, px
        self.parent[py] = px
        if self.rank[px] == self.rank[py]: self.rank[px] += 1
        self.count -= 1
        return True

    def connected(self, x, y):
        return self.find(x) == self.find(y)
```

---

## 11. Dijkstra's Shortest Path

Finds shortest path from a source to all nodes in a **weighted graph** (no negative edges).

```
Graph (weighted):
  0 ──4── 1
  |       |
  1       1
  |       |
  2 ──2── 3

dist[0]=0, dist[1]=4→3(via 2), dist[2]=1, dist[3]=3

Algorithm: always process the closest unvisited node.
```

```python
import heapq
def dijkstra(graph, src, n):
    dist = [float('inf')] * n
    dist[src] = 0
    heap = [(0, src)]
    while heap:
        d, u = heapq.heappop(heap)
        if d > dist[u]: continue      # stale entry
        for v, w in graph[u]:
            if dist[u] + w < dist[v]:
                dist[v] = dist[u] + w
                heapq.heappush(heap, (dist[v], v))
    return dist
# Time: O((V+E) log V)  Space: O(V)
```

---

## 12. Key Graph Algorithms Summary

| Algorithm          | Use Case                              | Time          |
|--------------------|---------------------------------------|---------------|
| BFS                | Shortest path (unweighted), levels    | O(V+E)        |
| DFS                | Cycle, connected components, topo     | O(V+E)        |
| Topological Sort   | Task scheduling (DAG)                 | O(V+E)        |
| Union-Find         | Connected components, Kruskal MST     | O(α(n))       |
| Dijkstra           | Shortest path (non-negative weights)  | O((V+E) log V)|
| Bellman-Ford       | Shortest path (negative weights)      | O(V·E)        |
| Floyd-Warshall     | All-pairs shortest path               | O(V³)         |
| Prim / Kruskal     | Minimum Spanning Tree                 | O(E log V)    |

---

## 13. Cycle Detection

### Undirected Graph (DFS)
```python
def has_cycle_undirected(graph, n):
    visited = set()
    def dfs(node, parent):
        visited.add(node)
        for nei in graph[node]:
            if nei not in visited:
                if dfs(nei, node): return True
            elif nei != parent: return True   # back edge = cycle
        return False
    for v in range(n):
        if v not in visited and dfs(v, -1): return True
    return False
```

### Directed Graph (DFS with 3-color)
```
WHITE (0) = unvisited
GRAY  (1) = in current DFS path → back edge to GRAY = cycle!
BLACK (2) = fully processed
```

```python
def has_cycle_directed(graph, n):
    color = [0] * n
    def dfs(node):
        color[node] = 1   # gray
        for nei in graph[node]:
            if color[nei] == 1: return True    # back edge
            if color[nei] == 0 and dfs(nei): return True
        color[node] = 2   # black
        return False
    return any(dfs(i) for i in range(n) if color[i] == 0)
```
