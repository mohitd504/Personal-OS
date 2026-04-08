"""
Problem: Maximum Product Subarray
Difficulty: Medium
Topic: Dynamic Programming
LeetCode: #152

Description:
    Given an integer array nums, find a subarray with the largest product
    and return that product.

Examples:
    Input:  nums = [2,3,-2,4]     Output: 6   ([2,3])
    Input:  nums = [-2,0,-1]      Output: 0

Constraints:
    - 1 <= nums.length <= 2*10^4
    - -10 <= nums[i] <= 10

Approach:
    Track both max and min product ending at current position
    (min needed because negative*negative = positive).

    [2,3,-2,4]:
    curr_max=2, curr_min=2, best=2
    curr_max=max(3,6,6)=6, curr_min=min(3,6,6)=3, best=6
    curr_max=max(-2,-12,9)=-2, curr_min=min(-2,-12,9)=-12, best=6
    curr_max=max(4,-8,-48)=4, curr_min=min(4,-8,-48)=-48, best=6
    Answer: 6 ✓

Time Complexity:  O(n)
Space Complexity: O(1)
"""

def max_product(nums):
    curr_max = curr_min = best = nums[0]
    for num in nums[1:]:
        candidates = (num, curr_max * num, curr_min * num)
        curr_max = max(candidates)
        curr_min = min(candidates)
        best = max(best, curr_max)
    return best

if __name__ == "__main__":
    assert max_product([2,3,-2,4])  == 6
    assert max_product([-2,0,-1])   == 0
    assert max_product([-2,3,-4])   == 24
    assert max_product([2,-5,-2,-4,3]) == 24
    print("All tests passed ✓")
