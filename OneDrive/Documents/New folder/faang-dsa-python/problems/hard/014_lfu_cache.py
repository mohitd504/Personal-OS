"""
Problem: LFU Cache
Difficulty: Hard
Topic: Design / Linked Lists / Hashing
LeetCode: #460

Description:
    Design a data structure that follows the Least Frequently Used (LFU)
    cache eviction policy. On tie in frequency, evict Least Recently Used.

    get(key): return value, or -1.
    put(key, value): insert/update. If capacity reached, evict LFU.

Examples:
    LFUCache(2)
    put(1,1); put(2,2)
    get(1)  → 1  (freq[1]=2, freq[2]=1)
    put(3,3)     → evict key 2 (lowest freq)
    get(2)  → -1
    get(3)  → 3

Constraints:
    - 1 <= capacity <= 10^4
    - All operations O(1)

Approach:
    Three hash maps:
    1. key_val: key → (value, freq)
    2. freq_keys: freq → OrderedDict (maintains LRU order per frequency)
    3. Track min_freq

Time Complexity:  O(1) all operations
Space Complexity: O(capacity)
"""

from collections import defaultdict, OrderedDict

class LFUCache:
    def __init__(self, capacity):
        self.cap = capacity
        self.key_val  = {}                           # key → [val, freq]
        self.freq_keys = defaultdict(OrderedDict)    # freq → {key: None}
        self.min_freq  = 0

    def _update(self, key):
        val, freq = self.key_val[key]
        del self.freq_keys[freq][key]
        if not self.freq_keys[freq] and freq == self.min_freq:
            self.min_freq += 1
        self.key_val[key] = [val, freq+1]
        self.freq_keys[freq+1][key] = None

    def get(self, key):
        if key not in self.key_val: return -1
        self._update(key)
        return self.key_val[key][0]

    def put(self, key, value):
        if self.cap == 0: return
        if key in self.key_val:
            self.key_val[key][0] = value
            self._update(key)
        else:
            if len(self.key_val) == self.cap:
                evict_key, _ = self.freq_keys[self.min_freq].popitem(last=False)
                del self.key_val[evict_key]
            self.key_val[key] = [value, 1]
            self.freq_keys[1][key] = None
            self.min_freq = 1

if __name__ == "__main__":
    lfu = LFUCache(2)
    lfu.put(1,1); lfu.put(2,2)
    assert lfu.get(1) == 1
    lfu.put(3,3)
    assert lfu.get(2) == -1
    assert lfu.get(3) == 3
    lfu.put(4,4)
    assert lfu.get(1) == -1  # evicted (freq=2, but 3 also freq=2; 3 more recent -> 1 evicted? No: put(4) evicts min_freq=2 LRU which is 1)
    print("All tests passed ✓")
