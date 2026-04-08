"""
Problem: LRU Cache (Full Implementation Review)
Difficulty: Hard
Topic: Design / Doubly Linked List / Hash Map
LeetCode: #146

Description:
    Implement LRU Cache with O(1) get and put.
    get(key): return value or -1.
    put(key,value): insert/update. Evict LRU if over capacity.

Examples:
    LRUCache(2); put(1,1); put(2,2); get(1)→1
    put(3,3) evicts 2; get(2)→-1; get(3)→3
    put(4,4) evicts 1; get(1)→-1

Full doubly-linked-list + hashmap implementation.
Time: O(1) all ops   Space: O(capacity)
"""

class Node:
    def __init__(self,key=0,val=0): self.key=key; self.val=val; self.prev=self.next=None

class LRUCache:
    def __init__(self, capacity):
        self.cap = capacity; self.cache = {}
        self.head = Node(); self.tail = Node()
        self.head.next=self.tail; self.tail.prev=self.head

    def _remove(self,n): n.prev.next=n.next; n.next.prev=n.prev
    def _insert(self,n): n.prev=self.tail.prev; n.next=self.tail; self.tail.prev.next=n; self.tail.prev=n

    def get(self,key):
        if key not in self.cache: return -1
        self._remove(self.cache[key]); self._insert(self.cache[key])
        return self.cache[key].val

    def put(self,key,value):
        if key in self.cache: self._remove(self.cache[key])
        n=Node(key,value); self.cache[key]=n; self._insert(n)
        if len(self.cache)>self.cap:
            lru=self.head.next; self._remove(lru); del self.cache[lru.key]

if __name__ == "__main__":
    c=LRUCache(2); c.put(1,1); c.put(2,2)
    assert c.get(1)==1; c.put(3,3)
    assert c.get(2)==-1; c.put(4,4)
    assert c.get(1)==-1; assert c.get(3)==3; assert c.get(4)==4
    print("All tests passed ✓")
