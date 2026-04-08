"""
Problem: Maximum Depth of Binary Tree
Difficulty: Easy
Topic: Trees / DFS
LeetCode: #104

Description:
    Given the root of a binary tree, return its maximum depth.
    Maximum depth = number of nodes along the longest path
    from root to a leaf.

Examples:
    Input:      3
               / \
              9  20
                /  \
               15   7
    Output: 3

    Input:  1 → (no children)   → 2 (right only)
    Output: 2

Constraints:
    - Number of nodes: [0, 10^4]
    - -100 <= Node.val <= 100

Approach (Recursive DFS):
    max_depth(root) = 1 + max(max_depth(left), max_depth(right))
    Base case: None → 0

    Tree:   3
           / \
          9  20
             / \
            15  7

    depth(9)=1, depth(15)=1, depth(7)=1
    depth(20)=1+max(1,1)=2
    depth(3)=1+max(1,2)=3 ✓

Approach (BFS — Level Count):
    Count levels in BFS. Each level = 1 depth.

Time Complexity:  O(n) — visit every node
Space Complexity: O(h) DFS stack / O(w) BFS queue, where h=height, w=max width
"""

class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val=val; self.left=left; self.right=right

def max_depth(root):
    """Recursive DFS."""
    if not root: return 0
    return 1 + max(max_depth(root.left), max_depth(root.right))

def max_depth_bfs(root):
    """BFS — count levels."""
    if not root: return 0
    from collections import deque
    q, depth = deque([root]), 0
    while q:
        depth += 1
        for _ in range(len(q)):
            node = q.popleft()
            if node.left:  q.append(node.left)
            if node.right: q.append(node.right)
    return depth

if __name__ == "__main__":
    # Build tree: [3,9,20,None,None,15,7]
    root = TreeNode(3, TreeNode(9), TreeNode(20, TreeNode(15), TreeNode(7)))
    assert max_depth(root)     == 3
    assert max_depth_bfs(root) == 3
    assert max_depth(None)     == 0
    assert max_depth(TreeNode(1)) == 1
    print("All tests passed ✓")
