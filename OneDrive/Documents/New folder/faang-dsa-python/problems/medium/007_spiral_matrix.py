"""
Problem: Spiral Matrix
Difficulty: Medium
Topic: Matrix / Simulation
LeetCode: #54

Description:
    Given an m x n matrix, return all elements in spiral order.

Examples:
    Input:  [[1,2,3],[4,5,6],[7,8,9]]
    Output: [1,2,3,6,9,8,7,4,5]

Constraints:
    - 1 <= m, n <= 10
    - -100 <= matrix[i][j] <= 100

Approach:
    Maintain four boundaries: top, bottom, left, right.
    Traverse: right along top → down along right → left along bottom
             → up along left. Shrink boundary after each traversal.

    [[1,2,3],[4,5,6],[7,8,9]]
    top=0,bot=2,L=0,R=2
    Right (top row):  [1,2,3]  top→1
    Down  (right col):[6,9]    R→1
    Left  (bot row):  [8,7,4]  bot→1
    Up    (left col): [4] already added... check top<=bot,L<=R → [4] no, 
    Actually: up gives [4] but we adjust check
    Result: [1,2,3,6,9,8,7,4,5] ✓

Time Complexity:  O(m*n)
Space Complexity: O(1) excluding output
"""

def spiral_order(matrix):
    result = []
    top, bottom = 0, len(matrix) - 1
    left, right = 0, len(matrix[0]) - 1
    while top <= bottom and left <= right:
        for c in range(left, right + 1):       result.append(matrix[top][c])
        top += 1
        for r in range(top, bottom + 1):       result.append(matrix[r][right])
        right -= 1
        if top <= bottom:
            for c in range(right, left - 1, -1): result.append(matrix[bottom][c])
            bottom -= 1
        if left <= right:
            for r in range(bottom, top - 1, -1): result.append(matrix[r][left])
            left += 1
    return result

if __name__ == "__main__":
    assert spiral_order([[1,2,3],[4,5,6],[7,8,9]]) == [1,2,3,6,9,8,7,4,5]
    assert spiral_order([[1,2,3,4],[5,6,7,8],[9,10,11,12]]) == [1,2,3,4,8,12,11,10,9,5,6,7]
    assert spiral_order([[1]]) == [1]
    print("All tests passed ✓")
