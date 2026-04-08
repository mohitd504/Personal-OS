"""
Problem: Maximum Frequency Stack
Difficulty: Hard
Topic: Design / Stack / Hashing
LeetCode: #895

Description:
    FreqStack supports push and pop. pop() returns the most frequent element.
    On ties, return the most recently pushed.

Examples:
    push(5,7,5,7,4,5); pop()→5; pop()→7; pop()→5; pop()→4

Approach:
    freq: element → frequency
    group: frequency → stack of elements
    max_freq: track current maximum frequency

Time: O(1) push/pop   Space: O(n)
"""

from collections import defaultdict

class FreqStack:
    def __init__(self):
        self.freq = defaultdict(int)
        self.group = defaultdict(list)
        self.max_freq = 0

    def push(self, val):
        self.freq[val] += 1
        f = self.freq[val]
        self.max_freq = max(self.max_freq, f)
        self.group[f].append(val)

    def pop(self):
        val = self.group[self.max_freq].pop()
        self.freq[val] -= 1
        if not self.group[self.max_freq]:
            self.max_freq -= 1
        return val

if __name__ == "__main__":
    fs = FreqStack()
    for v in [5,7,5,7,4,5]: fs.push(v)
    assert fs.pop() == 5
    assert fs.pop() == 7
    assert fs.pop() == 5
    assert fs.pop() == 4
    print("All tests passed ✓")
