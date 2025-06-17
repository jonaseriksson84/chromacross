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

// Full word list from our curated collection
const WORD_LIST = [
  'about', 'above', 'abuse', 'admit', 'adopt', 'adult', 'after', 'again', 'agent', 'agree', 
  'ahead', 'alert', 'alien', 'alike', 'alive', 'alone', 'along', 'alter', 'among', 'angel',
  'anger', 'angle', 'angry', 'apple', 'apply', 'arena', 'argue', 'armor', 'array', 'aside',
  'asset', 'audio', 'avoid', 'awake', 'award', 'aware', 'badly', 'based', 'basic', 'beach',
  'began', 'being', 'below', 'black', 'blank', 'block', 'blood', 'board', 'boost', 'bound',
  'brain', 'brand', 'bread', 'break', 'brief', 'bring', 'broad', 'broke', 'brown', 'build',
  'built', 'buyer', 'cable', 'carry', 'catch', 'cause', 'chain', 'chair', 'chaos', 'charm',
  'chart', 'chase', 'cheap', 'check', 'chest', 'child', 'china', 'chose', 'civil', 'claim',
  'class', 'clean', 'clear', 'click', 'climb', 'clock', 'close', 'cloud', 'coach', 'coast',
  'could', 'count', 'court', 'cover', 'craft', 'crash', 'crazy', 'cream', 'crime', 'cross',
  'crowd', 'crown', 'crude', 'curve', 'cycle', 'daily', 'dance', 'dated', 'dealt', 'death',
  'debut', 'delay', 'depth', 'doing', 'doubt', 'dozen', 'draft', 'drama', 'drank', 'dream',
  'dress', 'drill', 'drink', 'drive', 'drove', 'dying', 'eager', 'early', 'earth', 'eight',
  'elect', 'elite', 'empty', 'enemy', 'enjoy', 'enter', 'entry', 'equal', 'error', 'event',
  'every', 'exact', 'exist', 'extra', 'faith', 'false', 'fault', 'fiber', 'field', 'fifth',
  'fifty', 'fight', 'final', 'first', 'fixed', 'flash', 'fleet', 'floor', 'fluid', 'focus',
  'force', 'forth', 'forty', 'forum', 'found', 'frame', 'frank', 'fraud', 'fresh', 'front',
  'fruit', 'fully', 'funny', 'giant', 'given', 'glass', 'globe', 'going', 'grace', 'grade',
  'grain', 'grand', 'grant', 'grass', 'grave', 'great', 'green', 'gross', 'group', 'grown',
  'guard', 'guess', 'guest', 'guide', 'happy', 'heart', 'heavy', 'hence', 'horse', 'hotel',
  'house', 'human', 'ideal', 'image', 'index', 'inner', 'input', 'issue', 'japan', 'joint',
  'judge', 'known', 'label', 'large', 'laser', 'later', 'laugh', 'layer', 'learn', 'lease',
  'least', 'leave', 'legal', 'level', 'light', 'limit', 'links', 'lived', 'local', 'logic',
  'loose', 'lower', 'lucky', 'lunch', 'lying', 'magic', 'major', 'maker', 'march', 'match',
  'maybe', 'mayor', 'meant', 'medal', 'media', 'metal', 'might', 'minor', 'minus', 'mixed',
  'model', 'money', 'month', 'moral', 'motor', 'mount', 'mouse', 'mouth', 'moved', 'movie',
  'music', 'needs', 'never', 'newly', 'night', 'noise', 'north', 'noted', 'novel', 'nurse',
  'occur', 'ocean', 'offer', 'often', 'order', 'other', 'ought', 'outer', 'owned', 'owner',
  'paint', 'panel', 'paper', 'party', 'peace', 'phase', 'phone', 'photo', 'piano', 'piece',
  'pilot', 'pitch', 'place', 'plain', 'plane', 'plant', 'plate', 'point', 'pound', 'power',
  'press', 'price', 'pride', 'prime', 'print', 'prior', 'prize', 'proof', 'proud', 'prove',
  'queen', 'quick', 'quiet', 'quite', 'radio', 'raise', 'range', 'rapid', 'ratio', 'reach',
  'ready', 'realm', 'rebel', 'refer', 'relax', 'repay', 'reply', 'right', 'rigid', 'rival',
  'river', 'robin', 'roger', 'roman', 'rough', 'round', 'route', 'royal', 'rural', 'scale',
  'scene', 'scope', 'score', 'sense', 'serve', 'seven', 'shall', 'shape', 'share', 'sharp',
  'sheet', 'shelf', 'shell', 'shift', 'shine', 'shirt', 'shock', 'shoot', 'short', 'shown',
  'sides', 'sight', 'silly', 'since', 'sixth', 'sixty', 'sized', 'skill', 'sleep', 'slide',
  'small', 'smart', 'smile', 'smith', 'smoke', 'snake', 'solid', 'solve', 'sorry', 'sound',
  'south', 'space', 'spare', 'speak', 'speed', 'spend', 'spent', 'split', 'spoke', 'sport',
  'staff', 'stage', 'stake', 'stand', 'start', 'state', 'stays', 'steam', 'steel', 'steep',
  'steer', 'stick', 'still', 'stock', 'stone', 'stood', 'store', 'storm', 'story', 'strip',
  'stuck', 'study', 'stuff', 'style', 'sugar', 'suite', 'super', 'sweet', 'table', 'taken',
  'taste', 'taxes', 'teach', 'tells', 'terry', 'texas', 'thank', 'theft', 'their', 'theme',
  'there', 'these', 'thick', 'thing', 'think', 'third', 'those', 'three', 'threw', 'throw',
  'thumb', 'tight', 'timer', 'tired', 'title', 'today', 'token', 'topic', 'total', 'touch',
  'tough', 'tower', 'track', 'trade', 'train', 'treat', 'trend', 'trial', 'tribe', 'trick',
  'tried', 'tries', 'truck', 'truly', 'trust', 'truth', 'twice', 'twist', 'ultra', 'uncle',
  'under', 'union', 'unity', 'until', 'upper', 'urban', 'usage', 'usual', 'valid', 'value',
  'video', 'virus', 'visit', 'vital', 'vocal', 'voice', 'waste', 'watch', 'water', 'wheel',
  'where', 'which', 'while', 'white', 'whole', 'whose', 'woman', 'women', 'world', 'worry',
  'worse', 'worst', 'worth', 'would', 'write', 'wrong', 'wrote', 'youth'
];

// Find intersections for a word
function findIntersections(word1, wordList) {
  const intersections = [];
  for (let pos1 = 0; pos1 < 5; pos1++) {
    const letter = word1[pos1];
    for (const word2 of wordList) {
      if (word2 === word1) continue;
      for (let pos2 = 0; pos2 < 5; pos2++) {
        if (word2[pos2] === letter) {
          intersections.push({
            word1, word2, letter, word1_pos: pos1, word2_pos: pos2
          });
        }
      }
    }
  }
  return intersections;
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