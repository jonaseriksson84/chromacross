// Daily puzzle generator for ChromaCross

// Types
interface Intersection {
  word1: string;
  word2: string;
  letter: string;
  word1_pos: number;
  word2_pos: number;
}

interface Puzzle {
  puzzleId: number;
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
  colorMap: Record<string, string>;
}

// Seeded random number generator for deterministic results
class SeededRandom {
  private seed: number;

  constructor(seed: number) {
    this.seed = seed;
  }

  next(): number {
    this.seed = (this.seed * 9301 + 49297) % 233280;
    return this.seed / 233280;
  }

  nextInt(max: number): number {
    return Math.floor(this.next() * max);
  }
}

// Curated word list (subset of premium words for now)
// TODO: Load from file in production, but use hardcoded for development
function loadWordList(): string[] {
  return [
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
}

// Get unique letters from two words
function getUniqueLetters(word1: string, word2: string): string[] {
  const letterSet = new Set([...word1, ...word2]);
  return Array.from(letterSet).sort();
}

// Check if two sets of letters are equal
function setsAreEqual(set1: string[], set2: string[]): boolean {
  if (set1.length !== set2.length) return false;
  const sorted1 = [...set1].sort();
  const sorted2 = [...set2].sort();
  return sorted1.every((letter, index) => letter === sorted2[index]);
}

// Find all possible intersections for a word
function findIntersections(word1: string, wordList: string[]): Intersection[] {
  const intersections: Intersection[] = [];
  
  for (let pos1 = 0; pos1 < 5; pos1++) {
    const letter = word1[pos1];
    
    for (const word2 of wordList) {
      if (word2 === word1) continue;
      
      for (let pos2 = 0; pos2 < 5; pos2++) {
        if (word2[pos2] === letter) {
          intersections.push({
            word1,
            word2,
            letter,
            word1_pos: pos1,
            word2_pos: pos2
          });
        }
      }
    }
  }
  
  return intersections;
}

// Validate that puzzle has unique solution
function validateUniqueness(intersection: Intersection, wordList: string[]): boolean {
  const uniqueLetters = getUniqueLetters(intersection.word1, intersection.word2);
  
  // Check if any other word pair fits this exact pattern with same letters
  for (const wordA of wordList) {
    if (wordA === intersection.word1) continue;
    
    // Must have the intersection letter at the right position
    if (wordA[intersection.word1_pos] !== intersection.letter) continue;
    
    for (const wordB of wordList) {
      if (wordB === intersection.word2) continue;
      if (wordB[intersection.word2_pos] !== intersection.letter) continue;
      
      // Check if this alternative pair uses same set of letters
      const altUniqueLetters = getUniqueLetters(wordA, wordB);
      
      if (setsAreEqual(uniqueLetters, altUniqueLetters)) {
        console.log(`Collision found: ${intersection.word1}/${intersection.word2} vs ${wordA}/${wordB}`);
        return false; // Found collision - puzzle is ambiguous!
      }
    }
  }
  
  return true; // No collisions found - puzzle is unique
}

// Generate color map for letters
function generateColorMap(letters: string[], rng: SeededRandom): Record<string, string> {
  const colors = [
    "#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", "#FECA57",
    "#FF9FF3", "#54A0FF", "#5F27CD", "#00D2D3", "#FF9F43",
    "#C44569", "#40739E", "#487EB0", "#8C7AE6", "#E17055",
    "#6C5CE7", "#A29BFE", "#FD79A8", "#FDCB6E", "#E84393"
  ];
  
  // Shuffle letters using seeded random
  const shuffledLetters = [...letters];
  for (let i = shuffledLetters.length - 1; i > 0; i--) {
    const j = rng.nextInt(i + 1);
    [shuffledLetters[i], shuffledLetters[j]] = [shuffledLetters[j], shuffledLetters[i]];
  }
  
  const colorMap: Record<string, string> = {};
  for (let i = 0; i < shuffledLetters.length; i++) {
    colorMap[shuffledLetters[i]] = colors[i % colors.length];
  }
  
  return colorMap;
}

// Generate puzzle for a specific date
export function generateDailyPuzzle(date: string): Puzzle {
  console.log(`Generating puzzle for ${date}`);
  
  // Create seed from date
  const dateNum = parseInt(date.replace(/-/g, ''));
  const rng = new SeededRandom(dateNum);
  
  const wordList = loadWordList();
  console.log(`Using word list with ${wordList.length} words`);
  
  // Try to generate a valid puzzle
  const maxAttempts = 1000;
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    // Select first word randomly
    const word1 = wordList[rng.nextInt(wordList.length)];
    
    // Find all possible intersections for this word
    const intersections = findIntersections(word1, wordList);
    
    if (intersections.length === 0) continue;
    
    // Select random intersection
    const intersection = intersections[rng.nextInt(intersections.length)];
    
    // Validate uniqueness (this is the expensive part)
    if (validateUniqueness(intersection, wordList)) {
      console.log(`Found valid puzzle after ${attempt + 1} attempts: ${intersection.word1} / ${intersection.word2}`);
      
      const uniqueLetters = getUniqueLetters(intersection.word1, intersection.word2);
      const colorMap = generateColorMap(uniqueLetters, rng);
      
      return {
        puzzleId: dateNum,
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
        colorMap: Object.fromEntries(
          Object.entries(colorMap).map(([k, v]) => [k.toUpperCase(), v])
        )
      };
    }
  }
  
  // Fallback if generation fails
  console.warn(`Failed to generate puzzle after ${maxAttempts} attempts, using fallback`);
  return {
    puzzleId: dateNum,
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