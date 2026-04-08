"""
Problem: Reconstruct Itinerary
Difficulty: Hard
Topic: Graphs / Eulerian Path / DFS
LeetCode: #332

Description:
    Given a list of airline tickets [from, to], reconstruct the itinerary
    starting from "JFK". Use all tickets exactly once.
    If multiple valid itineraries, return lexicographically smallest.

Examples:
    Input:  [["MUC","LHR"],["JFK","MUC"],["SFO","SJC"],["LHR","SFO"]]
    Output: ["JFK","MUC","LHR","SFO","SJC"]

    Input:  [["JFK","SFO"],["JFK","ATL"],["SFO","ATL"],["ATL","JFK"],["ATL","SFO"]]
    Output: ["JFK","ATL","JFK","SFO","ATL","SFO"]

Approach (Hierholzer's Algorithm):
    Sort destinations (lexicographic). DFS and post-order append.
    This naturally finds the Eulerian path.

Time: O(E log E)   Space: O(E)
"""

from collections import defaultdict

def find_itinerary(tickets):
    adj = defaultdict(list)
    for src, dst in sorted(tickets, reverse=True):
        adj[src].append(dst)
    result = []
    def dfs(airport):
        while adj[airport]:
            dfs(adj[airport].pop())
        result.append(airport)
    dfs("JFK")
    return result[::-1]

if __name__ == "__main__":
    r = find_itinerary([["MUC","LHR"],["JFK","MUC"],["SFO","SJC"],["LHR","SFO"]])
    assert r == ["JFK","MUC","LHR","SFO","SJC"]
    r2 = find_itinerary([["JFK","SFO"],["JFK","ATL"],["SFO","ATL"],["ATL","JFK"],["ATL","SFO"]])
    assert r2 == ["JFK","ATL","JFK","SFO","ATL","SFO"]
    print("All tests passed ✓")
