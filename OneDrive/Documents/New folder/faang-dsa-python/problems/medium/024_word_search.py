"""
Problem: Word Search
Difficulty: Medium
Topic: Graphs / Matrix DFS / Backtracking
LeetCode: #79

Description:
    Given an m×n board of characters and a string word, return true if
    word exists in the grid. Word must be formed by sequentially adjacent
    cells (horizontally/vertically). No cell used more than once.

Examples:
    Input:  board=[["A","B","C","E"],["S","F","C","S"],["A","D","E","E"]]
            word="ABCCED"   Output: True
    Input:  word="SEE"      Output: True
    Input:  word="ABCB"     Output: False

Constraints:
    - 1 <= m, n <= 6
    - 1 <= word.length <= 15
    - board and word consist of uppercase letters.

Approach:
    DFS + Backtracking from each cell.
    Mark current cell as visited (temporarily), recurse on neighbors,
    then unmark (backtrack).

Time Complexity:  O(m*n*4^L) where L=word length
Space Complexity: O(L) recursion stack
"""

def exist(board, word):
    rows, cols = len(board), len(board[0])

    def dfs(r, c, idx):
        if idx == len(word): return True
        if r<0 or r>=rows or c<0 or c>=cols: return False
        if board[r][c] != word[idx]: return False
        tmp = board[r][c]
        board[r][c] = '#'   # mark visited
        found = any(dfs(r+dr, c+dc, idx+1) for dr,dc in [(0,1),(0,-1),(1,0),(-1,0)])
        board[r][c] = tmp   # restore (backtrack)
        return found

    return any(dfs(r, c, 0) for r in range(rows) for c in range(cols))

if __name__ == "__main__":
    b=[["A","B","C","E"],["S","F","C","S"],["A","D","E","E"]]
    assert exist([r[:] for r in b], "ABCCED") == True
    assert exist([r[:] for r in b], "SEE")    == True
    assert exist([r[:] for r in b], "ABCB")   == False
    print("All tests passed ✓")
