"""
Problem 48: Longest Chunked Palindrome Decomposition
=====================================================
Difficulty: Hard
Topics: Greedy, Two Pointers, Hashing / Rolling Hash

Description:
Return the largest possible k such that there exists a_1, a_2, ..., a_k with:
  - Each a_i is a non-empty string.
  - Their concatenation is equal to text.
  - For all 1 <= i <= k, a_i == a_{k+1-i}  (palindrome structure)

Examples:
    Input: text = "ghiabcdefhelloadamhelloabcdefghi"
    Output: 7
    Explanation: "ghi" + "abcdef" + "hello" + "adam" + "hello" + "abcdef" + "ghi"

    Input: text = "merchant"
    Output: 1

    Input: text = "antaprezatepzapreanta"
    Output: 11

Constraints:
    1 <= text.length <= 1000
    text consists only of lowercase English letters.

Approach (Greedy Two Pointers):
    - Use two pointers l, r from both ends.
    - Greedily find the shortest matching prefix and suffix.
    - Count += 2 for each match, +1 for remaining middle if non-empty.
    - Greedy works: taking shortest match is always at least as good as longer.

Complexity:
    Time:  O(n^2) worst case with naive string matching
    Space: O(n)
"""
def longestDecomposition(text: str) -> int:
    n = len(text)
    count = 0
    l, r = 0, n

    while l < r:
        found = False
        for length in range(1, (r - l) // 2 + 1):
            if text[l:l+length] == text[r-length:r]:
                count += 2
                l += length
                r -= length
                found = True
                break
        if not found:
            # Remaining middle portion counts as 1
            count += 1
            break

    return count


if __name__ == "__main__":
    assert longestDecomposition("ghiabcdefhelloadamhelloabcdefghi") == 7
    assert longestDecomposition("merchant") == 1
    assert longestDecomposition("antaprezatepzapreanta") == 11
    assert longestDecomposition("a") == 1
    assert longestDecomposition("aa") == 2
    assert longestDecomposition("aaa") == 3
    print("All tests passed!")
