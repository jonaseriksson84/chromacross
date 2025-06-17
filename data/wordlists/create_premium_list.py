#!/usr/bin/env python3

def load_wordlist(filename):
    """Load a wordlist"""
    words = set()
    try:
        with open(filename, 'r', encoding='utf-8') as f:
            for line in f:
                word = line.strip().lower()
                if len(word) == 5 and word.isalpha():
                    words.add(word)
    except FileNotFoundError:
        print(f"Warning: {filename} not found")
    return words

# Load the highest quality sources
wordle_answers = load_wordlist('wordle_answers_list.txt')
google_common = load_wordlist('google_common_5_letter.txt')
sgb_words = load_wordlist('sgb_words.txt')

print(f"Wordle answers: {len(wordle_answers)}")
print(f"Google common: {len(google_common)}")
print(f"Stanford Graph Base: {len(sgb_words)}")

# Create intersection - words that appear in multiple high-quality sources
wordle_google = wordle_answers.intersection(google_common)
wordle_sgb = wordle_answers.intersection(sgb_words)
google_sgb = google_common.intersection(sgb_words)
all_three = wordle_answers.intersection(google_common).intersection(sgb_words)

print(f"\nOverlaps:")
print(f"Wordle + Google: {len(wordle_google)}")
print(f"Wordle + Stanford: {len(wordle_sgb)}")
print(f"Google + Stanford: {len(google_sgb)}")
print(f"All three sources: {len(all_three)}")

# Create premium list: Start with Wordle answers (proven good), add Google common
premium_words = wordle_answers.union(google_common)

# Add words from Stanford that are also in Google common (double-validated)
premium_words.update(google_sgb)

# Sort alphabetically
premium_sorted = sorted(premium_words)

print(f"\nPremium list size: {len(premium_sorted)}")

# Write premium list
with open('curated_5_letter_words_premium.txt', 'w') as f:
    for word in premium_sorted:
        f.write(word + '\n')

print(f"Created premium word list: curated_5_letter_words_premium.txt ({len(premium_sorted)} words)")
print(f"Premium examples: {', '.join(premium_sorted[:15])}")

# Create a smaller "daily" list from the very best words
# Focus on Wordle answers + Google common that have high frequency
daily_words = wordle_answers.union(google_common)
daily_sorted = sorted(daily_words)

# Further filter to around 2000-3000 words as requested
if len(daily_sorted) > 3000:
    # Prefer words that appear in multiple sources
    priority_words = []
    
    # First, add words that appear in all three sources
    priority_words.extend(sorted(all_three))
    
    # Then add words that appear in Wordle + Google
    for word in sorted(wordle_google):
        if word not in priority_words:
            priority_words.append(word)
    
    # Then add remaining Wordle answers
    for word in sorted(wordle_answers):
        if word not in priority_words:
            priority_words.append(word)
    
    # Finally add remaining Google common words up to 3000 total
    for word in sorted(google_common):
        if word not in priority_words and len(priority_words) < 3000:
            priority_words.append(word)
    
    daily_words = priority_words[:3000]
else:
    daily_words = daily_sorted

with open('curated_5_letter_words_daily.txt', 'w') as f:
    for word in daily_words:
        f.write(word + '\n')

print(f"Created daily word list: curated_5_letter_words_daily.txt ({len(daily_words)} words)")
print(f"Daily examples: {', '.join(daily_words[:15])}")