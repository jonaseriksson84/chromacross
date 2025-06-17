# ChromaCross 5-Letter Word Lists - Summary Report

## Overview
Successfully downloaded and curated high-quality 5-letter English word lists for the ChromaCross puzzle game from multiple authoritative sources.

## Sources Downloaded

### 1. **Wordle Official Word Lists** ✅
- **Wordle Answers** (`wordle_answers_list.txt`): 2,309 words
  - Source: 3Blue1Brown's Wordle analysis repository
  - Description: Official daily answer words used in Wordle
  - Quality: **Excellent** - These are proven to be familiar, common words

- **Wordle Allowed Guesses** (`wordle_all_allowed.txt`): 12,953 words
  - Source: 3Blue1Brown's Wordle analysis repository  
  - Description: All valid guesses accepted by Wordle (includes answers + additional valid words)
  - Quality: **Good** - Comprehensive but includes some obscure words

### 2. **Google Common Words** ✅
- **Google 10K Common Words** (filtered to 5-letter): 1,382 words
  - Source: Google's Trillion Word Corpus frequency analysis
  - Description: Most frequently used English words based on web content analysis
  - Quality: **Excellent** - High-frequency, familiar words

### 3. **Stanford Graph Base (SGB)** ✅
- **Academic Curated List** (`sgb_words.txt`): 5,757 words
  - Source: Donald Knuth's Stanford Graph Base
  - Description: Academically curated list for computational linguistics research
  - Quality: **Very Good** - Well-curated, balanced selection

### 4. **SOWPODS Scrabble Dictionary** ✅
- **SOWPODS 5-Letter Words** (filtered): 12,478 words
  - Source: Official Scrabble dictionary (jesstess/Scrabble repository)
  - Description: 5-letter words from the official Scrabble word list
  - Quality: **Good** - Comprehensive but includes many obscure/archaic words

## Curation Process

### Filtering Applied:
1. **Length Validation**: Only exactly 5-letter words
2. **Character Validation**: Only alphabetic characters (a-z)
3. **Case Normalization**: All converted to lowercase
4. **Deduplication**: Removed duplicate words across sources
5. **Priority Scoring**: Assigned quality scores based on source reliability

### Priority Scoring System:
- **Score 100**: Wordle official answers (highest quality)
- **Score 90**: Google common words (frequency-based)
- **Score 80**: Stanford Graph Base (academically curated)
- **Score 60**: Wordle allowed guesses (comprehensive but varied quality)
- **Score 40**: SOWPODS dictionary (complete but includes obscure words)

## Final Curated Word Lists

### 🏆 **RECOMMENDED: `curated_5_letter_words_premium.txt`** - 2,875 words
- **Perfect for daily puzzles** - meets your 2000-3000 word target
- Combines Wordle answers + Google common words + high-overlap Stanford words
- Only familiar, recognizable words that players will know
- Excludes obscure, archaic, or overly technical terms

### 📊 **Alternative Options:**

1. **`curated_5_letter_words_high.txt`** - 5,987 words
   - High-quality words (score ≥80)
   - Includes Wordle answers, Google common, and Stanford Graph Base
   - Good balance of familiarity and variety

2. **`curated_5_letter_words_good.txt`** - 13,261 words
   - Good quality words (score ≥60)  
   - Adds Wordle allowed guesses for more variety
   - May include some less familiar words

3. **`curated_5_letter_words_all.txt`** - 13,280 words
   - Complete collection including SOWPODS additions
   - Maximum variety but includes obscure words

## Quality Analysis

### Word Overlap Analysis:
- **Wordle + Google overlap**: 816 words (highest quality intersection)
- **Wordle + Stanford overlap**: 2,276 words  
- **Google + Stanford overlap**: 1,179 words
- **All three sources overlap**: 810 words (premium core set)

### Recommended Usage:
- **For ChromaCross daily puzzles**: Use `curated_5_letter_words_premium.txt`
- **For expanded variety**: Use `curated_5_letter_words_high.txt`
- **For maximum options**: Use `curated_5_letter_words_good.txt`

## Sample Words by Quality

### Premium List Examples:
`about, above, abuse, admit, adopt, adult, after, again, agent, agree, ahead, alert, alien, alike, alive, alone, along, alter, among, angel`

### Quality Characteristics:
- ✅ Common, everyday words
- ✅ No proper nouns  
- ✅ No archaic terms
- ✅ Familiar to average English speakers
- ✅ Good for word game puzzles

## Files Created

### Source Files:
- `wordle_answers_list.txt` - Official Wordle daily answers
- `wordle_all_allowed.txt` - All Wordle valid guesses  
- `google_common_5_letter.txt` - Google frequency-based common words
- `sgb_words.txt` - Stanford Graph Base curated words
- `sowpods_5_letter_clean.txt` - SOWPODS Scrabble dictionary (5-letter only)

### Curated Output Files:
- `curated_5_letter_words_premium.txt` - **RECOMMENDED** (2,875 words)
- `curated_5_letter_words_high.txt` - High quality (5,987 words)
- `curated_5_letter_words_good.txt` - Good quality (13,261 words)  
- `curated_5_letter_words_all.txt` - All words (13,280 words)

### Processing Scripts:
- `combine_wordlists.py` - Main curation script
- `create_premium_list.py` - Premium list creation script

## Conclusion

✅ **Mission Accomplished!** 

Successfully created a high-quality, curated collection of 2,875 familiar 5-letter English words perfect for ChromaCross daily puzzles. The premium list focuses on words that players will recognize and enjoy, avoiding obscure terms while maintaining sufficient variety for engaging gameplay.

**Next Steps**: 
1. Test the premium word list in your game
2. Consider using the high-quality list (5,987 words) if you need more variety
3. The word lists are ready for integration into your puzzle generation system