# FAANG DSA in Python 🐍

A complete, self-contained Data Structures & Algorithms reference for FAANG interviews.
Every topic comes with **full elaborated theory** followed by **hand-crafted Python problems** — each with
a detailed walkthrough, complexity analysis, and runnable tests.

---

## Repository Structure

```
faang-dsa-python/
│
├── theory/                          # Deep-dive theory for each topic
│   ├── 01_arrays_strings/
│   │   └── README.md               # Two Pointers, Sliding Window, Prefix Sum, Binary Search, Kadane's, KMP...
│   ├── 02_linked_lists_stacks_queues/
│   │   └── README.md               # SLL/DLL, Floyd's, Monotonic Stack, Deque, LRU/LFU Cache...
│   ├── 03_trees_graphs/
│   │   └── README.md               # DFS/BFS, BST, Trie, Union-Find, Dijkstra, Topological Sort, Tarjan's...
│   └── 04_dynamic_programming/
│       └── README.md               # Memoization, Tabulation, Knapsack, LCS, LIS, Interval/Tree/Bitmask DP...
│
└── problems/
    ├── easy/    (001 – 025)         # 25 problems
    ├── medium/  (001 – 050)         # 50 problems
    └── hard/    (001 – 050)         # 50 problems
```

Total: **125 problems** across all difficulty levels.

---

## Theory Modules

| # | Topic | Key Patterns Covered |
|---|-------|----------------------|
| 01 | Arrays & Strings | Two Pointers, Sliding Window (fixed/variable), Prefix Sum, Difference Array, Binary Search, Kadane's Algorithm, Hashing, Matrix Traversal, KMP String Matching |
| 02 | Linked Lists, Stacks & Queues | Singly/Doubly LL, Fast & Slow Pointers (Floyd's Cycle), Dummy Head, Monotonic Stack, Deque Sliding Window, Priority Queue / Heap, LRU Cache, LFU Cache |
| 03 | Trees & Graphs | Tree DFS (in/pre/post), BFS Level-Order, BST Operations, Trie, LCA, Diameter, Serialize/Deserialize, Graph BFS/DFS, Topological Sort (Kahn's + DFS), Union-Find (path compression + union by rank), Dijkstra, Tarjan's Bridges, Hierholzer's Eulerian Path |
| 04 | Dynamic Programming & Recursion | Top-Down (Memoization) vs Bottom-Up (Tabulation), 1D/2D DP, 0-1 Knapsack, Unbounded Knapsack, LCS, Edit Distance, LIS (O(n log n) patience sort), Interval DP, Tree DP, Bitmask DP, 3D DP, Game Theory DP |

---

## Problem Coverage

### Easy (25 problems) — Core Patterns
| Range | Topics |
|-------|--------|
| 001–008 | Arrays: Two Sum, Best Time to Buy/Sell Stock, Valid Anagram, Contains Duplicate, Product Except Self, Maximum Subarray, Move Zeroes, Climbing Stairs |
| 009–016 | More Arrays & Strings: Plus One, Single Number, Intersection of Two Arrays, Majority Element, Pascal's Triangle, Missing Number, Find All Duplicates, Reverse String |
| 017–021 | Linked Lists & Stacks: Reverse LL, Middle of LL, Valid Parentheses, Min Stack, Implement Queue with Stacks |
| 022–025 | Trees: Invert Binary Tree, Maximum Depth, Symmetric Tree, Path Sum |

### Medium (50 problems) — Interview Staples
| Range | Topics |
|-------|--------|
| 001–010 | Arrays: 3Sum, Container with Most Water, Subarray Sum Equals K, Longest Substring without Repeats, Find K Closest Elements, Top K Frequent Elements, Spiral Matrix, Rotate Image, Group Anagrams, Minimum Size Subarray Sum |
| 011–020 | More Arrays/Strings: Longest Palindromic Substring, Jump Game, Decode Ways, Word Break, Coin Change, Unique Paths, Combination Sum, House Robber, Sort Colors, Letter Combinations of Phone Number |
| 021–030 | Linked Lists/Stacks/Queues: Add Two Numbers, Remove Nth from End, Reorder List, Copy List with Random Pointer, LRU Cache (medium), Daily Temperatures, Evaluate RPN, Decode String, Next Greater Element II, Asteroid Collision |
| 031–040 | Trees/Graphs: Binary Tree Level Order, Validate BST, LCA of BST, Kth Smallest in BST, Number of Islands, Clone Graph, Course Schedule, Pacific Atlantic Water Flow, Rotting Oranges, Find Town Judge |
| 041–050 | DP: House Robber II, Longest Common Subsequence, Target Sum, Partition Equal Subset Sum, Longest Increasing Subsequence, Maximum Product Subarray, Maximal Square, Perfect Squares, Palindromic Substrings, Counting Bits |

### Hard (50 problems) — FAANG Finals
| Range | Topics |
|-------|--------|
| 001–010 | Trapping Rain Water, Median of Two Sorted Arrays, N-Queens, Merge K Sorted Lists, Reverse Nodes in K-Group, Serialize/Deserialize BT, BT Maximum Path Sum, Word Ladder, Largest Rectangle in Histogram, Maximal Rectangle |
| 011–020 | Edit Distance, Word Search II (Trie), Alien Dictionary, LFU Cache, Burst Balloons, Regular Expression Matching, Longest Valid Parentheses, Sliding Window Maximum, Find Median from Data Stream, First Missing Positive |
| 021–030 | Sudoku Solver, Critical Connections (Tarjan's), Reconstruct Itinerary, Swim in Rising Water, Min Cost to Connect All Points (Prim's), Distinct Subsequences, Palindrome Partitioning II, Russian Doll Envelopes, Cherry Pickup, Super Egg Drop |
| 031–040 | Shortest Path in Binary Matrix, Substring with Concatenation of All Words, Text Justification, LRU Cache Full Design, Trapping Rain Water II (3D BFS), Max Frequency Stack, Ways to Stay at Same Place, Shortest Superstring (Bitmask DP), Student Attendance Record II, Count Different Palindromic Subsequences |
| 041–050 | Minimum Refueling Stops (Greedy Heap), Frog Jump (HashMap DP), Remove Boxes (3D Interval DP), Strange Printer (Interval DP), Paint House III (3D DP), Number of Music Playlists, Minimum Cost to Cut a Stick, Longest Chunked Palindrome Decomposition, Stone Game IV (Game Theory DP), Minimize Deviation in Array |

---

## Quick-Start Study Plan

### Week 1–2 — Arrays & Strings
1. Read `theory/01_arrays_strings/README.md` fully (ASCII diagrams + code patterns).
2. Solve Easy 001–008 (all array/string).
3. Solve Medium 001–020.
4. Tackle Hard 001, 007, 009, 010, 012.

### Week 3 — Linked Lists, Stacks & Queues
1. Read `theory/02_linked_lists_stacks_queues/README.md`.
2. Solve Easy 017–021.
3. Solve Medium 021–030.
4. Tackle Hard 004, 005, 013, 014, 036.

### Week 4–5 — Trees & Graphs
1. Read `theory/03_trees_graphs/README.md`.
2. Solve Easy 022–025.
3. Solve Medium 031–040.
4. Tackle Hard 006, 007, 008, 021, 022, 023, 024, 025.

### Week 6–7 — Dynamic Programming
1. Read `theory/04_dynamic_programming/README.md`.
2. Solve Easy 008 (Climbing Stairs).
3. Solve Medium 012–020 and 041–050.
4. Tackle Hard 011, 015, 016, 026–030, 038–040, 043–050.

### Week 8 — Mock Interviews
- Pick 2 Easy + 2 Medium + 1 Hard per session.
- Time yourself: Easy ≤ 15 min, Medium ≤ 25 min, Hard ≤ 45 min.

---

## Python Patterns Cheat Sheet

```python
# ── Two Pointers ──────────────────────────────────────
left, right = 0, len(arr) - 1
while left < right:
    if condition: left += 1
    else: right -= 1

# ── Sliding Window (variable) ─────────────────────────
from collections import defaultdict
window = defaultdict(int)
left = 0
for right in range(len(s)):
    window[s[right]] += 1
    while invalid(window):
        window[s[left]] -= 1
        if window[s[left]] == 0: del window[s[left]]
        left += 1
    ans = max(ans, right - left + 1)

# ── Prefix Sum ────────────────────────────────────────
prefix = [0] * (n + 1)
for i in range(n):
    prefix[i+1] = prefix[i] + nums[i]
# Sum [l, r] = prefix[r+1] - prefix[l]

# ── Binary Search ─────────────────────────────────────
import bisect
lo, hi = 0, n - 1
while lo <= hi:
    mid = (lo + hi) // 2
    if check(mid): hi = mid - 1
    else: lo = mid + 1

# ── BFS ───────────────────────────────────────────────
from collections import deque
q = deque([start])
visited = {start}
while q:
    node = q.popleft()
    for nei in graph[node]:
        if nei not in visited:
            visited.add(nei)
            q.append(nei)

# ── Union-Find ────────────────────────────────────────
parent = list(range(n))
rank = [0] * n
def find(x):
    if parent[x] != x: parent[x] = find(parent[x])
    return parent[x]
def union(x, y):
    px, py = find(x), find(y)
    if px == py: return False
    if rank[px] < rank[py]: px, py = py, px
    parent[py] = px
    if rank[px] == rank[py]: rank[px] += 1
    return True

# ── Top-Down DP (Memoization) ─────────────────────────
from functools import lru_cache
@lru_cache(maxsize=None)
def dp(i, j):
    if base_case: return base_val
    return min/max(dp(i-1, j), dp(i, j-1), ...)

# ── Heap / Priority Queue ─────────────────────────────
import heapq
heap = []
heapq.heappush(heap, val)       # min-heap
heapq.heappush(heap, -val)      # max-heap (negate)
top = heapq.heappop(heap)
```

---

## Running the Problems

Each problem file is self-contained and runnable:

```bash
python3 problems/easy/001_two_sum.py
python3 problems/medium/011_longest_palindromic_substring.py
python3 problems/hard/001_trapping_rain_water.py
```

Or run all problems to verify:

```bash
# Run all easy problems
for f in problems/easy/*.py; do python3 "$f" && echo "✓ $f"; done

# Run all medium problems
for f in problems/medium/*.py; do python3 "$f" && echo "✓ $f"; done

# Run all hard problems
for f in problems/hard/*.py; do python3 "$f" && echo "✓ $f"; done
```

---

## Complexity Reference

| Algorithm | Time | Space |
|-----------|------|-------|
| Two Pointers | O(n) | O(1) |
| Sliding Window | O(n) | O(k) |
| Prefix Sum | O(n) build, O(1) query | O(n) |
| Binary Search | O(log n) | O(1) |
| BFS / DFS | O(V + E) | O(V) |
| Dijkstra (heap) | O((V+E) log V) | O(V) |
| Union-Find | O(α(n)) per op | O(n) |
| Topological Sort | O(V + E) | O(V) |
| Heap Push/Pop | O(log n) | O(n) |
| DP 1D | O(n) | O(n) or O(1) |
| DP 2D | O(n²) | O(n²) or O(n) |
| Bitmask DP | O(2ⁿ · n) | O(2ⁿ) |
| LIS (patience sort) | O(n log n) | O(n) |

---

*Happy grinding! Consistency beats intensity — one session a day keeps the FAANG rejections away.* 🚀
