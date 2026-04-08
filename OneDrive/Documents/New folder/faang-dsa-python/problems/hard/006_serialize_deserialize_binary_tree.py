"""
Problem: Serialize and Deserialize Binary Tree
Difficulty: Hard
Topic: Trees / DFS / Design
LeetCode: #297

Description:
    Design an algorithm to serialize and deserialize a binary tree.
    Serialization: tree → string. Deserialization: string → tree.
    There is no restriction on your format.

Examples:
    Input:  root = [1,2,3,null,null,4,5]
    Output: [1,2,3,null,null,4,5]  (same tree after serialize→deserialize)

Approach (Preorder DFS):
    Serialize: preorder traversal, 'N' for null, comma-separated.
    Deserialize: iterate through values, build tree recursively.

    Tree:      1
              / \
             2   3
                / \
               4   5
    Serialized: "1,2,N,N,3,4,N,N,5,N,N"

Time Complexity:  O(n)
Space Complexity: O(n)
"""

class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val=val; self.left=left; self.right=right

class Codec:
    def serialize(self, root):
        if not root: return "N"
        return f"{root.val},{self.serialize(root.left)},{self.serialize(root.right)}"

    def deserialize(self, data):
        vals = iter(data.split(","))
        def build():
            v = next(vals)
            if v == "N": return None
            node = TreeNode(int(v))
            node.left  = build()
            node.right = build()
            return node
        return build()

def inorder(root):
    return inorder(root.left)+[root.val]+inorder(root.right) if root else []

if __name__ == "__main__":
    codec = Codec()
    root = TreeNode(1, TreeNode(2), TreeNode(3, TreeNode(4), TreeNode(5)))
    assert inorder(codec.deserialize(codec.serialize(root))) == inorder(root)
    assert codec.deserialize(codec.serialize(None)) is None
    print("All tests passed ✓")
