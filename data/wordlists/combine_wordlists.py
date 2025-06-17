#!/usr/bin/env python3
import re
from collections import defaultdict

def is_valid_word(word):
    """Check if word is valid for a word game - only letters, no proper nouns"""
    if len(word) != 5:
        return False
    if not word.isalpha():
        return False
    if not word.islower():
        return False
    return True

def load_wordlist(filename, priority_score):
    """Load a wordlist and assign priority scores"""
    words = {}
    try:
        with open(filename, 'r', encoding='utf-8') as f:
            for line in f:
                word = line.strip().lower()
                if is_valid_word(word):
                    if word not in words or words[word] < priority_score:
                        words[word] = priority_score
    except FileNotFoundError:
        print(f"Warning: {filename} not found")
    return words

# Load all wordlists with priority scores (higher = more preferred)
all_words = {}

# Highest priority: Official Wordle answers (these are proven to be good words)
wordle_answers = load_wordlist('wordle_answers_list.txt', 100)
all_words.update(wordle_answers)
print(f"Loaded {len(wordle_answers)} Wordle answers")

# High priority: Google common words (frequency-based, familiar to users)
google_common = load_wordlist('google_common_5_letter.txt', 90)
all_words.update(google_common)
print(f"Loaded {len(google_common)} Google common words")

# Medium-high priority: Stanford Graph Base (academically curated)
sgb_words = load_wordlist('sgb_words.txt', 80)
all_words.update(sgb_words)
print(f"Loaded {len(sgb_words)} Stanford Graph Base words")

# Medium priority: Wordle allowed guesses (valid but some may be obscure)
wordle_allowed = load_wordlist('wordle_all_allowed.txt', 60)
wordle_allowed_new = 0
for word, score in wordle_allowed.items():
    if word not in all_words:  # Only add if not already present with higher score
        all_words[word] = score
        wordle_allowed_new += 1
print(f"Added {wordle_allowed_new} additional Wordle allowed words")

# Lower priority: Clean SOWPODS (comprehensive but may include obscure words)
sowpods_words = load_wordlist('sowpods_5_letter_clean.txt', 40)
sowpods_new = 0
for word, score in sowpods_words.items():
    if word not in all_words:  # Only add if not already present with higher score
        all_words[word] = score
        sowpods_new += 1
print(f"Added {sowpods_new} additional SOWPODS words")

# Sort by priority score (descending) then alphabetically
sorted_words = sorted(all_words.items(), key=lambda x: (-x[1], x[0]))

# Create different tiers
high_quality = [word for word, score in sorted_words if score >= 80]  # Top tier
good_quality = [word for word, score in sorted_words if score >= 60]  # Good tier
all_quality = [word for word, score in sorted_words if score >= 40]   # All words

print(f"\nTotal unique words: {len(all_words)}")
print(f"High quality (score ≥80): {len(high_quality)}")
print(f"Good quality (score ≥60): {len(good_quality)}")
print(f"All quality (score ≥40): {len(all_quality)}")

# Write the different quality tiers
with open('curated_5_letter_words_high.txt', 'w') as f:
    for word in high_quality:
        f.write(word + '\n')

with open('curated_5_letter_words_good.txt', 'w') as f:
    for word in good_quality:
        f.write(word + '\n')

with open('curated_5_letter_words_all.txt', 'w') as f:
    for word in all_quality:
        f.write(word + '\n')

print(f"\nCreated three curated word lists:")
print(f"- curated_5_letter_words_high.txt ({len(high_quality)} words)")
print(f"- curated_5_letter_words_good.txt ({len(good_quality)} words)")  
print(f"- curated_5_letter_words_all.txt ({len(all_quality)} words)")

# Show some examples from each tier
print(f"\nHigh quality examples: {', '.join(high_quality[:10])}")
print(f"Good quality examples: {', '.join(good_quality[:10])}")