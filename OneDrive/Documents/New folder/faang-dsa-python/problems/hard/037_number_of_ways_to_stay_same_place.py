"""
Problem: Number of Ways to Stay in the Same Place After Some Steps
Difficulty: Hard
Topic: Dynamic Programming
LeetCode: #1269

Description:
    You have a pointer at index 0 in array of length arrLen.
    Each step: move left, right, or stay.
    After exactly steps steps, return ways to be back at index 0. Mod 10^9+7.

Examples:
    Input:  steps=3, arrLen=2   Output: 4
    Input:  steps=2, arrLen=4   Output: 3

Approach:
    dp[i] = ways to be at position i after current step.
    Only need to go up to min(steps//2+1, arrLen) positions.

Time: O(steps * min(steps, arrLen))   Space: O(min(steps, arrLen))
"""

def num_ways(steps, arrLen):
    MOD = 10**9+7
    max_pos = min(steps//2+1, arrLen)
    dp = [0]*max_pos; dp[0] = 1
    for _ in range(steps):
        ndp = [0]*max_pos
        for i in range(max_pos):
            if dp[i]==0: continue
            ndp[i] = (ndp[i]+dp[i])%MOD
            if i>0: ndp[i-1]=(ndp[i-1]+dp[i])%MOD
            if i+1<max_pos: ndp[i+1]=(ndp[i+1]+dp[i])%MOD
        dp = ndp
    return dp[0]

if __name__ == "__main__":
    assert num_ways(3,2)  == 4
    assert num_ways(2,4)  == 3
    assert num_ways(4,2)  == 8
    print("All tests passed ✓")
