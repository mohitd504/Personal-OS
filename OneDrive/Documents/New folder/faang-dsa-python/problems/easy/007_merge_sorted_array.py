"""
Problem: Merge Sorted Array
Difficulty: Easy
Topic: Arrays / Two Pointers
LeetCode: #88

Description:
    Merge nums2 into nums1 in-place. nums1 has length m+n where the first
    m elements are valid, and the last n are zeros (padding).

Examples:
    Input:  nums1=[1,2,3,0,0,0], m=3, nums2=[2,5,6], n=3
    Output: nums1 = [1,2,2,3,5,6]

    Input:  nums1=[1], m=1, nums2=[], n=0
    Output: [1]

Constraints:
    - nums1.length == m + n
    - 0 <= m, n <= 200

Approach:
    Merge from the END to avoid overwriting unprocessed elements.
    Use three pointers: p1=m-1, p2=n-1, p=m+n-1.
    Always place the larger of nums1[p1] and nums2[p2] at position p.

    nums1=[1,2,3,0,0,0] m=3, nums2=[2,5,6] n=3
    p1=2(3), p2=2(6), p=5 → place 6, p2=1, p=4
    p1=2(3), p2=1(5), p=4 → place 5, p2=0, p=3
    p1=2(3), p2=0(2), p=3 → place 3, p1=1, p=2
    p1=1(2), p2=0(2), p=2 → place 2, p1=0, p=1  (tie: take from nums1)
    p1=0(1), p2=0(2), p=1 → place 2, p2=-1, p=0
    p1=0(1), p2=-1:  remaining nums1 in place

Time Complexity:  O(m+n)
Space Complexity: O(1)
"""

def merge(nums1, m, nums2, n):
    p1, p2, p = m - 1, n - 1, m + n - 1
    while p1 >= 0 and p2 >= 0:
        if nums1[p1] >= nums2[p2]:
            nums1[p] = nums1[p1]; p1 -= 1
        else:
            nums1[p] = nums2[p2]; p2 -= 1
        p -= 1
    # Copy remaining nums2 (if any)
    while p2 >= 0:
        nums1[p] = nums2[p2]; p2 -= 1; p -= 1
    return nums1


if __name__ == "__main__":
    n1 = [1,2,3,0,0,0]; merge(n1,3,[2,5,6],3); assert n1==[1,2,2,3,5,6]
    n1 = [1];           merge(n1,1,[],0);       assert n1==[1]
    n1 = [0];           merge(n1,0,[1],1);       assert n1==[1]
    print("All tests passed ✓")
