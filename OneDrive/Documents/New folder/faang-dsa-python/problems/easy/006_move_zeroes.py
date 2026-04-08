"""
Problem: Move Zeroes
Difficulty: Easy
Topic: Arrays / Two Pointers
LeetCode: #283

Description:
    Given an integer array nums, move all 0s to the end while maintaining
    the relative order of the non-zero elements. Do this IN-PLACE.

Examples:
    Input:  nums = [0,1,0,3,12]
    Output: [1,3,12,0,0]

    Input:  nums = [0]
    Output: [0]

Constraints:
    - 1 <= nums.length <= 10^4
    - -2^31 <= nums[i] <= 2^31 - 1

Approach:
    Two pointers — "write" pointer tracks where next non-zero goes.
    "read" pointer scans all elements.
    After placing all non-zeros, fill remaining positions with 0.

    [0,1,0,3,12]
    write=0
    read=0: 0 → skip
    read=1: 1 → nums[write]=1, write=1 → [1,1,0,3,12]
    read=2: 0 → skip
    read=3: 3 → nums[write]=3, write=2 → [1,3,0,3,12]
    read=4: 12→ nums[write]=12,write=3 → [1,3,12,3,12]
    Fill [write:] with 0: [1,3,12,0,0] ✓

Time Complexity:  O(n)
Space Complexity: O(1)
"""

def move_zeroes(nums):
    write = 0
    for read in range(len(nums)):
        if nums[read] != 0:
            nums[write] = nums[read]
            write += 1
    for i in range(write, len(nums)):
        nums[i] = 0
    return nums


if __name__ == "__main__":
    assert move_zeroes([0,1,0,3,12]) == [1,3,12,0,0]
    assert move_zeroes([0])          == [0]
    assert move_zeroes([1,0])        == [1,0]
    print("All tests passed ✓")
