// Seeded random generator
class SeededRandom {
  private seed: number;
  constructor(seed: number) { this.seed = seed; }
  next(): number {
    this.seed = (this.seed * 9301 + 49297) % 233280;
    return this.seed / 233280;
  }
  nextInt(max: number): number { return Math.floor(this.next() * max); }
}

import fs from 'fs';
import path from 'path';

// Load word list from file
let WORD_LIST: string[] = [];
try {
  const wordListPath = path.join(process.cwd(), 'data/wordlists/words.txt');
  WORD_LIST = fs.readFileSync(wordListPath, 'utf-8')
    .trim()
    .split('\n')
    .map(word => word.toLowerCase().trim());
  console.log(`Loaded ${WORD_LIST.length} words for puzzles`);
} catch (error) {
  console.error('Failed to load word list:', error);
  // Fallback word list
  WORD_LIST = ['about', 'water', 'board', 'round', 'table', 'house', 'plant', 'light', 'great', 'world'];
}

// Find intersections for a word (prioritize middle positions for better visual appeal)
function findIntersections(word1, wordList, preferMiddle = true) {
  const intersections = [];
  const middleIntersections = [];
  
  for (let pos1 = 0; pos1 < 5; pos1++) {
    const letter = word1[pos1];
    for (const word2 of wordList) {
      if (word2 === word1) continue;
      for (let pos2 = 0; pos2 < 5; pos2++) {
        if (word2[pos2] === letter) {
          const intersection = {
            word1, word2, letter, word1_pos: pos1, word2_pos: pos2
          };
          
          // Separate middle intersections (positions 1, 2, 3 for both words)
          const isMiddle1 = pos1 >= 1 && pos1 <= 3;
          const isMiddle2 = pos2 >= 1 && pos2 <= 3;
          
          if (preferMiddle && isMiddle1 && isMiddle2) {
            middleIntersections.push(intersection);
          } else {
            intersections.push(intersection);
          }
        }
      }
    }
  }
  
  // Return middle intersections first if we have them, otherwise all intersections
  return middleIntersections.length > 0 ? middleIntersections : intersections;
}

// Get unique letters from two words
function getUniqueLetters(word1, word2) {
  return Array.from(new Set([...word1, ...word2])).sort();
}

// Check if sets are equal
function setsAreEqual(set1, set2) {
  if (set1.length !== set2.length) return false;
  return set1.every((letter, index) => letter === set2[index]);
}

// Validate puzzle uniqueness (simplified for performance)
function validateUniqueness(intersection, wordList) {
  const uniqueLetters = getUniqueLetters(intersection.word1, intersection.word2);
  
  // Quick check: if letter set is very common, likely to have collisions
  if (uniqueLetters.length < 7) return false; // Want at least 7 unique letters
  
  // For performance, only check a subset of potential collisions
  const checkWords = wordList.slice(0, 200); // Check first 200 words only
  
  for (const wordA of checkWords) {
    if (wordA === intersection.word1) continue;
    if (wordA[intersection.word1_pos] !== intersection.letter) continue;
    
    for (const wordB of checkWords) {
      if (wordB === intersection.word2) continue;
      if (wordB[intersection.word2_pos] !== intersection.letter) continue;
      
      const altUniqueLetters = getUniqueLetters(wordA, wordB);
      if (setsAreEqual(uniqueLetters, altUniqueLetters)) {
        return false; // Found collision
      }
    }
  }
  return true;
}

function generatePuzzle(date: string) {
  const epochDate = new Date(date).getTime() / (1000 * 60 * 60 * 24);
  const daysSinceEpoch = Math.floor(epochDate);
  const rng = new SeededRandom(daysSinceEpoch * 2654435761);
  
  console.log(`Generating puzzle for ${date}, day ${daysSinceEpoch}`);
  
  // Try to generate a valid puzzle
  const maxAttempts = 500; // Limit attempts for performance
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    // Select random word
    const word1 = WORD_LIST[rng.nextInt(WORD_LIST.length)];
    
    // Find intersections
    const intersections = findIntersections(word1, WORD_LIST);
    if (intersections.length === 0) continue;
    
    // Select random intersection
    const intersection = intersections[rng.nextInt(intersections.length)];
    
    // Validate uniqueness (simplified)
    if (validateUniqueness(intersection, WORD_LIST)) {
      console.log(`Found valid puzzle after ${attempt + 1} attempts: ${intersection.word1.toUpperCase()} / ${intersection.word2.toUpperCase()}`);
      
      const uniqueLetters = getUniqueLetters(intersection.word1, intersection.word2);
      
      // Generate colors
      const colors = ["#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", "#FECA57", "#FF9FF3", "#54A0FF", "#5F27CD", "#00D2D3", "#FF9F43"];
      const shuffledLetters = [...uniqueLetters];
      for (let i = shuffledLetters.length - 1; i > 0; i--) {
        const j = rng.nextInt(i + 1);
        [shuffledLetters[i], shuffledLetters[j]] = [shuffledLetters[j], shuffledLetters[i]];
      }
      
      const colorMap: Record<string, string> = {};
      for (let i = 0; i < shuffledLetters.length; i++) {
        colorMap[shuffledLetters[i].toUpperCase()] = colors[i % colors.length];
      }
      
      return {
        puzzleId: daysSinceEpoch,
        date,
        words: { 
          horizontal: intersection.word1.toUpperCase(), 
          vertical: intersection.word2.toUpperCase() 
        },
        intersection: { 
          letter: intersection.letter.toUpperCase(), 
          horizontalIndex: intersection.word1_pos, 
          verticalIndex: intersection.word2_pos 
        },
        uniqueLetters: uniqueLetters.map(l => l.toUpperCase()),
        colorMap
      };
    }
  }
  
  // Fallback if generation fails
  console.warn(`Failed to generate puzzle after ${maxAttempts} attempts, using fallback`);
  return {
    puzzleId: daysSinceEpoch,
    date,
    words: { horizontal: "ABOUT", vertical: "BOARD" },
    intersection: { letter: "B", horizontalIndex: 1, verticalIndex: 0 },
    uniqueLetters: ["A", "B", "D", "O", "R", "T", "U"],
    colorMap: {
      A: "#FF6B6B", B: "#4ECDC4", D: "#45B7D1", O: "#96CEB4",
      R: "#FECA57", T: "#FF9FF3", U: "#54A0FF"
    }
  };
}

// Cache
let cachedPuzzle: any = null;
let cachedDate: string = '';

export async function GET() {
  const today = new Date().toISOString().split('T')[0];
  
  if (cachedPuzzle && cachedDate === today) {
    return new Response(JSON.stringify(cachedPuzzle), {
      status: 200,
      headers: { 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=3600' }
    });
  }
  
  const puzzle = generatePuzzle(today);
  cachedPuzzle = puzzle;
  cachedDate = today;
  
  console.log('Generated puzzle:', puzzle.words.horizontal, '/', puzzle.words.vertical);
  
  return new Response(JSON.stringify(puzzle), {
    status: 200,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=3600' }
  });
}