import {
	handleGuess,
	saveState,
	loadState,
	render,
	shakeElement,
	closeModal,
	showResultsModal,
} from "./gameLogic.js";
import { addShareEventListeners } from "./shareUtils.js";
import { initializeHowToPlayModal } from "./howToPlayModal.js";

// Initialize the game client
export function initializeGameClient(puzzle, initialGameState) {
	let gameState = initialGameState;

	function initializeGame() {
		// Try to load saved state for this puzzle
		const savedState = loadState(puzzle.puzzleId);
		if (savedState) {
			gameState = savedState;
			// Re-render with saved state
			render(puzzle, gameState);
		}

		// Set up event listeners
		addEventListeners();
		addShareEventListeners(puzzle, gameState);
		
		// Initialize how-to-play modal
		initializeHowToPlayModal();
	}

	function addEventListeners() {
		// Event delegation for keyboard clicks
		const keyboardContainer = document.getElementById("keyboard-container");
		if (keyboardContainer) {
			keyboardContainer.addEventListener("click", (event) => {
				const target = event.target;
				if (target.classList.contains("key")) {
					const letter = target.dataset.letter;
					if (letter) {
						handleGuessWrapper(letter);
					}
				}
			});
		}

		// Physical keyboard support
		document.addEventListener("keydown", (event) => {
			const letter = event.key.toUpperCase();
			if (letter.match(/[A-Z]/)) {
				handleGuessWrapper(letter);
			}
		});

		// Modal close buttons
		const closeWinModal = document.getElementById("close-win-modal");
		const closeLossModal = document.getElementById("close-loss-modal");
		const showResultsButton = document.getElementById("show-results-button");

		if (closeWinModal) {
			closeWinModal.addEventListener("click", () => {
				closeModal(gameState);
				render(puzzle, gameState);
			});
		}

		if (closeLossModal) {
			closeLossModal.addEventListener("click", () => {
				closeModal(gameState);
				render(puzzle, gameState);
			});
		}

		if (showResultsButton) {
			showResultsButton.addEventListener("click", () => {
				showResultsModal(puzzle, gameState);
			});
		}
	}

	function handleGuessWrapper(letter) {
		const result = handleGuess(letter, puzzle, gameState);

		if (result.shouldShake) {
			shakeElement(document.querySelector(`[data-letter="${letter}"]`));
			return;
		}

		// Update game state
		gameState = result.gameState;

		// Save state after every valid move
		saveState(gameState);

		// Re-render the UI
		render(puzzle, gameState);

		// Update share event listeners with new game state
		addShareEventListeners(puzzle, gameState);
	}

	// Initialize when DOM is ready
	if (document.readyState === "loading") {
		document.addEventListener("DOMContentLoaded", initializeGame);
	} else {
		initializeGame();
	}
}
