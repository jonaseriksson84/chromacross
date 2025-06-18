// Algorithmic puzzle generator for ChromaCross
// Deterministic daily puzzle generation using word list

import * as fs from "node:fs";
import * as path from "node:path";

export interface Puzzle {
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

export interface Intersection {
	word1: string;
	word2: string;
	letter: string;
	word1Index: number;
	word2Index: number;
}

// Seeded random number generator
export class SeededRandom {
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

// Load word list from file
const wordListPath = path.join(process.cwd(), "data", "wordlists", "words.txt");
const content = fs.readFileSync(wordListPath, "utf-8");
const WORD_LIST = content
	.trim()
	.split("\n")
	.map((word) => word.toLowerCase().trim())
	.filter((word) => word.length >= 4 && word.length <= 8); // Filter for reasonable lengths

function findIntersections(word1: string, word2: string): Intersection[] {
	const intersections: Intersection[] = [];
	
	for (let i = 0; i < word1.length; i++) {
		for (let j = 0; j < word2.length; j++) {
			if (word1[i] === word2[j]) {
				intersections.push({
					word1,
					word2,
					letter: word1[i],
					word1Index: i,
					word2Index: j,
				});
			}
		}
	}
	
	return intersections;
}

function getUniqueLetters(word1: string, word2: string): string[] {
	const letterSet = new Set([...word1.split(""), ...word2.split("")]);
	return Array.from(letterSet).sort();
}

function generateColorMap(
	letters: string[],
	rng: SeededRandom,
): Record<string, string> {
	const colors = [
		"#FF6B6B",
		"#4ECDC4",
		"#45B7D1",
		"#96CEB4",
		"#FECA57",
		"#FF9FF3",
		"#54A0FF",
		"#5F27CD",
		"#00D2D3",
		"#FF9F43",
		"#C44569",
		"#40739E",
		"#487EB0",
		"#8C7AE6",
		"#E17055",
	];

	const shuffledLetters = [...letters];
	for (let i = shuffledLetters.length - 1; i > 0; i--) {
		const j = rng.nextInt(i + 1);
		[shuffledLetters[i], shuffledLetters[j]] = [
			shuffledLetters[j],
			shuffledLetters[i],
		];
	}

	const colorMap: Record<string, string> = {};
	for (let i = 0; i < shuffledLetters.length; i++) {
		colorMap[shuffledLetters[i]] = colors[i % colors.length];
	}

	return colorMap;
}

function preferMiddleIntersections(intersections: Intersection[]): Intersection[] {
	// Prefer intersections closer to the middle of both words
	return intersections.sort((a, b) => {
		const aWord1Middle = Math.abs(a.word1Index - (a.word1.length - 1) / 2);
		const aWord2Middle = Math.abs(a.word2Index - (a.word2.length - 1) / 2);
		const aScore = aWord1Middle + aWord2Middle;
		
		const bWord1Middle = Math.abs(b.word1Index - (b.word1.length - 1) / 2);
		const bWord2Middle = Math.abs(b.word2Index - (b.word2.length - 1) / 2);
		const bScore = bWord1Middle + bWord2Middle;
		
		return aScore - bScore;
	});
}

export function generateDailyPuzzle(date: string): Puzzle {
	const dateNum = Number.parseInt(date.replace(/-/g, ""));
	const rng = new SeededRandom(dateNum);
	
	// Try to find a valid puzzle with multiple attempts
	const maxAttempts = 100;
	
	for (let attempt = 0; attempt < maxAttempts; attempt++) {
		// Pick two random words
		const word1Index = rng.nextInt(WORD_LIST.length);
		const word2Index = rng.nextInt(WORD_LIST.length);
		
		if (word1Index === word2Index) continue; // Skip same word
		
		const word1 = WORD_LIST[word1Index];
		const word2 = WORD_LIST[word2Index];
		
		// Find intersections
		const intersections = findIntersections(word1, word2);
		if (intersections.length === 0) continue;
		
		// Prefer middle intersections for better visual appeal
		const sortedIntersections = preferMiddleIntersections(intersections);
		const intersection = sortedIntersections[0];
		
		const uniqueLetters = getUniqueLetters(word1, word2);
		
		// Ensure we have enough unique letters for variety
		if (uniqueLetters.length < 6) continue;
		
		const colorMap = generateColorMap(uniqueLetters, rng);
		
		return {
			puzzleId: dateNum,
			date,
			words: {
				horizontal: intersection.word1.toUpperCase(),
				vertical: intersection.word2.toUpperCase(),
			},
			intersection: {
				letter: intersection.letter.toUpperCase(),
				horizontalIndex: intersection.word1Index,
				verticalIndex: intersection.word2Index,
			},
			uniqueLetters: uniqueLetters.map((l) => l.toUpperCase()),
			colorMap: Object.fromEntries(
				Object.entries(colorMap).map(([k, v]) => [k.toUpperCase(), v]),
			),
		};
	}
	
	// If we reach here, throw an error - the algorithm should always find a puzzle
	throw new Error(`Failed to generate puzzle after ${maxAttempts} attempts for date ${date}`);
}
