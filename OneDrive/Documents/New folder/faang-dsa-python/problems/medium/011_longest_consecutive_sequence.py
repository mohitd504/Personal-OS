"""
Problem: Longest Consecutive Sequence
Difficulty: Medium
Topic: Arrays / Hashing
LeetCode: #128

Description:
    Given an unsorted array of integers, return the length of the longest
    consecutive elements sequence. Must run in O(n).

Examples:
    Input:  nums = [100,4,200,1,3,2]   Output: 4  ([1,2,3,4])
    Input:  nums = [0,3,7,2,5,8,4,6,0,1] Output: 9

Constraints:
    - 0 <= nums.length <= 10^5
    - -10^9 <= nums[i] <= 10^9

Approach:
    Add all numbers to a set. For each number, only start counting
    if (num-1) is NOT in the set (i.e., num is the start of a sequence).
    Then count how far the sequence extends.

    {100,4,200,1,3,2}
    num=1: 0 not in set → start! 1,2,3,4 → streak=4 ✓
    num=4: 3 IN set → skip (not start)
    num=100: 99 not in set → 100 → streak=1
    num=200: 199 not in set → 200 → streak=1
    Answer: 4

Time Complexity:  O(n)  (each number visited at most twice)
Space Complexity: O(n)
"""

def longest_consecutive(nums):
    num_set = set(nums)
    best = 0
    for num in num_set:
        if num - 1 not in num_set:  # start of sequence
            curr = num
            streak = 1
            while curr + 1 in num_set:
                curr += 1
                streak += 1
            best = max(best, streak)
    return best

if __name__ == "__main__":
    assert longest_consecutive([100,4,200,1,3,2])    == 4
    assert longest_consecutive([0,3,7,2,5,8,4,6,0,1])== 9
    assert longest_consecutive([])                     == 0
    print("All tests passed ✓")
