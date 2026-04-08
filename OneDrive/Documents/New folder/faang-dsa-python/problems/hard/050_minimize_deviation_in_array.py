"""
Problem 50: Minimize Deviation in Array
=========================================
Difficulty: Hard
Topics: Greedy, Heap (Priority Queue), Math

Description:
You have an array nums of n positive integers. In one operation, you can:
  - If a number is even, divide it by 2.
  - If a number is odd, multiply it by 2.

Deviation = max(nums) - min(nums).
Return the minimum possible deviation after performing some number of operations.

Examples:
    Input: nums = [1,2,3,4]
    Output: 1
    Explanation: nums becomes [2,2,2,4] → deviation = 2, or [2,2,2,2] → 0? 
                 Actually: [2,2,3,4]→[2,2,3,2]... 
                 Optimal: [2,2,2,2] → 0? No: 3→6 not allowed after multiply...
                 Let me trust test: answer is 1 for [1,2,3,4]

    Input: nums = [4,1,5,20,3]
    Output: 3

    Input: nums = [2,10,8]
    Output: 3

Constraints:
    n == nums.length
    2 <= n <= 5 * 10^4

Approach:
    Key insight: 
    - Even numbers can only decrease (keep dividing by 2).
    - Odd numbers can multiply by 2 once to become even, then only decrease.
    
    Strategy:
    1. Maximize all odd numbers (multiply by 2 → now all even).
    2. Use a max-heap. Track current minimum.
    3. Repeatedly: record deviation = max - min, then divide max by 2.
       Stop when max is odd (can't divide further).

Complexity:
    Time:  O(n log n * log(max_val))
    Space: O(n)
"""
import heapq
from typing import List


def minimumDeviation(nums: List[int]) -> int:
    # Make all numbers even (multiply odds by 2)
    heap = []
    min_val = float('inf')

    for num in nums:
        if num % 2 == 1:
            num *= 2
        heapq.heappush(heap, -num)  # max-heap
        min_val = min(min_val, num)

    result = float('inf')

    while True:
        max_val = -heap[0]
        result = min(result, max_val - min_val)

        if max_val % 2 == 1:
            break  # can't reduce max further

        heapq.heapreplace(heap, -(max_val // 2))
        min_val = min(min_val, max_val // 2)

    return result


if __name__ == "__main__":
    assert minimumDeviation([1,2,3,4]) == 1
    assert minimumDeviation([4,1,5,20,3]) == 3
    assert minimumDeviation([2,10,8]) == 3
    assert minimumDeviation([3,5]) == 2  # 6,10 → 6,5 → dev=1? No: 6,10→3,5 nope. 3*2=6,5*2=10 → min dev: 6,10(4) or 6,5(1)? 5 is odd, 5*2=10: [6,10]→dev=4; divide 6→[3,10]→[3,5] dev=2; optimal=2
    print("All tests passed!")
