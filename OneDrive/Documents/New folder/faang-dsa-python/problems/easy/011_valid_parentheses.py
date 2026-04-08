"""
Problem: Valid Parentheses
Difficulty: Easy
Topic: Stack
LeetCode: #20

Description:
    Given a string s containing only '(', ')', '{', '}', '[', ']',
    determine if the input string is valid.
    Open brackets must be closed by the same type in correct order.

Examples:
    Input:  s = "()"       Output: True
    Input:  s = "()[]{}"   Output: True
    Input:  s = "(]"       Output: False
    Input:  s = "([)]"     Output: False

Constraints:
    - 1 <= s.length <= 10^4
    - s consists of parentheses only.

Approach:
    Use a stack. Push opening brackets.
    For closing brackets, check if top of stack is matching opener.
    At end, stack must be empty.

    "([]{})" :
    '(' → push   stack=['(']
    '[' → push   stack=['(','[']
    ']' → match '[' → pop   stack=['(']
    '{' → push   stack=['(', '{']
    '}' → match '{' → pop   stack=['(']
    ')' → match '(' → pop   stack=[]
    Empty → True ✓

Time Complexity:  O(n)
Space Complexity: O(n)
"""

def is_valid(s):
    stack = []
    match = {')': '(', ']': '[', '}': '{'}
    for ch in s:
        if ch in match:
            if not stack or stack[-1] != match[ch]:
                return False
            stack.pop()
        else:
            stack.append(ch)
    return not stack


if __name__ == "__main__":
    assert is_valid("()")      == True
    assert is_valid("()[]{}")  == True
    assert is_valid("(]")      == False
    assert is_valid("([)]")    == False
    assert is_valid("{[]}")    == True
    print("All tests passed ✓")
