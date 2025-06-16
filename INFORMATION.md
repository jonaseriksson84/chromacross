f course. Here is a development document outlining the game logic, data structures, and backend processes for **ChromaCross**. This document is intended for developers to use as a technical specification.

---

# ChromaCross: Game Logic & Development Specification

**Version:** 1.0
**Date:** 6/16/2025

## 1. Overview

ChromaCross is a daily word puzzle that combines crossword-style word intersection with color-based code-breaking. Players are presented with a grid of colored squares representing two intersecting words. The objective is to deduce the words by guessing letters. A correct guess reveals the color associated with that letter, filling it in on the grid. The player wins by revealing all letters before running out of incorrect guesses.

## 2. Core Data Structures

The game's logic revolves around two primary objects: the `Puzzle` object (which is static for the day) and the `GameState` object (which tracks the player's progress).

### 2.1. The `Puzzle` Object

This object is generated once per day by the backend and contains the complete solution. It should be fetched by the client at the start of a new game.

```json
{
  "puzzleId": 42,
  "date": "2025-06-17",
  "words": {
    "horizontal": "WATER",
    "vertical": "LEMON"
  },
  "intersection": {
    "letter": "E",
    "horizontalIndex": 3,
    "verticalIndex": 1
  },
  "uniqueLetters": ["W", "A", "T", "E", "R", "L", "M", "O", "N"],
  "colorMap": {
    "W": "#FFFFFF",
    "A": "#90EE90",
    "T": "#FFD700",
    "E": "#A52A2A",
    "R": "#FF0000",
    "L": "#FFA500",
    "M": "#800080",
    "O": "#000000",
    "N": "#0000FF"
  }
}
```

### 2.2. The `GameState` Object

This object tracks the current player's session. It should be saved to the browser's `localStorage` to persist progress.

```json
{
  "puzzleId": 42,
  "revealedLetters": [],
  "incorrectGuesses": [],
  "status": "IN_PROGRESS"
}
```

*   **`revealedLetters`**: An array of correctly guessed letters (e.g., `["E", "A"]`).
*   **`incorrectGuesses`**: An array of incorrectly guessed letters (e.g., `["S", "X"]`).
*   **`status`**: Can be `IN_PROGRESS`, `WON`, or `LOST`.

## 3. Game Flow & Logic

### 3.1. Initialization

1.  On page load, the client checks `localStorage` for an existing `GameState`.
2.  If the `GameState.puzzleId` matches today's puzzle ID, load the saved state.
3.  If not, fetch today's `Puzzle` object from the backend API (e.g., `/api/today`).
4.  Initialize a new `GameState` for the current `puzzleId`.
5.  Render the UI based on the current `Puzzle` and `GameState`.

### 3.2. Player Input: Guessing a Letter

The primary player action is guessing a single letter.

1.  The player clicks a letter on the on-screen keyboard or types a key.
2.  The input is sanitized: convert to uppercase, ensure it's a single letter \(A-Z\).
3.  Check if the letter has already been guessed (is present in `revealedLetters` or `incorrectGuesses`). If so, provide brief feedback (e.g., a screen shake) and do nothing.

### 3.3. Guess Processing Logic

If the guess is a new, valid letter:

1.  **Check against the solution**: Determine if the guessed letter is present in the `puzzle.uniqueLetters` array.
2.  **Correct Guess**:
    *   Add the letter to the `GameState.revealedLetters` array.
    *   Update the UI:
        *   Reveal the letter in all corresponding colored squares on the grid.
        *   Update the palette to show the color-to-letter mapping (e.g., `🟫 = E`).
        *   Update the on-screen keyboard key to a "correct" state (e.g., green).
    *   Check for a win condition.
3.  **Incorrect Guess**:
    *   Add the letter to the `GameState.incorrectGuesses` array.
    *   Update the UI:
        *   Decrement the remaining attempts counter.
        *   Update the on-screen keyboard key to an "incorrect" state (e.g., gray).
    *   Check for a loss condition.
4.  **Save State**: After every valid guess, serialize the `GameState` object and save it to `localStorage`.

### 3.4. Win/Loss Conditions

*   **Win Condition**: The game is won when the set of `GameState.revealedLetters` is identical to the set of `puzzle.uniqueLetters`.
    *   Set `GameState.status = "WON"`.
    *   Display a "You Won!" message and the shareable results.
    *   Disable further input.

*   **Loss Condition**: The game is lost when the length of `GameState.incorrectGuesses` reaches the maximum allowed number (e.g., 6).
    *   Set `GameState.status = "LOST"`.
    *   Reveal the full solution on the grid.
    *   Display a "You Lost" message and the shareable results.
    *   Disable further input.

## 4. Backend: Daily Puzzle Generation

This is a server-side process that runs once per day to create a unique, unambiguous puzzle.

**Inputs**: A curated dictionary of valid words (e.g., 5-letter words).

**Algorithm**:

1.  **Select Candidate Pair**:
    a. Randomly select `word1` from the dictionary (e.g., `WATER`).
    b. Randomly select an index \(i\) and letter `L` from `word1` (e.g., index 3, letter 'E').
    c. Search the dictionary for all words (`word2`) that also contain the letter `L` at some index \(j\) (e.g., `LEMON`, with 'E' at index 1). Create a list of candidate pairs.

2.  **Perform Uniqueness Check (Crucial)**:
    a. For a candidate pair (`word1`, `word2`), create the set of unique letters required for the solution (e.g., for `WATER`/`LEMON`, the set is `{W,A,T,E,R,L,M,O,N}`).
    b. Define the structural pattern (e.g., a 5-letter word with 'E' at index 3 intersecting a 5-letter word with 'E' at index 1).
    c. **Collision Test**: Search the entire dictionary to see if any *other* pair of words can be formed that fits the *exact same structural pattern* using *only* the letters from the unique letter set.
    d. **If a collision is found** (e.g., `STARE`/`TRADE` can also be `RATES`/`DATES` using the same letters), the puzzle is ambiguous. **Discard this pair** and return to step 1.

3.  **Finalize Puzzle**:
    a. Once a unique, non-ambiguous pair is validated, proceed.
    b. Create the `colorMap`: For each letter in the `uniqueLetters` set, assign a unique, visually distinct color hex code. The assignment should be randomized.
    c. Construct the final `Puzzle` JSON object.

4.  **Store Puzzle**:
    a. Save the generated `Puzzle` object to a database or a flat file, retrievable by its date or ID.

## 5. Frontend UI/UX Logic

*   **Grid Rendering**: The grid is an \(N \times M\) display. For each cell corresponding to a letter:
    *   Retrieve the letter (e.g., `puzzle.words.horizontal[i]`).
    *   Check if this letter is in `GameState.revealedLetters`.
    *   **If yes**: Display the letter itself inside the cell. The background color should be its corresponding color from `puzzle.colorMap`.
    *   **If no**: Display only the background color from `puzzle.colorMap`.
*   **Palette Rendering**: The palette displays all unique colors from the `puzzle.colorMap`. For each color:
    *   Check if the corresponding letter has been revealed.
    *   **If yes**: Display `COLOR = LETTER`.
    *   **If no**: Display `COLOR = ?`.
*   **On-screen Keyboard**: Each key should reflect one of three states:
    *   **Default**: Unguessed.
    *   **Correct**: Guessed letter is in the puzzle.
    *   **Incorrect**: Guessed letter is not in the puzzle.

## 6. Share Functionality

When the user clicks "Share", the client should generate a spoiler-free text block.

1.  The text should include the game name, puzzle number, and result (guesses, win/loss).
2.  The grid should be represented by emojis corresponding to the colors of the **initial puzzle state**, not the solved state.
3.  This is generated client-side by mapping the `puzzle.colorMap` hex codes to a predefined set of color-block emojis (e.g., 🟥, 🟩, 🟦, 🟨, ⬛, ⬜, 🟪, 🟧).

**Example Share Text:**

```
ChromaCross #42
Solved in 9 guesses (2 incorrect)
      🟧
⬜🟩🟨🟫🟥
      🟪
      ⬛
      🟦
#ChromaCross
```

