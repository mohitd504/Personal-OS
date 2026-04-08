"""
Problem: Number of Provinces
Difficulty: Medium
Topic: Graphs / Union-Find / DFS
LeetCode: #547

Description:
    There are n cities. isConnected[i][j]=1 means city i and j are directly
    connected. A province is a group of directly/indirectly connected cities.
    Return the total number of provinces.

Examples:
    Input:  [[1,1,0],[1,1,0],[0,0,1]]   Output: 2
    Input:  [[1,0,0],[0,1,0],[0,0,1]]   Output: 3

Constraints:
    - 1 <= n <= 200
    - isConnected[i][i] == 1
    - isConnected[i][j] == isConnected[j][i]

Approach (Union-Find):
    For each connection, union those two cities.
    Count remaining components.

Time Complexity:  O(n²·α(n))
Space Complexity: O(n)
"""

def find_circle_num(isConnected):
    n = len(isConnected)
    parent = list(range(n))

    def find(x):
        while parent[x] != x:
            parent[x] = parent[parent[x]]  # path compression
            x = parent[x]
        return x

    def union(x, y):
        parent[find(x)] = find(y)

    for i in range(n):
        for j in range(i+1, n):
            if isConnected[i][j]:
                union(i, j)

    return sum(1 for i in range(n) if find(i) == i)

if __name__ == "__main__":
    assert find_circle_num([[1,1,0],[1,1,0],[0,0,1]]) == 2
    assert find_circle_num([[1,0,0],[0,1,0],[0,0,1]]) == 3
    assert find_circle_num([[1,1,0],[1,1,1],[0,1,1]]) == 1
    print("All tests passed ✓")
