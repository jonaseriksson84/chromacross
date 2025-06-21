// Game constants
export const MAX_INCORRECT_GUESSES = 8;


// State persistence functions
export function saveState(gameState) {
	try {
		localStorage.setItem("chromaCrossState", JSON.stringify(gameState));
	} catch (error) {
	}
}

export function loadState(puzzleId) {
	try {
		const savedStateString = localStorage.getItem("chromaCrossState");
		if (!savedStateString) {
				return null;
		}

		const savedState = JSON.parse(savedStateString);

		// Check if the saved state matches current puzzle ID
		if (savedState.puzzleId !== puzzleId) {
			localStorage.removeItem("chromaCrossState");
			return null;
		}

		return savedState;
	} catch (error) {
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

	// Sanitize input - only accept single uppercase letters A-Z
	if (!letter || !letter.match(/^[A-Z]$/)) {
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

	// Track all guesses in order for analytics
	newGameState.guessSequence = [...(gameState.guessSequence || []), letter];

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
		sendAnalytics(gameState, puzzle, "won");
		return;
	}

	// Loss condition: too many incorrect guesses
	if (gameState.incorrectGuesses.length >= MAX_INCORRECT_GUESSES) {
		gameState.status = "LOST";
		sendAnalytics(gameState, puzzle, "lost");
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
	grid.className = "grid gap-1 w-full max-w-xs mx-auto";
	grid.style.gridTemplateColumns = `repeat(${gridWidth}, 1fr)`;
	grid.style.aspectRatio = `${gridWidth}/${gridHeight}`;

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
				cell.className =
					"aspect-square flex items-center justify-center border-2 border-gray-600 text-lg sm:text-xl font-bold text-white";
				cell.style.backgroundColor = puzzle.colorMap[letter];

				// Show letter if revealed or game is lost
				if (
					gameState.revealedLetters.includes(letter) ||
					gameState.status === "LOST"
				) {
					cell.textContent = letter;
				}
			} else {
				cell.className = "aspect-square";
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

	const colors = Object.entries(puzzle.colorMap);
	const totalColors = colors.length;

	// Always split into exactly 2 rows
	const itemsPerRow = Math.ceil(totalColors / 2);

	const paletteWrapper = document.createElement("div");
	paletteWrapper.className = "space-y-2";

	// Create exactly 2 rows
	for (let rowIndex = 0; rowIndex < 2; rowIndex++) {
		const startIndex = rowIndex * itemsPerRow;
		const endIndex = Math.min(startIndex + itemsPerRow, totalColors);
		const row = colors.slice(startIndex, endIndex);
		
		if (row.length > 0) {
			const rowDiv = document.createElement("div");
			rowDiv.className = "flex gap-2 justify-center items-center";

			for (const [letter, color] of row) {
				const colorItem = document.createElement("div");
				colorItem.className = "flex items-center gap-1 text-sm";

				const colorCircle = document.createElement("div");
				colorCircle.className = "w-4 h-4 rounded-full border border-gray-500";
				colorCircle.style.backgroundColor = color;

				const letterSpan = document.createElement("span");
				letterSpan.textContent = gameState.revealedLetters.includes(letter)
					? letter
					: "?";
				letterSpan.className = "font-bold text-xs min-w-[12px]";

				colorItem.appendChild(colorCircle);
				colorItem.appendChild(document.createTextNode(" = "));
				colorItem.appendChild(letterSpan);

				rowDiv.appendChild(colorItem);
			}
			paletteWrapper.appendChild(rowDiv);
		}
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

			// Base Tailwind classes with consistent sizing
			let keyClass =
				"key bg-gray-700 border-2 border-gray-600 rounded py-3 px-3 text-sm font-bold text-white cursor-pointer transition-all duration-200 min-w-[36px] flex justify-center items-center hover:bg-gray-600 hover:scale-105";

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
	const guessCounterElement = document.getElementById("guess-counter");
	const dividerElement = document.getElementById("guess-counter-divider");
	
	if (!remainingCountElement) return;

	const remaining = MAX_INCORRECT_GUESSES - gameState.incorrectGuesses.length;
	remainingCountElement.textContent = remaining;
	
	// Hide guess counter and divider when game is over
	if (gameState.status === "WON" || gameState.status === "LOST") {
		if (guessCounterElement) guessCounterElement.style.display = "none";
		if (dividerElement) dividerElement.style.display = "none";
	} else {
		if (guessCounterElement) guessCounterElement.style.display = "block";
		if (dividerElement) dividerElement.style.display = "block";
	}

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
	const showResultsButton = document.getElementById("show-results-button");

	// Hide both modals by default and show results button for finished games
	const isGameFinished =
		gameState.status === "WON" || gameState.status === "LOST";

	// Check if modals should be shown (not manually closed)
	const modalWasClosed =
		localStorage.getItem(`chromacross-modal-closed-${gameState.puzzleId}`) ===
		"true";

	winModal.classList.add("hidden");
	winModal.classList.remove("flex");
	lossModal.classList.add("hidden");
	lossModal.classList.remove("flex");

	if (showResultsButton) {
		if (isGameFinished && modalWasClosed) {
			showResultsButton.classList.remove("hidden");
		} else {
			showResultsButton.classList.add("hidden");
		}
	}

	if (gameState.status === "WON") {
		// Update win stats
		const winStats = document.getElementById("win-stats");
		const totalGuesses =
			gameState.revealedLetters.length + gameState.incorrectGuesses.length;
		const incorrectCount = gameState.incorrectGuesses.length;

		winStats.innerHTML = `
			<p><strong>Solved in ${totalGuesses} guesses!</strong></p>
			<p>${incorrectCount} incorrect guess${incorrectCount !== 1 ? "es" : ""}</p>
		`;

		// Show modal if not manually closed
		if (!modalWasClosed) {
			winModal.classList.remove("hidden");
			winModal.classList.add("flex");
		}
	} else if (gameState.status === "LOST") {
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

		// Show modal if not manually closed
		if (!modalWasClosed) {
			lossModal.classList.remove("hidden");
			lossModal.classList.add("flex");
		}
	}
}

export function closeModal(gameState) {
	const winModal = document.getElementById("win-message");
	const lossModal = document.getElementById("loss-message");

	winModal.classList.add("hidden");
	winModal.classList.remove("flex");
	lossModal.classList.add("hidden");
	lossModal.classList.remove("flex");

	// Remember that the modal was closed for this puzzle
	localStorage.setItem(
		`chromacross-modal-closed-${gameState.puzzleId}`,
		"true",
	);
}

export function showResultsModal(puzzle, gameState) {
	// Clear the closed state and show the appropriate modal
	localStorage.removeItem(`chromacross-modal-closed-${gameState.puzzleId}`);
	renderGameStatus(puzzle, gameState);
}

export function render(puzzle, gameState) {
	renderGrid(puzzle, gameState);
	renderPalette(puzzle, gameState);
	renderKeyboard(gameState);
	renderGuessCounter(gameState);
	renderGameStatus(puzzle, gameState);
}

// Analytics tracking
function sendAnalytics(gameState, puzzle, outcome) {
	try {
		const analyticsData = {
			puzzleId: puzzle.puzzleId,
			outcome: outcome,
			totalGuesses: gameState.guessSequence.length,
			incorrectGuesses: gameState.incorrectGuesses.length,
			guessSequence: gameState.guessSequence,
			timestamp: Date.now()
		};

		// Send to analytics endpoint (fire and forget)
		fetch('/api/analytics', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(analyticsData)
		}).catch(() => {
			// Silently fail - analytics shouldn't break the game
		});

	} catch (error) {
		// Silently fail - analytics shouldn't break the game
	}
}
