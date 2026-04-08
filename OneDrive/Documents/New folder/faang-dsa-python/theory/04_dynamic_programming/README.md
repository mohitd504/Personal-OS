# 📘 Theory: Dynamic Programming & Recursion

---

## 1. What is Dynamic Programming?

**Dynamic Programming (DP)** solves complex problems by breaking them into
overlapping subproblems and storing results to avoid redundant computation.

**Two key properties required**:
1. **Optimal Substructure** — optimal solution built from optimal subsolutions
2. **Overlapping Subproblems** — same subproblems solved multiple times

### DP vs Divide & Conquer

```
Divide & Conquer: subproblems are INDEPENDENT (merge sort, quicksort)
DP:               subproblems OVERLAP (Fibonacci, LCS, knapsack)
```

---

## 2. Top-Down DP (Memoization)

Start from the original problem, recurse down, **cache** results.

### Fibonacci — Without DP: O(2ⁿ)
```
fib(5)
├── fib(4)
│   ├── fib(3)
│   │   ├── fib(2) ← computed again!
│   │   └── fib(1)
│   └── fib(2) ← computed again!
└── fib(3)  ← computed again!
```

### Fibonacci — With Memoization: O(n)
```python
def fib(n, memo={}):
    if n in memo: return memo[n]
    if n <= 1:    return n
    memo[n] = fib(n-1, memo) + fib(n-2, memo)
    return memo[n]

# Cleaner with @lru_cache
from functools import lru_cache
@lru_cache(maxsize=None)
def fib(n):
    if n <= 1: return n
    return fib(n-1) + fib(n-2)
```

---

## 3. Bottom-Up DP (Tabulation)

Fill a table starting from the **base cases**, build up to the answer.
Avoids recursion overhead.

```
Fibonacci tabulation:
dp[0]=0, dp[1]=1
dp[2] = dp[1]+dp[0] = 1
dp[3] = dp[2]+dp[1] = 2
dp[4] = dp[3]+dp[2] = 3
dp[5] = dp[4]+dp[3] = 5
```

```python
def fib(n):
    if n <= 1: return n
    dp = [0] * (n+1)
    dp[1] = 1
    for i in range(2, n+1):
        dp[i] = dp[i-1] + dp[i-2]
    return dp[n]

# Space-optimized (only need last 2):
def fib(n):
    a, b = 0, 1
    for _ in range(n): a, b = b, a+b
    return a
```

---

## 4. 1D DP Patterns

### Climbing Stairs
```
n=5 stairs, take 1 or 2 steps.
ways(1)=1, ways(2)=2
ways(n) = ways(n-1) + ways(n-2)  ← Fibonacci!

n:    1  2  3  4  5
dp:   1  2  3  5  8
```

```python
def climb(n):
    a, b = 1, 1
    for _ in range(n-1): a, b = b, a+b
    return b
```

### House Robber
```
nums = [2, 7, 9, 3, 1]
Can't rob adjacent houses.

dp[i] = max(rob house i: dp[i-2]+nums[i], skip: dp[i-1])

i:    0  1   2   3   4
dp:   2  7  11  11  12

Answer: 12 (rob 2, 9, 1)
```

```python
def rob(nums):
    prev2, prev1 = 0, 0
    for n in nums:
        prev2, prev1 = prev1, max(prev1, prev2+n)
    return prev1
```

### Coin Change (Minimum Coins)
```
coins=[1,5,11]  amount=15

dp[0]=0, dp[1]=1, dp[2]=2, ..., dp[5]=1, ..., dp[10]=2, dp[11]=1, dp[15]=3
For each amount a, try each coin c:
  dp[a] = min(dp[a], dp[a-c]+1)

a:   0  1  2  3  4  5  6  7  8  9 10 11 12 13 14 15
dp:  0  1  2  3  4  1  2  3  4  5  2  1  2  3  4  3
Answer: 3 (11+3×1 or 5+5+5)
```

```python
def coin_change(coins, amount):
    dp = [float('inf')] * (amount+1)
    dp[0] = 0
    for coin in coins:
        for a in range(coin, amount+1):
            dp[a] = min(dp[a], dp[a-coin]+1)
    return dp[amount] if dp[amount] != float('inf') else -1
```

---

## 5. 2D DP Patterns

### Unique Paths (Grid)
```
m=3, n=3 grid (only right/down moves)

dp[i][j] = dp[i-1][j] + dp[i][j-1]

dp:
1  1  1
1  2  3
1  3  6   ← answer

Any cell = paths from top + paths from left
```

```python
def unique_paths(m, n):
    dp = [[1]*n for _ in range(m)]
    for i in range(1,m):
        for j in range(1,n):
            dp[i][j] = dp[i-1][j] + dp[i][j-1]
    return dp[m-1][n-1]
# Space-optimized: O(n)
def unique_paths(m, n):
    dp = [1] * n
    for _ in range(1,m):
        for j in range(1,n):
            dp[j] += dp[j-1]
    return dp[-1]
```

### Longest Common Subsequence (LCS)
```
s1 = "ABCBDAB"
s2 = "BDCAB"

LCS = "BCAB" or "BDAB" → length 4

dp[i][j] = length of LCS of s1[:i] and s2[:j]

if s1[i-1]==s2[j-1]: dp[i][j] = dp[i-1][j-1] + 1
else:                dp[i][j] = max(dp[i-1][j], dp[i][j-1])
```

```python
def lcs(s1, s2):
    m, n = len(s1), len(s2)
    dp = [[0]*(n+1) for _ in range(m+1)]
    for i in range(1,m+1):
        for j in range(1,n+1):
            if s1[i-1]==s2[j-1]: dp[i][j] = dp[i-1][j-1]+1
            else:                dp[i][j] = max(dp[i-1][j], dp[i][j-1])
    return dp[m][n]
```

### Edit Distance
```
word1="horse"  word2="ros"
Operations: insert, delete, replace

     ""  r  o  s
 ""   0  1  2  3
  h   1  1  2  3
  o   2  2  1  2
  r   3  2  2  2
  s   4  3  3  2
  e   5  4  4  3   ← answer

if chars match: dp[i][j] = dp[i-1][j-1]          (free)
else:           dp[i][j] = 1 + min(
                    dp[i-1][j],     # delete from word1
                    dp[i][j-1],     # insert into word1
                    dp[i-1][j-1])   # replace
```

```python
def edit_dist(w1, w2):
    m, n = len(w1), len(w2)
    dp = list(range(n+1))
    for i in range(1,m+1):
        prev = dp[0]; dp[0] = i
        for j in range(1,n+1):
            tmp = dp[j]
            dp[j] = prev if w1[i-1]==w2[j-1] else 1+min(prev, dp[j], dp[j-1])
            prev = tmp
    return dp[n]
# Time: O(m·n)  Space: O(n)
```

---

## 6. Knapsack Problems

### 0/1 Knapsack — Each item used at most once
```
items:    weight=[1,3,4,5]   value=[1,4,5,7]   capacity=7

Traverse weights in REVERSE to prevent reusing items.

dp[w] = max value with capacity w

     0  1  2  3  4  5  6  7
w=1: 0  1  1  1  1  1  1  1
w=3: 0  1  1  4  5  5  5  5
w=4: 0  1  1  4  5  6  6  9
w=5: 0  1  1  4  5  7  8  9  ← answer = 9
```

```python
def knapsack(weights, values, W):
    dp = [0] * (W+1)
    for w, v in zip(weights, values):
        for cap in range(W, w-1, -1):   # reverse!
            dp[cap] = max(dp[cap], dp[cap-w]+v)
    return dp[W]
```

### Unbounded Knapsack — Items reusable
```
coins=[1,5,11]  amount=15  → coin change problem
Traverse weights FORWARD (allow reuse).
```

```python
def unbounded(weights, values, W):
    dp = [0] * (W+1)
    for cap in range(1, W+1):
        for w, v in zip(weights, values):
            if w <= cap:
                dp[cap] = max(dp[cap], dp[cap-w]+v)
    return dp[W]
```

### Partition Equal Subset Sum
```
nums=[1,5,11,5]  total=22  target=11
Can we select subset with sum=11?  → YES: {11} or {1,5,5}

dp = set of reachable sums
Start: {0}
After 1:  {0,1}
After 5:  {0,1,5,6}
After 11: {0,1,5,6,11,...}  → 11 in dp ✓
```

```python
def can_partition(nums):
    total = sum(nums)
    if total % 2: return False
    target = total // 2
    dp = {0}
    for n in nums:
        dp = dp | {s+n for s in dp}
        if target in dp: return True
    return False
```

---

## 7. DP on Strings

### Longest Increasing Subsequence (LIS) — O(n log n)
```
nums = [10, 9, 2, 5, 3, 7, 101, 18]
LIS  = [2, 3, 7, 18] or [2, 5, 7, 101] → length 4

Patience sorting (binary search approach):
tails = []  (maintains smallest tail for each length)

10 → [10]
9  → [9]    (replace 10)
2  → [2]    (replace 9)
5  → [2,5]
3  → [2,3]  (replace 5)
7  → [2,3,7]
101→ [2,3,7,101]
18 → [2,3,7,18] (replace 101)
len(tails) = 4 ✓
```

```python
import bisect
def lis(nums):
    tails = []
    for n in nums:
        pos = bisect.bisect_left(tails, n)
        if pos == len(tails): tails.append(n)
        else:                 tails[pos] = n
    return len(tails)
```

### Longest Palindromic Substring — Expand Around Center
```
"babad"
Centers: b, a, b, a, d, ba, ab, ba, ad
Expand b: "b"          (len=1)
Expand a: "bab"        (len=3) ← or "aba" at center 'a'
Expand b: "b"          (len=1)
...
Answer: "bab" or "aba"
```

```python
def longest_palindrome(s):
    def expand(l, r):
        while l>=0 and r<len(s) and s[l]==s[r]: l-=1; r+=1
        return s[l+1:r]
    best = ""
    for i in range(len(s)):
        for p in (expand(i,i), expand(i,i+1)):
            if len(p) > len(best): best = p
    return best
# Time: O(n²)  Space: O(1)
```

---

## 8. Interval DP

Used when the problem involves a range [i,j] and the optimal solution
for [i,j] depends on solutions for smaller ranges.

### Burst Balloons
```
nums=[3,1,5,8]  (with 1s padded: [1,3,1,5,8,1])
Choose order to burst for max coins.

dp[l][r] = max coins from bursting all in (l,r) — open interval
Last balloon burst in (l,r) is k:
  dp[l][r] = max(nums[l]*nums[k]*nums[r] + dp[l][k] + dp[k][r])
```

```python
def max_coins(nums):
    nums = [1] + nums + [1]
    n = len(nums)
    dp = [[0]*n for _ in range(n)]
    for length in range(2, n):
        for l in range(n-length):
            r = l + length
            for k in range(l+1, r):
                dp[l][r] = max(dp[l][r],
                    nums[l]*nums[k]*nums[r] + dp[l][k] + dp[k][r])
    return dp[0][n-1]
```

---

## 9. DP on Trees

Problems where state depends on subtree structure.

### Binary Tree Maximum Path Sum
```
Path can start and end at ANY node (not necessarily root-to-leaf).

        -10
        /  \
       9   20
           / \
          15   7

Best path: 15→20→7 = 42
```

```python
def max_path_sum(root):
    best = [float('-inf')]
    def gain(node):
        if not node: return 0
        L = max(gain(node.left), 0)
        R = max(gain(node.right), 0)
        best[0] = max(best[0], node.val + L + R)
        return node.val + max(L, R)
    gain(root)
    return best[0]
```

### House Robber on Tree
```python
def rob_tree(root):
    def dfs(node):      # returns (rob_node, skip_node)
        if not node: return 0, 0
        Lr, Ls = dfs(node.left)
        Rr, Rs = dfs(node.right)
        rob  = node.val + Ls + Rs         # rob this, skip children
        skip = max(Lr,Ls) + max(Rr,Rs)   # skip this, best of children
        return rob, skip
    return max(dfs(root))
```

---

## 10. DP Decision Framework

```
Step 1: Is the problem asking for max/min/count/true-false of some
        quantity over all valid configurations? → Likely DP

Step 2: Can you define the problem recursively?
        f(n) depends on f(n-1), f(n-2), ...?

Step 3: Are there overlapping subproblems (same f(k) called multiple times)?

Step 4: Define DP state:
        What information do I need at each step?
        1D: f(i) — position i
        2D: f(i,j) — two variables (two sequences, grid, etc.)

Step 5: Write recurrence:
        f(i) = some combination of f(i-1), f(i-2), ...

Step 6: Base cases:
        f(0) = ?, f(1) = ?

Step 7: Traverse order:
        Ensure subproblems computed before they're needed.

Step 8: Answer:
        Usually f(n), f[n-1][n-1], max(f), etc.

Step 9: Optimize space:
        Often O(n²) → O(n) or O(n) → O(1)
```

---

## 11. Common DP Patterns Reference

| Pattern             | Example Problem          | State       | Recurrence                        |
|---------------------|--------------------------|-------------|-----------------------------------|
| 1D Linear           | Climbing Stairs          | dp[i]       | dp[i] = dp[i-1] + dp[i-2]        |
| 1D Optimal          | House Robber             | dp[i]       | dp[i] = max(dp[i-1], dp[i-2]+v)  |
| 0/1 Knapsack        | Subset Sum               | dp[w]       | dp[w] = max(dp[w], dp[w-wi]+vi)  |
| Unbounded Knapsack  | Coin Change              | dp[a]       | dp[a] = min(dp[a], dp[a-c]+1)    |
| LCS / Edit Distance | LCS, Edit Dist           | dp[i][j]    | depends on chars matching         |
| LIS                 | Longest Increasing Subseq| tails[]     | bisect_left + replace             |
| Palindrome          | Palindromic Substrings   | dp[i][j]    | dp[i][j]=dp[i+1][j-1]&&s[i]==s[j]|
| Interval DP         | Burst Balloons           | dp[l][r]    | try all split points k            |
| Tree DP             | House Robber III         | (rob, skip) | post-order DFS                    |
| Bitmask DP          | TSP                      | dp[mask][i] | try all unvisited next nodes      |

---

## 12. Complexity Guide

```
1D DP:           O(n)       time,  O(n) or O(1) space
2D DP:           O(n²)      time,  O(n²) or O(n) space
Knapsack:        O(n·W)     time,  O(W) space
LCS / Edit:      O(m·n)     time,  O(n) space (optimized)
LIS:             O(n log n) time,  O(n) space (patience sort)
Interval DP:     O(n³)      time,  O(n²) space
Bitmask DP:      O(n²·2ⁿ)  time,  O(n·2ⁿ) space
```
