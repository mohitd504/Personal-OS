"""
Problem: Reorder List
Difficulty: Medium
Topic: Linked Lists / Fast&Slow Pointers
LeetCode: #143

Description:
    Given list L0→L1→...→Ln-1→Ln, reorder it to:
    L0→Ln→L1→Ln-1→L2→Ln-2→...
    Do this IN-PLACE without modifying node values.

Examples:
    Input:  1→2→3→4     Output: 1→4→2→3
    Input:  1→2→3→4→5   Output: 1→5→2→4→3

Approach:
    3 Steps:
    1. Find middle with slow/fast pointers
    2. Reverse the second half
    3. Merge the two halves alternately

    1→2→3→4→5
    Step 1: middle=3, split: 1→2→3  and  4→5
    Step 2: reverse 2nd half: 5→4
    Step 3: merge: 1→5→2→4→3 ✓

Time Complexity:  O(n)
Space Complexity: O(1)
"""

class ListNode:
    def __init__(self, val=0, next=None): self.val=val; self.next=next

def reorder_list(head):
    if not head or not head.next: return
    # Step 1: Find middle
    slow, fast = head, head
    while fast.next and fast.next.next:
        slow = slow.next; fast = fast.next.next
    # Step 2: Reverse second half
    prev, curr = None, slow.next
    slow.next = None
    while curr:
        nxt = curr.next; curr.next = prev; prev, curr = curr, nxt
    # Step 3: Merge
    first, second = head, prev
    while second:
        t1, t2 = first.next, second.next
        first.next = second; second.next = t1
        first, second = t1, t2

def make_list(arr):
    d=ListNode(); c=d
    for v in arr: c.next=ListNode(v); c=c.next
    return d.next

def to_list(h):
    r=[]
    while h: r.append(h.val); h=h.next
    return r

if __name__ == "__main__":
    l=make_list([1,2,3,4]); reorder_list(l); assert to_list(l)==[1,4,2,3]
    l=make_list([1,2,3,4,5]); reorder_list(l); assert to_list(l)==[1,5,2,4,3]
    print("All tests passed ✓")
