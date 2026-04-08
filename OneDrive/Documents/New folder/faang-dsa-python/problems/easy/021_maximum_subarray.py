"""
Problem: Maximum Subarray
Difficulty: Easy
Topic: Dynamic Programming / Kadane's Algorithm
LeetCode: #53

Description:
    Given an integer array nums, find the contiguous subarray (at least
    one element) which has the largest sum and return its sum.

Examples:
    Input:  nums = [-2,1,-3,4,-1,2,1,-5,4]
    Output: 6   (subarray [4,-1,2,1])

    Input:  nums = [1]       Output: 1
    Input:  nums = [5,4,-1,7,8] Output: 23

Constraints:
    - 1 <= nums.length <= 10^5
    - -10^4 <= nums[i] <= 10^4

Approach (Kadane's Algorithm):
    At each position, decide: extend previous subarray OR start fresh.
    curr = max(num, curr + num)
    best = max(best, curr)

    [-2, 1, -3, 4, -1, 2, 1, -5, 4]
    curr: -2  1  -2   4   3  5   6   1   5
    best: -2  1   1   4   4  5   6   6   6

    Answer: 6 ✓

Time Complexity:  O(n)
Space Complexity: O(1)
"""

def max_subarray(nums):
    curr = best = nums[0]
    for num in nums[1:]:
        curr = max(num, curr + num)
        best = max(best, curr)
    return best


if __name__ == "__main__":
    assert max_subarray([-2,1,-3,4,-1,2,1,-5,4]) == 6
    assert max_subarray([1])                       == 1
    assert max_subarray([5,4,-1,7,8])              == 23
    assert max_subarray([-1,-2,-3])                == -1
    print("All tests passed ✓")
