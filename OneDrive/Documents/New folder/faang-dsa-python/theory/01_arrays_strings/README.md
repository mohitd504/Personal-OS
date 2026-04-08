# 📘 Theory: Arrays & Strings

---

## 1. What is an Array?

An **array** is a contiguous block of memory storing elements of the same type,
accessible via a zero-based integer index.

```
Index:  0    1    2    3    4
       ┌────┬────┬────┬────┬────┐
       │ 10 │ 20 │ 30 │ 40 │ 50 │
       └────┴────┴────┴────┴────┘
         ↑                    ↑
       arr[0]               arr[4]
```

### Why Arrays?
- O(1) random access by index
- Cache-friendly (memory locality)
- Foundation for almost all other data structures

### Python Specifics
Python's `list` is a **dynamic array** (backed by C array, auto-resizes).

```python
arr = []           # empty
arr = [1, 2, 3]    # literal
arr = [0] * n      # n zeros
arr = list(range(n))  # [0..n-1]
```

---

## 2. Array Operations & Complexities

| Operation          | Time     | Space | Notes                         |
|--------------------|----------|-------|-------------------------------|
| Access `arr[i]`    | O(1)     | O(1)  | Direct index                  |
| Search (unsorted)  | O(n)     | O(1)  | Linear scan                   |
| Search (sorted)    | O(log n) | O(1)  | Binary search                 |
| Insert at end      | O(1)*    | O(1)  | Amortized; resize is O(n)     |
| Insert at index i  | O(n)     | O(1)  | Shifts elements right         |
| Delete at end      | O(1)     | O(1)  |                               |
| Delete at index i  | O(n)     | O(1)  | Shifts elements left          |
| Slice `arr[l:r]`   | O(r-l)   | O(r-l)| Creates new list              |

---

## 3. Two Pointers Technique

Use **two indices** moving toward each other or in the same direction to
avoid a nested O(n²) loop.

### 3a. Opposite Pointers (Converging)

Used when array is sorted, or we need pairs/triplets summing to a target.

```
arr = [1, 3, 5, 7, 9]   target = 10

Step 1:  L=0 (1)  R=4 (9)  sum=10 → FOUND!

arr = [1, 2, 4, 6, 8]   target = 9
Step 1:  L=0 (1)  R=4 (8)  sum=9  → FOUND!
Step 2:  L=0 (1)  R=3 (6)  sum=7  → too small → L++
Step 3:  L=1 (2)  R=3 (6)  sum=8  → too small → L++
Step 4:  L=2 (4)  R=3 (6)  sum=10 → too big  → R--
         L >= R → stop
```

```python
def two_sum_sorted(arr, target):
    L, R = 0, len(arr) - 1
    while L < R:
        s = arr[L] + arr[R]
        if s == target: return [L, R]
        elif s < target: L += 1
        else:            R -= 1
    return []
# Time: O(n)  Space: O(1)
```

### 3b. Same Direction Pointers (Fast & Slow / Read & Write)

Used to remove duplicates, partition arrays, detect cycles.

```
Remove duplicates in-place from [1,1,2,3,3,4]:

write=1
read=1: arr[1]==arr[0] → skip
read=2: arr[2]=2 ≠ arr[0] → arr[write]=2, write=2
read=3: 3 ≠ 2 → arr[write]=3, write=3
read=4: 3 == 3 → skip
read=5: 4 ≠ 3 → arr[write]=4, write=4
Result: [1,2,3,4,_,_]  return write=4
```

```python
def remove_duplicates(arr):
    if not arr: return 0
    write = 1
    for read in range(1, len(arr)):
        if arr[read] != arr[write - 1]:
            arr[write] = arr[read]
            write += 1
    return write
# Time: O(n)  Space: O(1)
```

### 3c. Three Sum — Extending Two Pointers

Fix one element, then use two pointers for the rest.

```python
def three_sum(arr):
    arr.sort()
    result = []
    for i in range(len(arr) - 2):
        if i > 0 and arr[i] == arr[i-1]: continue  # skip duplicates
        L, R = i + 1, len(arr) - 1
        while L < R:
            s = arr[i] + arr[L] + arr[R]
            if s == 0:
                result.append([arr[i], arr[L], arr[R]])
                while L < R and arr[L] == arr[L+1]: L += 1
                while L < R and arr[R] == arr[R-1]: R -= 1
                L += 1; R -= 1
            elif s < 0: L += 1
            else:       R -= 1
    return result
# Time: O(n²)  Space: O(1) excluding output
```

---

## 4. Sliding Window

Maintain a **window** [L, R] that slides over the array, expanding/shrinking
based on a condition. Avoids re-computing from scratch at each step.

### 4a. Fixed-Size Window

```
arr = [2, 1, 5, 1, 3, 2],  k = 3
Window sums:
[2,1,5] = 8  ← initial
[1,5,1] = 7  ← slide: +1 -2
[5,1,3] = 9  ← max
[1,3,2] = 6

Answer: 9
```

```python
def max_sum_fixed(arr, k):
    window = sum(arr[:k])
    best = window
    for i in range(k, len(arr)):
        window += arr[i] - arr[i - k]
        best = max(best, window)
    return best
# Time: O(n)  Space: O(1)
```

### 4b. Variable-Size Window (Expand & Shrink)

Used for: longest/shortest subarray satisfying a condition.

```
Pattern:
  for R in range(n):
      add arr[R] to window state
      while window is INVALID:
          remove arr[L] from state
          L += 1
      update answer with (R - L + 1)
```

```python
def longest_no_repeat(s):
    """Longest substring without repeating characters."""
    seen = {}
    L = best = 0
    for R, ch in enumerate(s):
        if ch in seen and seen[ch] >= L:
            L = seen[ch] + 1
        seen[ch] = R
        best = max(best, R - L + 1)
    return best
# Time: O(n)  Space: O(26) = O(1)
```

### 4c. Window with Frequency Map (Anagram / Permutation)

```python
def find_anagrams(s, p):
    """All starting indices of p's anagrams in s."""
    from collections import Counter
    need = Counter(p)
    have = {}
    formed = 0
    required = len(need)
    result = []
    L = 0
    for R, ch in enumerate(s):
        have[ch] = have.get(ch, 0) + 1
        if ch in need and have[ch] == need[ch]:
            formed += 1
        while formed == required:
            if R - L + 1 == len(p):
                result.append(L)
            have[s[L]] -= 1
            if s[L] in need and have[s[L]] < need[s[L]]:
                formed -= 1
            L += 1
    return result
# Time: O(n)  Space: O(26)
```

---

## 5. Prefix Sum

Pre-compute cumulative sums to answer range queries in O(1).

```
arr    =  [3,  1,  4,  1,  5,  9]
prefix =  [0,  3,  4,  8,  9, 14, 23]
           ↑
         prefix[0] = 0 (empty)

Sum(arr[L..R]) = prefix[R+1] - prefix[L]

Example: Sum(arr[2..4]) = prefix[5] - prefix[2]
                        = 14 - 4 = 10  ✓ (4+1+5)
```

```python
def build_prefix(arr):
    n = len(arr)
    prefix = [0] * (n + 1)
    for i in range(n):
        prefix[i+1] = prefix[i] + arr[i]
    return prefix

def range_sum(prefix, L, R):
    return prefix[R+1] - prefix[L]
# Build: O(n)  Query: O(1)  Space: O(n)
```

### Subarray Sum = K (Hash Map Trick)

```
We need: prefix[R] - prefix[L] == k
So:      prefix[L] == prefix[R] - k

Keep a frequency map of seen prefix sums.
```

```python
def subarray_sum_k(arr, k):
    from collections import defaultdict
    count = 0
    curr = 0
    seen = defaultdict(int)
    seen[0] = 1  # empty prefix
    for num in arr:
        curr += num
        count += seen[curr - k]
        seen[curr] += 1
    return count
# Time: O(n)  Space: O(n)
```

### Difference Array (Range Updates in O(1))

```
To add +v to arr[L..R]:
  diff[L]   += v
  diff[R+1] -= v

Then prefix sum diff[] to get the final array.
```

```python
def range_add(n, updates):
    """updates = [(L, R, val), ...]  returns final array"""
    diff = [0] * (n + 1)
    for L, R, val in updates:
        diff[L]   += val
        diff[R+1] -= val
    result = []
    curr = 0
    for i in range(n):
        curr += diff[i]
        result.append(curr)
    return result
# Build: O(updates)  Query (final array): O(n)
```

---

## 6. Sorting

### 6a. Built-in (Timsort)
```python
arr.sort()                  # in-place, O(n log n)
sorted(arr)                 # new list
arr.sort(key=lambda x: -x)  # descending
arr.sort(key=lambda x: (x[1], x[0]))  # multi-key
```

### 6b. Counting Sort (for limited integer range)
```python
def counting_sort(arr, max_val):
    count = [0] * (max_val + 1)
    for x in arr: count[x] += 1
    result = []
    for val, freq in enumerate(count):
        result.extend([val] * freq)
    return result
# Time: O(n + k)  Space: O(k)
```

### 6c. Bucket Sort (for floats in [0,1))
```python
def bucket_sort(arr):
    n = len(arr)
    buckets = [[] for _ in range(n)]
    for x in arr:
        buckets[int(x * n)].append(x)
    for b in buckets: b.sort()
    return [x for b in buckets for x in b]
# Time: O(n) average  Space: O(n)
```

---

## 7. Hashing

Use a **hash map (dict)** or **hash set (set)** to achieve O(1) lookups.

### Frequency Counter
```python
from collections import Counter
freq = Counter(arr)           # {element: count}
most_common = freq.most_common(k)
```

### defaultdict
```python
from collections import defaultdict
graph = defaultdict(list)     # default empty list
groups = defaultdict(set)     # default empty set
counts = defaultdict(int)     # default 0
```

### Two Sum (canonical hash pattern)
```python
def two_sum(arr, target):
    seen = {}  # val → index
    for i, num in enumerate(arr):
        if target - num in seen:
            return [seen[target - num], i]
        seen[num] = i
    return []
# Time: O(n)  Space: O(n)
```

---

## 8. Binary Search on Arrays

Apply whenever the search space is **monotonic** (sorted / has a binary property).

### Standard Binary Search
```
arr = [1, 3, 5, 7, 9, 11]  target = 7

Step 1: L=0 R=5 mid=2  arr[2]=5 < 7 → L=3
Step 2: L=3 R=5 mid=4  arr[4]=9 > 7 → R=3
Step 3: L=3 R=3 mid=3  arr[3]=7 == 7 → return 3
```

```python
def binary_search(arr, target):
    L, R = 0, len(arr) - 1
    while L <= R:
        mid = L + (R - L) // 2   # avoid overflow
        if arr[mid] == target:   return mid
        elif arr[mid] < target:  L = mid + 1
        else:                    R = mid - 1
    return -1
# Time: O(log n)  Space: O(1)
```

### Find First / Last Position
```python
def first_position(arr, target):
    L, R, pos = 0, len(arr)-1, -1
    while L <= R:
        mid = (L + R) // 2
        if arr[mid] == target: pos = mid; R = mid - 1  # keep going left
        elif arr[mid] < target: L = mid + 1
        else: R = mid - 1
    return pos
```

### Binary Search on Answer (Abstract)

When you need the **minimum/maximum value satisfying a condition**:

```python
def min_days_to_make_bouquets(bloomDay, m, k):
    def can_make(day):
        bouquets = flowers = 0
        for d in bloomDay:
            if d <= day:
                flowers += 1
                if flowers == k: bouquets += 1; flowers = 0
            else:
                flowers = 0
        return bouquets >= m

    L, R = min(bloomDay), max(bloomDay)
    ans = -1
    while L <= R:
        mid = (L + R) // 2
        if can_make(mid): ans = mid; R = mid - 1
        else:             L = mid + 1
    return ans
```

---

## 9. Kadane's Algorithm (Maximum Subarray)

**Key insight**: At each position, decide — extend current subarray OR start fresh.

```
arr = [-2, 1, -3, 4, -1, 2, 1, -5, 4]

pos:   0   1   2   3   4   5   6   7  8
curr: -2   1  -2   4   3   5   6   1  5
max:  -2   1   1   4   4   5   6   6  6

Answer: 6  (subarray [4,-1,2,1])
```

```python
def max_subarray(arr):
    curr = best = arr[0]
    for num in arr[1:]:
        curr = max(num, curr + num)
        best = max(best, curr)
    return best
# Time: O(n)  Space: O(1)
```

**Extended**: Track indices
```python
def max_subarray_with_bounds(arr):
    best = curr = arr[0]
    start = end = temp = 0
    for i in range(1, len(arr)):
        if arr[i] > curr + arr[i]:
            curr = arr[i]; temp = i
        else:
            curr += arr[i]
        if curr > best:
            best = curr; start = temp; end = i
    return best, start, end
```

---

## 10. Matrix (2D Array)

### Traversal Directions
```python
DIRS = [(0,1),(0,-1),(1,0),(-1,0)]        # 4-directional
DIRS8 = [(r,c) for r in [-1,0,1] for c in [-1,0,1] if (r,c) != (0,0)]  # 8-dir

def in_bounds(r, c, rows, cols):
    return 0 <= r < rows and 0 <= c < cols
```

### Spiral Order
```
┌→→→→→┐
↑ ┌→→┐ ↓
↑ ↑  ↓ ↓
↑ └←←┘ ↓
└←←←←←┘
```

```python
def spiral(matrix):
    res = []
    top, bottom, left, right = 0, len(matrix)-1, 0, len(matrix[0])-1
    while top <= bottom and left <= right:
        for c in range(left, right+1):    res.append(matrix[top][c]);    top += 1
        for r in range(top, bottom+1):    res.append(matrix[r][right]);  right -= 1
        if top <= bottom:
            for c in range(right, left-1,-1): res.append(matrix[bottom][c]); bottom -= 1
        if left <= right:
            for r in range(bottom, top-1,-1): res.append(matrix[r][left]);   left += 1
    return res
```

### Rotate 90° Clockwise (in-place)
```
Step 1 – Transpose:    Step 2 – Reverse rows:
1 2 3    1 4 7         7 4 1
4 5 6 →  2 5 8    →    8 5 2
7 8 9    3 6 9         9 6 3
```

```python
def rotate(matrix):
    n = len(matrix)
    for i in range(n):
        for j in range(i+1, n):
            matrix[i][j], matrix[j][i] = matrix[j][i], matrix[i][j]
    for row in matrix:
        row.reverse()
```

---

## 11. Strings — Key Techniques

### String as Array
```python
s = "hello"
chars = list(s)   # mutable
chars[0] = 'H'
s = "".join(chars)
```

### Common String Methods
```python
s.split()          # split on whitespace
s.split(',')       # split on comma
s.strip()          # remove leading/trailing whitespace
s.lower() / .upper()
s.startswith(p) / .endswith(p)
s.find(sub)        # index of first occurrence, -1 if not found
s.count(sub)       # count non-overlapping occurrences
s.replace(old,new)
s[::-1]            # reverse
```

### KMP Pattern Matching
```
Pattern: "AABAAB"
Failure function (LPS): [0,1,0,1,2,3]

Allows O(n+m) text search vs O(n*m) naive.
```

```python
def kmp_search(text, pattern):
    def build_lps(pat):
        lps = [0] * len(pat)
        length = 0; i = 1
        while i < len(pat):
            if pat[i] == pat[length]:
                length += 1; lps[i] = length; i += 1
            elif length:
                length = lps[length - 1]
            else:
                lps[i] = 0; i += 1
        return lps

    lps = build_lps(pattern)
    i = j = 0
    positions = []
    while i < len(text):
        if text[i] == pattern[j]:
            i += 1; j += 1
        if j == len(pattern):
            positions.append(i - j)
            j = lps[j - 1]
        elif i < len(text) and text[i] != pattern[j]:
            j = lps[j-1] if j else (i := i + 1) or 0
    return positions
# Time: O(n + m)  Space: O(m)
```

---

## 12. Common FAANG Patterns Summary

| Pattern             | When to Use                               | Time     |
|---------------------|-------------------------------------------|----------|
| Two Pointers        | Sorted array, pairs, palindrome           | O(n)     |
| Sliding Window      | Subarray/substring with condition         | O(n)     |
| Prefix Sum          | Range sum queries, subarray sum = k       | O(n)     |
| Binary Search       | Sorted array, answer-space search         | O(log n) |
| Hashing             | Frequency, existence, grouping            | O(n)     |
| Sorting             | Ordering, next greater, greedy            | O(n log n)|
| Kadane's            | Max/min subarray sum                      | O(n)     |
| Matrix BFS/DFS      | Islands, flood fill, reachability         | O(m·n)   |

---

## 13. Complexity Cheat Sheet

```
n = 10^4  → O(n²) is fine        (~10^8 ops max)
n = 10^5  → O(n log n) needed
n = 10^6  → O(n) or O(n log n)
n = 10^9  → O(log n) or O(1)
```
