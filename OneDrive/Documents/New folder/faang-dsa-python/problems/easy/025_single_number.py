"""
Problem: Single Number
Difficulty: Easy
Topic: Arrays / Bit Manipulation
LeetCode: #136

Description:
    Given a non-empty array of integers where every element appears twice
    except for one — find that single one.
    Must be O(n) time and O(1) space.

Examples:
    Input:  nums = [2,2,1]       Output: 1
    Input:  nums = [4,1,2,1,2]   Output: 4

Constraints:
    - 1 <= nums.length <= 3*10^4
    - -3*10^4 <= nums[i] <= 3*10^4
    - Each element appears twice except for one.

Approach (XOR Trick):
    XOR properties:
      a ^ a = 0   (same number cancels)
      a ^ 0 = a   (zero identity)
      XOR is commutative and associative

    So: a ^ b ^ a = b ^ (a ^ a) = b ^ 0 = b

    [4,1,2,1,2]:
    0 ^ 4 = 4
    4 ^ 1 = 5
    5 ^ 2 = 7
    7 ^ 1 = 6   (1s cancel: 5 XOR 1 = 4, then 4 XOR 2 = 6... let's recalc)
    Actually:
    4^1^2^1^2 = 4^(1^1)^(2^2) = 4^0^0 = 4 ✓

Time Complexity:  O(n)
Space Complexity: O(1)
"""

def single_number(nums):
    result = 0
    for num in nums:
        result ^= num
    return result


if __name__ == "__main__":
    assert single_number([2,2,1])       == 1
    assert single_number([4,1,2,1,2])   == 4
    assert single_number([1])            == 1
    print("All tests passed ✓")
