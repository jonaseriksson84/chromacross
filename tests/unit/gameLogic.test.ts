import { describe, it, expect, beforeEach } from 'vitest';

// Note: We're testing the pure logic functions, not the DOM manipulation or localStorage parts
// Import the actual functions from gameLogic.js for testing
import { handleGuess, checkGameStatus, MAX_INCORRECT_GUESSES } from '../../src/scripts/gameLogic.js';
import type { Puzzle } from '../../src/utils/simplePuzzleGenerator.ts';
import type { GameState } from '../../src/types/game.ts';

describe('Game Logic', () => {
  let mockPuzzle: Puzzle;
  let initialGameState: GameState;

  beforeEach(() => {
    // Create a mock puzzle for testing
    mockPuzzle = {
      puzzleId: 12345,
      date: "2025-06-18",
      words: {
        horizontal: "WATER",
        vertical: "TOWER"
      },
      intersection: {
        letter: "E",
        horizontalIndex: 3,
        verticalIndex: 4
      },
      uniqueLetters: ["A", "E", "O", "R", "T", "W"], // 6 unique letters
      colorMap: {
        "W": "#FF6B6B",
        "A": "#4ECDC4",
        "T": "#45B7D1",
        "E": "#96CEB4",
        "R": "#FECA57",
        "O": "#FF9FF3"
      }
    };

    initialGameState = {
      puzzleId: 12345,
      revealedLetters: [],
      incorrectGuesses: [],
      status: "IN_PROGRESS"
    };
  });

  describe('handleGuess', () => {
    it('should add correct letter to revealed letters', () => {
      const result = handleGuess('W', mockPuzzle, initialGameState);
      
      expect(result.shouldShake).toBe(false);
      expect(result.gameState.revealedLetters).toContain('W');
      expect(result.gameState.incorrectGuesses).not.toContain('W');
      expect(result.gameState.status).toBe('IN_PROGRESS');
    });

    it('should add incorrect letter to incorrect guesses', () => {
      const result = handleGuess('X', mockPuzzle, initialGameState);
      
      expect(result.shouldShake).toBe(false);
      expect(result.gameState.incorrectGuesses).toContain('X');
      expect(result.gameState.revealedLetters).not.toContain('X');
      expect(result.gameState.status).toBe('IN_PROGRESS');
    });

    it('should not mutate original game state', () => {
      const originalState = { ...initialGameState };
      const result = handleGuess('W', mockPuzzle, initialGameState);
      
      expect(initialGameState).toEqual(originalState);
      expect(result.gameState).not.toBe(initialGameState);
    });

    it('should shake on duplicate guess (already revealed)', () => {
      const stateWithRevealed = {
        ...initialGameState,
        revealedLetters: ['W']
      };
      
      const result = handleGuess('W', mockPuzzle, stateWithRevealed);
      
      expect(result.shouldShake).toBe(true);
      expect(result.gameState).toBe(stateWithRevealed); // Should return same state
    });

    it('should shake on duplicate guess (already incorrect)', () => {
      const stateWithIncorrect = {
        ...initialGameState,
        incorrectGuesses: ['X']
      };
      
      const result = handleGuess('X', mockPuzzle, stateWithIncorrect);
      
      expect(result.shouldShake).toBe(true);
      expect(result.gameState).toBe(stateWithIncorrect); // Should return same state
    });

    it('should ignore invalid letters', () => {
      const testCases = ['', '1', 'x', ' ', '!'];
      
      for (const letter of testCases) {
        const result = handleGuess(letter, mockPuzzle, initialGameState);
        expect(result.shouldShake).toBe(false);
        expect(result.gameState).toBe(initialGameState);
      }
    });

    it('should ignore multi-character strings', () => {
      // The regex /^[A-Z]$/ only matches single uppercase letters
      // So "AB" should be ignored, not processed as a guess
      const result = handleGuess('AB', mockPuzzle, initialGameState);
      
      expect(result.shouldShake).toBe(false);
      expect(result.gameState).toBe(initialGameState); // Should be unchanged
    });

    it('should not accept guesses when game is won', () => {
      const wonState = {
        ...initialGameState,
        status: 'WON'
      };
      
      const result = handleGuess('W', mockPuzzle, wonState);
      
      expect(result.shouldShake).toBe(false);
      expect(result.gameState).toBe(wonState);
    });

    it('should not accept guesses when game is lost', () => {
      const lostState = {
        ...initialGameState,
        status: 'LOST'
      };
      
      const result = handleGuess('W', mockPuzzle, lostState);
      
      expect(result.shouldShake).toBe(false);
      expect(result.gameState).toBe(lostState);
    });

    it('should trigger win when all letters are revealed', () => {
      const almostWonState = {
        ...initialGameState,
        revealedLetters: ['W', 'A', 'T', 'E', 'R'] // Missing 'O'
      };
      
      const result = handleGuess('O', mockPuzzle, almostWonState);
      
      expect(result.gameState.status).toBe('WON');
      expect(result.gameState.revealedLetters).toHaveLength(6);
    });

    it('should trigger loss when max incorrect guesses reached', () => {
      const almostLostState = {
        ...initialGameState,
        incorrectGuesses: ['B', 'C', 'D', 'F', 'G', 'I', 'J'] // 7 incorrect guesses
      };
      
      const result = handleGuess('H', mockPuzzle, almostLostState);
      
      expect(result.gameState.status).toBe('LOST');
      expect(result.gameState.incorrectGuesses).toHaveLength(8);
    });
  });

  describe('checkGameStatus', () => {
    it('should detect win condition when all letters revealed', () => {
      const gameState = {
        ...initialGameState,
        revealedLetters: ['W', 'A', 'T', 'E', 'R', 'O']
      };
      
      checkGameStatus(gameState, mockPuzzle);
      
      expect(gameState.status).toBe('WON');
    });

    it('should detect loss condition when max incorrect guesses reached', () => {
      const gameState = {
        ...initialGameState,
        incorrectGuesses: ['B', 'C', 'D', 'F', 'G', 'H', 'I', 'J'] // 8 incorrect guesses
      };
      
      checkGameStatus(gameState, mockPuzzle);
      
      expect(gameState.status).toBe('LOST');
    });

    it('should not change status when game is still in progress', () => {
      const gameState = {
        ...initialGameState,
        revealedLetters: ['W', 'A'],
        incorrectGuesses: ['B', 'C']
      };
      
      checkGameStatus(gameState, mockPuzzle);
      
      expect(gameState.status).toBe('IN_PROGRESS');
    });

    it('should prioritize win over loss (edge case)', () => {
      // This shouldn't happen in normal gameplay, but test the edge case
      const gameState = {
        ...initialGameState,
        revealedLetters: ['W', 'A', 'T', 'E', 'R', 'O'], // All letters
        incorrectGuesses: ['B', 'C', 'D', 'F', 'G', 'H'] // Max incorrect
      };
      
      checkGameStatus(gameState, mockPuzzle);
      
      expect(gameState.status).toBe('WON'); // Win should be checked first
    });
  });

  describe('game flow integration', () => {
    it('should handle a complete winning game', () => {
      let currentState = { ...initialGameState };
      
      // Guess all correct letters
      const correctLetters = ['W', 'A', 'T', 'E', 'R', 'O'];
      
      for (const letter of correctLetters) {
        const result = handleGuess(letter, mockPuzzle, currentState);
        currentState = result.gameState;
        expect(result.shouldShake).toBe(false);
      }
      
      expect(currentState.status).toBe('WON');
      expect(currentState.revealedLetters).toHaveLength(6);
      expect(currentState.incorrectGuesses).toHaveLength(0);
    });

    it('should handle a complete losing game', () => {
      let currentState = { ...initialGameState };
      
      // Guess 8 incorrect letters
      const incorrectLetters = ['B', 'C', 'D', 'F', 'G', 'H', 'I', 'J'];
      
      for (const letter of incorrectLetters) {
        const result = handleGuess(letter, mockPuzzle, currentState);
        currentState = result.gameState;
        expect(result.shouldShake).toBe(false);
      }
      
      expect(currentState.status).toBe('LOST');
      expect(currentState.incorrectGuesses).toHaveLength(8);
    });

    it('should handle mixed correct and incorrect guesses', () => {
      let currentState = { ...initialGameState };
      
      // Mix of correct and incorrect guesses
      const guesses = ['W', 'X', 'A', 'Y', 'T', 'Z'];
      
      for (const letter of guesses) {
        const result = handleGuess(letter, mockPuzzle, currentState);
        currentState = result.gameState;
      }
      
      expect(currentState.revealedLetters).toEqual(['W', 'A', 'T']);
      expect(currentState.incorrectGuesses).toEqual(['X', 'Y', 'Z']);
      expect(currentState.status).toBe('IN_PROGRESS');
    });

    it('should maintain immutability throughout game flow', () => {
      let currentState = { ...initialGameState };
      const stateHistory = [currentState];
      
      const guesses = ['W', 'X', 'A'];
      
      for (const letter of guesses) {
        const result = handleGuess(letter, mockPuzzle, currentState);
        currentState = result.gameState;
        stateHistory.push(currentState);
      }
      
      // Check that all states in history are different objects
      for (let i = 0; i < stateHistory.length - 1; i++) {
        expect(stateHistory[i]).not.toBe(stateHistory[i + 1]);
      }
      
      // Original state should be unchanged
      expect(stateHistory[0]).toEqual(initialGameState);
    });
  });

  describe('edge cases', () => {
    it('should handle puzzle with single unique letter', () => {
      const singleLetterPuzzle = {
        ...mockPuzzle,
        uniqueLetters: ['A']
      };
      
      const result = handleGuess('A', singleLetterPuzzle, initialGameState);
      
      expect(result.gameState.status).toBe('WON');
    });

    it('should handle empty puzzle gracefully', () => {
      const emptyPuzzle = {
        ...mockPuzzle,
        uniqueLetters: []
      };
      
      const result = handleGuess('A', emptyPuzzle, initialGameState);
      
      expect(result.gameState.status).toBe('WON'); // 0 letters revealed = all letters
    });

    it('should handle case sensitivity correctly', () => {
      // The function should only accept uppercase letters
      const result = handleGuess('w', mockPuzzle, initialGameState);
      
      expect(result.shouldShake).toBe(false);
      expect(result.gameState).toBe(initialGameState); // No change
    });

    it('should ignore special keys and modifier keys', () => {
      // Test common special keys that users might press
      const specialKeys = [
        'Shift', 'Alt', 'Control', 'Meta', 'Tab', 'Escape', 'Enter',
        'Backspace', 'Delete', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight',
        'F1', 'F2', 'F3', 'CapsLock', 'NumLock', 'ScrollLock'
      ];
      
      for (const key of specialKeys) {
        const result = handleGuess(key, mockPuzzle, initialGameState);
        expect(result.shouldShake).toBe(false);
        expect(result.gameState).toBe(initialGameState); // Should be unchanged
      }
    });

    it('should ignore numbers and symbols', () => {
      // Test numbers and common symbols
      const invalidChars = ['0', '1', '2', '9', '!', '@', '#', '$', '%', '^', '&', '*', '(', ')', '-', '+', '=', '[', ']', '{', '}', '|', '\\', ':', ';', '"', "'", '<', '>', ',', '.', '?', '/'];
      
      for (const char of invalidChars) {
        const result = handleGuess(char, mockPuzzle, initialGameState);
        expect(result.shouldShake).toBe(false);
        expect(result.gameState).toBe(initialGameState); // Should be unchanged
      }
    });
  });
});