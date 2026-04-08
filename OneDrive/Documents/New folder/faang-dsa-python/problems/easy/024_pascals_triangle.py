"""
Problem: Pascal's Triangle
Difficulty: Easy
Topic: Dynamic Programming / Arrays
LeetCode: #118

Description:
    Given an integer numRows, return the first numRows of Pascal's triangle.
    Each row: [1, ...], last=[1]. Middle: triangle[i][j] = triangle[i-1][j-1] + triangle[i-1][j]

Examples:
    Input:  numRows = 5
    Output: [[1],[1,1],[1,2,1],[1,3,3,1],[1,4,6,4,1]]

Constraints:
    - 1 <= numRows <= 30

Approach:
    Each row starts and ends with 1.
    Inner values = sum of two values above it.

    Row 0: [1]
    Row 1: [1, 1]
    Row 2: [1, 1+1=2, 1] = [1,2,1]
    Row 3: [1, 1+2=3, 2+1=3, 1] = [1,3,3,1]
    Row 4: [1, 1+3=4, 3+3=6, 3+1=4, 1] = [1,4,6,4,1]

Time Complexity:  O(numRows²)
Space Complexity: O(numRows²)
"""

def generate(numRows):
    triangle = []
    for i in range(numRows):
        row = [1] * (i + 1)
        for j in range(1, i):
            row[j] = triangle[i-1][j-1] + triangle[i-1][j]
        triangle.append(row)
    return triangle


if __name__ == "__main__":
    assert generate(1) == [[1]]
    assert generate(5) == [[1],[1,1],[1,2,1],[1,3,3,1],[1,4,6,4,1]]
    print("All tests passed ✓")
