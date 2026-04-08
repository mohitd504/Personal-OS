"""
Problem: Word Search II
Difficulty: Hard
Topic: Trie / Backtracking / DFS
LeetCode: #212

Description:
    Given an m×n board of characters and a list of words, return all words
    found on the board. Words are formed by sequentially adjacent cells.

Examples:
    Input:  board=[["o","a","a","n"],["e","t","a","e"],["i","h","k","r"],["i","f","l","v"]],
            words=["oath","pea","eat","rain"]
    Output: ["eat","oath"]

Constraints:
    - 1 <= m, n <= 12
    - 1 <= words.length <= 3*10^4

Approach:
    Build a Trie from all words.
    DFS from each cell. Prune branches not in Trie.
    When a complete word is found, add to result.
    Remove found words from Trie to avoid duplicates.

Time Complexity:  O(M*(4*3^(L-1))) where M=cells, L=max word length
Space Complexity: O(N*L) for Trie
"""

class TrieNode:
    def __init__(self):
        self.children = {}
        self.word = None

def find_words(board, words):
    root = TrieNode()
    for w in words:
        node = root
        for ch in w:
            if ch not in node.children:
                node.children[ch] = TrieNode()
            node = node.children[ch]
        node.word = w

    rows, cols = len(board), len(board[0])
    result = []
    DIRS = [(0,1),(0,-1),(1,0),(-1,0)]

    def dfs(r, c, node):
        ch = board[r][c]
        if ch not in node.children: return
        nxt = node.children[ch]
        if nxt.word:
            result.append(nxt.word)
            nxt.word = None   # avoid duplicates
        board[r][c] = '#'
        for dr, dc in DIRS:
            nr, nc = r+dr, c+dc
            if 0<=nr<rows and 0<=nc<cols and board[nr][nc]!='#':
                dfs(nr, nc, nxt)
        board[r][c] = ch
        if not nxt.children:          # pruning
            del node.children[ch]

    for r in range(rows):
        for c in range(cols):
            dfs(r, c, root)
    return result

if __name__ == "__main__":
    b=[["o","a","a","n"],["e","t","a","e"],["i","h","k","r"],["i","f","l","v"]]
    r = sorted(find_words([row[:] for row in b],["oath","pea","eat","rain"]))
    assert r == ["eat","oath"]
    print("All tests passed ✓")
