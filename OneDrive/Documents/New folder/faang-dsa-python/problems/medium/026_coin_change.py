"""
Problem: Coin Change
Difficulty: Medium
Topic: Dynamic Programming / Unbounded Knapsack
LeetCode: #322

Description:
    Given coins of different denominations and an amount, find the minimum
    number of coins to make up that amount. Return -1 if not possible.

Examples:
    Input:  coins=[1,5,11], amount=15   Output: 3  (5+5+5 or 11+3*1? min is 5+5+5=3)
    Input:  coins=[1,5,11], amount=15:  11+3=4 or 5+5+5=3 → 3
    Input:  coins=[2], amount=3         Output: -1

Constraints:
    - 1 <= coins.length <= 12
    - 1 <= coins[i] <= 2^31 - 1
    - 0 <= amount <= 10^4

Approach:
    Unbounded knapsack variant.
    dp[a] = minimum coins to make amount a.
    For each coin c, for each amount a >= c:
      dp[a] = min(dp[a], dp[a-c] + 1)

    coins=[1,5,11], amount=15:
    dp[0]=0
    After coin 1: dp=[0,1,2,...,15]
    After coin 5: dp[5]=min(5,dp[0]+1)=1, dp[10]=2, dp[15]=3
    After coin 11: dp[11]=min(11,dp[0]+1)=1, dp[15]=min(3,dp[4]+1)=min(3,5)=3
    Answer: dp[15]=3 ✓

Time Complexity:  O(amount * coins)
Space Complexity: O(amount)
"""

def coin_change(coins, amount):
    dp = [float('inf')] * (amount + 1)
    dp[0] = 0
    for coin in coins:
        for a in range(coin, amount + 1):
            dp[a] = min(dp[a], dp[a - coin] + 1)
    return dp[amount] if dp[amount] != float('inf') else -1

if __name__ == "__main__":
    assert coin_change([1,5,11], 15) == 3
    assert coin_change([1,2,5], 11)  == 3
    assert coin_change([2], 3)       == -1
    assert coin_change([1], 0)       == 0
    print("All tests passed ✓")
