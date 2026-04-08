"""
Problem: Decode String
Difficulty: Medium
Topic: Stack / Recursion
LeetCode: #394

Description:
    Given an encoded string, return its decoded string.
    Encoding: k[encoded_string] means repeat encoded_string k times.

Examples:
    Input:  s = "3[a]2[bc]"     Output: "aaabcbc"
    Input:  s = "3[a2[c]]"      Output: "accaccacc"
    Input:  s = "2[abc]3[cd]ef" Output: "abcabccdcdcdef"

Constraints:
    - 1 <= s.length <= 30
    - s has no extra white spaces; digits are for k only (1-300).

Approach:
    Stack. For each character:
    - Digit: build current number
    - '[': push (current_string, current_num) onto stack, reset
    - ']': pop (prev_string, num), append current_string * num to prev
    - Letter: append to current string

    "3[a2[c]]":
    '3': num=3
    '[': push ("",3), curr=""
    'a': curr="a"
    '2': num=2
    '[': push ("a",2), curr=""
    'c': curr="c"
    ']': pop ("a",2), curr="a"+"cc"="acc"
    ']': pop ("",3),  curr=""+"accaccacc"="accaccacc"
    Answer: "accaccacc" ✓

Time Complexity:  O(max_k^depth * n)
Space Complexity: O(n)
"""

def decode_string(s):
    stack = []
    curr_str = ""
    curr_num = 0
    for ch in s:
        if ch.isdigit():
            curr_num = curr_num * 10 + int(ch)
        elif ch == '[':
            stack.append((curr_str, curr_num))
            curr_str, curr_num = "", 0
        elif ch == ']':
            prev_str, num = stack.pop()
            curr_str = prev_str + curr_str * num
        else:
            curr_str += ch
    return curr_str

if __name__ == "__main__":
    assert decode_string("3[a]2[bc]")     == "aaabcbc"
    assert decode_string("3[a2[c]]")      == "accaccacc"
    assert decode_string("2[abc]3[cd]ef") == "abcabccdcdcdef"
    print("All tests passed ✓")
