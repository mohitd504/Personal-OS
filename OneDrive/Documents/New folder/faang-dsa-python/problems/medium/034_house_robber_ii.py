"""
Problem: House Robber II
Difficulty: Medium
Topic: Dynamic Programming
LeetCode: #213

Description:
    Same as House Robber, but houses are arranged in a CIRCLE.
    (First and last house are adjacent — can't rob both.)

Examples:
    Input:  nums = [2,3,2]     Output: 3
    Input:  nums = [1,2,3,1]   Output: 4

Constraints:
    - 1 <= nums.length <= 100
    - 0 <= nums[i] <= 1000

Approach:
    Since first and last are adjacent, split into two subproblems:
    1. Rob nums[0..n-2] (exclude last)
    2. Rob nums[1..n-1] (exclude first)
    Answer = max of both cases.

    nums=[1,2,3,1]:
    Case 1: rob [1,2,3] → max=4 (1+3)
    Case 2: rob [2,3,1] → max=3 (2+1=3 or 3=3)
    Answer: max(4,3)=4 ✓

Time Complexity:  O(n)
Space Complexity: O(1)
"""

def rob(nums):
    def rob_linear(arr):
        prev2 = prev1 = 0
        for n in arr:
            prev2, prev1 = prev1, max(prev1, prev2 + n)
        return prev1

    if len(nums) == 1: return nums[0]
    return max(rob_linear(nums[:-1]), rob_linear(nums[1:]))

if __name__ == "__main__":
    assert rob([2,3,2])   == 3
    assert rob([1,2,3,1]) == 4
    assert rob([1,2,3])   == 3
    print("All tests passed ✓")
