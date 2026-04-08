"""
Problem: Kth Smallest Element in a BST
Difficulty: Medium
Topic: Trees / Inorder DFS
LeetCode: #230

Description:
    Given the root of a BST and integer k, return the kth smallest value
    (1-indexed) among all node values.

Examples:
    Input:  root=[3,1,4,null,2], k=1   Output: 1
    Input:  root=[5,3,6,2,4,null,null,1], k=3   Output: 3

Constraints:
    - 1 <= k <= n <= 10^4
    - 0 <= Node.val <= 10^4

Approach:
    Inorder traversal of BST gives sorted order.
    Stop at the kth visited node.

    BST inorder is always sorted: 1 ≤ 2 ≤ 3 ≤ 4 ≤ 5...
    Use iterative inorder to avoid full traversal.

Time Complexity:  O(h + k) where h = tree height
Space Complexity: O(h)
"""

class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val=val; self.left=left; self.right=right

def kth_smallest(root, k):
    stack, curr = [], root
    while stack or curr:
        while curr:
            stack.append(curr)
            curr = curr.left
        curr = stack.pop()
        k -= 1
        if k == 0: return curr.val
        curr = curr.right
    return -1

if __name__ == "__main__":
    # [3,1,4,null,2]
    r = TreeNode(3, TreeNode(1, None, TreeNode(2)), TreeNode(4))
    assert kth_smallest(r, 1) == 1
    assert kth_smallest(r, 2) == 2
    assert kth_smallest(r, 3) == 3
    print("All tests passed ✓")
