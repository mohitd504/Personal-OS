"""
Problem 49: Stone Game IV
==========================
Difficulty: Hard
Topics: Dynamic Programming, Game Theory

Description:
Alice and Bob take turns playing a game, with Alice starting first.
Initially, there are n stones in a pile. On each player's turn, that player
makes a move consisting of removing any non-zero square number of stones from the pile.

The player who cannot make a move loses. Given a positive integer n,
return True if and only if Alice wins the game.

Examples:
    Input: n = 1
    Output: True  (Alice removes 1 stone)

    Input: n = 2
    Output: False (Alice must remove 1, Bob removes 1, Alice loses)

    Input: n = 4
    Output: True  (Alice removes 4)

Constraints:
    1 <= n <= 10^5

Approach:
    dp[i] = True if the current player wins with i stones.
    
    dp[0] = False (no moves, current player loses)
    dp[i] = True if any dp[i - k^2] == False for perfect square k^2 <= i
    
    This is a standard Sprague-Grundy / Game DP.

Complexity:
    Time:  O(n * sqrt(n))
    Space: O(n)
"""
import math


def winnerSquareGame(n: int) -> bool:
    dp = [False] * (n + 1)
    squares = [i * i for i in range(1, int(math.sqrt(n)) + 1)]

    for i in range(1, n + 1):
        for sq in squares:
            if sq > i:
                break
            if not dp[i - sq]:
                dp[i] = True
                break

    return dp[n]


if __name__ == "__main__":
    assert winnerSquareGame(1) == True
    assert winnerSquareGame(2) == False
    assert winnerSquareGame(4) == True
    assert winnerSquareGame(7) == False
    assert winnerSquareGame(17) == False
    assert winnerSquareGame(100) == True
    print("All tests passed!")
