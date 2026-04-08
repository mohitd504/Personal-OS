"""
Problem: Find Minimum in Rotated Sorted Array
Difficulty: Medium
Topic: Arrays / Binary Search
LeetCode: #153

Description:
    A sorted array is rotated at some unknown pivot. Find the minimum.
    Assume no duplicates.

Examples:
    Input:  nums = [3,4,5,1,2]   Output: 1
    Input:  nums = [4,5,6,7,0,1,2] Output: 0
    Input:  nums = [11,13,15,17] Output: 11  (no rotation)

Constraints:
    - 1 <= nums.length <= 5000
    - -5000 <= nums[i] <= 5000

Approach:
    Binary search. The minimum is where the "rotation break" occurs.
    If nums[mid] > nums[R]: minimum is in RIGHT half (mid+1..R)
    Else: minimum is in LEFT half (L..mid)

    [3,4,5,1,2]: L=0,R=4,mid=2 → nums[2]=5>nums[4]=2 → L=3
                 L=3,R=4,mid=3 → nums[3]=1<nums[4]=2 → R=3
                 L==R → return nums[3]=1 ✓

Time Complexity:  O(log n)
Space Complexity: O(1)
"""

def find_min(nums):
    L, R = 0, len(nums) - 1
    while L < R:
        mid = (L + R) // 2
        if nums[mid] > nums[R]:
            L = mid + 1
        else:
            R = mid
    return nums[L]

if __name__ == "__main__":
    assert find_min([3,4,5,1,2])    == 1
    assert find_min([4,5,6,7,0,1,2])== 0
    assert find_min([11,13,15,17])  == 11
    assert find_min([1])             == 1
    print("All tests passed ✓")
