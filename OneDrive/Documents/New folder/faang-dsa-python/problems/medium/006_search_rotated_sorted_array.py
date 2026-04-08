"""
Problem: Search in Rotated Sorted Array
Difficulty: Medium
Topic: Arrays / Binary Search
LeetCode: #33

Description:
    A sorted array was rotated at some pivot. Given a target, return its
    index or -1 if not found. Must be O(log n).

Examples:
    Input:  nums=[4,5,6,7,0,1,2], target=0  → Output: 4
    Input:  nums=[4,5,6,7,0,1,2], target=3  → Output: -1

Constraints:
    - 1 <= nums.length <= 5000
    - All values unique.

Approach:
    Modified binary search. At each mid, one half is always sorted.
    Determine which half is sorted, then check if target is in that half.

    [4,5,6,7,0,1,2] target=0
    L=0 R=6 mid=3: nums[3]=7
    Left [4..7] sorted. 4<=0? No → search right. L=4
    L=4 R=6 mid=5: nums[5]=1
    Left [0..1] sorted. 0<=0<=1? Yes → search left. R=5
    L=4 R=5 mid=4: nums[4]=0 == target → return 4 ✓

Time Complexity:  O(log n)
Space Complexity: O(1)
"""

def search(nums, target):
    L, R = 0, len(nums) - 1
    while L <= R:
        mid = (L + R) // 2
        if nums[mid] == target: return mid
        # Left half is sorted
        if nums[L] <= nums[mid]:
            if nums[L] <= target < nums[mid]:
                R = mid - 1
            else:
                L = mid + 1
        else:  # Right half is sorted
            if nums[mid] < target <= nums[R]:
                L = mid + 1
            else:
                R = mid - 1
    return -1

if __name__ == "__main__":
    assert search([4,5,6,7,0,1,2], 0) == 4
    assert search([4,5,6,7,0,1,2], 3) == -1
    assert search([1],              1) == 0
    print("All tests passed ✓")
