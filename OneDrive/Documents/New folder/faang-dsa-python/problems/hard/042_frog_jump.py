"""
Problem 42: Frog Jump
=====================
Difficulty: Hard
Topics: Dynamic Programming, Hash Map

Description:
A frog wants to cross a river. The river is divided into some units, and at
each unit there may or may not be a stone. The frog can jump onto the last stone.

Given a list of stones' positions (in units), determine if the frog can cross,
ending at the last stone. The frog starts at position 0 and must jump to
position 1 on the first jump. After that, if the frog's last jump was k units,
its next jump must be k-1, k, or k+1 units.

Examples:
    Input: stones = [0,1,3,5,6,8,12,17]
    Output: True

    Input: stones = [0,1,2,3,4,8,9,11]
    Output: False

Constraints:
    2 <= stones.length <= 2000
    0 <= stones[i] <= 2^31 - 1

Approach:
    - dp[pos] = set of jump sizes that can reach position pos
    - For each stone and each jump size k that reached it,
      try k-1, k, k+1 as next jumps.
    - Use a set for O(1) position lookup.

Complexity:
    Time:  O(n^2)
    Space: O(n^2)
"""
from typing import List
from collections import defaultdict


def canCross(stones: List[int]) -> bool:
    stone_set = set(stones)
    # dp[pos] = set of k values (jump sizes) that can reach pos
    dp = defaultdict(set)
    dp[0].add(0)

    for stone in stones:
        for k in dp[stone]:
            for next_k in [k-1, k, k+1]:
                if next_k > 0 and stone + next_k in stone_set:
                    dp[stone + next_k].add(next_k)

    return bool(dp[stones[-1]])


if __name__ == "__main__":
    assert canCross([0,1,3,5,6,8,12,17]) == True
    assert canCross([0,1,2,3,4,8,9,11]) == False
    assert canCross([0,1]) == True
    assert canCross([0,2]) == False
    print("All tests passed!")
