"""
Problem: Cherry Pickup
Difficulty: Hard
Topic: Dynamic Programming (3D)
LeetCode: #741

Description:
    n×n grid: 0=empty, 1=cherry, -1=thorn.
    Walk from (0,0) to (n-1,n-1) and back. Collect max cherries.
    (Equivalent: two people walk from (0,0) to (n-1,n-1) simultaneously.)

Examples:
    Input:  [[0,1,-1],[1,0,-1],[1,1,1]]   Output: 5

Approach:
    Simulate two walkers simultaneously (both take k steps).
    dp[k][r1][r2] where c1=k-r1, c2=k-r2.
    At each step, both move right or down.

Time: O(n³)   Space: O(n²) rolling
"""

def cherry_pickup(grid):
    n = len(grid)
    NEG_INF = float('-inf')
    dp = [[NEG_INF]*n for _ in range(n)]
    dp[0][0] = grid[0][0]
    for k in range(1, 2*n-1):
        ndp = [[NEG_INF]*n for _ in range(n)]
        for r1 in range(max(0,k-n+1), min(n,k+1)):
            c1 = k - r1
            if grid[r1][c1] == -1: continue
            for r2 in range(r1, min(n,k+1)):
                c2 = k - r2
                if grid[r2][c2] == -1: continue
                cherries = grid[r1][c1] + (grid[r2][c2] if r2!=r1 else 0)
                best = NEG_INF
                for pr1 in [r1,r1-1]:
                    for pr2 in [r2,r2-1]:
                        if pr1>=0 and pr2>=0:
                            best = max(best, dp[pr1][pr2])
                if best != NEG_INF:
                    ndp[r1][r2] = max(ndp[r1][r2], best+cherries)
        dp = ndp
    return max(0, dp[n-1][n-1])

if __name__ == "__main__":
    assert cherry_pickup([[0,1,-1],[1,0,-1],[1,1,1]]) == 5
    assert cherry_pickup([[1,1,-1],[1,-1,1],[-1,1,1]]) == 0
    print("All tests passed ✓")
