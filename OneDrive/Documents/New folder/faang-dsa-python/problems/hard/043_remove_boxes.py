"""
Problem 43: Remove Boxes
========================
Difficulty: Hard
Topics: Dynamic Programming (Interval DP with extra dimension)

Description:
Given several boxes with different colors (represented by integers), you want to
remove all boxes. Each time you can choose some continuous boxes with the same
color (each box has a separate color) and remove them. You get points = k*k
where k is the number of boxes removed at once.

Return the maximum points you can get.

Examples:
    Input: boxes = [1,3,2,2,2,3,4,3,1]
    Output: 23
    Explanation: [1,3,2,2,2,3,4,3,1] → remove [2,2,2] → 9 pts
                 [1,3,3,4,3,1] → remove [3,3,3] → 9 pts (but need rearranging...)
                 Optimal: 23

    Input: boxes = [1,1,1]
    Output: 9

Constraints:
    1 <= boxes.length <= 100
    1 <= boxes[i] <= 100

Approach (3D Interval DP):
    dp[l][r][k] = max points from boxes[l..r] with k boxes identical to boxes[l]
                  attached to the left of boxes[l].
    
    Base: dp[l][l][k] = (k+1)^2
    
    Transitions:
    1. Remove boxes[l] together with the k attached: (k+1)^2 + dp[l+1][r][0]
    2. For any m in (l,r] where boxes[m]==boxes[l]:
       dp[l][r][k] = max(dp[l+1][m-1][0] + dp[m][r][k+1])
       (skip l+1..m-1 range, then process m..r with k+1 same-color boxes on left)

Complexity:
    Time:  O(n^4)
    Space: O(n^3)
"""
from typing import List
from functools import lru_cache


def removeBoxes(boxes: List[int]) -> int:
    n = len(boxes)

    @lru_cache(maxsize=None)
    def dp(l, r, k):
        # k = number of boxes same as boxes[l] to the left of l
        if l > r:
            return 0
        # Merge consecutive same-color boxes at start
        while l < r and boxes[l] == boxes[l+1]:
            l += 1
            k += 1
        # Option 1: remove boxes[l] and its k companions
        result = (k + 1) ** 2 + dp(l + 1, r, 0)
        # Option 2: find boxes[m] == boxes[l], skip range in between
        for m in range(l + 1, r + 1):
            if boxes[m] == boxes[l]:
                result = max(result, dp(l + 1, m - 1, 0) + dp(m, r, k + 1))
        return result

    return dp(0, n - 1, 0)


if __name__ == "__main__":
    assert removeBoxes([1,3,2,2,2,3,4,3,1]) == 23
    assert removeBoxes([1,1,1]) == 9
    assert removeBoxes([1]) == 1
    assert removeBoxes([1,2,1]) == 5  # remove 2 (1pt), then [1,1] (4pt) = 5
    print("All tests passed!")
