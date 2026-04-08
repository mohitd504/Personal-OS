"""
Problem: Same Tree
Difficulty: Easy
Topic: Trees / DFS
LeetCode: #100

Description:
    Given the roots of two binary trees p and q, check if they are the same.
    Two trees are the same if they are structurally identical AND have the
    same node values.

Examples:
    Input:  p=[1,2,3], q=[1,2,3]   → True
    Input:  p=[1,2],   q=[1,null,2] → False
    Input:  p=[1,2,1], q=[1,1,2]   → False

Constraints:
    - Number of nodes: [0, 100]
    - -10^4 <= Node.val <= 10^4

Approach:
    Recursively check: both None → same, one None → different,
    values differ → different, else recurse on left and right.

Time Complexity:  O(n)
Space Complexity: O(h)
"""

class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val=val; self.left=left; self.right=right

def is_same_tree(p, q):
    if not p and not q: return True
    if not p or not q:  return False
    if p.val != q.val:  return False
    return is_same_tree(p.left, q.left) and is_same_tree(p.right, q.right)

if __name__ == "__main__":
    def mk(v,l=None,r=None): return TreeNode(v,l,r)
    assert is_same_tree(mk(1,mk(2),mk(3)), mk(1,mk(2),mk(3))) == True
    assert is_same_tree(mk(1,mk(2)),       mk(1,None,mk(2)))  == False
    assert is_same_tree(None, None)                            == True
    print("All tests passed ✓")
