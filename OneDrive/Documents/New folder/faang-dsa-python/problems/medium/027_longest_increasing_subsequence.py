"""
Problem: Longest Increasing Subsequence
Difficulty: Medium
Topic: Dynamic Programming
LeetCode: #300

Description:
    Given an integer array nums, return the length of the longest
    strictly increasing subsequence.

Examples:
    Input:  nums = [10,9,2,5,3,7,101,18]   Output: 4  ([2,3,7,101])
    Input:  nums = [0,1,0,3,2,3]            Output: 4
    Input:  nums = [7,7,7,7,7]              Output: 1

Constraints:
    - 1 <= nums.length <= 2500
    - -10^4 <= nums[i] <= 10^4

Approach (Patience Sort / O(n log n)):
    Maintain array `tails` where tails[i] = smallest tail element of all
    increasing subsequences of length i+1.

    When processing num:
    - If num > tails[-1]: extend longest subsequence (append)
    - Else: binary search for position and replace (maintain smallest tail)

    [10,9,2,5,3,7,101,18]:
    10  → tails=[10]
    9   → tails=[9]     (replace 10)
    2   → tails=[2]     (replace 9)
    5   → tails=[2,5]   (extend)
    3   → tails=[2,3]   (replace 5)
    7   → tails=[2,3,7] (extend)
    101 → tails=[2,3,7,101] (extend)
    18  → tails=[2,3,7,18]  (replace 101)
    Answer: len(tails) = 4 ✓

Time Complexity:  O(n log n)
Space Complexity: O(n)
"""

import bisect

def length_of_lis(nums):
    tails = []
    for num in nums:
        pos = bisect.bisect_left(tails, num)
        if pos == len(tails):
            tails.append(num)
        else:
            tails[pos] = num
    return len(tails)

if __name__ == "__main__":
    assert length_of_lis([10,9,2,5,3,7,101,18]) == 4
    assert length_of_lis([0,1,0,3,2,3])          == 4
    assert length_of_lis([7,7,7,7,7])             == 1
    assert length_of_lis([1,3,6,7,9,4,10,5,6])   == 6
    print("All tests passed ✓")
