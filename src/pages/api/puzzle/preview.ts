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

// Simplified puzzle generation for preview
function generatePreviewPuzzle(date: string) {
  const epochDate = new Date(date).getTime() / (1000 * 60 * 60 * 24);
  const daysSinceEpoch = Math.floor(epochDate);
  const rng = new SeededRandom(daysSinceEpoch * 2654435761);
  
  // Quick generation - just pick two random words that intersect
  for (let attempt = 0; attempt < 100; attempt++) {
    const word1 = WORD_LIST[rng.nextInt(WORD_LIST.length)];
    const word2 = WORD_LIST[rng.nextInt(WORD_LIST.length)];
    
    if (word1 === word2) continue;
    
    // Find any intersection
    for (let i = 0; i < 5; i++) {
      for (let j = 0; j < 5; j++) {
        if (word1[i] === word2[j]) {
          const uniqueLetters = Array.from(new Set([...word1, ...word2])).sort();
          return {
            date,
            words: { horizontal: word1.toUpperCase(), vertical: word2.toUpperCase() },
            intersection: { letter: word1[i].toUpperCase(), horizontalIndex: i, verticalIndex: j },
            uniqueLetters: uniqueLetters.map(l => l.toUpperCase()),
            letterCount: uniqueLetters.length
          };
        }
      }
    }
  }
  
  // Fallback
  return {
    date,
    words: { horizontal: "ABOUT", vertical: "BOARD" },
    intersection: { letter: "B", horizontalIndex: 1, verticalIndex: 0 },
    uniqueLetters: ["A", "B", "D", "O", "R", "T", "U"],
    letterCount: 7
  };
}

export async function GET() {
  const results = [];
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