"""
Problem: Partition Equal Subset Sum
Difficulty: Medium
Topic: Dynamic Programming / 0-1 Knapsack
LeetCode: #416

Description:
    Given a non-empty array of positive integers, determine if it can be
    partitioned into two subsets with equal sums.

Examples:
    Input:  nums = [1,5,11,5]   Output: True  ({1,5,5} and {11})
    Input:  nums = [1,2,3,5]    Output: False

Constraints:
    - 1 <= nums.length <= 200
    - 1 <= nums[i] <= 100

Approach:
    If total sum is odd → impossible. Target = total // 2.
    0/1 knapsack: can we pick a subset summing to target?

    dp = set of reachable sums (start with {0}).
    For each number n: dp = dp ∪ {s+n for s in dp}
    Check if target in dp.

    [1,5,11,5] total=22 target=11
    Start: {0}
    After 1:  {0,1}
    After 5:  {0,1,5,6}
    After 11: {0,1,5,6,11,...}  → 11 found! True ✓

Time Complexity:  O(n*target)
Space Complexity: O(target)
"""

def can_partition(nums):
    total = sum(nums)
    if total % 2: return False
    target = total // 2
    dp = {0}
    for num in nums:
        dp |= {s + num for s in dp}
        if target in dp: return True
    return False

if __name__ == "__main__":
    assert can_partition([1,5,11,5]) == True
    assert can_partition([1,2,3,5])  == False
    assert can_partition([1,1])       == True
    print("All tests passed ✓")
