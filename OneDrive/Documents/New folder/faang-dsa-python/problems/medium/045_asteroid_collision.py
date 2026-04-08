"""
Problem: Asteroid Collision
Difficulty: Medium
Topic: Stack / Simulation
LeetCode: #735

Description:
    Array asteroids: positive = moving right, negative = moving left.
    When two asteroids collide, the smaller explodes. Equal size both explode.
    Find the state after all collisions.

Examples:
    Input:  [5,10,-5]    Output: [5,10]   (10 beats -5)
    Input:  [8,-8]       Output: []       (both explode)
    Input:  [10,2,-5]    Output: [10]     (10 beats -5)
    Input:  [-2,-1,1,2]  Output: [-2,-1,1,2]  (no collision: left-movers pass right-movers going same way)

Approach:
    Use a stack. For each asteroid:
    - Positive or stack empty: push
    - Negative: compare with top:
      * top negative: push (both going left, no collision)
      * top positive and top < |current|: pop (top explodes), retry
      * top positive and top > |current|: current explodes, stop
      * top positive and top == |current|: both explode, pop

Time Complexity:  O(n)
Space Complexity: O(n)
"""

def asteroid_collision(asteroids):
    stack = []
    for ast in asteroids:
        alive = True
        while alive and ast < 0 and stack and stack[-1] > 0:
            if stack[-1] < abs(ast):
                stack.pop()
            elif stack[-1] == abs(ast):
                stack.pop(); alive = False
            else:
                alive = False
        if alive:
            stack.append(ast)
    return stack

if __name__ == "__main__":
    assert asteroid_collision([5,10,-5])   == [5,10]
    assert asteroid_collision([8,-8])      == []
    assert asteroid_collision([10,2,-5])   == [10]
    assert asteroid_collision([-2,-1,1,2]) == [-2,-1,1,2]
    print("All tests passed ✓")
