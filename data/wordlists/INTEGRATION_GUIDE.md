# ChromaCross Word List Integration Guide

## Quick Start

### Recommended File
Use **`words.txt`** for your daily ChromaCross puzzles.

```javascript
// Example integration in your puzzle generation code
import fs from 'fs';
import path from 'path';

// Load the word list
const loadWordList = () => {
  const wordListPath = path.join(process.cwd(), 'data/wordlists/words.txt');
  const wordList = fs.readFileSync(wordListPath, 'utf-8')
    .trim()
    .split('\n')
    .map(word => word.toLowerCase());
  
  return wordList;
};

// Usage in your existing game logic
const words = loadWordList();
console.log(`Loaded ${words.length} words for ChromaCross puzzles`);

// Example: Get a random word for today's puzzle
const getTodaysWord = (date) => {
  const words = loadWordList();
  // Use date as seed for consistent daily words
  const dateStr = date.toISOString().split('T')[0]; // YYYY-MM-DD
  const seed = dateStr.split('-').reduce((acc, num) => acc + parseInt(num), 0);
  const index = seed % words.length;
  return words[index];
};
```

## File Options

| File | Words | Best For |
|------|-------|----------|
| `words.txt` | 2,875 | **Daily puzzles** (recommended) |

## Word Quality Guarantee

All words in the list are:
- ✅ Exactly 5 letters long
- ✅ Common English words (no archaic terms)
- ✅ Familiar to average players
- ✅ No proper nouns
- ✅ Alphabetic characters only
- ✅ Verified through multiple authoritative sources

## Sample Words
`about, above, abuse, admit, adopt, adult, after, again, agent, agree, ahead, alert, alien, alike, alive, alone, along, alter, among, angel, anger, angle, angry, apple, apply, arena, argue, armor, array, aside, asset, audio, avoid, awake, award, aware, badly, based, basic, beach...`

Perfect for engaging, fair gameplay!