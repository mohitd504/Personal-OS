"""
Problem: Gas Station
Difficulty: Medium
Topic: Arrays / Greedy
LeetCode: #134

Description:
    n gas stations in a circle. gas[i] = gas at station i.
    cost[i] = gas to travel from station i to i+1.
    Find starting station index that lets you complete the circuit.
    Return -1 if not possible. Answer is unique if it exists.

Examples:
    Input:  gas=[1,2,3,4,5], cost=[3,4,5,1,2]   Output: 3
    Input:  gas=[2,3,4],     cost=[3,4,3]         Output: -1

Constraints:
    - 1 <= n <= 10^5
    - 0 <= gas[i], cost[i] <= 10^4

Approach:
    Key insight: if total gas >= total cost, a solution exists.
    Greedily find the start: if tank drops below 0 at station i,
    no station between start and i can be the answer → try i+1.

    gain[i] = gas[i] - cost[i]
    [1-3, 2-4, 3-5, 4-1, 5-2] = [-2,-2,-2,3,3]
    Total = 0 >= 0 → solution exists
    Tank: start=0
    i=0: -2 < 0 → start=1, tank=0
    i=1: -2 < 0 → start=2, tank=0
    i=2: -2 < 0 → start=3, tank=0
    i=3: +3 → tank=3
    i=4: +3 → tank=6 > 0
    Answer: 3 ✓

Time Complexity:  O(n)
Space Complexity: O(1)
"""

def can_complete_circuit(gas, cost):
    if sum(gas) < sum(cost): return -1
    tank = 0
    start = 0
    for i in range(len(gas)):
        tank += gas[i] - cost[i]
        if tank < 0:
            start = i + 1
            tank = 0
    return start

if __name__ == "__main__":
    assert can_complete_circuit([1,2,3,4,5],[3,4,5,1,2]) == 3
    assert can_complete_circuit([2,3,4],[3,4,3])          == -1
    print("All tests passed ✓")
