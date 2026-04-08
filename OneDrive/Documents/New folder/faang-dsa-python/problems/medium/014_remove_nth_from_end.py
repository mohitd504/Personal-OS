"""
Problem: Remove Nth Node From End of List
Difficulty: Medium
Topic: Linked Lists / Two Pointers
LeetCode: #19

Description:
    Given the head of a linked list, remove the nth node from the end
    and return the head. Do it in ONE PASS.

Examples:
    Input:  1→2→3→4→5, n=2   Output: 1→2→3→5
    Input:  1, n=1            Output: []
    Input:  1→2, n=1          Output: [1]

Constraints:
    - 1 <= sz <= 30
    - 1 <= n <= sz

Approach:
    Use two pointers with a gap of n+1 between them.
    Advance fast n+1 steps first, then move both until fast=None.
    Slow is now at the node BEFORE the one to delete.

    1→2→3→4→5  n=2
    After gap: fast=node(3) [2 ahead of dummy]
    Move both: fast→4, slow→1; fast→5, slow→2; fast→None, slow→3
    slow.next = slow.next.next → skip 4
    1→2→3→5 ✓

Time Complexity:  O(n)  one pass
Space Complexity: O(1)
"""

class ListNode:
    def __init__(self, val=0, next=None): self.val=val; self.next=next

def remove_nth_from_end(head, n):
    dummy = ListNode(0, head)
    fast = slow = dummy
    for _ in range(n + 1):
        fast = fast.next
    while fast:
        fast = fast.next
        slow = slow.next
    slow.next = slow.next.next
    return dummy.next

def make_list(arr):
    d=ListNode(); c=d
    for v in arr: c.next=ListNode(v); c=c.next
    return d.next

def to_list(h):
    r=[]
    while h: r.append(h.val); h=h.next
    return r

if __name__ == "__main__":
    assert to_list(remove_nth_from_end(make_list([1,2,3,4,5]),2)) == [1,2,3,5]
    assert to_list(remove_nth_from_end(make_list([1]),1))          == []
    assert to_list(remove_nth_from_end(make_list([1,2]),1))        == [1]
    print("All tests passed ✓")
