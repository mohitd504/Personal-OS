"""
Problem: Invert Binary Tree
Difficulty: Easy
Topic: Trees / DFS
LeetCode: #226

Description:
    Given the root of a binary tree, invert it (mirror it) and return the root.

Examples:
    Input:       4             Output:      4
                / \                        / \
               2   7                      7   2
              / \ / \                    / \ / \
             1  3 6  9                  9  6 3  1

Constraints:
    - Number of nodes: [0, 100]
    - -100 <= Node.val <= 100

Approach:
    Recursively swap left and right children at every node.
    Post-order: invert left subtree, invert right subtree, then swap.

    invert(4):
      left  = invert(2) → swap 1,3 → becomes subtree (2, right=1, left=3)
      right = invert(7) → swap 6,9 → becomes subtree (7, right=6, left=9)
      swap children → 4's left=inverted(7), right=inverted(2)

Time Complexity:  O(n) — every node visited once
Space Complexity: O(h) — recursion stack (h = tree height)
"""

class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val=val; self.left=left; self.right=right

def invert_tree(root):
    if not root: return None
    root.left, root.right = invert_tree(root.right), invert_tree(root.left)
    return root

def inorder(root):
    if not root: return []
    return inorder(root.left) + [root.val] + inorder(root.right)

if __name__ == "__main__":
    root = TreeNode(4, TreeNode(2,TreeNode(1),TreeNode(3)), TreeNode(7,TreeNode(6),TreeNode(9)))
    assert inorder(invert_tree(root)) == [9,7,6,4,3,2,1]
    assert invert_tree(None) is None
    print("All tests passed ✓")
