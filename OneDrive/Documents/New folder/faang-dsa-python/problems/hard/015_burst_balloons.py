"""
Problem: Burst Balloons
Difficulty: Hard
Topic: Dynamic Programming / Interval DP
LeetCode: #312

Description:
    Given n balloons indexed 0 to n-1, each with a number. Burst all balloons
    to maximize coins. Bursting balloon i earns nums[left]*nums[i]*nums[right].
    After bursting, left and right become adjacent.

Examples:
    Input:  nums = [3,1,5,8]   Output: 167
    Explanation: burst 1→3*1*5=15, burst 5→3*5*8=120, burst 3→1*3*8=24,
                 burst 8→1*8*1=8 → 15+120+24+8=167? No...
                 Optimal: 3×1×8+3×5×8+1×3×8+1×8×1 = 167

Constraints:
    - 1 <= n <= 300
    - 0 <= nums[i] <= 100

Approach (Interval DP):
    Pad with 1s: nums = [1] + nums + [1]
    dp[l][r] = max coins from bursting all balloons in OPEN interval (l,r).
    For last balloon k to burst in (l,r):
      dp[l][r] = max(nums[l]*nums[k]*nums[r] + dp[l][k] + dp[k][r])

Time Complexity:  O(n³)
Space Complexity: O(n²)
"""

def max_coins(nums):
    nums = [1] + nums + [1]
    n = len(nums)
    dp = [[0]*n for _ in range(n)]
    for length in range(2, n):
        for l in range(n - length):
            r = l + length
            for k in range(l+1, r):
                dp[l][r] = max(dp[l][r],
                               nums[l]*nums[k]*nums[r] + dp[l][k] + dp[k][r])
    return dp[0][n-1]

if __name__ == "__main__":
    assert max_coins([3,1,5,8]) == 167
    assert max_coins([1,5])     == 10
    assert max_coins([3])       == 3
    print("All tests passed ✓")
