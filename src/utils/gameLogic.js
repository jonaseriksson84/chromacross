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
	grid.className = "grid gap-0.5";
	grid.style.gridTemplateColumns = `repeat(${gridWidth}, 1fr)`;

	for (let row = 0; row < gridHeight; row++) {
		for (let col = 0; col < gridWidth; col++) {
			const cell = document.createElement("div");
			
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
				cell.className = "w-10 h-10 flex items-center justify-center border-2 border-gray-600 text-xl font-bold text-white md:w-9 md:h-9 md:text-base";
				cell.style.backgroundColor = puzzle.colorMap[letter];

				// Show letter if revealed or game is lost
				if (
					gameState.revealedLetters.includes(letter) ||
					gameState.status === "LOST"
				) {
					cell.textContent = letter;
				}
			} else {
				cell.className = "w-10 h-10 md:w-9 md:h-9";
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
	title.className = "mb-4 font-bold";
	paletteContainer.appendChild(title);

	const paletteWrapper = document.createElement("div");
	paletteWrapper.className = "flex flex-wrap gap-2 justify-center";

	for (const [letter, color] of Object.entries(puzzle.colorMap)) {
		const colorItem = document.createElement("div");
		colorItem.className = "flex items-center gap-1 text-sm";

		const colorCircle = document.createElement("div");
		colorCircle.className = "w-5 h-5 rounded-full border border-gray-500";
		colorCircle.style.backgroundColor = color;

		const letterSpan = document.createElement("span");
		letterSpan.textContent = gameState.revealedLetters.includes(letter)
			? letter
			: "?";
		letterSpan.className = "font-bold min-w-[15px]";

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
		rowDiv.className = "flex justify-center gap-1 mb-1";

		for (const letter of row) {
			const key = document.createElement("button");
			key.textContent = letter;
			key.dataset.letter = letter;
			
			// Base Tailwind classes
			let keyClass = "key bg-gray-700 border-2 border-gray-600 rounded px-3 py-2 text-base font-bold text-white cursor-pointer transition-all duration-200 min-w-[40px] flex justify-center items-center hover:bg-gray-600 hover:scale-105 md:px-2 md:py-1 md:text-sm";
			
			// Set key state based on game state
			if (gameState.revealedLetters.includes(letter)) {
				keyClass += " !bg-green-500 !border-green-400";
			} else if (gameState.incorrectGuesses.includes(letter)) {
				keyClass += " !bg-gray-500 !border-gray-400 !text-gray-300";
			}
			
			key.className = keyClass;
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
	remainingCountElement.classList.remove("text-red-400");
	remainingCountElement.classList.add("text-blue-400");
	if (remaining <= 2 && remaining > 0) {
		remainingCountElement.classList.remove("text-blue-400");
		remainingCountElement.classList.add("text-red-400");
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
