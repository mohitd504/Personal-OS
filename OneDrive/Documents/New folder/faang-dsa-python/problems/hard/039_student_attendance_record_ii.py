"""
Problem: Student Attendance Record II
Difficulty: Hard
Topic: Dynamic Programming
LeetCode: #552

Description:
    Given n, count attendance records of length n that make a student eligible.
    Eligible: fewer than 2 absences ('A'), no 3+ consecutive lates ('L').
    Return count modulo 10^9+7.

Examples:
    Input: n=2  Output: 8
    Input: n=1  Output: 3 (P, A, L)
    Input: n=10101 Output: 183236316

Approach:
    State: (absences=0 or 1, trailing_lates=0,1,2)
    6 states total. Transition matrix or iterative DP.

Time: O(n)   Space: O(1)
"""

def check_record(n):
    MOD = 10**9+7
    # dp[a][l] = ways with 'a' absences and 'l' trailing lates
    dp = [[0]*3 for _ in range(2)]
    dp[0][0] = 1
    for _ in range(n):
        ndp = [[0]*3 for _ in range(2)]
        for a in range(2):
            for l in range(3):
                if dp[a][l]==0: continue
                v = dp[a][l]
                # Add 'P'
                ndp[a][0] = (ndp[a][0]+v)%MOD
                # Add 'A' (only if a==0)
                if a==0: ndp[1][0]=(ndp[1][0]+v)%MOD
                # Add 'L' (only if l<2)
                if l<2: ndp[a][l+1]=(ndp[a][l+1]+v)%MOD
        dp = ndp
    return sum(dp[a][l] for a in range(2) for l in range(3))%MOD

if __name__ == "__main__":
    assert check_record(2) == 8
    assert check_record(1) == 3
    assert check_record(10101) == 183236316
    print("All tests passed ✓")
