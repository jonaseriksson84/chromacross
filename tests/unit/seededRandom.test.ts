import { describe, it, expect } from 'vitest';
import { SeededRandom } from '../../src/utils/simplePuzzleGenerator.ts';

describe('SeededRandom', () => {
  describe('constructor', () => {
    it('should initialize with provided seed', () => {
      const rng = new SeededRandom(12345);
      expect(rng).toBeInstanceOf(SeededRandom);
    });

    it('should handle different seed types', () => {
      const seeds = [0, 1, -1, 999999, 123.456];
      for (const seed of seeds) {
        expect(() => new SeededRandom(seed)).not.toThrow();
      }
    });
  });

  describe('next()', () => {
    it('should return values between 0 and 1', () => {
      const rng = new SeededRandom(12345);
      
      for (let i = 0; i < 100; i++) {
        const value = rng.next();
        expect(value).toBeGreaterThanOrEqual(0);
        expect(value).toBeLessThan(1);
      }
    });

    it('should produce deterministic sequences for same seed', () => {
      const rng1 = new SeededRandom(42);
      const rng2 = new SeededRandom(42);
      
      const sequence1 = [];
      const sequence2 = [];
      
      for (let i = 0; i < 20; i++) {
        sequence1.push(rng1.next());
        sequence2.push(rng2.next());
      }
      
      expect(sequence1).toEqual(sequence2);
    });

    it('should produce different sequences for different seeds', () => {
      const rng1 = new SeededRandom(123);
      const rng2 = new SeededRandom(456);
      
      const sequence1 = [];
      const sequence2 = [];
      
      for (let i = 0; i < 10; i++) {
        sequence1.push(rng1.next());
        sequence2.push(rng2.next());
      }
      
      expect(sequence1).not.toEqual(sequence2);
    });

    it('should not repeat for reasonable number of iterations', () => {
      const rng = new SeededRandom(12345);
      const values = new Set();
      
      for (let i = 0; i < 1000; i++) {
        values.add(rng.next());
      }
      
      // Should have generated many unique values (not exact due to floating point)
      expect(values.size).toBeGreaterThan(990);
    });

    it('should produce same sequence when reinitialized with same seed', () => {
      // This test verifies deterministic behavior without hardcoding specific values
      const seed = 12345;
      
      const rng1 = new SeededRandom(seed);
      const sequence1 = [rng1.next(), rng1.next(), rng1.next()];
      
      const rng2 = new SeededRandom(seed);
      const sequence2 = [rng2.next(), rng2.next(), rng2.next()];
      
      expect(sequence1).toEqual(sequence2);
    });
  });

  describe('nextInt()', () => {
    it('should return integers within specified range', () => {
      const rng = new SeededRandom(12345);
      
      for (let i = 0; i < 100; i++) {
        const value = rng.nextInt(10);
        expect(Number.isInteger(value)).toBe(true);
        expect(value).toBeGreaterThanOrEqual(0);
        expect(value).toBeLessThan(10);
      }
    });

    it('should handle different max values', () => {
      const rng = new SeededRandom(12345);
      const maxValues = [1, 5, 100, 1000];
      
      for (const max of maxValues) {
        for (let i = 0; i < 10; i++) {
          const value = rng.nextInt(max);
          expect(value).toBeGreaterThanOrEqual(0);
          expect(value).toBeLessThan(max);
        }
      }
    });

    it('should produce deterministic integer sequences', () => {
      const rng1 = new SeededRandom(42);
      const rng2 = new SeededRandom(42);
      
      const sequence1 = [];
      const sequence2 = [];
      
      for (let i = 0; i < 20; i++) {
        sequence1.push(rng1.nextInt(100));
        sequence2.push(rng2.nextInt(100));
      }
      
      expect(sequence1).toEqual(sequence2);
    });

    it('should distribute values reasonably across range', () => {
      const rng = new SeededRandom(12345);
      const counts = new Array(10).fill(0);
      const iterations = 10000;
      
      for (let i = 0; i < iterations; i++) {
        const value = rng.nextInt(10);
        counts[value]++;
      }
      
      // Each bucket should have roughly 1000 values (10% each)
      // Allow for reasonable variance
      for (const count of counts) {
        expect(count).toBeGreaterThan(800); // At least 8%
        expect(count).toBeLessThan(1200);   // At most 12%
      }
    });

    it('should handle edge cases', () => {
      const rng = new SeededRandom(12345);
      
      // Test max = 1 (should always return 0)
      for (let i = 0; i < 10; i++) {
        expect(rng.nextInt(1)).toBe(0);
      }
    });

    it('should work correctly after many next() calls', () => {
      const rng = new SeededRandom(12345);
      
      // Call next() many times to advance the state
      for (let i = 0; i < 1000; i++) {
        rng.next();
      }
      
      // nextInt should still work correctly
      for (let i = 0; i < 10; i++) {
        const value = rng.nextInt(50);
        expect(value).toBeGreaterThanOrEqual(0);
        expect(value).toBeLessThan(50);
      }
    });
  });

  describe('real-world usage patterns', () => {
    it('should work like puzzle generator uses it', () => {
      // Test the pattern used in generateDailyPuzzle
      const dateNum = 20250618; // From date parsing
      const rng = new SeededRandom(dateNum);
      
      // Simulate picking from a word list
      const wordListSize = 2875;
      const word1Index = rng.nextInt(wordListSize);
      const word2Index = rng.nextInt(wordListSize);
      
      expect(word1Index).toBeGreaterThanOrEqual(0);
      expect(word1Index).toBeLessThan(wordListSize);
      expect(word2Index).toBeGreaterThanOrEqual(0);
      expect(word2Index).toBeLessThan(wordListSize);
    });

    it('should be consistent across date-based seeds', () => {
      // Test date-based seed generation
      const dates = ['2025-06-18', '2025-06-19', '2025-06-20'];
      const results = [];
      
      for (const date of dates) {
        const dateNum = Number.parseInt(date.replace(/-/g, ''));
        const rng = new SeededRandom(dateNum);
        
        // Get first few values
        const values = [];
        for (let i = 0; i < 5; i++) {
          values.push(rng.nextInt(1000));
        }
        results.push(values);
      }
      
      // Each date should produce different results
      expect(results[0]).not.toEqual(results[1]);
      expect(results[1]).not.toEqual(results[2]);
      expect(results[0]).not.toEqual(results[2]);
    });
  });
});