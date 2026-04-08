"""
Problem: N-Queens
Difficulty: Hard
Topic: Backtracking
LeetCode: #51

Description:
    Place n queens on an n×n chessboard such that no two queens attack each other.
    Return all distinct solutions. Each solution is a board represented as a list
    of strings, '.' = empty, 'Q' = queen.

Examples:
    Input:  n=4
    Output: [[".Q..","...Q","Q...","..Q."],["..Q.","Q...","...Q",".Q.."]]

Constraints:
    - 1 <= n <= 9

Approach (Backtracking):
    Place queens row by row. Track occupied columns, diagonals (r-c), anti-diagonals (r+c).
    For each row, try each column. If safe, place queen and recurse.
    If we fill all n rows, add the board to solutions.

    Safety check O(1) using sets:
    - col in cols
    - (row-col) in diag
    - (row+col) in anti_diag

Time Complexity:  O(n!)
Space Complexity: O(n²)
"""

def solve_n_queens(n):
    result = []
    cols = set(); diag = set(); anti = set()
    board = [['.']*n for _ in range(n)]

    def backtrack(row):
        if row == n:
            result.append(["".join(r) for r in board])
            return
        for col in range(n):
            if col in cols or (row-col) in diag or (row+col) in anti:
                continue
            cols.add(col); diag.add(row-col); anti.add(row+col)
            board[row][col] = 'Q'
            backtrack(row + 1)
            cols.discard(col); diag.discard(row-col); anti.discard(row+col)
            board[row][col] = '.'

    backtrack(0)
    return result

if __name__ == "__main__":
    r4 = solve_n_queens(4)
    assert len(r4) == 2
    r1 = solve_n_queens(1)
    assert r1 == [["Q"]]
    r8 = solve_n_queens(8)
    assert len(r8) == 92
    print("All tests passed ✓")
