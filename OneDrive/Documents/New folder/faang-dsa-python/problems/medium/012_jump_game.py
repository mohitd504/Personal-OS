"""
Problem: Jump Game
Difficulty: Medium
Topic: Arrays / Greedy
LeetCode: #55

Description:
    Given an array nums where nums[i] = max jump length from index i,
    return true if you can reach the last index starting from index 0.

Examples:
    Input:  nums = [2,3,1,1,4]   Output: True
    Input:  nums = [3,2,1,0,4]   Output: False

Constraints:
    - 1 <= nums.length <= 3*10^4
    - 0 <= nums[i] <= 10^5

Approach (Greedy):
    Track the farthest reachable index.
    For each position i, if i > farthest → stuck, return False.
    Otherwise update farthest = max(farthest, i + nums[i]).

    [2,3,1,1,4]:
    i=0: farthest=max(0,0+2)=2
    i=1: farthest=max(2,1+3)=4
    i=2: 2<=4, farthest=max(4,2+1)=4
    i=3: 3<=4, farthest=max(4,3+1)=4
    i=4: 4<=4, reached end → True ✓

    [3,2,1,0,4]:
    i=0: farthest=3
    i=1: farthest=max(3,1+2)=3
    i=2: farthest=max(3,2+1)=3
    i=3: farthest=max(3,3+0)=3
    i=4: 4 > 3 → False ✓

Time Complexity:  O(n)
Space Complexity: O(1)
"""

def can_jump(nums):
    farthest = 0
    for i in range(len(nums)):
        if i > farthest: return False
        farthest = max(farthest, i + nums[i])
    return True

if __name__ == "__main__":
    assert can_jump([2,3,1,1,4]) == True
    assert can_jump([3,2,1,0,4]) == False
    assert can_jump([0])          == True
    assert can_jump([2,0,0])      == True
    print("All tests passed ✓")
