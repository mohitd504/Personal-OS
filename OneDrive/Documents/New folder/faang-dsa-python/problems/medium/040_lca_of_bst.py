"""
Problem: Lowest Common Ancestor of a Binary Search Tree
Difficulty: Medium
Topic: Trees / BST Property
LeetCode: #235

Description:
    Given a BST, find the LCA of two nodes p and q.
    LCA is the deepest node that is an ancestor of both.

Examples:
    BST: [6,2,8,0,4,7,9,null,null,3,5]
    p=2, q=8 → LCA=6
    p=2, q=4 → LCA=2

Constraints:
    - 2 to 10^5 nodes.
    - All values unique.

Approach:
    Use BST property: if both p and q are < root, LCA is in left subtree.
    If both > root, LCA is in right subtree.
    Otherwise, root is the LCA (split point).

    This is O(h) vs O(n) for general binary tree.

Time Complexity:  O(h) where h = height
Space Complexity: O(1) iterative
"""

class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val=val; self.left=left; self.right=right

def lca_bst(root, p, q):
    """Iterative O(h) O(1) solution using BST property."""
    while root:
        if p.val < root.val and q.val < root.val:
            root = root.left
        elif p.val > root.val and q.val > root.val:
            root = root.right
        else:
            return root
    return None

if __name__ == "__main__":
    # Build [6,2,8,0,4,7,9]
    root = TreeNode(6, TreeNode(2,TreeNode(0),TreeNode(4,TreeNode(3),TreeNode(5))),
                       TreeNode(8,TreeNode(7),TreeNode(9)))
    p, q = root.left, root.right   # 2, 8
    assert lca_bst(root, p, q).val == 6
    p2, q2 = root.left, root.left.right  # 2, 4
    assert lca_bst(root, p2, q2).val == 2
    print("All tests passed ✓")
