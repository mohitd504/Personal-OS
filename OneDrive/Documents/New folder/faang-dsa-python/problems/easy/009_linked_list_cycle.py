"""
Problem: Linked List Cycle
Difficulty: Easy
Topic: Linked Lists / Fast & Slow Pointers
LeetCode: #141

Description:
    Given the head of a linked list, determine if the list has a cycle.
    Return true if there is a cycle, false otherwise.

Examples:
    Input:  3 → 1 → 2 → 0 → (back to 1)
    Output: True

    Input:  1 → 2 → (no cycle)
    Output: False

Constraints:
    - Number of nodes: [0, 10^4]
    - pos is -1 (no cycle) or a valid index.

Approach (Floyd's Tortoise & Hare):
    Slow pointer moves 1 step, fast moves 2 steps.
    If there's a cycle, fast will eventually lap slow → they meet.
    If no cycle, fast reaches the end (None).

    Proof: Inside a cycle of length L, fast gains 1 step per iteration.
    The gap between them decreases by 1 each time → they meet in O(L) steps.

Time Complexity:  O(n)
Space Complexity: O(1)  (vs O(n) for hash set approach)
"""

class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val; self.next = next

def has_cycle(head):
    slow = fast = head
    while fast and fast.next:
        slow = slow.next
        fast = fast.next.next
        if slow is fast:
            return True
    return False

if __name__ == "__main__":
    # Build: 3→1→2→0→(back to 1)
    n0,n1,n2,n3 = ListNode(3),ListNode(1),ListNode(2),ListNode(0)
    n0.next=n1; n1.next=n2; n2.next=n3; n3.next=n1
    assert has_cycle(n0) == True
    # No cycle
    a,b = ListNode(1),ListNode(2); a.next=b
    assert has_cycle(a) == False
    assert has_cycle(None) == False
    print("All tests passed ✓")
