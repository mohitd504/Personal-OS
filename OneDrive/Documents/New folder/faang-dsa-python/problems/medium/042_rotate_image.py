"""
Problem: Rotate Image
Difficulty: Medium
Topic: Matrix
LeetCode: #48

Description:
    Given an n×n 2D matrix, rotate it 90° clockwise in-place.

Examples:
    Input:  [[1,2,3],[4,5,6],[7,8,9]]
    Output: [[7,4,1],[8,5,2],[9,6,3]]

Constraints:
    - 1 <= n <= 20
    - -1000 <= matrix[i][j] <= 1000

Approach:
    Step 1: Transpose (swap matrix[i][j] and matrix[j][i])
    Step 2: Reverse each row

    [[1,2,3],     Transpose:    [[1,4,7],    Reverse rows: [[7,4,1],
     [4,5,6],    ──────────→    [2,5,8],   ─────────────→  [8,5,2],
     [7,8,9]]                   [3,6,9]]                    [9,6,3]]

Time Complexity:  O(n²)
Space Complexity: O(1)
"""

def rotate(matrix):
    n = len(matrix)
    # Step 1: Transpose
    for i in range(n):
        for j in range(i+1, n):
            matrix[i][j], matrix[j][i] = matrix[j][i], matrix[i][j]
    # Step 2: Reverse each row
    for row in matrix:
        row.reverse()
    return matrix

if __name__ == "__main__":
    m = [[1,2,3],[4,5,6],[7,8,9]]
    assert rotate(m) == [[7,4,1],[8,5,2],[9,6,3]]
    m2 = [[5,1,9,11],[2,4,8,10],[13,3,6,7],[15,14,12,16]]
    assert rotate(m2) == [[15,13,2,5],[14,3,4,1],[12,6,8,9],[16,7,10,11]]
    print("All tests passed ✓")
