"""
Problem: Construct Binary Search Tree from Preorder Traversal
Difficulty: Medium
Topic: Trees / Recursion
LeetCode: #1008

Description:
    Given an array that represents the preorder traversal of a BST,
    construct the BST and return its root.

Examples:
    Input:  preorder = [8,5,1,7,10,12]
    Output: BST with root 8

Constraints:
    - 1 <= preorder.length <= 100
    - Values are distinct.

Approach (Recursion with bounds):
    In preorder, first element is always the root.
    Left subtree: elements < root (while they are < root)
    Right subtree: elements >= root

    Use bound-based recursion: build(lower, upper) consumes elements
    that fall within (lower, upper).

Time Complexity:  O(n)
Space Complexity: O(h)
"""

class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val=val; self.left=left; self.right=right

def bst_from_preorder(preorder):
    idx = [0]
    def build(lo, hi):
        if idx[0] >= len(preorder): return None
        val = preorder[idx[0]]
        if not (lo < val < hi): return None
        idx[0] += 1
        node = TreeNode(val)
        node.left  = build(lo, val)
        node.right = build(val, hi)
        return node
    return build(float('-inf'), float('inf'))

def inorder(root):
    if not root: return []
    return inorder(root.left) + [root.val] + inorder(root.right)

if __name__ == "__main__":
    root = bst_from_preorder([8,5,1,7,10,12])
    assert inorder(root) == [1,5,7,8,10,12]
    root2 = bst_from_preorder([1,3])
    assert inorder(root2) == [1,3]
    print("All tests passed ✓")
