"""
Problem: Valid Palindrome
Difficulty: Easy
Topic: Strings / Two Pointers
LeetCode: #125

Description:
    A phrase is a palindrome if, after converting all uppercase letters to
    lowercase and removing all non-alphanumeric characters, it reads the
    same forward and backward.
    Return true if s is a palindrome, false otherwise.

Examples:
    Input:  s = "A man, a plan, a canal: Panama"
    Output: True   ("amanaplanacanalpanama" is a palindrome)

    Input:  s = "race a car"
    Output: False  ("raceacar" is not a palindrome)

Constraints:
    - 1 <= s.length <= 2*10^5
    - s consists only of printable ASCII characters.

Approach:
    Two-pointer approach: place one pointer at start, one at end.
    Skip non-alphanumeric characters on both sides.
    Compare characters (case-insensitive). If any mismatch → False.

    Walkthrough ("A man, a plan, a canal: Panama"):
    After cleaning: "amanaplanacanalpanama"
    L pointer: a m a n a p l a n a c a n a l p a n a m a
    R pointer:                                          a  ← from right
    They mirror → palindrome ✓

Time Complexity:  O(n)
Space Complexity: O(1)
"""

def is_palindrome(s):
    L, R = 0, len(s) - 1
    while L < R:
        while L < R and not s[L].isalnum(): L += 1
        while L < R and not s[R].isalnum(): R -= 1
        if s[L].lower() != s[R].lower():
            return False
        L += 1; R -= 1
    return True


if __name__ == "__main__":
    assert is_palindrome("A man, a plan, a canal: Panama") == True
    assert is_palindrome("race a car")                     == False
    assert is_palindrome(" ")                              == True
    print("All tests passed ✓")
