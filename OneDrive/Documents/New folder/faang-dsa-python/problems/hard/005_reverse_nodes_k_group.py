"""
Problem: Reverse Nodes in k-Group
Difficulty: Hard
Topic: Linked Lists / Recursion
LeetCode: #25

Description:
    Given the head of a linked list, reverse the nodes k at a time.
    If not enough nodes remain, leave them as is.

Examples:
    Input:  1→2→3→4→5, k=2   Output: 2→1→4→3→5
    Input:  1→2→3→4→5, k=3   Output: 3→2→1→4→5

Constraints:
    - 1 <= k <= n
    - n = list length

Approach:
    1. Check if k nodes remain (if not, return head unchanged)
    2. Reverse k nodes
    3. Connect: head.next = recurse(remaining)
    4. Return new head of reversed group

Time Complexity:  O(n)
Space Complexity: O(n/k) recursion
"""

class ListNode:
    def __init__(self, val=0, next=None): self.val=val; self.next=next

def reverse_k_group(head, k):
    # Check if k nodes remain
    node, count = head, 0
    while node and count < k:
        node = node.next; count += 1
    if count < k: return head
    # Reverse k nodes
    prev, curr = None, head
    for _ in range(k):
        nxt = curr.next; curr.next = prev; prev, curr = curr, nxt
    # head is now tail of reversed group
    head.next = reverse_k_group(curr, k)
    return prev

def make_list(arr):
    d=ListNode(); c=d
    for v in arr: c.next=ListNode(v); c=c.next
    return d.next

def to_list(h):
    r=[]
    while h: r.append(h.val); h=h.next
    return r

if __name__ == "__main__":
    assert to_list(reverse_k_group(make_list([1,2,3,4,5]),2)) == [2,1,4,3,5]
    assert to_list(reverse_k_group(make_list([1,2,3,4,5]),3)) == [3,2,1,4,5]
    assert to_list(reverse_k_group(make_list([1,2]),3))       == [1,2]
    print("All tests passed ✓")
