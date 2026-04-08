"""
Problem: Evaluate Reverse Polish Notation
Difficulty: Medium
Topic: Stack / Math
LeetCode: #150

Description:
    Evaluate an expression in Reverse Polish Notation.
    Valid operators: +, -, *, /. Division truncates toward zero.

Examples:
    Input:  ["2","1","+","3","*"]    Output: 9   ((2+1)*3)
    Input:  ["4","13","5","/","+"]   Output: 6   (4+(13/5))
    Input:  ["10","6","9","3","+","-11","*","/","*","17","+","5","+"]
    Output: 22

Constraints:
    - 1 <= tokens.length <= 10^4
    - tokens[i] is an operator or integer in [-200, 200]

Approach:
    Use a stack. For each token:
    - If number: push onto stack
    - If operator: pop two operands, apply operator, push result

    ["2","1","+","3","*"]:
    "2" → stack=[2]
    "1" → stack=[2,1]
    "+" → pop 1,2 → 2+1=3 → stack=[3]
    "3" → stack=[3,3]
    "*" → pop 3,3 → 3*3=9 → stack=[9]
    Result: 9 ✓

Time Complexity:  O(n)
Space Complexity: O(n)
"""

def eval_rpn(tokens):
    stack = []
    for token in tokens:
        if token in {'+', '-', '*', '/'}:
            b, a = stack.pop(), stack.pop()
            if   token == '+': stack.append(a + b)
            elif token == '-': stack.append(a - b)
            elif token == '*': stack.append(a * b)
            else:              stack.append(int(a / b))  # truncate toward zero
        else:
            stack.append(int(token))
    return stack[0]

if __name__ == "__main__":
    assert eval_rpn(["2","1","+","3","*"])  == 9
    assert eval_rpn(["4","13","5","/","+"]) == 6
    assert eval_rpn(["10","6","9","3","+","-11","*","/","*","17","+","5","+"]) == 22
    print("All tests passed ✓")
