"""
Problem: Largest Rectangle in Histogram
Difficulty: Hard
Topic: Stack / Monotonic Stack
LeetCode: #84

Description:
    Given an array of integers heights representing histogram bar heights
    (width=1 each), return the area of the largest rectangle.

Examples:
    Input:  heights = [2,1,5,6,2,3]   Output: 10   (bars 5 and 6)
    Input:  heights = [2,4]             Output: 4

Constraints:
    - 1 <= heights.length <= 10^5
    - 0 <= heights[i] <= 10^4

Approach (Monotonic Increasing Stack):
    Stack stores (index, height) in increasing height order.
    When current height < stack top: pop and calculate area.
    Width = current_index - stack_top_index (after pop)

    [2,1,5,6,2,3]:
    i=0(2): push (0,2)
    i=1(1): 1<2 → pop (0,2), area=2*(1-0)=2; start=0; push(0,1) [extend back]
    i=2(5): push (2,5)
    i=3(6): push (3,6)
    i=4(2): pop (3,6), area=6*(4-3)=6; pop (2,5), area=5*(4-2)=10 ← max; push(2,2)
    i=5(3): push (5,3)
    End: remaining bars extend to end
    pop (5,3): area=3*(6-5)=3
    pop (2,2): area=2*(6-2)=8
    pop (0,1): area=1*(6-0)=6
    Answer: 10 ✓

Time Complexity:  O(n)
Space Complexity: O(n)
"""

def largest_rectangle_area(heights):
    stack = []  # (start_index, height)
    max_area = 0
    for i, h in enumerate(heights):
        start = i
        while stack and stack[-1][1] > h:
            idx, height = stack.pop()
            max_area = max(max_area, height * (i - idx))
            start = idx
        stack.append((start, h))
    for idx, height in stack:
        max_area = max(max_area, height * (len(heights) - idx))
    return max_area

if __name__ == "__main__":
    assert largest_rectangle_area([2,1,5,6,2,3]) == 10
    assert largest_rectangle_area([2,4])          == 4
    assert largest_rectangle_area([1])            == 1
    assert largest_rectangle_area([6,2,5,4,5,1,6])== 12
    print("All tests passed ✓")
