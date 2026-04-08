"""
Problem: Longest Valid Parentheses
Difficulty: Hard
Topic: Stack / Dynamic Programming
LeetCode: #32

Description:
    Given a string s containing '(' and ')', return the length of the
    longest valid (well-formed) parentheses substring.

Examples:
    Input:  s = "(()"      Output: 2  ("()")
    Input:  s = ")()())"   Output: 4  ("()()")
    Input:  s = ""         Output: 0

Constraints:
    - 0 <= s.length <= 3*10^4

Approach (Stack):
    Stack stores indices. Initialize with [-1] as base.
    '(': push index.
    ')': pop top.
      - Stack empty after pop: push current index as new base.
      - Stack not empty: length = current_index - stack[-1].

    ")()())":
    stack=[-1]
    i=0 ')': pop -1, empty → push 0, stack=[0]
    i=1 '(': push 1, stack=[0,1]
    i=2 ')': pop 1, stack=[0], len=2-0=2 ← best
    i=3 '(': push 3, stack=[0,3]
    i=4 ')': pop 3, stack=[0], len=4-0=4 ← best
    i=5 ')': pop 0, empty → push 5, stack=[5]
    Answer: 4 ✓

Time Complexity:  O(n)
Space Complexity: O(n)
"""

def longest_valid_parentheses(s):
    stack = [-1]
    best = 0
    for i, ch in enumerate(s):
        if ch == '(':
            stack.append(i)
        else:
            stack.pop()
            if not stack:
                stack.append(i)
            else:
                best = max(best, i - stack[-1])
    return best

if __name__ == "__main__":
    assert longest_valid_parentheses("(()") == 2
    assert longest_valid_parentheses(")()())") == 4
    assert longest_valid_parentheses("") == 0
    assert longest_valid_parentheses("()(())") == 6
    print("All tests passed ✓")
