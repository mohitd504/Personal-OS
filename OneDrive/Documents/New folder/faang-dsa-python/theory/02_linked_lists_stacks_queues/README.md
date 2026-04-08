# 📘 Theory: Linked Lists, Stacks & Queues

---

## 1. Linked List — Fundamentals

A **linked list** is a sequence of nodes where each node stores a value and
a pointer to the next node. Unlike arrays, elements are NOT stored contiguously
in memory.

```
Singly Linked List:
  head
   ↓
  [1|•]──→[2|•]──→[3|•]──→[4|•]──→[5|╳]
                                        ↑
                                       tail

Doubly Linked List:
  head
   ↓
  [╳|1|•]⟷[•|2|•]⟷[•|3|•]⟷[•|4|•]⟷[•|5|╳]
```

### Node Definition
```python
class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next
```

### Operations & Complexities

| Operation             | Singly LL | Doubly LL | Array  |
|-----------------------|-----------|-----------|--------|
| Access by index       | O(n)      | O(n)      | O(1)   |
| Search                | O(n)      | O(n)      | O(n)   |
| Insert at head        | O(1)      | O(1)      | O(n)   |
| Insert at tail        | O(1)*     | O(1)      | O(1)   |
| Insert at middle      | O(n)      | O(n)      | O(n)   |
| Delete at head        | O(1)      | O(1)      | O(n)   |
| Delete at tail        | O(n)      | O(1)      | O(1)   |
| Delete at middle      | O(n)      | O(1)**    | O(n)   |

*with tail pointer  **given the node directly

---

## 2. Singly Linked List — All Operations

```python
class SinglyLinkedList:
    def __init__(self):
        self.head = None

    # ── Insert ──────────────────────────────
    def prepend(self, val):           # O(1)
        self.head = ListNode(val, self.head)

    def append(self, val):            # O(n) without tail ptr
        node = ListNode(val)
        if not self.head: self.head = node; return
        curr = self.head
        while curr.next: curr = curr.next
        curr.next = node

    def insert_after(self, prev, val):  # O(1) given prev
        prev.next = ListNode(val, prev.next)

    # ── Delete ──────────────────────────────
    def delete_val(self, val):        # O(n)
        dummy = ListNode(0, self.head)
        curr = dummy
        while curr.next:
            if curr.next.val == val:
                curr.next = curr.next.next; break
            curr = curr.next
        self.head = dummy.next

    # ── Reverse ─────────────────────────────
    def reverse(self):                # O(n)
        prev, curr = None, self.head
        while curr:
            nxt = curr.next
            curr.next = prev
            prev, curr = curr, nxt
        self.head = prev
```

### The Dummy Node Pattern

Always use a **dummy (sentinel) head node** to simplify edge cases
(empty list, deletion of head node, merging).

```python
dummy = ListNode(0)
dummy.next = head
curr = dummy
# ... do operations ...
return dummy.next   # new head
```

---

## 3. Fast & Slow Pointers (Floyd's Tortoise & Hare)

Move one pointer 1 step and another 2 steps. Critical for:
- Finding the **middle** of a list
- Detecting **cycles**
- Finding the **start of a cycle**

### Find Middle
```
List: 1 → 2 → 3 → 4 → 5

slow: 1 → 2 → 3
fast: 1 → 3 → 5(null.next stops)
Middle = slow = 3 ✓

List: 1 → 2 → 3 → 4 (even)
slow: 1 → 2 → 3
fast: 1 → 3 → (null stops)
Middle = slow = 3  (second of two middle nodes)
```

```python
def find_middle(head):
    slow = fast = head
    while fast and fast.next:
        slow = slow.next
        fast = fast.next.next
    return slow
# Time: O(n)  Space: O(1)
```

### Detect Cycle (Floyd's)
```
If cycle exists, fast and slow WILL meet.

Proof: fast gains 1 step on slow each iteration.
Inside the cycle, the gap closes by 1 per step → they meet.
```

```python
def has_cycle(head):
    slow = fast = head
    while fast and fast.next:
        slow = slow.next
        fast = fast.next.next
        if slow == fast: return True
    return False
# Time: O(n)  Space: O(1)
```

### Find Cycle Start
```
After meeting at point X inside cycle:
  distance(head → cycle_start) == distance(X → cycle_start)

Reset slow to head, move both 1 step → they meet at cycle start.
```

```python
def cycle_start(head):
    slow = fast = head
    while fast and fast.next:
        slow = slow.next; fast = fast.next.next
        if slow == fast:
            slow = head
            while slow != fast:
                slow = slow.next; fast = fast.next
            return slow
    return None
```

---

## 4. Key Linked List Algorithms

### Reverse a Linked List (Iterative)
```
Before: 1 → 2 → 3 → 4 → None
After:  4 → 3 → 2 → 1 → None

Step by step:
prev=None  curr=1
  nxt=2, 1.next=None, prev=1, curr=2
  nxt=3, 2.next=1,   prev=2, curr=3
  nxt=4, 3.next=2,   prev=3, curr=4
  nxt=None, 4.next=3, prev=4, curr=None
return prev (4)
```

```python
def reverse(head):
    prev, curr = None, head
    while curr:
        nxt = curr.next
        curr.next = prev
        prev, curr = curr, nxt
    return prev
# Time: O(n)  Space: O(1)
```

### Reverse (Recursive)
```python
def reverse_recursive(head):
    if not head or not head.next: return head
    new_head = reverse_recursive(head.next)
    head.next.next = head
    head.next = None
    return new_head
# Time: O(n)  Space: O(n) call stack
```

### Merge Two Sorted Lists
```
L1: 1 → 3 → 5
L2: 2 → 4 → 6

Compare heads: 1<2 → take 1
               2<3 → take 2
               3<4 → take 3
               ...
Result: 1 → 2 → 3 → 4 → 5 → 6
```

```python
def merge_sorted(l1, l2):
    dummy = ListNode(0)
    curr = dummy
    while l1 and l2:
        if l1.val <= l2.val: curr.next = l1; l1 = l1.next
        else:                curr.next = l2; l2 = l2.next
        curr = curr.next
    curr.next = l1 or l2
    return dummy.next
# Time: O(n+m)  Space: O(1)
```

### Remove Nth Node from End
```
List: 1 → 2 → 3 → 4 → 5,  n=2

Use two pointers gap of n+1:
  right advances n+1 steps: points to node 3
  then both advance until right is None
  left stops at node 3 (before the target)
  left.next = left.next.next → removes 4
```

```python
def remove_nth(head, n):
    dummy = ListNode(0, head)
    L = R = dummy
    for _ in range(n + 1): R = R.next
    while R:
        L = L.next; R = R.next
    L.next = L.next.next
    return dummy.next
# Time: O(n)  Space: O(1)
```

### Palindrome Linked List
```
Strategy:
  1. Find middle (fast/slow)
  2. Reverse second half
  3. Compare both halves
  4. (Optional) Restore list

1 → 2 → 3 → 2 → 1
         ↑ split here
1st: 1 → 2 → 3
2nd: 1 → 2 → 3  (reversed from 3 → 2 → 1)
Compare: equal → palindrome ✓
```

---

## 5. Stack

A **stack** is a LIFO (Last In, First Out) data structure.

```
PUSH 1: [1]
PUSH 2: [1, 2]
PUSH 3: [1, 2, 3]
POP:    [1, 2]   → returns 3
PEEK:   [1, 2]   → returns 2 (no remove)
```

### Python Stack (using list)
```python
stack = []
stack.append(x)   # push   O(1)
stack.pop()       # pop    O(1)
stack[-1]         # peek   O(1)
not stack         # isEmpty
```

### Valid Parentheses
```
s = "({[]})"

Process:
  '(' → push '('
  '{' → push '{'
  '[' → push '['
  ']' → peek='[', match → pop
  '}' → peek='{', match → pop
  ')' → peek='(', match → pop
  stack empty → True ✓
```

```python
def is_valid(s):
    stack = []
    match = {')':'(', ']':'[', '}':'{'}
    for ch in s:
        if ch in match:
            if not stack or stack[-1] != match[ch]: return False
            stack.pop()
        else:
            stack.append(ch)
    return not stack
# Time: O(n)  Space: O(n)
```

### Monotonic Stack

Maintain stack in **monotonically increasing or decreasing order**.
Efficiently finds: next greater/smaller element, areas, spans.

#### Monotonic Decreasing Stack — Next Greater Element
```
arr = [2, 1, 5, 3, 6, 4]

Process each element. Pop when current > top (found NGE for top).
i=0: push 2     stack=[2]
i=1: 1 < 2 → push 1   stack=[2,1]
i=2: 5 > 1 → pop 1, NGE[1]=5; 5>2 → pop 2, NGE[2]=5; push 5  stack=[5]
i=3: 3 < 5 → push 3   stack=[5,3]
i=4: 6 > 3 → pop 3, NGE[3]=6; 6>5 → pop 5, NGE[5]=6; push 6  stack=[6]
i=5: 4 < 6 → push 4   stack=[6,4]
Remaining (no NGE): 6→-1, 4→-1

Result: NGE = [5, 5, 6, 6, -1, -1]
```

```python
def next_greater(arr):
    n = len(arr)
    result = [-1] * n
    stack = []   # indices
    for i in range(n):
        while stack and arr[stack[-1]] < arr[i]:
            result[stack.pop()] = arr[i]
        stack.append(i)
    return result
# Time: O(n)  Space: O(n)
```

#### Monotonic Increasing Stack — Largest Rectangle
```
heights = [2, 1, 5, 6, 2, 3]

Maintain stack of indices in increasing height order.
When we pop (because current height < stack top), calculate area:
  width = i - stack[-1] - 1  (or i if stack empty)

Pop 6 (h=6): area = 6 * 1 = 6
Pop 5 (h=5): area = 5 * 2 = 10  ← max
Pop 2 (h=2): area = 2 * 4 = 8
...
```

---

## 6. Queue

A **queue** is a FIFO (First In, First Out) data structure.

```
ENQUEUE 1,2,3:  front→[1, 2, 3]←back
DEQUEUE:        front→[2, 3]  returns 1
FRONT:          returns 2
```

### Python Queue (using collections.deque)
```python
from collections import deque
q = deque()
q.append(x)        # enqueue O(1)
q.popleft()        # dequeue O(1)
q[0]               # front   O(1)
not q              # isEmpty
```

### BFS with Queue
```
Graph: 0─1─3
       |
       2─4

BFS from 0:
Queue: [0]
Visit 0 → enqueue neighbors 1,2 → Queue: [1,2]
Visit 1 → enqueue 3            → Queue: [2,3]
Visit 2 → enqueue 4            → Queue: [3,4]
Visit 3, 4 (no unvisited neighbors)
Order: [0, 1, 2, 3, 4]
```

---

## 7. Deque (Double-Ended Queue)

Supports O(1) push/pop at BOTH ends. Used for:
- Sliding window maximum/minimum
- Palindrome checking
- BFS with priority

```python
from collections import deque
dq = deque()
dq.append(x)        # add right  O(1)
dq.appendleft(x)    # add left   O(1)
dq.pop()            # remove right O(1)
dq.popleft()        # remove left  O(1)
dq[0]               # left peek  O(1)
dq[-1]              # right peek O(1)
```

### Sliding Window Maximum (Monotonic Deque)
```
arr=[1,3,-1,-3,5,3,6,7]  k=3

Use a deque storing indices, front always has max.

Window [1,3,-1]: push 0; 3>1 pop 0 push 1; -1<3 push 2.  Max=arr[1]=3
Window [3,-1,-3]: pop idx<i-k+1? No. -3<-1 push 3. Max=arr[1]=3
Window [-1,-3,5]: 5>-3 pop 3; 5>-1 pop 2; 5>3 pop 1; push 4. Max=5
...
```

```python
def sliding_max(arr, k):
    dq = deque()
    res = []
    for i, v in enumerate(arr):
        if dq and dq[0] < i - k + 1: dq.popleft()   # out of window
        while dq and arr[dq[-1]] < v: dq.pop()       # smaller → useless
        dq.append(i)
        if i >= k - 1: res.append(arr[dq[0]])
    return res
# Time: O(n)  Space: O(k)
```

---

## 8. Priority Queue (Min/Max Heap)

Supports: insert O(log n), extract-min O(log n), peek-min O(1).

```
Min-Heap structure (always smallest at top):
        1
       / \
      3    2
     / \  / \
    7   4 5   6
```

```python
import heapq

heap = []
heapq.heappush(heap, val)      # insert     O(log n)
heapq.heappop(heap)            # extract min O(log n)
heap[0]                        # peek min    O(1)
heapq.heapify(list)            # build heap  O(n)

# Max-heap: negate values
heapq.heappush(heap, -val)
-heapq.heappop(heap)

# Custom objects: use tuples (priority, value)
heapq.heappush(heap, (priority, value))
```

### Top K Frequent Elements
```python
def top_k_frequent(nums, k):
    from collections import Counter
    import heapq
    count = Counter(nums)
    return heapq.nlargest(k, count, key=count.get)
# Time: O(n log k)  Space: O(n)
```

---

## 9. LRU Cache

**Least Recently Used** cache: evict the least recently accessed item when full.

**Implementation**: Doubly Linked List + Hash Map

```
capacity = 3, operations:
put(1,1): {1:node1}  List: [1]
put(2,2): {1,2}      List: [1,2]
put(3,3): {1,2,3}    List: [1,2,3]
get(1):              List: [2,3,1]  → 1 moved to MRU end
put(4,4): evict LRU(2) → List: [3,1,4]

Hash map gives O(1) node lookup.
Doubly LL gives O(1) move-to-tail and evict-from-head.
```

```python
class LRUCache:
    def __init__(self, capacity):
        self.cap = capacity
        self.map = {}
        # Dummy head (LRU end) and tail (MRU end)
        self.head = Node()
        self.tail = Node()
        self.head.next = self.tail
        self.tail.prev = self.head

    def _remove(self, node):
        node.prev.next = node.next
        node.next.prev = node.prev

    def _insert_tail(self, node):
        node.prev = self.tail.prev
        node.next = self.tail
        self.tail.prev.next = node
        self.tail.prev = node

    def get(self, key):
        if key not in self.map: return -1
        self._remove(self.map[key])
        self._insert_tail(self.map[key])
        return self.map[key].val

    def put(self, key, value):
        if key in self.map: self._remove(self.map[key])
        node = Node(key, value)
        self.map[key] = node
        self._insert_tail(node)
        if len(self.map) > self.cap:
            lru = self.head.next
            self._remove(lru)
            del self.map[lru.key]
# All operations O(1)
```

---

## 10. Common Patterns Summary

| Pattern                      | Use Case                                   | Time     |
|------------------------------|--------------------------------------------|----------|
| Dummy head node              | Simplify LL operations, avoid null checks  | O(1)     |
| Fast & Slow pointers         | Middle, cycle detection, palindrome        | O(n)     |
| Two pointer (separate lists) | Merge, intersection                        | O(n+m)   |
| Reverse in-place             | Palindrome, reorder                        | O(n)     |
| Monotonic stack              | NGE, histogram, daily temps                | O(n)     |
| Sliding window + deque       | Sliding max/min                            | O(n)     |
| Min-heap of size k           | Kth largest, merge k lists, top-k          | O(n log k)|
| LRU (DLL + HashMap)          | Cache with O(1) get/put                    | O(1)     |
