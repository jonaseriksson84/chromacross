// Simple puzzle generator for ChromaCross
// Deterministic daily puzzle generation

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

// Seeded random number generator
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

// Curated word pairs that we know work well together
const GOOD_WORD_PAIRS = [
	{ h: "ABOUT", v: "BOARD", letter: "B", hPos: 1, vPos: 0 },
	{ h: "HOUSE", v: "MUSIC", letter: "U", hPos: 2, vPos: 1 },
	{ h: "WATER", v: "LEMON", letter: "E", hPos: 3, vPos: 1 },
	{ h: "LIGHT", v: "TIGER", letter: "T", hPos: 4, vPos: 0 },
	{ h: "PAPER", v: "APPLE", letter: "P", hPos: 0, vPos: 1 },
	{ h: "CHAIR", v: "HEART", letter: "H", hPos: 1, vPos: 0 },
	{ h: "VOICE", v: "OCEAN", letter: "O", hPos: 1, vPos: 0 },
	{ h: "PLANT", v: "LUNCH", letter: "N", hPos: 3, vPos: 2 },
	{ h: "GRAND", v: "ARGUE", letter: "R", hPos: 2, vPos: 1 },
	{ h: "SMART", v: "MARCH", letter: "A", hPos: 2, vPos: 1 },
	{ h: "SPACE", v: "PEACE", letter: "A", hPos: 2, vPos: 2 },
	{ h: "BREAD", v: "DREAM", letter: "R", hPos: 1, vPos: 1 },
	{ h: "CLOCK", v: "CLEAN", letter: "C", hPos: 0, vPos: 0 },
	{ h: "STAGE", v: "AGREE", letter: "G", hPos: 3, vPos: 1 },
	{ h: "FRAME", v: "REACH", letter: "A", hPos: 2, vPos: 2 },
	{ h: "QUICK", v: "QUIET", letter: "Q", hPos: 0, vPos: 0 },
	{ h: "YOUTH", v: "TOUGH", letter: "U", hPos: 2, vPos: 2 },
	{ h: "JUDGE", v: "GUESS", letter: "U", hPos: 1, vPos: 1 },
	{ h: "PRIDE", v: "PRINT", letter: "R", hPos: 1, vPos: 1 },
	{ h: "SHIFT", v: "SHIRT", letter: "H", hPos: 1, vPos: 1 },
];

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

export function generateDailyPuzzle(date: string): Puzzle {
	const dateNum = Number.parseInt(date.replace(/-/g, ""));
	const rng = new SeededRandom(dateNum);

	// Select a word pair deterministically
	const pairIndex = rng.nextInt(GOOD_WORD_PAIRS.length);
	const pair = GOOD_WORD_PAIRS[pairIndex];

	const uniqueLetters = getUniqueLetters(pair.h, pair.v);
	const colorMap = generateColorMap(uniqueLetters, rng);

	return {
		puzzleId: dateNum,
		date,
		words: {
			horizontal: pair.h,
			vertical: pair.v,
		},
		intersection: {
			letter: pair.letter,
			horizontalIndex: pair.hPos,
			verticalIndex: pair.vPos,
		},
		uniqueLetters: uniqueLetters.map((l) => l.toUpperCase()),
		colorMap: Object.fromEntries(
			Object.entries(colorMap).map(([k, v]) => [k.toUpperCase(), v]),
		),
	};
}
