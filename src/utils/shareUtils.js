// Letter to emoji mapping for share functionality
function createEmojiMap(puzzle, gameState) {
	// Green squares for all correctly guessed letters
	const emojiMap = {};
	const allPuzzleLetters = puzzle.uniqueLetters;

	// Map each letter to green (only revealed letters will be used)
	for (const letter of allPuzzleLetters) {
		emojiMap[letter] = "🟩"; // Green for all letters
	}

	console.log("Emoji mapping:", emojiMap);
	return emojiMap;
}

export function generateShareText(puzzle, gameState) {
	const title = `ChromaCross #${puzzle.puzzleId}`;
	const yellowSquare = "🟨"; // Emoji for unguessed letters on loss
	let summary = "";
	let gridText = "";

	const emojiMap = createEmojiMap(puzzle, gameState);
	const horizontalWord = puzzle.words.horizontal;
	const verticalWord = puzzle.words.vertical;
	const hIndex = puzzle.intersection.horizontalIndex;
	const vIndex = puzzle.intersection.verticalIndex;

	// Helper function to avoid repeating grid construction logic
	function buildGrid(getEmojiForLetter) {
		let text = "";
		const emptyCell = "⬛"; // Use black square for empty cells
		const gridWidth = horizontalWord.length;
		const gridHeight = verticalWord.length;

		// Build full grid row by row
		for (let row = 0; row < gridHeight; row++) {
			for (let col = 0; col < gridWidth; col++) {
				let letter = null;

				// Check if this cell is part of the horizontal word
				if (row === vIndex) {
					letter = horizontalWord[col];
					text += getEmojiForLetter(letter);
				}
				// Check if this cell is part of the vertical word
				else if (col === hIndex) {
					letter = verticalWord[row];
					text += getEmojiForLetter(letter);
				}
				// Empty cell
				else {
					text += emptyCell;
				}
			}
			text += "\n";
		}

		return text.trim();
	}

	// --- Main Logic Branch ---
	if (gameState.status === "WON") {
		const attempts =
			gameState.revealedLetters.length + gameState.incorrectGuesses.length;
		summary = `Solved in ${attempts} guesses (${gameState.incorrectGuesses.length} incorrect)`;

		// Build the grid with all colors
		gridText = buildGrid((letter) => emojiMap[letter]);
	} else if (gameState.status === "LOST") {
		summary = `Found ${gameState.revealedLetters.length}/${puzzle.uniqueLetters.length} letters`;
		const revealed = gameState.revealedLetters;

		// Build the grid, checking if each letter was revealed
		gridText = buildGrid((letter) =>
			revealed.includes(letter) ? emojiMap[letter] : yellowSquare,
		);
	}

	return `${title}\n${summary}\n${gridText}\n#ChromaCross`;
}

export async function handleShare(event, puzzle, gameState) {
	const button = event.target;
	const shareText = generateShareText(puzzle, gameState);

	try {
		await navigator.clipboard.writeText(shareText);

		// Provide user feedback
		const originalText = button.textContent;
		button.textContent = "Copied!";
		button.classList.remove("bg-blue-500");
		button.classList.add("bg-green-500");

		setTimeout(() => {
			button.textContent = originalText;
			button.classList.remove("bg-green-500");
			button.classList.add("bg-blue-500");
		}, 2000);
	} catch (error) {
		console.error("Failed to copy to clipboard:", error);
		// Fallback: show the text in an alert or prompt
		prompt("Copy this text to share your results:", shareText);
	}
}

// Store current game data for share functionality
let currentPuzzle = null;
let currentGameState = null;

// Single event handler function
function shareEventHandler(event) {
	if (currentPuzzle && currentGameState) {
		handleShare(event, currentPuzzle, currentGameState);
	}
}

export function addShareEventListeners(puzzle, gameState) {
	// Update current game data
	currentPuzzle = puzzle;
	currentGameState = gameState;

	const shareButtonWin = document.getElementById("share-button-win");
	const shareButtonLoss = document.getElementById("share-button-loss");

	// Only add listeners if they don't already exist
	if (shareButtonWin && !shareButtonWin.hasAttribute("data-listener-added")) {
		shareButtonWin.addEventListener("click", shareEventHandler);
		shareButtonWin.setAttribute("data-listener-added", "true");
	}
	if (shareButtonLoss && !shareButtonLoss.hasAttribute("data-listener-added")) {
		shareButtonLoss.addEventListener("click", shareEventHandler);
		shareButtonLoss.setAttribute("data-listener-added", "true");
	}
}
