"""
Problem: Daily Temperatures
Difficulty: Medium
Topic: Stack / Monotonic Stack
LeetCode: #739

Description:
    Given an array of daily temperatures, return an array answer where
    answer[i] is the number of days until a warmer temperature.
    If no future warmer day exists, answer[i] = 0.

Examples:
    Input:  temps = [73,74,75,71,69,72,76,73]
    Output: [1,1,4,2,1,1,0,0]

Constraints:
    - 1 <= temps.length <= 10^5
    - 30 <= temps[i] <= 100

Approach (Monotonic Decreasing Stack):
    Stack stores indices of temperatures in decreasing order.
    When current temp > temps[stack[-1]], we found the answer for that index.

    [73,74,75,71,69,72,76,73]
    i=0(73): push 0,       stack=[0]
    i=1(74): 74>73 → pop 0, ans[0]=1-0=1. Push 1, stack=[1]
    i=2(75): 75>74 → pop 1, ans[1]=2-1=1. Push 2, stack=[2]
    i=3(71): 71<75, push.  stack=[2,3]
    i=4(69): 69<71, push.  stack=[2,3,4]
    i=5(72): 72>69 → pop 4, ans[4]=5-4=1
             72>71 → pop 3, ans[3]=5-3=2; 72<75, push 5. stack=[2,5]
    i=6(76): 76>72 → pop 5, ans[5]=6-5=1
             76>75 → pop 2, ans[2]=6-2=4; push 6. stack=[6]
    i=7(73): 73<76, push.  stack=[6,7]
    Remaining [6,7]: ans stays 0
    Result: [1,1,4,2,1,1,0,0] ✓

Time Complexity:  O(n)  — each index pushed/popped at most once
Space Complexity: O(n)
"""

def daily_temperatures(temps):
    n = len(temps)
    ans = [0] * n
    stack = []  # stores indices
    for i, t in enumerate(temps):
        while stack and temps[stack[-1]] < t:
            j = stack.pop()
            ans[j] = i - j
        stack.append(i)
    return ans

if __name__ == "__main__":
    assert daily_temperatures([73,74,75,71,69,72,76,73]) == [1,1,4,2,1,1,0,0]
    assert daily_temperatures([30,40,50,60]) == [1,1,1,0]
    assert daily_temperatures([30,60,90])    == [1,1,0]
    print("All tests passed ✓")
