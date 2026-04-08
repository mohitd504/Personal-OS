"""
Problem 45: Paint House III
============================
Difficulty: Hard
Topics: Dynamic Programming (3D DP)

Description:
There is a row of m houses in a small city. Each house must be painted with
one of the n colors. Some houses are already painted (color != 0).
The cost of painting house i with color j is cost[i][j-1].

A neighborhood is a maximal group of consecutive houses painted with the same color.
You want exactly target neighborhoods.

Return the minimum cost to paint all remaining houses so there are exactly
target neighborhoods. Return -1 if impossible.

Examples:
    Input: houses=[0,0,0,0,0], cost=[[1,10],[10,1],[10,1],[1,10],[5,1]], m=5, n=2, target=3
    Output: 9

    Input: houses=[0,2,1,2,0], cost=[[1,10],[10,1],[10,1],[1,10],[5,1]], m=5, n=2, target=3
    Output: 11

Constraints:
    m == houses.length == cost.length
    1 <= m <= 100
    1 <= n <= 20
    1 <= target <= m

Approach:
    dp[i][j][k] = min cost to paint houses[0..i] where house i has color j
                  and there are k neighborhoods so far.
    
    Transitions:
    - If house i already painted (houses[i] != 0): only consider color = houses[i]
    - For each previous color pc:
      * same color: neighborhoods stay same
      * different color: neighborhoods + 1

Complexity:
    Time:  O(m * n^2 * target)
    Space: O(m * n * target)
"""
from typing import List
import math


def minCost(houses: List[int], cost: List[List[int]], m: int, n: int, target: int) -> int:
    INF = math.inf
    # dp[house][color][neighborhoods]
    # Initialize with INF
    dp = [[[INF] * (target + 1) for _ in range(n + 1)] for _ in range(m)]

    # Base case: first house
    if houses[0] != 0:
        dp[0][houses[0]][1] = 0
    else:
        for c in range(1, n + 1):
            dp[0][c][1] = cost[0][c - 1]

    for i in range(1, m):
        colors = [houses[i]] if houses[i] != 0 else range(1, n + 1)
        for c in colors:
            paint_cost = 0 if houses[i] != 0 else cost[i][c - 1]
            for k in range(1, target + 1):
                for pc in range(1, n + 1):
                    if dp[i-1][pc][k] == INF:
                        continue
                    if pc == c:
                        dp[i][c][k] = min(dp[i][c][k], dp[i-1][pc][k] + paint_cost)
                    elif k > 1:
                        dp[i][c][k] = min(dp[i][c][k], dp[i-1][pc][k-1] + paint_cost)

    ans = min(dp[m-1][c][target] for c in range(1, n+1))
    return ans if ans != INF else -1


if __name__ == "__main__":
    assert minCost([0,0,0,0,0], [[1,10],[10,1],[10,1],[1,10],[5,1]], 5, 2, 3) == 9
    assert minCost([0,2,1,2,0], [[1,10],[10,1],[10,1],[1,10],[5,1]], 5, 2, 3) == 11
    assert minCost([3,1,2,3], [[1,1,1],[1,1,1],[1,1,1],[1,1,1]], 4, 3, 3) == -1
    print("All tests passed!")
