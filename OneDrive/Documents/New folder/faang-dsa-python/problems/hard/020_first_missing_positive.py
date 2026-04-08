"""
Problem: First Missing Positive
Difficulty: Hard
Topic: Arrays / Index as Hash
LeetCode: #41

Description:
    Given an unsorted integer array nums, return the smallest missing
    positive integer. Must be O(n) time and O(1) space.

Examples:
    Input:  nums = [1,2,0]       Output: 3
    Input:  nums = [3,4,-1,1]    Output: 2
    Input:  nums = [7,8,9,11,12] Output: 1

Constraints:
    - 1 <= nums.length <= 10^5
    - -2^31 <= nums[i] <= 2^31 - 1

Approach (Cyclic Sort / Index as Hash):
    The answer must be in range [1, n+1].
    Place each number x in its "correct" position: index x-1.
    After placement, scan: first index where nums[i] != i+1 is the answer.

    [3,4,-1,1]:
    Place 3 at index 2: [−1,4,3,1]
    Place −1: negative, skip: move on
    Place 4 at index 3: [−1,1,3,4]
    Place 1 at index 0: [1,−1,3,4] ... but wait, let's redo with swap logic:

    i=0: nums[0]=3, swap with nums[2]: [−1,4,3,1]... continue until stable
    Scan: i=0, nums[0]=1 ✓; i=1, nums[1]=-1 ≠ 2 → answer=2 ✓

Time Complexity:  O(n)
Space Complexity: O(1)
"""

def first_missing_positive(nums):
    n = len(nums)
    # Step 1: Place each number in its correct position
    for i in range(n):
        while 1 <= nums[i] <= n and nums[nums[i]-1] != nums[i]:
            correct = nums[i] - 1
            nums[i], nums[correct] = nums[correct], nums[i]
    # Step 2: Find first position where nums[i] != i+1
    for i in range(n):
        if nums[i] != i + 1:
            return i + 1
    return n + 1

if __name__ == "__main__":
    assert first_missing_positive([1,2,0])       == 3
    assert first_missing_positive([3,4,-1,1])    == 2
    assert first_missing_positive([7,8,9,11,12]) == 1
    assert first_missing_positive([1])            == 2
    print("All tests passed ✓")
