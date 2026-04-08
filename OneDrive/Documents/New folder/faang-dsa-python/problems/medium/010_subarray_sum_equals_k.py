"""
Problem: Subarray Sum Equals K
Difficulty: Medium
Topic: Arrays / Prefix Sum / Hashing
LeetCode: #560

Description:
    Given an array of integers nums and an integer k, return the total number
    of continuous subarrays whose sum equals k.

Examples:
    Input:  nums=[1,1,1], k=2   Output: 2
    Input:  nums=[1,2,3], k=3   Output: 2  ([1,2] and [3])

Constraints:
    - 1 <= nums.length <= 2*10^4
    - -1000 <= nums[i] <= 1000
    - -10^7 <= k <= 10^7

Approach:
    Use prefix sum + hash map.
    We need: prefix[R] - prefix[L] = k
    Equivalent: prefix[L] = prefix[R] - k

    As we iterate, maintain a count of prefix sums seen so far.
    For each new prefix sum, add count of (curr_prefix - k).

    nums=[1,1,1] k=2:
    prefix=0, seen={0:1}
    prefix=1, need=1-2=-1, count+=seen[-1]=0, seen={0:1,1:1}
    prefix=2, need=2-2=0,  count+=seen[0]=1,  seen={0:1,1:1,2:1}
    prefix=3, need=3-2=1,  count+=seen[1]=1,  seen={0:1,1:1,2:1,3:1}
    Total count = 2 ✓

Time Complexity:  O(n)
Space Complexity: O(n)
"""

from collections import defaultdict

def subarray_sum(nums, k):
    count = 0
    prefix = 0
    seen = defaultdict(int)
    seen[0] = 1
    for num in nums:
        prefix += num
        count += seen[prefix - k]
        seen[prefix] += 1
    return count

if __name__ == "__main__":
    assert subarray_sum([1,1,1], 2) == 2
    assert subarray_sum([1,2,3], 3) == 2
    assert subarray_sum([1],     1) == 1
    assert subarray_sum([-1,-1,1], 0) == 1
    print("All tests passed ✓")
