import type { APIRoute } from 'astro';
import fs from 'fs';
import path from 'path';

// Seeded random generator (same as in today.ts)
class SeededRandom {
  private seed: number;
  constructor(seed: number) { this.seed = seed; }
  next(): number {
    this.seed = (this.seed * 9301 + 49297) % 233280;
    return this.seed / 233280;
  }
  nextInt(max: number): number { return Math.floor(this.next() * max); }
}

// Load word list (same as in today.ts)
let WORD_LIST: string[] = [];
try {
  const wordListPath = path.join(process.cwd(), 'data/wordlists/words.txt');
  WORD_LIST = fs.readFileSync(wordListPath, 'utf-8')
    .trim()
    .split('\n')
    .map(word => word.toLowerCase().trim());
} catch (error) {
  console.error('Failed to load word list:', error);
  WORD_LIST = ['about', 'water', 'board', 'round', 'table', 'house', 'plant', 'light', 'great', 'world'];
}

// Find intersections (same logic as today.ts)
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
  
  if (uniqueLetters.length < 7) return false;
  
  const checkWords = wordList.slice(0, 200);
  
  for (const wordA of checkWords) {
    if (wordA === intersection.word1) continue;
    if (wordA[intersection.word1_pos] !== intersection.letter) continue;
    
    for (const wordB of checkWords) {
      if (wordB === intersection.word2) continue;
      if (wordB[intersection.word2_pos] !== intersection.letter) continue;
      
      const altUniqueLetters = getUniqueLetters(wordA, wordB);
      if (setsAreEqual(uniqueLetters, altUniqueLetters)) {
        return false;
      }
    }
  }
  return true;
}

function generatePuzzle(date: string) {
  const epochDate = new Date(date).getTime() / (1000 * 60 * 60 * 24);
  const daysSinceEpoch = Math.floor(epochDate);
  const rng = new SeededRandom(daysSinceEpoch * 2654435761);
  
  const maxAttempts = 500;
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const word1 = WORD_LIST[rng.nextInt(WORD_LIST.length)];
    const intersections = findIntersections(word1, WORD_LIST);
    
    if (intersections.length === 0) continue;
    
    const intersection = intersections[rng.nextInt(intersections.length)];
    
    if (validateUniqueness(intersection, WORD_LIST)) {
      const uniqueLetters = getUniqueLetters(intersection.word1, intersection.word2);
      
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
        colorMap,
        debug: {
          attempt: attempt + 1,
          daysSinceEpoch,
          seed: daysSinceEpoch * 2654435761,
          isMiddleIntersection: (intersection.word1_pos >= 1 && intersection.word1_pos <= 3) && 
                              (intersection.word2_pos >= 1 && intersection.word2_pos <= 3)
        }
      };
    }
  }
  
  // Fallback
  return {
    puzzleId: daysSinceEpoch,
    date,
    words: { horizontal: "ABOUT", vertical: "BOARD" },
    intersection: { letter: "B", horizontalIndex: 1, verticalIndex: 0 },
    uniqueLetters: ["A", "B", "D", "O", "R", "T", "U"],
    colorMap: {
      A: "#FF6B6B", B: "#4ECDC4", D: "#45B7D1", O: "#96CEB4",
      R: "#FECA57", T: "#FF9FF3", U: "#54A0FF"
    },
    debug: {
      attempt: "FALLBACK",
      daysSinceEpoch,
      seed: daysSinceEpoch * 2654435761,
      isMiddleIntersection: true
    }
  };
}

export const GET: APIRoute = async ({ params }) => {
  const { date } = params;
  
  // Validate date format (YYYY-MM-DD)
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return new Response(JSON.stringify({
      error: "Invalid date format. Use YYYY-MM-DD (e.g., 2025-08-20)"
    }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  // Validate date is reasonable
  const inputDate = new Date(date);
  const today = new Date();
  const oneYearFromNow = new Date();
  oneYearFromNow.setFullYear(today.getFullYear() + 1);
  
  if (isNaN(inputDate.getTime())) {
    return new Response(JSON.stringify({
      error: "Invalid date"
    }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  if (inputDate > oneYearFromNow) {
    return new Response(JSON.stringify({
      error: "Date too far in future (max 1 year from now)"
    }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  try {
    const puzzle = generatePuzzle(date);
    
    return new Response(JSON.stringify(puzzle, null, 2), {
      status: 200,
      headers: { 
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=86400' // Cache for 24 hours
      }
    });
  } catch (error) {
    return new Response(JSON.stringify({
      error: "Failed to generate puzzle",
      details: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};