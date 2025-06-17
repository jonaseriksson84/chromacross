import * as fs from 'node:fs';
import * as path from 'node:path';

// Type definitions
interface Intersection {
  word1: string;
  word2: string;
  letter: string;
  word1_pos: number;
  word2_pos: number;
}

interface PreviewPuzzle {
  date: string;
  words: {
    horizontal: string;
    vertical: string;
  };
  intersection: {
    letter: string;
    horizontalIndex: number;
    verticalIndex: number;
  };
  uniqueLetters: string[];
  letterCount: number;
  isMiddleIntersection: boolean;
}

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
function findIntersections(word1: string, wordList: string[], preferMiddle = true): Intersection[] {
  const intersections: Intersection[] = [];
  const middleIntersections: Intersection[] = [];
  
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

// Improved puzzle generation for preview
function generatePreviewPuzzle(date: string): PreviewPuzzle {
  const epochDate = new Date(date).getTime() / (1000 * 60 * 60 * 24);
  const daysSinceEpoch = Math.floor(epochDate);
  const rng = new SeededRandom(daysSinceEpoch * 2654435761);
  
  // Try to generate with middle intersections
  for (let attempt = 0; attempt < 100; attempt++) {
    const word1 = WORD_LIST[rng.nextInt(WORD_LIST.length)];
    const intersections = findIntersections(word1, WORD_LIST.slice(0, 500)); // Limit for performance
    
    if (intersections.length > 0) {
      const intersection = intersections[rng.nextInt(intersections.length)];
      const uniqueLetters = Array.from(new Set([...intersection.word1.split(''), ...intersection.word2.split('')])).sort();
      
      return {
        date,
        words: { horizontal: intersection.word1.toUpperCase(), vertical: intersection.word2.toUpperCase() },
        intersection: { 
          letter: intersection.letter.toUpperCase(), 
          horizontalIndex: intersection.word1_pos, 
          verticalIndex: intersection.word2_pos 
        },
        uniqueLetters: uniqueLetters.map(l => l.toUpperCase()),
        letterCount: uniqueLetters.length,
        isMiddleIntersection: (intersection.word1_pos >= 1 && intersection.word1_pos <= 3) && 
                            (intersection.word2_pos >= 1 && intersection.word2_pos <= 3)
      };
    }
  }
  
  // Fallback
  return {
    date,
    words: { horizontal: "ABOUT", vertical: "BOARD" },
    intersection: { letter: "B", horizontalIndex: 1, verticalIndex: 0 },
    uniqueLetters: ["A", "B", "D", "O", "R", "T", "U"],
    letterCount: 7,
    isMiddleIntersection: true
  };
}

export async function GET() {
  const results: PreviewPuzzle[] = [];
  const today = new Date();
  
  // Generate puzzles for next 3 months (90 days)
  for (let i = 0; i < 90; i++) {
    const currentDate = new Date(today);
    currentDate.setDate(today.getDate() + i);
    const dateString = currentDate.toISOString().split('T')[0];
    
    const puzzle = generatePreviewPuzzle(dateString);
    results.push(puzzle);
  }
  
  return new Response(JSON.stringify({
    totalDays: results.length,
    wordListSize: WORD_LIST.length,
    puzzles: results
  }, null, 2), {
    status: 200,
    headers: { 
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache' // Don't cache preview data
    }
  });
}