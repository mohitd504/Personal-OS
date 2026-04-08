"""
Problem: Two Sum
Difficulty: Easy
Topic: Arrays & Hashing
LeetCode: #1

Description:
    Given an array of integers nums and an integer target, return the indices
    of the two numbers such that they add up to target. You may not use the
    same element twice. Exactly one solution is guaranteed.

Examples:
    Input:  nums = [2,7,11,15], target = 9
    Output: [0, 1]   (nums[0]+nums[1] = 2+7 = 9)

    Input:  nums = [3,2,4], target = 6
    Output: [1, 2]

Constraints:
    - 2 <= nums.length <= 10^4
    - -10^9 <= nums[i] <= 10^9
    - Only one valid answer exists.

Approach:
    Use a hash map to store (value → index) as we iterate.
    For each number, check if (target - number) is already in the map.
    If yes, we found our pair. If no, store current number in map.

    Example walkthrough (nums=[2,7,11,15], target=9):
      i=0: need=9-2=7, not in map → map={2:0}
      i=1: need=9-7=2, 2 IS in map → return [map[2], 1] = [0,1] ✓

Time Complexity:  O(n)  — single pass
Space Complexity: O(n)  — hash map stores at most n entries
"""

def two_sum(nums, target):
    seen = {}               # value → index
    for i, num in enumerate(nums):
        complement = target - num
        if complement in seen:
            return [seen[complement], i]
        seen[num] = i
    return []


# ── Tests ────────────────────────────────────────────
if __name__ == "__main__":
    assert two_sum([2,7,11,15], 9)  == [0,1]
    assert two_sum([3,2,4], 6)      == [1,2]
    assert two_sum([3,3], 6)        == [0,1]
    print("All tests passed ✓")
