// Game constants
export const MAX_INCORRECT_GUESSES = 6;

// State persistence functions
export function saveState(gameState) {
	try {
		localStorage.setItem("chromaCrossState", JSON.stringify(gameState));
		console.log("Game state saved");
	} catch (error) {
		console.error("Failed to save game state:", error);
	}
}

export function loadState(puzzleId) {
	try {
		const savedStateString = localStorage.getItem("chromaCrossState");
		if (!savedStateString) {
			console.log("No saved state found");
			return null;
		}

		const savedState = JSON.parse(savedStateString);

		// Check if the saved state matches current puzzle ID
		if (savedState.puzzleId !== puzzleId) {
			console.log("Saved state is for a different puzzle, discarding");
			localStorage.removeItem("chromaCrossState");
			return null;
		}

		console.log("Valid saved state found, loading...");
		return savedState;
	} catch (error) {
		console.error("Failed to load game state:", error);
		// Clear corrupted data
		localStorage.removeItem("chromaCrossState");
		return null;
	}
}

// Game logic functions
export function handleGuess(letter, puzzle, gameState) {
	// Check if game is over
	if (gameState.status !== "IN_PROGRESS") {
		return { gameState, shouldShake: false };
	}

	// Sanitize input
	if (!letter || !letter.match(/[A-Z]/)) {
		return { gameState, shouldShake: false };
	}

	// Check if already guessed
	if (
		gameState.revealedLetters.includes(letter) ||
		gameState.incorrectGuesses.includes(letter)
	) {
		return { gameState, shouldShake: true };
	}

	// Create new state to avoid mutation
	const newGameState = { ...gameState };

	// Check if letter is in puzzle
	if (puzzle.uniqueLetters.includes(letter)) {
		// Correct guess
		newGameState.revealedLetters = [...gameState.revealedLetters, letter];
	} else {
		// Incorrect guess
		newGameState.incorrectGuesses = [...gameState.incorrectGuesses, letter];
	}

	// Check win/loss conditions
	checkGameStatus(newGameState, puzzle);

	return { gameState: newGameState, shouldShake: false };
}

export function checkGameStatus(gameState, puzzle) {
	// Win condition: all unique letters have been revealed
	if (gameState.revealedLetters.length === puzzle.uniqueLetters.length) {
		gameState.status = "WON";
		console.log("Player wins!");
		return;
	}

	// Loss condition: too many incorrect guesses
	if (gameState.incorrectGuesses.length >= MAX_INCORRECT_GUESSES) {
		gameState.status = "LOST";
		console.log("Player loses!");
		return;
	}
}

export function shakeElement(element) {
	if (element) {
		element.style.animation = "shake 0.3s";
		setTimeout(() => {
			element.style.animation = "";
		}, 300);
	}
}

// Rendering functions
export function renderGrid(puzzle, gameState) {
	const gridContainer = document.getElementById("grid-container");
	if (!gridContainer) return;

	gridContainer.innerHTML = "";

	const horizontal = puzzle.words.horizontal;
	const vertical = puzzle.words.vertical;
	const intersection = puzzle.intersection;
	const gridWidth = horizontal.length;
	const gridHeight = vertical.length;

	const grid = document.createElement("div");
	grid.className = "puzzle-grid";
	grid.style.display = "grid";
	grid.style.gridTemplateColumns = `repeat(${gridWidth}, 1fr)`;
	grid.style.gap = "2px";

	for (let row = 0; row < gridHeight; row++) {
		for (let col = 0; col < gridWidth; col++) {
			const cell = document.createElement("div");
			cell.className = "grid-cell";

			let letter = null;
			let isEmpty = true;

			if (row === intersection.verticalIndex) {
				letter = horizontal[col];
				isEmpty = false;
			} else if (col === intersection.horizontalIndex) {
				letter = vertical[row];
				isEmpty = false;
			}

			if (!isEmpty && letter) {
				cell.style.backgroundColor = puzzle.colorMap[letter];
				cell.style.width = "40px";
				cell.style.height = "40px";
				cell.style.display = "flex";
				cell.style.justifyContent = "center";
				cell.style.alignItems = "center";
				cell.style.border = "2px solid #4a4a4a";
				cell.style.fontSize = "1.2rem";
				cell.style.fontWeight = "bold";
				cell.style.color = "#ffffff";

				// Show letter if revealed or game is lost
				if (
					gameState.revealedLetters.includes(letter) ||
					gameState.status === "LOST"
				) {
					cell.textContent = letter;
				}
			} else {
				cell.style.backgroundColor = "transparent";
				cell.style.border = "none";
				cell.style.width = "40px";
				cell.style.height = "40px";
			}

			grid.appendChild(cell);
		}
	}

	gridContainer.appendChild(grid);
}

export function renderPalette(puzzle, gameState) {
	const paletteContainer = document.getElementById("palette-container");
	if (!paletteContainer) return;

	paletteContainer.innerHTML = "";

	const title = document.createElement("div");
	title.textContent = "Color Palette";
	title.style.marginBottom = "1rem";
	title.style.fontWeight = "bold";
	paletteContainer.appendChild(title);

	const paletteWrapper = document.createElement("div");
	paletteWrapper.style.display = "flex";
	paletteWrapper.style.flexWrap = "wrap";
	paletteWrapper.style.gap = "0.5rem";
	paletteWrapper.style.justifyContent = "center";

	for (const [letter, color] of Object.entries(puzzle.colorMap)) {
		const colorItem = document.createElement("div");
		colorItem.style.display = "flex";
		colorItem.style.alignItems = "center";
		colorItem.style.gap = "0.25rem";
		colorItem.style.fontSize = "0.9rem";

		const colorCircle = document.createElement("div");
		colorCircle.style.width = "20px";
		colorCircle.style.height = "20px";
		colorCircle.style.borderRadius = "50%";
		colorCircle.style.backgroundColor = color;
		colorCircle.style.border = "1px solid #666";

		const letterSpan = document.createElement("span");
		letterSpan.textContent = gameState.revealedLetters.includes(letter)
			? letter
			: "?";
		letterSpan.style.fontWeight = "bold";
		letterSpan.style.minWidth = "15px";

		colorItem.appendChild(colorCircle);
		colorItem.appendChild(document.createTextNode(" = "));
		colorItem.appendChild(letterSpan);

		paletteWrapper.appendChild(colorItem);
	}

	paletteContainer.appendChild(paletteWrapper);
}

export function renderKeyboard(gameState) {
	const keyboardContainer = document.getElementById("keyboard-container");
	if (!keyboardContainer) return;

	keyboardContainer.innerHTML = "";

	const rows = [
		["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
		["A", "S", "D", "F", "G", "H", "J", "K", "L"],
		["Z", "X", "C", "V", "B", "N", "M"],
	];

	for (const row of rows) {
		const rowDiv = document.createElement("div");
		rowDiv.style.display = "flex";
		rowDiv.style.justifyContent = "center";
		rowDiv.style.gap = "0.25rem";
		rowDiv.style.marginBottom = "0.25rem";

		for (const letter of row) {
			const key = document.createElement("button");
			key.className = "key";
			key.textContent = letter;
			key.dataset.letter = letter;

			// Set key state based on game state
			if (gameState.revealedLetters.includes(letter)) {
				key.classList.add("correct");
			} else if (gameState.incorrectGuesses.includes(letter)) {
				key.classList.add("incorrect");
			}

			// Apply styles directly to ensure visibility
			key.style.backgroundColor = "#3a3a3a";
			key.style.border = "2px solid #4a4a4a";
			key.style.borderRadius = "4px";
			key.style.padding = "0.75rem";
			key.style.fontSize = "1rem";
			key.style.fontWeight = "bold";
			key.style.color = "#ffffff";
			key.style.cursor = "pointer";
			key.style.transition = "all 0.2s ease";
			key.style.minWidth = "40px";

			if (gameState.revealedLetters.includes(letter)) {
				key.style.backgroundColor = "#4caf50";
				key.style.borderColor = "#66bb6a";
			} else if (gameState.incorrectGuesses.includes(letter)) {
				key.style.backgroundColor = "#616161";
				key.style.borderColor = "#757575";
				key.style.color = "#bdbdbd";
			}

			rowDiv.appendChild(key);
		}

		keyboardContainer.appendChild(rowDiv);
	}
}

export function renderGuessCounter(gameState) {
	const remainingCountElement = document.getElementById("remaining-count");
	if (!remainingCountElement) return;

	const remaining = MAX_INCORRECT_GUESSES - gameState.incorrectGuesses.length;
	remainingCountElement.textContent = remaining;

	// Add warning styling when getting low
	remainingCountElement.classList.remove("warning");
	if (remaining <= 2 && remaining > 0) {
		remainingCountElement.classList.add("warning");
	}

	// Hide the counter when game is over
	const guessCounter = document.getElementById("guess-counter");
	if (gameState.status !== "IN_PROGRESS") {
		guessCounter.style.display = "none";
	} else {
		guessCounter.style.display = "inline-block";
	}
}

export function renderGameStatus(puzzle, gameState) {
	const winModal = document.getElementById("win-message");
	const lossModal = document.getElementById("loss-message");

	// Hide both modals by default
	winModal.classList.add("hidden");
	lossModal.classList.add("hidden");

	if (gameState.status === "WON") {
		// Show win modal
		winModal.classList.remove("hidden");

		// Update win stats
		const winStats = document.getElementById("win-stats");
		const totalGuesses =
			gameState.revealedLetters.length + gameState.incorrectGuesses.length;
		const incorrectCount = gameState.incorrectGuesses.length;

		winStats.innerHTML = `
			<p><strong>Solved in ${totalGuesses} guesses!</strong></p>
			<p>${incorrectCount} incorrect guess${incorrectCount !== 1 ? "es" : ""}</p>
		`;
	} else if (gameState.status === "LOST") {
		// Show loss modal
		lossModal.classList.remove("hidden");

		// Update loss stats
		const lossStats = document.getElementById("loss-stats");
		const totalGuesses =
			gameState.revealedLetters.length + gameState.incorrectGuesses.length;
		const correctCount = gameState.revealedLetters.length;

		lossStats.innerHTML = `
			<p><strong>You made ${totalGuesses} guesses</strong></p>
			<p>${correctCount} correct, ${MAX_INCORRECT_GUESSES} incorrect</p>
			<p><strong>The words were: ${puzzle.words.horizontal} / ${puzzle.words.vertical}</strong></p>
		`;
	}
}

export function render(puzzle, gameState) {
	renderGrid(puzzle, gameState);
	renderPalette(puzzle, gameState);
	renderKeyboard(gameState);
	renderGuessCounter(gameState);
	renderGameStatus(puzzle, gameState);
}
