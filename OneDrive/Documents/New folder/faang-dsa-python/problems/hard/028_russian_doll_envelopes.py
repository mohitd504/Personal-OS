"""
Problem: Russian Doll Envelopes
Difficulty: Hard
Topic: Dynamic Programming / Binary Search
LeetCode: #354

Description:
    Given envelopes [w,h], find the maximum number you can nest
    (must be strictly increasing in both w and h).

Examples:
    Input:  [[5,4],[6,4],[6,7],[2,3]]   Output: 3  ([2,3],[5,4],[6,7])

Approach:
    Sort by width ascending, then height DESCENDING (same width can't nest).
    Run LIS on heights only.

    Sorted: [[2,3],[5,4],[6,7],[6,4]] → heights descending for same w:
    [[2,3],[5,4],[6,7],[6,4]]
    LIS on [3,4,7,4]: tails = [3]→[3,4]→[3,4,7]→[3,4,4]? no [3,4,7] remains max 3
    Wait: [[2,3],[5,4],[6,7],[6,4]] → sort: [[2,3],[5,4],[6,7],[6,4]]
    After sort(w asc, h desc): [[2,3],[5,4],[6,7],[6,4]]
    Heights: [3,4,7,4] → LIS patience: [3]→[3,4]→[3,4,7]→[3,4,4] → len=3 ✓

Time: O(n log n)   Space: O(n)
"""

import bisect

def max_envelopes(envelopes):
    envelopes.sort(key=lambda x: (x[0], -x[1]))
    tails = []
    for _, h in envelopes:
        pos = bisect.bisect_left(tails, h)
        if pos == len(tails): tails.append(h)
        else: tails[pos] = h
    return len(tails)

if __name__ == "__main__":
    assert max_envelopes([[5,4],[6,4],[6,7],[2,3]]) == 3
    assert max_envelopes([[1,1],[1,1],[1,1]])        == 1
    assert max_envelopes([[2,100],[3,200],[4,300],[5,500],[5,400],[5,250],[6,370],[6,360],[7,380]]) == 5
    print("All tests passed ✓")
