"""
Problem: Reverse Linked List
Difficulty: Easy
Topic: Linked Lists
LeetCode: #206

Description:
    Given the head of a singly linked list, reverse the list and return
    the reversed list's head.

Examples:
    Input:  1 → 2 → 3 → 4 → 5
    Output: 5 → 4 → 3 → 2 → 1

    Input:  1 → 2
    Output: 2 → 1

Constraints:
    - Number of nodes: [0, 5000]
    - -5000 <= Node.val <= 5000

Approach (Iterative):
    Use three pointers: prev, curr, next.
    For each node, reverse the .next pointer to point to prev.
    Move all three forward.

    1→2→3→4→5
    prev=None curr=1
    Step: nxt=2, 1.next=None, prev=1, curr=2
    Step: nxt=3, 2.next=1,    prev=2, curr=3
    Step: nxt=4, 3.next=2,    prev=3, curr=4
    Step: nxt=5, 4.next=3,    prev=4, curr=5
    Step: nxt=None,5.next=4,  prev=5, curr=None
    return prev (5) ✓

Time Complexity:  O(n)
Space Complexity: O(1) iterative  /  O(n) recursive
"""

class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val; self.next = next

def reverse_list(head):
    """Iterative approach."""
    prev, curr = None, head
    while curr:
        nxt = curr.next
        curr.next = prev
        prev, curr = curr, nxt
    return prev

def reverse_list_recursive(head):
    """Recursive approach."""
    if not head or not head.next: return head
    new_head = reverse_list_recursive(head.next)
    head.next.next = head
    head.next = None
    return new_head

# Helpers for testing
def make_list(arr):
    dummy = ListNode(0)
    curr = dummy
    for v in arr: curr.next = ListNode(v); curr = curr.next
    return dummy.next

def to_list(head):
    result = []
    while head: result.append(head.val); head = head.next
    return result

if __name__ == "__main__":
    assert to_list(reverse_list(make_list([1,2,3,4,5]))) == [5,4,3,2,1]
    assert to_list(reverse_list(make_list([1,2])))        == [2,1]
    assert to_list(reverse_list(make_list([])))           == []
    print("All tests passed ✓")
