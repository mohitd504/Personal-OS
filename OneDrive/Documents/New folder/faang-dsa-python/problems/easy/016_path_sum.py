"""
Problem: Path Sum
Difficulty: Easy
Topic: Trees / DFS
LeetCode: #112

Description:
    Given the root of a binary tree and an integer targetSum, return true
    if there is a root-to-leaf path such that the sum of all values equals
    targetSum.

Examples:
    Input:  targetSum=22
            5
           / \
          4   8
         /   / \
        11  13  4
       /  \      \
      7    2      1
    Path: 5→4→11→2 = 22 → True

    Input:  root=[1,2,3], targetSum=5  → False

Constraints:
    - Number of nodes: [0, 5000]
    - -1000 <= Node.val <= 1000
    - -1000 <= targetSum <= 1000

Approach:
    DFS: at each node, subtract node value from target.
    At a leaf, check if remaining == 0.

Time Complexity:  O(n)
Space Complexity: O(h)
"""

class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val=val; self.left=left; self.right=right

def has_path_sum(root, target):
    if not root: return False
    target -= root.val
    if not root.left and not root.right:   # leaf node
        return target == 0
    return has_path_sum(root.left, target) or has_path_sum(root.right, target)

if __name__ == "__main__":
    root = TreeNode(5, TreeNode(4, TreeNode(11, TreeNode(7), TreeNode(2))),
                       TreeNode(8, TreeNode(13), TreeNode(4, None, TreeNode(1))))
    assert has_path_sum(root, 22) == True
    assert has_path_sum(root, 27) == False
    assert has_path_sum(None, 0)  == False
    print("All tests passed ✓")
