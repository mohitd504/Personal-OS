"""
Problem: Min Stack
Difficulty: Medium
Topic: Stack / Design
LeetCode: #155

Description:
    Design a stack that supports push, pop, top, and retrieving
    the minimum element — all in O(1) time.

Examples:
    MinStack s; s.push(-2); s.push(0); s.push(-3)
    s.getMin() → -3
    s.pop()
    s.top()    → 0
    s.getMin() → -2

Constraints:
    - -2^31 <= val <= 2^31 - 1
    - pop/top/getMin called on non-empty stack.

Approach:
    Maintain two stacks: main stack and min_stack.
    min_stack stores the minimum at each point in the stack's history.
    When pushing x, push min(x, min_stack[-1]) onto min_stack.

    push(-2): stack=[-2],    min_stack=[-2]
    push(0):  stack=[-2,0],  min_stack=[-2,-2]  (min stays -2)
    push(-3): stack=[-2,0,-3], min_stack=[-2,-2,-3]
    getMin(): min_stack[-1] = -3 ✓
    pop():    stack=[-2,0],  min_stack=[-2,-2]
    getMin(): -2 ✓

Time Complexity:  O(1) all operations
Space Complexity: O(n)
"""

class MinStack:
    def __init__(self):
        self.stack = []
        self.min_stack = []

    def push(self, val):
        self.stack.append(val)
        min_val = val if not self.min_stack else min(val, self.min_stack[-1])
        self.min_stack.append(min_val)

    def pop(self):
        self.stack.pop()
        self.min_stack.pop()

    def top(self):
        return self.stack[-1]

    def getMin(self):
        return self.min_stack[-1]

if __name__ == "__main__":
    s = MinStack()
    s.push(-2); s.push(0); s.push(-3)
    assert s.getMin() == -3
    s.pop()
    assert s.top()    == 0
    assert s.getMin() == -2
    print("All tests passed ✓")
