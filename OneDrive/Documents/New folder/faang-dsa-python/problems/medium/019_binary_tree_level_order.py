"""
Problem: Binary Tree Level Order Traversal
Difficulty: Medium
Topic: Trees / BFS
LeetCode: #102

Description:
    Return the level order traversal of a binary tree's node values
    as a list of lists (left to right, level by level).

Examples:
    Input:      3
               / \
              9  20
                /  \
               15   7
    Output: [[3],[9,20],[15,7]]

Constraints:
    - [0, 2000] nodes
    - -1000 <= Node.val <= 1000

Approach:
    BFS with a queue. Process one level at a time.
    At the start of each iteration, snapshot the current queue size —
    that's how many nodes belong to the current level.

Time Complexity:  O(n)
Space Complexity: O(w) where w = maximum width of tree
"""

from collections import deque

class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val=val; self.left=left; self.right=right

def level_order(root):
    if not root: return []
    result, q = [], deque([root])
    while q:
        level = []
        for _ in range(len(q)):
            node = q.popleft()
            level.append(node.val)
            if node.left:  q.append(node.left)
            if node.right: q.append(node.right)
        result.append(level)
    return result

if __name__ == "__main__":
    root = TreeNode(3, TreeNode(9), TreeNode(20, TreeNode(15), TreeNode(7)))
    assert level_order(root) == [[3],[9,20],[15,7]]
    assert level_order(None) == []
    print("All tests passed ✓")
