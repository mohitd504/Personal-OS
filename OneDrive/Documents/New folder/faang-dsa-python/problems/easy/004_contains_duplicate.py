"""
Problem: Contains Duplicate
Difficulty: Easy
Topic: Arrays / Hashing
LeetCode: #217

Description:
    Given an integer array nums, return true if any value appears at least
    twice, and false if every element is distinct.

Examples:
    Input:  nums = [1,2,3,1]
    Output: True

    Input:  nums = [1,2,3,4]
    Output: False

Constraints:
    - 1 <= nums.length <= 10^5
    - -10^9 <= nums[i] <= 10^9

Approach:
    Use a hash set. For each number, check if it already exists in the set.
    If yes → duplicate found. If no → add to set and continue.

Time Complexity:  O(n)
Space Complexity: O(n)
"""

def contains_duplicate(nums):
    seen = set()
    for num in nums:
        if num in seen:
            return True
        seen.add(num)
    return False

# Alternative one-liner:
def contains_duplicate_v2(nums):
    return len(nums) != len(set(nums))


if __name__ == "__main__":
    assert contains_duplicate([1,2,3,1]) == True
    assert contains_duplicate([1,2,3,4]) == False
    assert contains_duplicate([1,1,1,3,3,4,3,2,4,2]) == True
    print("All tests passed ✓")
