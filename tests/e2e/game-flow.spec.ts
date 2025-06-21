import { test, expect } from "@playwright/test";

test.describe("ChromaCross Game Flow", () => {
	test("user can complete a winning game", async ({ page }) => {
		await page.goto("/");

		// Dismiss how-to-play modal if present
		const howToPlayModal = page.locator("#how-to-play-modal");
		if (await howToPlayModal.isVisible()) {
			await page.click("#got-it-button");
			await expect(howToPlayModal).toBeHidden();
		}

		// Get today's puzzle letters from the global puzzle object
		const puzzleData = await page.evaluate(() => {
			// @ts-ignore - accessing global variable set by the game
			return window.puzzle;
		});

		console.log("Puzzle data:", puzzleData);

		// Verify we have puzzle data
		expect(puzzleData).toBeDefined();
		expect(puzzleData.uniqueLetters).toBeDefined();
		expect(puzzleData.uniqueLetters.length).toBeGreaterThan(0);

		// Make correct guesses for all unique letters
		for (const letter of puzzleData.uniqueLetters) {
			console.log(`Guessing letter: ${letter}`);
			await page.keyboard.press(letter);

			// Verify the letter appears in the keyboard as correct (green)
			const keyElement = page.locator(`[data-letter="${letter}"]`);
			await expect(keyElement).toHaveClass(/bg-green-500/);
		}

		// Verify win modal appears
		const winModal = page.locator("#win-message");
		await expect(winModal).toBeVisible();

		// Verify win message content
		await expect(page.locator("#win-message h2")).toContainText(
			"Congratulations",
		);

		console.log("Game completed successfully!");
	});

	test("game state persists across page refresh", async ({ page }) => {
		await page.goto("/");

		// Dismiss how-to-play modal if present
		const howToPlayModal = page.locator("#how-to-play-modal");
		if (await howToPlayModal.isVisible()) {
			await page.click("#got-it-button");
			await expect(howToPlayModal).toBeHidden();
		}

		// Get puzzle data to know valid/invalid letters
		const puzzleData = await page.evaluate(() => {
			// @ts-ignore - accessing global variable set by the game
			return window.puzzle;
		});

		// Make some guesses - one correct, one incorrect
		const correctLetter = puzzleData.uniqueLetters[0]; // First letter from puzzle
		// Find a letter that's definitely not in the puzzle
		const incorrectLetter = "QWXY".split("").find(letter => !puzzleData.uniqueLetters.includes(letter)) || "Q";

		console.log(`Making correct guess: ${correctLetter}`);
		await page.keyboard.press(correctLetter);

		console.log(`Making incorrect guess: ${incorrectLetter}`);
		await page.keyboard.press(incorrectLetter);

		// Verify initial state before refresh
		const correctKey = page.locator(`[data-letter="${correctLetter}"]`);
		const incorrectKey = page.locator(`[data-letter="${incorrectLetter}"]`);

		await expect(correctKey).toHaveClass(/bg-green-500/);
		await expect(incorrectKey).toHaveClass(/bg-gray-500/);

		// Check that letters appear in the grid
		const gridCells = page.locator(
			'#grid-container [style*="background-color"]',
		);
		const visibleCells = await gridCells.count();
		expect(visibleCells).toBeGreaterThan(0);

		console.log("State before refresh verified. Refreshing page...");

		// Refresh the page
		await page.reload();

		// Wait for game to reinitialize
		// @ts-ignore - accessing global variable set by the game
		await page.waitForFunction(() => window.puzzle !== undefined);

		console.log("Page refreshed. Verifying state persistence...");

		// Verify state is restored after refresh
		const correctKeyAfterRefresh = page.locator(
			`[data-letter="${correctLetter}"]`,
		);
		const incorrectKeyAfterRefresh = page.locator(
			`[data-letter="${incorrectLetter}"]`,
		);

		// Verify keyboard states are restored
		await expect(correctKeyAfterRefresh).toHaveClass(/bg-green-500/);
		await expect(incorrectKeyAfterRefresh).toHaveClass(/bg-gray-500/);

		// Verify letters still appear in the grid
		const gridCellsAfterRefresh = page.locator(
			'#grid-container [style*="background-color"]',
		);
		const visibleCellsAfterRefresh = await gridCellsAfterRefresh.count();
		expect(visibleCellsAfterRefresh).toBeGreaterThan(0);

		// Verify guess counter reflects the incorrect guess
		const remainingGuesses = await page
			.locator("#remaining-count")
			.textContent();
		expect(Number.parseInt(remainingGuesses || "8")).toBe(7); // Started with 8, made 1 incorrect

		console.log("Game state persistence verified successfully!");
	});

	test("special keys do not count as guesses", async ({ page }) => {
		await page.goto("/");

		// Dismiss how-to-play modal if present
		const howToPlayModal = page.locator("#how-to-play-modal");
		if (await howToPlayModal.isVisible()) {
			await page.click("#got-it-button");
			await expect(howToPlayModal).toBeHidden();
		}

		// Get initial guess count
		const initialRemainingGuesses = await page
			.locator("#remaining-count")
			.textContent();
		const initialCount = Number.parseInt(initialRemainingGuesses || "8");

		console.log(`Initial remaining guesses: ${initialCount}`);

		// Test various special keys that should NOT count as guesses
		const specialKeys = [
			"Shift",
			"Alt",
			"Control",
			"Meta",
			"Tab",
			"Escape",
			"Enter",
			"Backspace",
			"Delete",
			"ArrowUp",
			"ArrowDown",
			"ArrowLeft",
			"ArrowRight",
			"F1",
			"F2",
			"CapsLock",
		];

		for (const key of specialKeys) {
			console.log(`Testing special key: ${key}`);
			await page.keyboard.press(key);

			// Verify guess count hasn't changed
			const currentRemainingGuesses = await page
				.locator("#remaining-count")
				.textContent();
			const currentCount = Number.parseInt(currentRemainingGuesses || "8");

			expect(currentCount).toBe(initialCount);
		}

		// Test numbers and symbols that should also be ignored
		const invalidChars = ["0", "1", "9", "!", "@", "#", "$", "%", "^", "&", "*"];

		for (const char of invalidChars) {
			console.log(`Testing invalid character: ${char}`);
			await page.keyboard.press(char);

			// Verify guess count hasn't changed
			const currentRemainingGuesses = await page
				.locator("#remaining-count")
				.textContent();
			const currentCount = Number.parseInt(currentRemainingGuesses || "8");

			expect(currentCount).toBe(initialCount);
		}

		// Get puzzle data to find an incorrect letter
		const puzzleData = await page.evaluate(() => {
			// @ts-ignore - accessing global variable set by the game
			return window.puzzle;
		});

		// Find a letter that's definitely not in the puzzle
		const incorrectLetter = "QWXY".split("").find(letter => !puzzleData.uniqueLetters.includes(letter)) || "Q";

		// Now make one actual incorrect guess to verify the counter does work
		console.log(`Making actual incorrect guess: ${incorrectLetter}`);
		await page.keyboard.press(incorrectLetter);

		// Verify guess count decreased by 1
		const finalRemainingGuesses = await page
			.locator("#remaining-count")
			.textContent();
		const finalCount = Number.parseInt(finalRemainingGuesses || "8");

		expect(finalCount).toBe(initialCount - 1);

		// Verify incorrect key shows as incorrect in keyboard
		const incorrectKey = page.locator(`[data-letter="${incorrectLetter}"]`);
		await expect(incorrectKey).toHaveClass(/!bg-gray-500/);

		console.log("Input validation test completed successfully!");
	});

	test("how-to-play modal behavior works correctly", async ({ page }) => {
		// Clear localStorage to simulate first-time user
		await page.goto("/");
		await page.evaluate(() => {
			localStorage.clear();
		});

		// Reload page to simulate fresh visit
		await page.reload();

		console.log("Testing first-time user experience...");

		// Modal should appear automatically for first-time users
		const howToPlayModal = page.locator("#how-to-play-modal");
		await expect(howToPlayModal).toBeVisible();

		// Verify modal content
		await expect(page.locator("#how-to-play-modal h2")).toContainText(
			"How to Play ChromaCross",
		);

		// Dismiss modal by clicking "Got it!" button
		await page.click("#got-it-button");
		await expect(howToPlayModal).toBeHidden();

		console.log("Modal dismissed. Testing persistence...");

		// Refresh page - modal should NOT appear again
		await page.reload();

		// Wait a moment for any potential modal to show
		await page.waitForTimeout(1000);

		// Modal should remain hidden
		await expect(howToPlayModal).toBeHidden();

		// Verify localStorage has the tutorial-seen flag
		const hasSeenTutorial = await page.evaluate(() => {
			return localStorage.getItem("chromacross-has-seen-tutorial") === "true";
		});
		expect(hasSeenTutorial).toBe(true);

		console.log("Testing manual modal trigger...");

		// User should still be able to manually open the modal
		const showModalButton = page.locator("#show-how-to-play");
		await showModalButton.click();

		// Modal should appear
		await expect(howToPlayModal).toBeVisible();

		// Close modal with X button
		await page.click("#close-how-to-play");
		await expect(howToPlayModal).toBeHidden();

		console.log("Modal behavior test completed successfully!");
	});
});
