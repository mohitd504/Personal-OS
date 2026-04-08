"""
Problem 47: Minimum Cost to Cut a Stick
========================================
Difficulty: Hard
Topics: Dynamic Programming (Interval DP)

Description:
Given a wooden stick of length n units. The stick is labelled from 0 to n.
Given an integer array cuts where cuts[i] denotes a position you should perform a cut.

You can perform the cuts in any order. The cost of one cut is the length of the stick
to be cut. The total cost is the sum of costs of all cuts.

Return the minimum total cost of the cuts.

Examples:
    Input: n=7, cuts=[1,3,4,5]
    Output: 16
    Explanation: Cut at 1 (cost 7), then at 3 (cost 6), at 4 (cost 3), at 5 (cost 4)... 
                 Better: cut 3 (7), cut 1 (3), cut 5 (4), cut 4 (2) = 16

    Input: n=9, cuts=[5,6,1,4,2]
    Output: 22

Constraints:
    2 <= n <= 10^6
    1 <= cuts.length <= min(n-1, 100)

Approach (Interval DP):
    - Add 0 and n to cuts, sort them.
    - dp[i][j] = min cost to make all cuts between cuts[i] and cuts[j].
    - For each split point k: dp[i][j] = min(dp[i][k] + dp[k][j]) + (cuts[j] - cuts[i])
    - The cost of a cut within segment [cuts[i], cuts[j]] is the segment length.

Complexity:
    Time:  O(m^3) where m = len(cuts)
    Space: O(m^2)
"""
from typing import List
from functools import lru_cache


def minCost(n: int, cuts: List[int]) -> int:
    cuts = sorted([0] + cuts + [n])
    m = len(cuts)

    @lru_cache(maxsize=None)
    def dp(i, j):
        if j - i <= 1:
            return 0  # no cuts possible between adjacent positions
        cost = float('inf')
        for k in range(i + 1, j):
            cost = min(cost, dp(i, k) + dp(k, j) + cuts[j] - cuts[i])
        return cost

    return dp(0, m - 1)


if __name__ == "__main__":
    assert minCost(7, [1,3,4,5]) == 16
    assert minCost(9, [5,6,1,4,2]) == 22
    assert minCost(25, [15,14,1]) == 37  # known answer
    print("All tests passed!")
