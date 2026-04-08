"""
Problem: Implement Queue using Stacks
Difficulty: Easy
Topic: Stack / Queue Design
LeetCode: #232

Description:
    Implement a FIFO queue using only two stacks.
    Implement: push(x), pop(), peek(), empty().

Examples:
    MyQueue q = new MyQueue()
    q.push(1); q.push(2)
    q.peek()  → 1
    q.pop()   → 1
    q.empty() → False

Constraints:
    - 1 <= x <= 9
    - At most 100 calls to push, pop, peek, empty.
    - pop/peek only called when queue is not empty.

Approach:
    Two stacks: in_stack (for push), out_stack (for pop/peek).
    Push: always to in_stack.
    Pop/Peek: if out_stack empty, transfer ALL from in_stack.
    This gives amortized O(1) per operation.

    push(1): in=[1]  out=[]
    push(2): in=[1,2] out=[]
    peek():  out empty → transfer: in=[], out=[2,1]
             out[-1] = 1 ✓
    pop():   out[-1]=1 → pop → out=[2]
    peek():  out[-1]=2 ✓

Time Complexity:  O(1) amortized for all operations
Space Complexity: O(n)
"""

class MyQueue:
    def __init__(self):
        self.in_stack  = []
        self.out_stack = []

    def push(self, x):
        self.in_stack.append(x)

    def _transfer(self):
        if not self.out_stack:
            while self.in_stack:
                self.out_stack.append(self.in_stack.pop())

    def pop(self):
        self._transfer()
        return self.out_stack.pop()

    def peek(self):
        self._transfer()
        return self.out_stack[-1]

    def empty(self):
        return not self.in_stack and not self.out_stack


if __name__ == "__main__":
    q = MyQueue()
    q.push(1); q.push(2)
    assert q.peek()  == 1
    assert q.pop()   == 1
    assert q.empty() == False
    assert q.pop()   == 2
    assert q.empty() == True
    print("All tests passed ✓")
