"""
Problem: 3Sum
Difficulty: Medium
Topic: Arrays / Two Pointers
LeetCode: #15

Description:
    Given an integer array nums, return all unique triplets [nums[i], nums[j], nums[k]]
    such that i!=j!=k and nums[i]+nums[j]+nums[k]==0.

Examples:
    Input:  nums = [-1,0,1,2,-1,-4]
    Output: [[-1,-1,2],[-1,0,1]]

    Input:  nums = [0,0,0]
    Output: [[0,0,0]]

Constraints:
    - 3 <= nums.length <= 3000
    - -10^5 <= nums[i] <= 10^5

Approach:
    Sort array. For each index i, use two pointers L=i+1, R=end.
    Skip duplicates at i to avoid duplicate triplets.
    Move L right if sum too small, R left if too large.

    Sorted: [-4,-1,-1,0,1,2]
    i=-4: L=-1,R=2 → -4+-1+2=-3 <0 → L++
          L=-1,R=2 → -4+-1+2=-3 <0 → L++
          L=0, R=2 → -4+0+2=-2 <0 → L++
          L=1, R=2 → -4+1+2=-1 <0 → L++
    i=-1(first): L=-1,R=2 → -1+-1+2=0 ✓ → add
                 L=0, R=1 → -1+0+1=0  ✓ → add
    i=-1(dup): skip
    ...

Time Complexity:  O(n²)
Space Complexity: O(1) excluding output
"""

def three_sum(nums):
    nums.sort()
    result = []
    for i in range(len(nums) - 2):
        if i > 0 and nums[i] == nums[i-1]:
            continue
        L, R = i + 1, len(nums) - 1
        while L < R:
            s = nums[i] + nums[L] + nums[R]
            if s == 0:
                result.append([nums[i], nums[L], nums[R]])
                while L < R and nums[L] == nums[L+1]: L += 1
                while L < R and nums[R] == nums[R-1]: R -= 1
                L += 1; R -= 1
            elif s < 0: L += 1
            else:       R -= 1
    return result

if __name__ == "__main__":
    r = three_sum([-1,0,1,2,-1,-4])
    assert sorted(r) == sorted([[-1,-1,2],[-1,0,1]])
    assert three_sum([0,0,0]) == [[0,0,0]]
    assert three_sum([1,2,-2,-1]) == []
    print("All tests passed ✓")
