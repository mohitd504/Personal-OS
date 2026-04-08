"""
Problem: Find Median from Data Stream
Difficulty: Hard
Topic: Design / Two Heaps
LeetCode: #295

Description:
    Design a data structure that supports:
    addNum(num): adds integer to the data structure.
    findMedian(): returns the median of all added integers.

Examples:
    addNum(1); addNum(2); findMedian() → 1.5
    addNum(3); findMedian() → 2.0

Constraints:
    - -10^5 <= num <= 10^5
    - addNum called at most 5*10^4 times.

Approach (Two Heaps):
    Maintain two heaps:
    - small: max-heap (negate values) for lower half
    - large: min-heap for upper half
    Keep len(small) == len(large) or len(small) == len(large)+1

    Median:
    - Odd total:  small[0] (max of lower half)
    - Even total: (small[0] + large[0]) / 2

Time Complexity:  addNum O(log n), findMedian O(1)
Space Complexity: O(n)
"""

import heapq

class MedianFinder:
    def __init__(self):
        self.small = []   # max-heap (negated)
        self.large = []   # min-heap

    def addNum(self, num):
        heapq.heappush(self.small, -num)
        # Balance: move max of small to large
        heapq.heappush(self.large, -heapq.heappop(self.small))
        # Keep small at least as large as large
        if len(self.large) > len(self.small):
            heapq.heappush(self.small, -heapq.heappop(self.large))

    def findMedian(self):
        if len(self.small) > len(self.large):
            return float(-self.small[0])
        return (-self.small[0] + self.large[0]) / 2.0

if __name__ == "__main__":
    mf = MedianFinder()
    mf.addNum(1); mf.addNum(2)
    assert mf.findMedian() == 1.5
    mf.addNum(3)
    assert mf.findMedian() == 2.0
    mf.addNum(4)
    assert mf.findMedian() == 2.5
    print("All tests passed ✓")
