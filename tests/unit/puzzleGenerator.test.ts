import { describe, it, expect, beforeAll } from 'vitest';
import { generateDailyPuzzle, type Puzzle } from '../../src/utils/simplePuzzleGenerator.ts';

describe('Puzzle Generator', () => {
  describe('generateDailyPuzzle', () => {
    it('should generate consistent puzzles for the same date', () => {
      const date = '2025-06-18';
      const puzzle1 = generateDailyPuzzle(date);
      const puzzle2 = generateDailyPuzzle(date);
      
      expect(puzzle1).toEqual(puzzle2);
      expect(puzzle1.puzzleId).toBe(puzzle2.puzzleId);
      expect(puzzle1.words).toEqual(puzzle2.words);
      expect(puzzle1.intersection).toEqual(puzzle2.intersection);
      expect(puzzle1.colorMap).toEqual(puzzle2.colorMap);
    });

    it('should generate different puzzles for different dates', () => {
      const puzzle1 = generateDailyPuzzle('2025-06-18');
      const puzzle2 = generateDailyPuzzle('2025-06-19');
      
      expect(puzzle1.puzzleId).not.toBe(puzzle2.puzzleId);
      // Words or intersection should be different (very high probability)
      const isDifferent = 
        puzzle1.words.horizontal !== puzzle2.words.horizontal ||
        puzzle1.words.vertical !== puzzle2.words.vertical ||
        puzzle1.intersection.letter !== puzzle2.intersection.letter;
      expect(isDifferent).toBe(true);
    });

    it('should generate valid puzzle structure', () => {
      const puzzle = generateDailyPuzzle('2025-06-18');
      
      // Basic structure validation
      expect(puzzle).toHaveProperty('puzzleId');
      expect(puzzle).toHaveProperty('date');
      expect(puzzle).toHaveProperty('words');
      expect(puzzle).toHaveProperty('intersection');
      expect(puzzle).toHaveProperty('uniqueLetters');
      expect(puzzle).toHaveProperty('colorMap');
      
      // Words structure
      expect(puzzle.words).toHaveProperty('horizontal');
      expect(puzzle.words).toHaveProperty('vertical');
      expect(typeof puzzle.words.horizontal).toBe('string');
      expect(typeof puzzle.words.vertical).toBe('string');
      
      // Intersection structure
      expect(puzzle.intersection).toHaveProperty('letter');
      expect(puzzle.intersection).toHaveProperty('horizontalIndex');
      expect(puzzle.intersection).toHaveProperty('verticalIndex');
      expect(typeof puzzle.intersection.letter).toBe('string');
      expect(typeof puzzle.intersection.horizontalIndex).toBe('number');
      expect(typeof puzzle.intersection.verticalIndex).toBe('number');
    });

    it('should have exactly 5-letter words (word list constraint)', () => {
      const puzzle = generateDailyPuzzle('2025-06-18');
      
      expect(puzzle.words.horizontal.length).toBe(5);
      expect(puzzle.words.vertical.length).toBe(5);
    });

    it('should have valid intersection coordinates', () => {
      const puzzle = generateDailyPuzzle('2025-06-18');
      
      const horizontal = puzzle.words.horizontal;
      const vertical = puzzle.words.vertical;
      const intersection = puzzle.intersection;
      
      // Intersection indices should be within word bounds
      expect(intersection.horizontalIndex).toBeGreaterThanOrEqual(0);
      expect(intersection.horizontalIndex).toBeLessThan(horizontal.length);
      expect(intersection.verticalIndex).toBeGreaterThanOrEqual(0);
      expect(intersection.verticalIndex).toBeLessThan(vertical.length);
      
      // The intersection letter should match both words at the specified positions
      expect(horizontal[intersection.horizontalIndex]).toBe(intersection.letter);
      expect(vertical[intersection.verticalIndex]).toBe(intersection.letter);
    });

    it('should have at least 6 unique letters for variety', () => {
      const puzzle = generateDailyPuzzle('2025-06-18');
      
      expect(puzzle.uniqueLetters.length).toBeGreaterThanOrEqual(6);
      
      // Verify uniqueLetters array contains actual unique letters
      const uniqueSet = new Set(puzzle.uniqueLetters);
      expect(uniqueSet.size).toBe(puzzle.uniqueLetters.length);
    });

    it('should have consistent uniqueLetters with actual words', () => {
      const puzzle = generateDailyPuzzle('2025-06-18');
      
      // Calculate expected unique letters from words
      const horizontal = puzzle.words.horizontal;
      const vertical = puzzle.words.vertical;
      const expectedLetters = Array.from(new Set([...horizontal, ...vertical])).sort();
      
      expect(puzzle.uniqueLetters.sort()).toEqual(expectedLetters.map(l => l.toUpperCase()));
    });

    it('should have color map with entry for each unique letter', () => {
      const puzzle = generateDailyPuzzle('2025-06-18');
      
      const colorMapKeys = Object.keys(puzzle.colorMap).sort();
      const uniqueLetters = puzzle.uniqueLetters.sort();
      
      expect(colorMapKeys).toEqual(uniqueLetters);
      
      // Each color should be a valid hex color
      for (const color of Object.values(puzzle.colorMap)) {
        expect(color).toMatch(/^#[0-9A-F]{6}$/i);
      }
    });

    it('should generate uppercase words and letters', () => {
      const puzzle = generateDailyPuzzle('2025-06-18');
      
      expect(puzzle.words.horizontal).toBe(puzzle.words.horizontal.toUpperCase());
      expect(puzzle.words.vertical).toBe(puzzle.words.vertical.toUpperCase());
      expect(puzzle.intersection.letter).toBe(puzzle.intersection.letter.toUpperCase());
      
      for (const letter of puzzle.uniqueLetters) {
        expect(letter).toBe(letter.toUpperCase());
      }
    });

    it('should have valid puzzle ID based on date', () => {
      const puzzle = generateDailyPuzzle('2025-06-18');
      
      expect(typeof puzzle.puzzleId).toBe('number');
      expect(puzzle.puzzleId).toBeGreaterThan(0);
      expect(puzzle.date).toBe('2025-06-18');
    });

    it('should handle edge case dates', () => {
      // Test various date formats
      const dates = [
        '2025-01-01', // New Year
        '2025-12-31', // End of year
        '2024-02-29', // Leap year
        '2025-02-28', // Non-leap year
      ];
      
      for (const date of dates) {
        expect(() => generateDailyPuzzle(date)).not.toThrow();
        const puzzle = generateDailyPuzzle(date);
        expect(puzzle.date).toBe(date);
      }
    });

    it('should generate puzzles with reasonable variety over multiple dates', () => {
      const dates = ['2025-06-18', '2025-06-19', '2025-06-20', '2025-06-21', '2025-06-22'];
      const puzzles = dates.map(date => generateDailyPuzzle(date));
      
      // Check that we get different horizontal words across dates
      const horizontalWords = new Set(puzzles.map(p => p.words.horizontal));
      expect(horizontalWords.size).toBeGreaterThan(1); // Should have some variety
      
      // Check that we get different vertical words across dates
      const verticalWords = new Set(puzzles.map(p => p.words.vertical));
      expect(verticalWords.size).toBeGreaterThan(1); // Should have some variety
    });
  });
});