"""
Problem: Product of Array Except Self
Difficulty: Medium
Topic: Arrays / Prefix Product
LeetCode: #238

Description:
    Given an integer array nums, return an array answer such that
    answer[i] = product of all elements except nums[i].
    Must run in O(n) without using the division operation.

Examples:
    Input:  nums = [1,2,3,4]    Output: [24,12,8,6]
    Input:  nums = [-1,1,0,-3,3] Output: [0,0,9,0,0]

Constraints:
    - 2 <= nums.length <= 10^5
    - -30 <= nums[i] <= 30
    - Product fits in 32-bit integer.

Approach:
    Two passes:
    Pass 1 (left): result[i] = product of all elements to the LEFT
    Pass 2 (right): multiply result[i] by product of all elements to the RIGHT

    nums = [1, 2, 3, 4]
    Left products:  [1, 1, 2, 6]
    Right products: [24,12, 4, 1]   (computed right-to-left)
    result[i] = left[i] * right[i]
              = [1*24, 1*12, 2*4, 6*1] = [24, 12, 8, 6] ✓

Time Complexity:  O(n)
Space Complexity: O(1) excluding output array
"""

def product_except_self(nums):
    n = len(nums)
    result = [1] * n
    # Left pass: result[i] = product of nums[0..i-1]
    left = 1
    for i in range(n):
        result[i] = left
        left *= nums[i]
    # Right pass: multiply by product of nums[i+1..n-1]
    right = 1
    for i in range(n - 1, -1, -1):
        result[i] *= right
        right *= nums[i]
    return result

if __name__ == "__main__":
    assert product_except_self([1,2,3,4])    == [24,12,8,6]
    assert product_except_self([-1,1,0,-3,3])== [0,0,9,0,0]
    print("All tests passed ✓")
