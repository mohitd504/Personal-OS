"""
Problem 46: Number of Music Playlists
======================================
Difficulty: Hard
Topics: Dynamic Programming, Combinatorics

Description:
Your music player contains n different songs. You want to listen to goal songs
in total for your trip. To avoid boredom, you create a playlist such that:
  - Every song is played at least once.
  - A song can only be played again only if k other songs have been played.

Given n, goal, and k, return the number of possible playlists.
Answer can be huge, return it modulo 10^9 + 7.

Examples:
    Input: goal=3, n=3, k=1
    Output: 6

    Input: goal=2, n=2, k=0
    Output: 2

    Input: goal=2, n=3, k=1
    Output: 6

Constraints:
    0 <= k < n <= goal <= 100

Approach:
    dp[i][j] = number of playlists of length i using exactly j unique songs.
    
    Transitions:
    1. Add a new song (not heard before):
       dp[i][j] += dp[i-1][j-1] * (n - (j-1))
       (n - j + 1 choices for new song)
    
    2. Replay an old song (at least k songs must have passed):
       dp[i][j] += dp[i-1][j] * max(0, j - k)
       (j - k old songs are eligible to replay)

Complexity:
    Time:  O(goal * n)
    Space: O(goal * n)
"""
def numMusicPlaylists(goal: int, n: int, k: int) -> int:
    MOD = 10**9 + 7
    # dp[i][j] = playlists of length i with j unique songs
    dp = [[0] * (n + 1) for _ in range(goal + 1)]
    dp[0][0] = 1

    for i in range(1, goal + 1):
        for j in range(1, n + 1):
            # Add a new song
            dp[i][j] += dp[i-1][j-1] * (n - (j - 1))
            # Replay an old song
            dp[i][j] += dp[i-1][j] * max(0, j - k)
            dp[i][j] %= MOD

    return dp[goal][n]


if __name__ == "__main__":
    assert numMusicPlaylists(3, 3, 1) == 6
    assert numMusicPlaylists(2, 2, 0) == 2
    assert numMusicPlaylists(2, 3, 1) == 6
    print("All tests passed!")
