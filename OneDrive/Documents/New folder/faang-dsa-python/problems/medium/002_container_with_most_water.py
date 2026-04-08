"""
Problem: Container With Most Water
Difficulty: Medium
Topic: Arrays / Two Pointers / Greedy
LeetCode: #11

Description:
    Given n vertical lines height[i], find two lines that together with
    the x-axis forms a container that holds the most water.

Examples:
    Input:  height = [1,8,6,2,5,4,8,3,7]
    Output: 49   (lines at index 1 and 8: min(8,7)*(8-1)=7*7=49)

Constraints:
    - n >= 2
    - 0 <= height[i] <= 10^4

Approach:
    Two pointers at both ends. Container water = min(h[L],h[R]) * (R-L).
    To maximize: always move the SHORTER line inward (moving the taller
    can never increase water — width decreases, height bounded by shorter).

    height=[1,8,6,2,5,4,8,3,7]
    L=0(1)  R=8(7): water=1*8=8,   move L (shorter)
    L=1(8)  R=8(7): water=7*7=49 ← max, move R
    L=1(8)  R=7(3): water=3*6=18,  move R
    L=1(8)  R=6(8): water=8*5=40,  tie → move L
    ... continue
    Answer: 49

Time Complexity:  O(n)
Space Complexity: O(1)
"""

def max_area(height):
    L, R = 0, len(height) - 1
    best = 0
    while L < R:
        water = min(height[L], height[R]) * (R - L)
        best = max(best, water)
        if height[L] < height[R]: L += 1
        else:                     R -= 1
    return best

if __name__ == "__main__":
    assert max_area([1,8,6,2,5,4,8,3,7]) == 49
    assert max_area([1,1]) == 1
    print("All tests passed ✓")
