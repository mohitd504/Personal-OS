"""
Problem: Time Based Key-Value Store
Difficulty: Medium
Topic: Hashing / Binary Search / Design
LeetCode: #981

Description:
    Design a time-based key-value data structure that stores multiple values
    for the same key at different timestamps.

    set(key, value, timestamp): stores value at timestamp.
    get(key, timestamp): returns the value at the largest timestamp <= given timestamp.

Examples:
    TimeMap kv;
    kv.set("foo","bar",1); kv.set("foo","bar2",4)
    kv.get("foo",4) → "bar2"
    kv.get("foo",5) → "bar2"
    kv.get("foo",3) → "bar"
    kv.get("foo",0) → ""

Constraints:
    - 1 <= key.length, value.length <= 100
    - 1 <= timestamp <= 10^7
    - set timestamps are strictly increasing for the same key.

Approach:
    dict of lists: key → [(timestamp, value), ...]
    get: binary search for largest timestamp <= query timestamp.

Time Complexity:  set O(1), get O(log n)
Space Complexity: O(n)
"""

import bisect

class TimeMap:
    def __init__(self):
        self.store = {}  # key → [(timestamp, value)]

    def set(self, key, value, timestamp):
        if key not in self.store:
            self.store[key] = []
        self.store[key].append((timestamp, value))

    def get(self, key, timestamp):
        if key not in self.store: return ""
        times_vals = self.store[key]
        # binary search for largest timestamp <= given
        lo, hi = 0, len(times_vals) - 1
        result = ""
        while lo <= hi:
            mid = (lo + hi) // 2
            if times_vals[mid][0] <= timestamp:
                result = times_vals[mid][1]
                lo = mid + 1
            else:
                hi = mid - 1
        return result

if __name__ == "__main__":
    kv = TimeMap()
    kv.set("foo","bar",1); kv.set("foo","bar2",4)
    assert kv.get("foo",4) == "bar2"
    assert kv.get("foo",5) == "bar2"
    assert kv.get("foo",3) == "bar"
    assert kv.get("foo",0) == ""
    print("All tests passed ✓")
