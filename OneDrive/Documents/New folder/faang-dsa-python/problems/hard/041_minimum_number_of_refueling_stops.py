"""
Problem 41: Minimum Number of Refueling Stops
==============================================
Difficulty: Hard
Topics: Greedy, Heap (Priority Queue), Dynamic Programming

Description:
A car travels from a starting position to a destination which is `target` miles away.
Along the way, there are gas stations. Each `station[i] = [position, fuel]` represents
a station at mile `position` that has `fuel` liters of gas.

The car starts with `startFuel` liters. It uses 1 liter per mile.
Return the minimum number of refueling stops needed to reach the destination.
Return -1 if impossible.

Examples:
    Input: target=100, startFuel=10, stations=[[10,60],[20,30],[30,30],[60,40]]
    Output: 2

    Input: target=1, startFuel=1, stations=[]
    Output: 0

Constraints:
    1 <= target, startFuel <= 10^9
    0 <= stations.length <= 500

Approach (Greedy + Max-Heap):
    - Drive as far as possible. When you run out of fuel, greedily pick the
      largest fuel stop you've passed.
    - Use a max-heap of fuels of stations passed.
    - Each time we refuel, increment stop count.
    - If heap empty and can't reach next station/target → -1.

Complexity:
    Time:  O(n log n) — each station pushed/popped once from heap
    Space: O(n)
"""
import heapq
from typing import List


def minRefuelStops(target: int, startFuel: int, stations: List[List[int]]) -> int:
    # max-heap (negate for Python's min-heap)
    heap = []
    fuel = startFuel
    stops = 0
    prev = 0  # previous position

    stations.append([target, 0])  # treat destination as final station

    for pos, cap in stations:
        fuel -= (pos - prev)  # fuel used to reach this station
        # while we can't reach this position, refuel from best past station
        while fuel < 0:
            if not heap:
                return -1
            fuel += -heapq.heappop(heap)  # take largest available fuel
            stops += 1
        heapq.heappush(heap, -cap)  # add this station to available options
        prev = pos

    return stops


if __name__ == "__main__":
    assert minRefuelStops(100, 10, [[10,60],[20,30],[30,30],[60,40]]) == 2
    assert minRefuelStops(1, 1, []) == 0
    assert minRefuelStops(100, 1, [[10,100]]) == -1
    assert minRefuelStops(1000000000, 1000000000, []) == 0
    print("All tests passed!")
