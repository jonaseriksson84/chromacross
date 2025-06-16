# ChromaCross: Implementation Plan

This document outlines the step-by-step implementation plan for the ChromaCross web application. The approach is iterative, focusing on building and testing the application in manageable chunks. Each step concludes with a "Pause Point" describing a stable, testable state of the application.

## Step 1: Project Setup & Static UI

### Objective
Create the basic file structure and a static, non-interactive user interface using HTML and CSS. This step is about building the "scaffolding" of the game.

### Tasks
1.  **Create Project Files:**
    *   `index.html` (or your framework's equivalent entry point).
    *   `style.css`: For all styling.
    *   `script.js`: For all game logic.

2.  **Structure the View:**
    *   Add a basic HTML5 boilerplate.
    *   Link the stylesheet and script files.
    *   Create the main containers for the game components with clear IDs:
        *   A main `<div id="game-container">`.
        *   A `<header>` with the game title `<h1>ChromaCross</h1>`.
        *   A `<div id="grid-container">` for the puzzle grid.
        *   A `<div id="palette-container">` for the color key.
        *   A `<div id="keyboard-container">` for the on-screen keyboard.

3.  **Style the View:**
    *   Use Flexbox or CSS Grid to center the `game-container` on the page.
    *   Add placeholder styles for the grid, palette, and keyboard.
    *   Define basic styles for grid cells (`.grid-cell`) and keyboard keys (`.key`), including size, borders, and fonts. The goal is to have a visual layout, even with no data.

### ✅ Pause Point & Test
Open the main page in a browser. You should see the title of the game and distinct, empty areas for the grid, the color palette, and the keyboard. There is no functionality yet; this step is purely visual layout.

---

## Step 2: Data Modeling & Initial Render

### Objective
Define the game's data structures in code and write a rendering function that populates the static UI with data from a hardcoded puzzle.

### Tasks
1.  **Define Data Structures:** In `script.js`, create placeholder objects for the puzzle and the game state.

    ```javascript
    // A hardcoded puzzle for development
    const puzzle = {
      puzzleId: 1,
      words: { horizontal: "WATER", vertical: "LEMON" },
      intersection: { letter: "E", horizontalIndex: 3, verticalIndex: 1 },
      uniqueLetters: ["W", "A", "T", "E", "R", "L", "M", "O", "N"],
      colorMap: {
        W: "#4a90e2", A: "#7ed321", T: "#f5a623", E: "#bd10e0",
        R: "#d0021b", L: "#f8e71c", M: "#50e3c2", O: "#9013fe",
        N: "#b8e986",
      },
    };

    // The player's current state
    let gameState = {
      puzzleId: 1,
      revealedLetters: [],
      incorrectGuesses: [],
      status: "IN_PROGRESS",
    };
    ```

2.  **Create a `render()` Function:**
    *   This function will be responsible for updating the entire UI based on the current `puzzle` and `gameState`.
    *   **Grid:** Write logic to dynamically create the grid cells based on `puzzle.words`. Each cell's background color should be set from `puzzle.colorMap`. Initially, no letters are shown.
    *   **Palette:** Populate the palette area. For each unique color in `puzzle.colorMap`, display a colored circle and a "?" symbol.
    *   **Keyboard:** Dynamically generate the keys for the keyboard.

3.  **Initial Call:** Call `render()` once when the script loads to draw the initial game board.

### ✅ Pause Point & Test
Refresh the browser. The grid should now be filled with the colors from the hardcoded `puzzle` object. The palette should show one colored circle for each unique letter. The keyboard should be fully rendered. The game is still not interactive.

---

## Step 3: Core Game Logic - Handling Guesses

### Objective
Implement the primary game loop: listen for player input, process the guess, update the game state, and re-render the UI to reflect the change.

### Tasks
1.  **Add Event Listeners:**
    *   Attach a single event listener to the `keyboard-container`. Use event delegation to capture clicks on individual keys.
    *   Optionally, add a global `keydown` event listener to handle physical keyboard input.

2.  **Create `handleGuess(letter)` Function:**
    *   This function will be the brain of the game.
    *   It should first check if the letter has already been guessed or if the game is over. If so, do nothing.
    *   Determine if the guessed `letter` is in `puzzle.uniqueLetters`.
    *   **If correct:** Add the letter to `gameState.revealedLetters`.
    *   **If incorrect:** Add the letter to `gameState.incorrectGuesses`.

3.  **Update the `render()` Function:**
    *   Modify `render()` to read from `gameState`.
    *   **Grid:** If a letter is in `gameState.revealedLetters`, display the letter inside its corresponding colored cell.
    *   **Palette:** If a letter is revealed, update the `?` to show the letter.
    *   **Keyboard:** Change the class/styling of a key after it has been guessed (e.g., add a `.correct` or `.incorrect` class).

4.  **Connect Logic:** Call `handleGuess(letter)` from your event listener, and make sure `handleGuess` calls `render()` at the end to update the screen.

### ✅ Pause Point & Test
The game should now be interactive. Clicking a correct letter on the keyboard should reveal it on the grid and in the palette. Clicking an incorrect letter should change the key's color to indicate it was a wrong guess. You can't win or lose yet, but the core mechanic is functional.

Excellent. Let's proceed with the next steps in the implementation plan, building upon the interactive foundation we established.

---

## Step 4: Implementing Win/Loss Conditions

### Objective
To give the game a definitive end-state by checking for win or loss conditions after every guess. This involves disabling input and displaying a clear message to the player upon completion.

### Tasks
1.  **Define Game Constants:** At the top of `script.js`, define a constant for the maximum number of allowed incorrect guesses.

    ```javascript
    const MAX_INCORRECT_GUESSES = 6;
    ```

2.  **Create `checkGameStatus()` Function:**
    *   This function will be called at the end of `handleGuess`.
    *   **Win Check:** Compare the number of revealed letters to the number of unique letters required. If they match, set `gameState.status = "WON"`.
      *   `if (gameState.revealedLetters.length === puzzle.uniqueLetters.length)`
    *   **Loss Check:** Compare the number of incorrect guesses to the maximum allowed. If they match, set `gameState.status = "LOST"`.
      *   `if (gameState.incorrectGuesses.length >= MAX_INCORRECT_GUESSES)`

3.  **Update `handleGuess()`:**
    *   After updating the state, call `checkGameStatus()`.
    *   Add a guard at the beginning of `handleGuess` to prevent any action if `gameState.status` is not `"IN_PROGRESS"`.

4.  **Display Feedback:**
    *   Create hidden `<div>` elements in your HTML for win/loss messages (e.g., `<div id="win-message" class="modal">...</div>`).
    *   In your `render()` function, check `gameState.status`. If it's `WON` or `LOST`, display the appropriate message modal.
    *   When the game is lost, the `render()` function should also be updated to reveal all the letters of the puzzle.

### ✅ Pause Point & Test
The game is now fully playable from start to finish. You can win by guessing all the letters, which should trigger a success message. You can lose by making 6 incorrect guesses, which should trigger a failure message and reveal the solution. Once the game is over, the keyboard should become non-functional.

---

## Step 5: State Persistence with Local Storage

### Objective
To save the player's progress so they can close the browser and return to the game without losing their state.

### Tasks
1.  **Create `saveState()` and `loadState()` Functions:**
    *   **`saveState()`**: This function takes the current `gameState` object, uses `JSON.stringify()` to convert it to a string, and saves it to `localStorage` with a specific key (e.g., `'chromaCrossState'`).
    *   **`loadState()`**: This function reads the string from `localStorage`. If it exists, it uses `JSON.parse()` to convert it back into an object. **Crucially**, it must check if the `savedState.puzzleId` matches the current `puzzle.puzzleId`. If they don't match, it's an old game, and the saved state should be discarded.

2.  **Integrate State Management into the Game Flow:**
    *   Call `saveState()` at the end of the `handleGuess` function, after every valid move.
    *   At the very beginning of your script's execution, call `loadState()`. If it returns a valid, matching state, overwrite the initial `gameState` with the loaded one.
    *   The initial `render()` call will then draw the board based on this loaded state.

### ✅ Pause Point & Test
Play a game and make a few guesses. Refresh the page. The game should reload to the exact state you left it in (correct guesses, incorrect guesses, etc.). Win or lose a game, refresh, and the completed state should persist. Clear your browser's local storage and refresh; the game should start over from the beginning.

---

## Step 6: Share Functionality

### Objective
To create the classic, spoiler-free, shareable text block that can be copied to the user's clipboard.

### Tasks
1.  **Add a "Share" Button:** In the win/loss message modals, add a `<button id="share-button">Share</button>`.

2.  **Create `generateShareText()` Function:**
    *   This function builds the final string. It should include:
        *   The game name and puzzle ID.
        *   The result summary (e.g., "Solved in 10 guesses (1 incorrect)").
        *   The emoji grid.
    *   To build the emoji grid, create a mapping between the hex codes in `puzzle.colorMap` and a set of color-block emojis (e.g., `{'#4a90e2': '🟦', ...}`). Iterate through the puzzle words to reconstruct the grid shape using these emojis.

3.  **Implement Clipboard Logic:**
    *   Add an event listener to the share button.
    *   The listener's callback should call `generateShareText()` to get the result string.
    *   Use the `navigator.clipboard.writeText()` API to copy the string to the clipboard. This is a modern, asynchronous API.
    *   Provide user feedback, like changing the button text to "Copied!" for a few seconds.

### ✅ Pause Point & Test
Complete a game. The win/loss modal should appear with a "Share" button. Clicking the button should copy a correctly formatted text block to your clipboard. Paste the result into a text editor to verify its format and ensure it doesn't contain spoilers.

---

## Step 7: Backend Integration

### Objective
To transition from a hardcoded puzzle to fetching a unique daily puzzle from a server API, making the game a true daily experience.

### Tasks
1.  **Remove Hardcoded Puzzle:** Delete the `const puzzle = {...}` object from your `script.js`.

2.  **Implement `fetchPuzzle()` Function:**
    *   Create an `async` function to fetch data from a backend endpoint (e.g., `/api/puzzle/today`).
    *   Use the `fetch` API and handle the JSON response.
    *   Include error handling for network or server issues (e.g., using a `try...catch` block).

3.  **Modify Initialization Logic:**
    *   The entire game initialization sequence must now wait for the puzzle to be fetched.
    *   Wrap the startup logic in an `async` function.
    *   `await` the `fetchPuzzle()` call.
    *   Once the puzzle data is received, then proceed with `loadState()` (passing the new puzzle ID for validation) and the initial `render()`.
    *   If the fetch fails, display an error message to the user instead of the game board.

### ✅ Pause Point & Test
For this step, you will need a mock API or a simple backend that serves the `Puzzle` JSON object. When you load the page, you should see a network request in your browser's developer tools. The game should render using the data from the server. Changing the puzzle data on the server should result in a different puzzle on the front end after a refresh.