"""
Problem: Word Ladder
Difficulty: Hard
Topic: Graphs / BFS
LeetCode: #127

Description:
    Given beginWord, endWord, and wordList, return the number of words in
    the shortest transformation sequence from beginWord to endWord, where
    each step changes exactly one letter and each word must be in wordList.
    Return 0 if no such sequence.

Examples:
    Input:  beginWord="hit", endWord="cog",
            wordList=["hot","dot","dog","lot","log","cog"]
    Output: 5  (hit→hot→dot→dog→cog)

    Input:  endWord="cog" not in wordList → Output: 0

Constraints:
    - 1 <= beginWord.length <= 10
    - All words same length.

Approach (BFS with wildcard patterns):
    Pre-build pattern→words map: "h*t" → ["hit","hot"]
    BFS from beginWord. For each word, try all wildcard patterns.
    Faster than comparing each word pair.

Time Complexity:  O(M² × N) where M=word length, N=num words
Space Complexity: O(M² × N)
"""

from collections import defaultdict, deque

def ladder_length(beginWord, endWord, wordList):
    word_set = set(wordList)
    if endWord not in word_set: return 0
    # Build pattern map
    patterns = defaultdict(list)
    for word in wordList:
        for i in range(len(word)):
            patterns[word[:i]+'*'+word[i+1:]].append(word)
    visited = {beginWord}
    queue = deque([(beginWord, 1)])
    while queue:
        word, length = queue.popleft()
        for i in range(len(word)):
            pattern = word[:i]+'*'+word[i+1:]
            for neighbor in patterns[pattern]:
                if neighbor == endWord: return length + 1
                if neighbor not in visited:
                    visited.add(neighbor)
                    queue.append((neighbor, length+1))
    return 0

if __name__ == "__main__":
    assert ladder_length("hit","cog",["hot","dot","dog","lot","log","cog"]) == 5
    assert ladder_length("hit","cog",["hot","dot","dog","lot","log"])       == 0
    assert ladder_length("a","c",["a","b","c"])                             == 2
    print("All tests passed ✓")
