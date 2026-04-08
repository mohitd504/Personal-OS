"""
Problem: Validate Binary Search Tree
Difficulty: Medium
Topic: Trees / DFS
LeetCode: #98

Description:
    Given the root of a binary tree, determine if it is a valid BST.
    A BST requires: left subtree < root, right subtree > root, recursively.

Examples:
    Input:   2          Output: True
            / \
           1   3

    Input:   5          Output: False (3 is in right subtree of 5 but 3<5)
            / \
           1   4
              / \
             3   6

Constraints:
    - [1, 10^4] nodes
    - -2^31 <= Node.val <= 2^31 - 1

Approach:
    Pass valid range (lo, hi) through recursion.
    At each node, value must be strictly in (lo, hi).
    Left child: range becomes (lo, node.val)
    Right child: range becomes (node.val, hi)

Time Complexity:  O(n)
Space Complexity: O(h)
"""

class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val=val; self.left=left; self.right=right

def is_valid_bst(root):
    def validate(node, lo, hi):
        if not node: return True
        if not (lo < node.val < hi): return False
        return (validate(node.left, lo, node.val) and
                validate(node.right, node.val, hi))
    return validate(root, float('-inf'), float('inf'))

if __name__ == "__main__":
    r1 = TreeNode(2, TreeNode(1), TreeNode(3))
    assert is_valid_bst(r1) == True
    r2 = TreeNode(5, TreeNode(1), TreeNode(4, TreeNode(3), TreeNode(6)))
    assert is_valid_bst(r2) == False
    print("All tests passed ✓")
