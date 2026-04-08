"""
Problem: Merge Two Sorted Lists
Difficulty: Easy
Topic: Linked Lists
LeetCode: #21

Description:
    Merge two sorted linked lists and return the merged list (sorted).
    The merged list should be made by splicing together the nodes.

Examples:
    Input:  l1=1→2→4,  l2=1→3→4
    Output: 1→1→2→3→4→4

    Input:  l1=[], l2=[]
    Output: []

Constraints:
    - Number of nodes in each list: [0, 50]
    - -100 <= Node.val <= 100

Approach:
    Use a dummy head to simplify edge cases.
    Compare l1.val and l2.val, attach the smaller node, advance that pointer.
    When one list is exhausted, attach the remaining nodes of the other.

    l1: 1→2→4    l2: 1→3→4
    dummy → ?
    1<=1 → take l1(1): dummy→1,  l1=2→4
    1<=2 → take l2(1): dummy→1→1, l2=3→4
    2<=3 → take l1(2): dummy→1→1→2, l1=4
    3<=4 → take l2(3): dummy→1→1→2→3, l2=4
    4<=4 → take l1(4): dummy→1→1→2→3→4, l1=None
    attach l2(4): dummy→1→1→2→3→4→4 ✓

Time Complexity:  O(n+m)
Space Complexity: O(1)
"""

class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val; self.next = next

def merge_two_lists(l1, l2):
    dummy = ListNode(0)
    curr = dummy
    while l1 and l2:
        if l1.val <= l2.val:
            curr.next = l1; l1 = l1.next
        else:
            curr.next = l2; l2 = l2.next
        curr = curr.next
    curr.next = l1 or l2
    return dummy.next

def make_list(arr):
    dummy = ListNode(); curr = dummy
    for v in arr: curr.next = ListNode(v); curr = curr.next
    return dummy.next

def to_list(h):
    r = []; 
    while h: r.append(h.val); h = h.next
    return r

if __name__ == "__main__":
    assert to_list(merge_two_lists(make_list([1,2,4]),make_list([1,3,4]))) == [1,1,2,3,4,4]
    assert to_list(merge_two_lists(make_list([]),make_list([])))           == []
    assert to_list(merge_two_lists(make_list([]),make_list([0])))          == [0]
    print("All tests passed ✓")
