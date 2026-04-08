"""
Problem: House Robber
Difficulty: Easy
Topic: Dynamic Programming (1D)
LeetCode: #198

Description:
    You are a robber planning to rob houses along a street. Adjacent houses
    have security alarms and cannot both be robbed. Given an integer array
    nums representing the money in each house, return the maximum money
    you can rob without alerting police.

Examples:
    Input:  nums = [1,2,3,1]   Output: 4  (rob house 1 and 3: 1+3=4)
    Input:  nums = [2,7,9,3,1] Output: 12 (rob house 1,3,5: 2+9+1=12)

Constraints:
    - 1 <= nums.length <= 100
    - 0 <= nums[i] <= 400

Approach:
    dp[i] = max money robbing up to house i
    Choice at each house: rob it (dp[i-2] + nums[i]) or skip (dp[i-1])
    dp[i] = max(dp[i-1], dp[i-2] + nums[i])

    nums = [2, 7, 9, 3, 1]
    prev2=0, prev1=0
    i=2: max(0, 0+2)=2   → prev2=0, prev1=2
    i=7: max(2, 0+7)=7   → prev2=2, prev1=7
    i=9: max(7, 2+9)=11  → prev2=7, prev1=11
    i=3: max(11,7+3)=11  → prev2=11,prev1=11
    i=1: max(11,11+1)=12 → prev2=11,prev1=12  ← answer ✓

Time Complexity:  O(n)
Space Complexity: O(1)
"""

def rob(nums):
    prev2 = prev1 = 0
    for num in nums:
        prev2, prev1 = prev1, max(prev1, prev2 + num)
    return prev1


if __name__ == "__main__":
    assert rob([1,2,3,1])   == 4
    assert rob([2,7,9,3,1]) == 12
    assert rob([0])          == 0
    assert rob([1,2])        == 2
    print("All tests passed ✓")
