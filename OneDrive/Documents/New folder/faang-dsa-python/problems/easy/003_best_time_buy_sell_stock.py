"""
Problem: Best Time to Buy and Sell Stock
Difficulty: Easy
Topic: Arrays / Greedy
LeetCode: #121

Description:
    You are given an array prices where prices[i] is the price of a stock
    on day i. Maximize profit by choosing a single day to buy and a later
    day to sell. Return the maximum profit (0 if no profit possible).

Examples:
    Input:  prices = [7,1,5,3,6,4]
    Output: 5    (buy day 2 at price 1, sell day 5 at price 6)

    Input:  prices = [7,6,4,3,1]
    Output: 0    (prices only decrease, no profit possible)

Constraints:
    - 1 <= prices.length <= 10^5
    - 0 <= prices[i] <= 10^4

Approach:
    Track the minimum price seen so far (best buying opportunity).
    At each price, compute profit = current_price - min_price.
    Update max profit if this is better.

    Walkthrough [7,1,5,3,6,4]:
    day 0: price=7, min=7,  profit=0,  max=0
    day 1: price=1, min=1,  profit=0,  max=0  (new min!)
    day 2: price=5, min=1,  profit=4,  max=4
    day 3: price=3, min=1,  profit=2,  max=4
    day 4: price=6, min=1,  profit=5,  max=5  ← answer
    day 5: price=4, min=1,  profit=3,  max=5

Time Complexity:  O(n)
Space Complexity: O(1)
"""

def max_profit(prices):
    min_price = float('inf')
    max_profit = 0
    for price in prices:
        if price < min_price:
            min_price = price
        elif price - min_price > max_profit:
            max_profit = price - min_price
    return max_profit


if __name__ == "__main__":
    assert max_profit([7,1,5,3,6,4]) == 5
    assert max_profit([7,6,4,3,1])   == 0
    assert max_profit([1,2])         == 1
    print("All tests passed ✓")
