"""
Problem: Median of Two Sorted Arrays
Difficulty: Hard
Topic: Arrays / Binary Search
LeetCode: #4

Description:
    Given two sorted arrays nums1 and nums2, return the median of the
    two sorted arrays. Must run in O(log(m+n)) time.

Examples:
    Input:  nums1=[1,3], nums2=[2]       Output: 2.0
    Input:  nums1=[1,2], nums2=[3,4]     Output: 2.5

Constraints:
    - 0 <= m, n <= 1000
    - -10^6 <= nums1[i], nums2[i] <= 10^6

Approach (Binary Search on Partition):
    Binary search on the smaller array.
    Find a partition (i, j) such that:
      left side  = nums1[:i] + nums2[:j]  (half of total elements)
      right side = nums1[i:] + nums2[j:]
    Valid partition when: nums1[i-1] <= nums2[j] AND nums2[j-1] <= nums1[i]

    If total is even: median = (max(left) + min(right)) / 2
    If total is odd:  median = min(right)

Time Complexity:  O(log(min(m,n)))
Space Complexity: O(1)
"""

def find_median(nums1, nums2):
    A, B = nums1, nums2
    if len(A) > len(B): A, B = B, A
    m, n = len(A), len(B)
    lo, hi = 0, m
    while lo <= hi:
        i = (lo + hi) // 2
        j = (m + n + 1) // 2 - i
        A_left  = A[i-1] if i > 0 else float('-inf')
        A_right = A[i]   if i < m else float('inf')
        B_left  = B[j-1] if j > 0 else float('-inf')
        B_right = B[j]   if j < n else float('inf')
        if A_left <= B_right and B_left <= A_right:
            if (m + n) % 2 == 1:
                return float(max(A_left, B_left))
            return (max(A_left, B_left) + min(A_right, B_right)) / 2
        elif A_left > B_right:
            hi = i - 1
        else:
            lo = i + 1
    return 0.0

if __name__ == "__main__":
    assert find_median([1,3],[2])   == 2.0
    assert find_median([1,2],[3,4]) == 2.5
    assert find_median([0,0],[0,0]) == 0.0
    assert find_median([],[1])      == 1.0
    print("All tests passed ✓")
