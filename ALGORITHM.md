# ChromaCross: Puzzle Generation Algorithm

## Overview

ChromaCross generates one unique puzzle per day that all players worldwide receive. The algorithm uses the current date as a seed to deterministically generate the same puzzle for everyone on the same day.

## Core Constraints

- **5-letter words only** - Creates manageable 5×5 intersection grids
- **Common, familiar words** - Prioritize words players actually know
- **One puzzle per day globally** - Everyone gets the same puzzle
- **Deterministic generation** - Same date = same puzzle worldwide
- **Unique solutions** - No other word pairs can be formed with the same letters

## Current Implementation

The game currently uses a curated word list of **2,875 common English words** sourced from:
- Wordle official answer lists
- Google's most common 5-letter words
- Stanford Graph Base curated words

All words are familiar, everyday English words with no proper nouns or archaic terms.

## Word List Curation

### Sources (implemented):
1. **Wordle word lists** - Official Wordle answers (2,309 words)
2. **Google common words** - High-frequency words from Google's corpus (1,382 words)
3. **Stanford Graph Base** - Academically curated list (5,757 words)

### Filtering criteria (applied):
- English words only
- No proper nouns
- No archaic/obsolete terms
- No highly technical jargon
- Exactly 5 letters
- Alphabetic characters only
- Priority scoring based on source quality

### Current word list: 2,875 curated common words

## Daily Puzzle Generation Algorithm

### Input
- Current date (YYYY-MM-DD format)
- Curated word list (~3000 words)

### Process

#### 1. **Date-based Seeding**
```
seed = parseInt(YYYYMMDD)
rng = SeededRandom(seed)  // Ensures same output for same date
```

#### 2. **Word Selection & Intersection Finding**
```
attempts = 0
while (attempts < 1000):
    word1 = wordList[rng.next() % wordList.length]
    
    // Find all possible intersections for word1
    intersections = []
    for position1 in [0,1,2,3,4]:
        letter = word1[position1]
        for word2 in wordList:
            if word2 == word1: continue
            for position2 in [0,1,2,3,4]:
                if word2[position2] == letter:
                    intersections.push({
                        word1, word2, letter,
                        word1_pos: position1,
                        word2_pos: position2
                    })
    
    if intersections.length > 0:
        intersection = intersections[rng.next() % intersections.length]
        if validateUniqueness(intersection):
            return generatePuzzle(intersection)
    
    attempts++

throw "Could not generate valid puzzle for this date"
```

#### 3. **Uniqueness Validation**
This is the critical step that ensures puzzle has only one solution:

```
function validateUniqueness(intersection):
    // Extract all unique letters from both words
    uniqueLetters = getUniqueLetters(intersection.word1, intersection.word2)
    
    // Define the structural pattern (grid shape and intersection point)
    pattern = {
        horizontal_length: 5,
        vertical_length: 5,
        intersection_h_pos: intersection.word1_pos,
        intersection_v_pos: intersection.word2_pos
    }
    
    // Check if any other word pair fits this exact pattern
    for word_a in wordList:
        if word_a == intersection.word1: continue
        
        // Must have the intersection letter at the right position
        if word_a[pattern.intersection_h_pos] != intersection.letter: continue
        
        for word_b in wordList:
            if word_b == intersection.word2: continue
            if word_b[pattern.intersection_v_pos] != intersection.letter: continue
            
            // Check if this alternative pair uses only letters from our set
            altUniqueLetters = getUniqueLetters(word_a, word_b)
            
            if setsAreEqual(uniqueLetters, altUniqueLetters):
                return false  // Found collision - puzzle is ambiguous!
    
    return true  // No collisions found - puzzle is unique
```

#### 4. **Puzzle Object Generation**
```
function generatePuzzle(intersection):
    uniqueLetters = getUniqueLetters(intersection.word1, intersection.word2)
    
    // Generate color map with deterministic but varied colors
    colorMap = {}
    colors = [
        "#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", "#FECA57",
        "#FF9FF3", "#54A0FF", "#5F27CD", "#00D2D3", "#FF9F43",
        "#C44569", "#40739E", "#487EB0", "#8C7AE6", "#E17055"
    ]
    
    for i, letter in enumerate(shuffledLetters):
        colorMap[letter] = colors[i % colors.length]
    
    return {
        puzzleId: parseInt(getCurrentDateString()),  // YYYYMMDD
        date: getCurrentDateString(),
        words: {
            horizontal: intersection.word1,
            vertical: intersection.word2
        },
        intersection: {
            letter: intersection.letter,
            horizontalIndex: intersection.word1_pos,
            verticalIndex: intersection.word2_pos
        },
        uniqueLetters: uniqueLetters,
        colorMap: colorMap
    }
```

## Performance Optimizations

### 1. **Caching Strategy**
- Cache generated puzzle for the current day
- Pre-generate next 2-3 days at midnight UTC
- Serve from cache for all requests on same day

### 2. **Word List Indexing**
- Index words by each letter position for faster intersection lookup
- Use hash maps for O(1) word validation
- Pre-compute letter frequency for better word selection

### 3. **Fallback Handling**
- If generation fails for a date (rare), fall back to pre-validated puzzles
- Keep a small backup pool of 100 manually verified unique puzzles

## Quality Assurance

### Validation Steps:
1. **Word familiarity** - Both words must be in curated common word list
2. **Letter diversity** - Prefer puzzles with 7-9 unique letters (good challenge)
3. **Color distinctiveness** - Ensure colors are visually distinct
4. **Difficulty balance** - Track average solve times and adjust word selection

### Monitoring:
- Log generation success/failure rates
- Track player completion statistics
- Monitor for any reported ambiguous puzzles

## Expected Output

With ~3000 common 5-letter words:
- **Theoretical combinations**: 3000² × 5 positions = 45M
- **After filtering**: ~0.1% pass uniqueness test = 45,000 valid puzzles
- **Sustainability**: 45,000 ÷ 365 days = **123 years** of daily puzzles

## Implementation Status

### ✅ Completed Features:
1. **Word list curation** - 2,875 high-quality words from multiple sources
2. **Basic generation algorithm** - Date-seeded puzzle generation
3. **Deterministic puzzle creation** - Same puzzle for all players daily
4. **Color assignment** - Unique colors for each letter
5. **Game state management** - Progress persistence with localStorage
6. **Analytics system** - Anonymous gameplay tracking in Cloudflare KV

### 🔄 Current Implementation:
The game uses a **simplified approach** that generates consistent daily puzzles without full uniqueness validation. The algorithm prioritizes:
- **Reliability** - Always generates a valid puzzle
- **Consistency** - Same puzzle worldwide
- **Quality** - Only uses curated, familiar words
- **Performance** - Fast generation and serving

### 🎯 Future Enhancements:
- Full uniqueness validation for puzzle ambiguity checking
- Advanced difficulty balancing based on analytics
- Expanded word list with regional variants
- Puzzle pre-generation and caching

This implementation ensures ChromaCross provides engaging daily puzzles with excellent performance and reliability while maintaining room for algorithmic improvements.