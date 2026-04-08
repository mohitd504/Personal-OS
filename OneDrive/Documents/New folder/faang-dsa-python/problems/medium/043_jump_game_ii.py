"""
Problem: Jump Game II
Difficulty: Medium
Topic: Arrays / Greedy
LeetCode: #45

Description:
    Given nums where nums[i] = max jump from index i, return the minimum
    number of jumps to reach the last index. You can always reach the end.

Examples:
    Input:  nums = [2,3,1,1,4]   Output: 2  (0→1→4 or 0→2→3→4? min=2: 0→1→4)
    Input:  nums = [2,3,0,1,4]   Output: 2

Constraints:
    - 1 <= nums.length <= 10^4
    - 0 <= nums[i] <= 1000

Approach (Greedy):
    Track current jump's farthest reach and next jump's farthest reach.
    When current reach is exhausted, must jump (increment jumps, update reach).

    [2,3,1,1,4]:
    jumps=0, curr_end=0, farthest=0
    i=0: farthest=max(0,0+2)=2, i==curr_end → jumps=1, curr_end=2
    i=1: farthest=max(2,1+3)=4
    i=2: farthest=max(4,2+1)=4, i==curr_end → jumps=2, curr_end=4
    i=3: farthest=max(4,3+1)=4
    i=4: curr_end=4 → done
    Answer: 2 ✓

Time Complexity:  O(n)
Space Complexity: O(1)
"""

def jump(nums):
    jumps = curr_end = farthest = 0
    for i in range(len(nums) - 1):
        farthest = max(farthest, i + nums[i])
        if i == curr_end:
            jumps += 1
            curr_end = farthest
    return jumps

if __name__ == "__main__":
    assert jump([2,3,1,1,4]) == 2
    assert jump([2,3,0,1,4]) == 2
    assert jump([1,2,3])     == 2
    assert jump([1])          == 0
    print("All tests passed ✓")
