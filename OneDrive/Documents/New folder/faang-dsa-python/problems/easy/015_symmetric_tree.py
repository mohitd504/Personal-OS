"""
Problem: Symmetric Tree
Difficulty: Easy
Topic: Trees / DFS / BFS
LeetCode: #101

Description:
    Given the root of a binary tree, check whether it is a mirror of itself
    (symmetric around its center).

Examples:
    Input:      1           Output: True
               / \
              2   2
             / \ / \
            3  4 4  3

    Input:      1           Output: False
               / \
              2   2
               \   \
               3    3

Constraints:
    - Number of nodes: [1, 1000]
    - -100 <= Node.val <= 100

Approach:
    Two nodes are mirrors if:
    1. Both are None (symmetric base case)
    2. Both have same value AND
       left.left mirrors right.right AND
       left.right mirrors right.left

Time Complexity:  O(n)
Space Complexity: O(h)
"""

class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val=val; self.left=left; self.right=right

def is_symmetric(root):
    def is_mirror(L, R):
        if not L and not R: return True
        if not L or not R:  return False
        return (L.val == R.val and
                is_mirror(L.left, R.right) and
                is_mirror(L.right, R.left))
    return is_mirror(root.left, root.right)

if __name__ == "__main__":
    # Symmetric
    root = TreeNode(1, TreeNode(2,TreeNode(3),TreeNode(4)), TreeNode(2,TreeNode(4),TreeNode(3)))
    assert is_symmetric(root) == True
    # Asymmetric
    root2 = TreeNode(1, TreeNode(2,None,TreeNode(3)), TreeNode(2,None,TreeNode(3)))
    assert is_symmetric(root2) == False
    print("All tests passed ✓")
