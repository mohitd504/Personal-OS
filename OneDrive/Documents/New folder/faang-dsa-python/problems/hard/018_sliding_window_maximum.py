"""
Problem: Sliding Window Maximum
Difficulty: Hard
Topic: Sliding Window / Monotonic Deque
LeetCode: #239

Description:
    Given an array nums and integer k, return the maximum value in each
    sliding window of size k.

Examples:
    Input:  nums=[1,3,-1,-3,5,3,6,7], k=3
    Output: [3,3,5,5,6,7]

Constraints:
    - 1 <= k <= nums.length <= 10^5
    - -10^4 <= nums[i] <= 10^4

Approach (Monotonic Decreasing Deque):
    Deque stores indices; front = index of maximum in current window.
    For each new element:
    1. Remove indices outside window from front.
    2. Remove from back all indices with smaller value (they can never be max).
    3. Add current index.
    4. If window is full (i >= k-1), record deque[0] as max.

    [1,3,-1,-3,5,3,6,7] k=3:
    i=0(1):  dq=[0]
    i=1(3):  3>1 pop 0, dq=[1]
    i=2(-1): dq=[1,2]  window full → max=nums[1]=3
    i=3(-3): dq=[1,2,3] window: [1..3], dq[0]=1 valid → max=3
    i=4(5):  5>-3 pop 3; 5>-1 pop 2; 5>3 pop 1; dq=[4] → max=5
    i=5(3):  dq=[4,5] → max=nums[4]=5
    i=6(6):  6>3 pop 5; dq=[4,6]→ wait, 6>5 pop 4; dq=[6] → max=6
    i=7(7):  7>6 pop 6; dq=[7] → max=7
    Result: [3,3,5,5,6,7] ✓

Time Complexity:  O(n)
Space Complexity: O(k)
"""

from collections import deque

def max_sliding_window(nums, k):
    dq = deque()
    result = []
    for i, v in enumerate(nums):
        if dq and dq[0] < i - k + 1:
            dq.popleft()
        while dq and nums[dq[-1]] < v:
            dq.pop()
        dq.append(i)
        if i >= k - 1:
            result.append(nums[dq[0]])
    return result

if __name__ == "__main__":
    assert max_sliding_window([1,3,-1,-3,5,3,6,7], 3) == [3,3,5,5,6,7]
    assert max_sliding_window([1], 1)                   == [1]
    assert max_sliding_window([1,-1], 1)                == [1,-1]
    print("All tests passed ✓")
