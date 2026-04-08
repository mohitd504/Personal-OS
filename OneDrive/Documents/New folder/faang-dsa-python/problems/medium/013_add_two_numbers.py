"""
Problem: Add Two Numbers
Difficulty: Medium
Topic: Linked Lists / Math
LeetCode: #2

Description:
    Two non-empty linked lists represent non-negative integers in REVERSE order
    (each node has one digit). Add and return the sum as a linked list.

Examples:
    Input:  l1=2→4→3  l2=5→6→4   (342 + 465)
    Output: 7→0→8     (807)

    Input:  l1=9→9→9→9→9→9→9  l2=9→9→9→9
    Output: 8→9→9→9→0→0→0→1

Constraints:
    - 1 to 100 nodes each
    - 0 <= Node.val <= 9
    - No leading zeros except the number 0 itself.

Approach:
    Simulate digit-by-digit addition with carry.
    Process both lists simultaneously, adding digits and tracking carry.
    Continue until both lists exhausted AND carry is 0.

    l1=2→4→3  l2=5→6→4
    2+5+0=7  carry=0  → node(7)
    4+6+0=10 carry=1  → node(0)
    3+4+1=8  carry=0  → node(8)
    Result: 7→0→8 ✓

Time Complexity:  O(max(m,n))
Space Complexity: O(max(m,n)+1) for result
"""

class ListNode:
    def __init__(self, val=0, next=None): self.val=val; self.next=next

def add_two_numbers(l1, l2):
    dummy = ListNode(0)
    curr = dummy
    carry = 0
    while l1 or l2 or carry:
        v1 = l1.val if l1 else 0
        v2 = l2.val if l2 else 0
        total = v1 + v2 + carry
        carry = total // 10
        curr.next = ListNode(total % 10)
        curr = curr.next
        if l1: l1 = l1.next
        if l2: l2 = l2.next
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
    assert to_list(add_two_numbers(make_list([2,4,3]),make_list([5,6,4]))) == [7,0,8]
    assert to_list(add_two_numbers(make_list([0]),make_list([0])))         == [0]
    r = to_list(add_two_numbers(make_list([9,9,9,9,9,9,9]),make_list([9,9,9,9])))
    assert r == [8,9,9,9,0,0,0,1]
    print("All tests passed ✓")
