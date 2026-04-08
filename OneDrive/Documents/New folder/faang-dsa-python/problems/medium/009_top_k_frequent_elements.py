"""
Problem: Top K Frequent Elements
Difficulty: Medium
Topic: Arrays / Hashing / Heap
LeetCode: #347

Description:
    Given an integer array nums and an integer k, return the k most
    frequent elements. Answer may be in any order.

Examples:
    Input:  nums=[1,1,1,2,2,3], k=2   Output: [1,2]
    Input:  nums=[1], k=1              Output: [1]

Constraints:
    - 1 <= nums.length <= 10^5
    - k is in the range [1, unique elements count]
    - Answer is unique.

Approach (Min-Heap of size k):
    Count frequencies. Use min-heap of size k.
    Push each (freq, num). When heap > k, pop the min.
    Remaining k elements are the answer.

Approach 2 (Bucket Sort):
    Use array of lists indexed by frequency.
    Collect top k from highest frequency buckets.
    Time: O(n), Space: O(n)

Time Complexity:  O(n log k)
Space Complexity: O(n)
"""

import heapq
from collections import Counter

def top_k_frequent(nums, k):
    count = Counter(nums)
    return heapq.nlargest(k, count, key=count.get)

def top_k_frequent_bucket(nums, k):
    """O(n) using bucket sort by frequency."""
    count = Counter(nums)
    buckets = [[] for _ in range(len(nums) + 1)]
    for num, freq in count.items():
        buckets[freq].append(num)
    result = []
    for freq in range(len(buckets) - 1, 0, -1):
        result.extend(buckets[freq])
        if len(result) >= k: break
    return result[:k]

if __name__ == "__main__":
    assert sorted(top_k_frequent([1,1,1,2,2,3], 2)) == [1,2]
    assert top_k_frequent([1], 1) == [1]
    assert sorted(top_k_frequent_bucket([1,1,1,2,2,3], 2)) == [1,2]
    print("All tests passed ✓")
