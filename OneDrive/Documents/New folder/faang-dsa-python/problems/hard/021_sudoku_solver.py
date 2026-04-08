"""
Problem: Sudoku Solver
Difficulty: Hard
Topic: Backtracking
LeetCode: #37

Description:
    Solve a Sudoku puzzle by filling empty cells ('.').
    Rules: each row, column, and 3x3 box contains digits 1-9 exactly once.

Examples:
    Input board (9x9 with '.' for empty) → solved in-place.

Approach:
    Backtracking: find empty cell, try digits 1-9.
    Validity check using three sets: rows, cols, boxes.
    Box index = (row//3)*3 + col//3

Time: O(9^m) where m = empty cells   Space: O(81)
"""

def solve_sudoku(board):
    rows  = [set() for _ in range(9)]
    cols  = [set() for _ in range(9)]
    boxes = [set() for _ in range(9)]
    empty = []
    for r in range(9):
        for c in range(9):
            if board[r][c] != '.':
                d = board[r][c]
                rows[r].add(d); cols[c].add(d); boxes[(r//3)*3+c//3].add(d)
            else:
                empty.append((r,c))
    def bt(idx):
        if idx == len(empty): return True
        r, c = empty[idx]
        b = (r//3)*3+c//3
        for d in "123456789":
            if d not in rows[r] and d not in cols[c] and d not in boxes[b]:
                board[r][c] = d
                rows[r].add(d); cols[c].add(d); boxes[b].add(d)
                if bt(idx+1): return True
                board[r][c] = '.'
                rows[r].discard(d); cols[c].discard(d); boxes[b].discard(d)
        return False
    bt(0)

if __name__ == "__main__":
    b=[["5","3",".",".","7",".",".",".","."],
       ["6",".",".","1","9","5",".",".","."],
       [".","9","8",".",".",".",".","6","."],
       ["8",".",".",".","6",".",".",".","3"],
       ["4",".",".","8",".","3",".",".","1"],
       ["7",".",".",".","2",".",".",".","6"],
       [".","6",".",".",".",".","2","8","."],
       [".",".",".","4","1","9",".",".","5"],
       [".",".",".",".","8",".",".","7","9"]]
    solve_sudoku(b)
    assert b[0][2]=="4" and b[1][2]=="3"
    print("All tests passed ✓")
