"""
Problem: Trapping Rain Water
Difficulty: Hard
Topic: Arrays / Two Pointers
LeetCode: #42

Description:
    Given n non-negative integers representing an elevation map where the
    width of each bar is 1, compute how much water it can trap after raining.

Examples:
    Input:  height = [0,1,0,2,1,0,1,3,2,1,2,1]
    Output: 6

    Input:  height = [4,2,0,3,2,5]
    Output: 9

Constraints:
    - n == height.length
    - 1 <= n <= 2*10^4
    - 0 <= height[i] <= 10^5

Approach (Two Pointers O(1) space):
    Water at position i = min(max_left, max_right) - height[i]
    Use two pointers: process whichever side has smaller max.
    If left_max < right_max: water[L] = left_max - height[L], L++
    Else:                    water[R] = right_max - height[R], R--

    height=[0,1,0,2,1,0,1,3,2,1,2,1]
    L=0,R=11, lmax=0,rmax=1
    L side: lmax=max(0,0)=0, water+=0-0=0, L=1
    L side: lmax=max(0,1)=1, water+=1-1=0, L=2
    ...continues...
    Total water = 6 ✓

Time Complexity:  O(n)
Space Complexity: O(1)
"""

def trap(height):
    L, R = 0, len(height) - 1
    left_max = right_max = 0
    water = 0
    while L < R:
        if height[L] < height[R]:
            left_max = max(left_max, height[L])
            water += left_max - height[L]
            L += 1
        else:
            right_max = max(right_max, height[R])
            water += right_max - height[R]
            R -= 1
    return water

if __name__ == "__main__":
    assert trap([0,1,0,2,1,0,1,3,2,1,2,1]) == 6
    assert trap([4,2,0,3,2,5])              == 9
    assert trap([3,0,2,0,4])                == 7
    print("All tests passed ✓")
