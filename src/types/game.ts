// Shared type definitions for ChromaCross game

export interface GameState {
	puzzleId: number;
	revealedLetters: string[];
	incorrectGuesses: string[];
	status: 'IN_PROGRESS' | 'WON' | 'LOST';
}

export interface GuessResult {
	gameState: GameState;
	shouldShake: boolean;
}