"""
Problem: Min Cost Climbing Stairs
Difficulty: Easy
Topic: Dynamic Programming
LeetCode: #746

Description:
    You are given an integer array cost where cost[i] is the cost of the
    i-th step. You can climb 1 or 2 steps. Pay the cost of the step you
    are on, then step to 1 or 2 steps up. You can start from step 0 or 1.
    Return the minimum cost to reach the top.

Examples:
    Input:  cost = [10,15,20]     Output: 15  (step 1 → top)
    Input:  cost = [1,100,1,1,1,100,1,1,100,1]  Output: 6

Constraints:
    - 2 <= cost.length <= 1000
    - 0 <= cost[i] <= 999

Approach:
    dp[i] = minimum cost to reach step i
    dp[0] = cost[0], dp[1] = cost[1]
    dp[i] = cost[i] + min(dp[i-1], dp[i-2])
    Answer = min(dp[-1], dp[-2])

    cost = [10, 15, 20]
    dp[0]=10, dp[1]=15
    dp[2]=20+min(15,10)=30
    Answer = min(30,15) = 15 ✓

Time Complexity:  O(n)
Space Complexity: O(1)
"""

def min_cost_climbing_stairs(cost):
    n = len(cost)
    prev2, prev1 = cost[0], cost[1]
    for i in range(2, n):
        prev2, prev1 = prev1, cost[i] + min(prev1, prev2)
    return min(prev1, prev2)


if __name__ == "__main__":
    assert min_cost_climbing_stairs([10,15,20]) == 15
    assert min_cost_climbing_stairs([1,100,1,1,1,100,1,1,100,1]) == 6
    print("All tests passed ✓")
