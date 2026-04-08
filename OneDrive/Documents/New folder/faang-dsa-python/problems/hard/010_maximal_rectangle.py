"""
Problem: Maximal Rectangle
Difficulty: Hard
Topic: Stack / DP / Matrix
LeetCode: #85

Description:
    Given a rows×cols binary matrix of '0's and '1's, find the largest
    rectangle containing only '1's and return its area.

Examples:
    Input:  [["1","0","1","0","0"],
             ["1","0","1","1","1"],
             ["1","1","1","1","1"],
             ["1","0","0","1","0"]]
    Output: 6

Approach:
    Treat each row as base of a histogram.
    heights[j] = consecutive 1s above (including current row) at column j.
    Apply largest rectangle in histogram for each row.

    Row 0: heights=[1,0,1,0,0] → max=1
    Row 1: heights=[2,0,2,1,1] → max=3
    Row 2: heights=[3,1,3,2,2] → max=6 ← answer
    Row 3: heights=[4,0,0,3,0] → max=4

Time Complexity:  O(rows × cols)
Space Complexity: O(cols)
"""

def maximal_rectangle(matrix):
    if not matrix or not matrix[0]: return 0
    cols = len(matrix[0])
    heights = [0] * cols
    best = 0
    for row in matrix:
        for j in range(cols):
            heights[j] = heights[j]+1 if row[j]=='1' else 0
        # largest rectangle in histogram
        stack = []
        for i, h in enumerate(heights):
            start = i
            while stack and stack[-1][1] > h:
                idx, height = stack.pop()
                best = max(best, height*(i-idx))
                start = idx
            stack.append((start, h))
        for idx, height in stack:
            best = max(best, height*(cols-idx))
    return best

if __name__ == "__main__":
    m=[["1","0","1","0","0"],["1","0","1","1","1"],["1","1","1","1","1"],["1","0","0","1","0"]]
    assert maximal_rectangle(m) == 6
    assert maximal_rectangle([["0"]]) == 0
    assert maximal_rectangle([["1"]]) == 1
    print("All tests passed ✓")
