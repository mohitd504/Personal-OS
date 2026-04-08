"""
Problem: Task Scheduler
Difficulty: Medium
Topic: Greedy / Heap
LeetCode: #621

Description:
    Given a character array tasks and integer n (cooldown period),
    return minimum intervals to finish all tasks. CPU must wait n intervals
    between two same tasks. CPU can idle.

Examples:
    Input:  tasks=["A","A","A","B","B","B"], n=2   Output: 8
    Explanation: A→B→idle→A→B→idle→A→B = 8

    Input:  tasks=["A","A","A","B","B","B"], n=0   Output: 6

Constraints:
    - 1 <= tasks.length <= 10^4
    - n is in [0, 100]

Approach (Mathematical):
    Let max_count = highest frequency of any task.
    Let max_count_tasks = how many tasks have that frequency.
    ans = max((max_count-1)*(n+1) + max_count_tasks, len(tasks))

    The formula places max_count tasks in intervals of (n+1),
    filling gaps with other tasks or idles.

Time Complexity:  O(n)
Space Complexity: O(1)
"""

from collections import Counter

def least_interval(tasks, n):
    counts = Counter(tasks)
    max_count = max(counts.values())
    max_count_tasks = sum(1 for v in counts.values() if v == max_count)
    return max((max_count - 1) * (n + 1) + max_count_tasks, len(tasks))

if __name__ == "__main__":
    assert least_interval(["A","A","A","B","B","B"], 2) == 8
    assert least_interval(["A","A","A","B","B","B"], 0) == 6
    assert least_interval(["A","A","A","A","A","A","B","C","D","E","F","G"], 2) == 16
    print("All tests passed ✓")
