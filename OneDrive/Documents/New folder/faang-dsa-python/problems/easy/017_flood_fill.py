"""
Problem: Flood Fill
Difficulty: Easy
Topic: Graphs / Matrix DFS
LeetCode: #733

Description:
    You are given an image represented by an m×n integer grid. Starting from
    pixel (sr,sc), change the color of the starting pixel and all connected
    pixels of the same color to newColor. 4-directional connectivity.

Examples:
    Input:  image=[[1,1,1],[1,1,0],[1,0,1]], sr=1,sc=1, newColor=2
    Output: [[2,2,2],[2,2,0],[2,0,1]]

Constraints:
    - 1 <= m, n <= 50
    - 0 <= image[i][j], newColor < 2^16

Approach:
    DFS from (sr,sc). If a neighbor has the original color, fill it and
    recurse. Use the color change itself as "visited" marker.
    Edge case: if original color == newColor, do nothing.

Time Complexity:  O(m*n)
Space Complexity: O(m*n)  recursion stack
"""

def flood_fill(image, sr, sc, newColor):
    original = image[sr][sc]
    if original == newColor:
        return image
    rows, cols = len(image), len(image[0])

    def dfs(r, c):
        if r < 0 or r >= rows or c < 0 or c >= cols: return
        if image[r][c] != original: return
        image[r][c] = newColor
        for dr, dc in [(0,1),(0,-1),(1,0),(-1,0)]:
            dfs(r+dr, c+dc)

    dfs(sr, sc)
    return image


if __name__ == "__main__":
    img = [[1,1,1],[1,1,0],[1,0,1]]
    assert flood_fill(img, 1, 1, 2) == [[2,2,2],[2,2,0],[2,0,1]]
    img2 = [[0,0,0],[0,0,0]]
    assert flood_fill(img2, 0, 0, 2) == [[2,2,2],[2,2,2]]
    print("All tests passed ✓")
