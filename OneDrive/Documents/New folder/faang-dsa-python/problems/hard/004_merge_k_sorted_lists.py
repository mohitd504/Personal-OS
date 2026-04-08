"""
Problem: Merge K Sorted Lists
Difficulty: Hard
Topic: Linked Lists / Heap
LeetCode: #23

Description:
    Given an array of k linked lists, each sorted in ascending order,
    merge all into one sorted linked list and return it.

Examples:
    Input:  lists=[[1,4,5],[1,3,4],[2,6]]
    Output: 1→1→2→3→4→4→5→6

Constraints:
    - k == lists.length
    - 0 <= k <= 10^4
    - 0 <= lists[i].length <= 500

Approach (Min-Heap):
    Push head of each list into a min-heap.
    Each step: pop minimum node, add to result, push its next node.

    Heap stores (val, index, node) — index breaks ties.

Time Complexity:  O(N log k) where N = total nodes, k = number of lists
Space Complexity: O(k)
"""

import heapq

class ListNode:
    def __init__(self, val=0, next=None): self.val=val; self.next=next

def merge_k_lists(lists):
    heap = []
    for i, node in enumerate(lists):
        if node:
            heapq.heappush(heap, (node.val, i, node))
    dummy = ListNode(0)
    curr = dummy
    while heap:
        val, i, node = heapq.heappop(heap)
        curr.next = node; curr = curr.next
        if node.next:
            heapq.heappush(heap, (node.next.val, i, node.next))
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
    lists = [make_list([1,4,5]), make_list([1,3,4]), make_list([2,6])]
    assert to_list(merge_k_lists(lists)) == [1,1,2,3,4,4,5,6]
    assert to_list(merge_k_lists([])) == []
    print("All tests passed ✓")
