"""
Problem: Binary Tree Maximum Path Sum
Difficulty: Hard
Topic: Trees / DFS / DP on Trees
LeetCode: #124

Description:
    Given the root of a binary tree, return the maximum path sum of any
    non-empty path. A path is a sequence of nodes with edges between them.
    A node can appear at most once. Path does not need to pass through root.

Examples:
    Input:  [-10,9,20,null,null,15,7]
    Output: 42   (path: 15→20→7)

    Input:  [1,2,3]
    Output: 6    (path: 2→1→3)

Approach:
    DFS returning "max gain" = max contribution of this subtree to parent.
    At each node: path through this node = left_gain + node.val + right_gain
    Update global max with this value.
    Return to parent: node.val + max(left_gain, right_gain, 0)

Time Complexity:  O(n)
Space Complexity: O(h)
"""

class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val=val; self.left=left; self.right=right

def max_path_sum(root):
    best = [float('-inf')]
    def gain(node):
        if not node: return 0
        L = max(gain(node.left), 0)
        R = max(gain(node.right), 0)
        best[0] = max(best[0], node.val + L + R)
        return node.val + max(L, R)
    gain(root)
    return best[0]

if __name__ == "__main__":
    r1 = TreeNode(-10,TreeNode(9),TreeNode(20,TreeNode(15),TreeNode(7)))
    assert max_path_sum(r1) == 42
    r2 = TreeNode(1,TreeNode(2),TreeNode(3))
    assert max_path_sum(r2) == 6
    assert max_path_sum(TreeNode(-3)) == -3
    print("All tests passed ✓")
