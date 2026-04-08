"""
Problem: Text Justification
Difficulty: Hard
Topic: Strings / Greedy / Simulation
LeetCode: #68

Description:
    Given words and maxWidth, format text so each line is exactly maxWidth
    characters. Pack words left to right. Extra spaces distributed evenly
    (left-biased). Last line is left-justified.

Examples:
    Input:  words=["This","is","an","example","of","text","justification."], maxWidth=16
    Output: ["This    is    an","example  of text","justification.  "]

Time: O(n)   Space: O(n)
"""

def full_justify(words, maxWidth):
    lines = []; i = 0
    while i < len(words):
        line_len = len(words[i]); j = i+1
        while j < len(words) and line_len+1+len(words[j]) <= maxWidth:
            line_len += 1+len(words[j]); j += 1
        num_words = j-i; gaps = num_words-1
        if j == len(words) or num_words == 1:
            line = " ".join(words[i:j])
            lines.append(line + " "*(maxWidth-len(line)))
        else:
            total_spaces = maxWidth - sum(len(words[k]) for k in range(i,j))
            space, extra = divmod(total_spaces, gaps)
            line = ""
            for k in range(i, j-1):
                line += words[k] + " "*space + (" " if k-i < extra else "")
            line += words[j-1]
            lines.append(line)
        i = j
    return lines

if __name__ == "__main__":
    r = full_justify(["This","is","an","example","of","text","justification."],16)
    assert r[0] == "This    is    an"
    assert r[2] == "justification.  "
    print("All tests passed ✓")
