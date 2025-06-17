import * as fs from "node:fs";
import * as path from "node:path";

// Type definitions
interface IntersectionAnalysis {
	word1: string;
	word2: string;
	letter: string;
	pos1: number;
	pos2: number;
	isMiddle1: boolean;
	isMiddle2: boolean;
	bothMiddle: boolean;
}

// Load word list
let WORD_LIST: string[] = [];
try {
	const wordListPath = path.join(process.cwd(), "data/wordlists/words.txt");
	WORD_LIST = fs
		.readFileSync(wordListPath, "utf-8")
		.trim()
		.split("\n")
		.map((word) => word.toLowerCase().trim());
} catch (error) {
	WORD_LIST = ["about", "water", "board", "round", "table"];
}

// Find all possible intersections
function findAllIntersections(wordList: string[]): IntersectionAnalysis[] {
	const intersections: IntersectionAnalysis[] = [];

	for (const word1 of wordList) {
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
							pos1,
							pos2,
							isMiddle1: pos1 >= 1 && pos1 <= 3, // Middle positions (1, 2, 3)
							isMiddle2: pos2 >= 1 && pos2 <= 3,
							bothMiddle: pos1 >= 1 && pos1 <= 3 && pos2 >= 1 && pos2 <= 3,
						});
					}
				}
			}
		}
	}

	return intersections;
}

// Analyze intersection patterns
function analyzeIntersections(intersections: IntersectionAnalysis[]) {
	const total = intersections.length;
	const edgeIntersections = intersections.filter(
		(i) => !i.isMiddle1 || !i.isMiddle2,
	);
	const middleIntersections = intersections.filter((i) => i.bothMiddle);
	const oneMiddleIntersections = intersections.filter(
		(i) => i.isMiddle1 || i.isMiddle2,
	);

	// Position frequency analysis
	const positionCombos: Record<string, number> = {};
	for (const intersection of intersections) {
		const key = `${intersection.pos1}-${intersection.pos2}`;
		positionCombos[key] = (positionCombos[key] || 0) + 1;
	}

	// Letter frequency analysis
	const letterFreq: Record<string, number> = {};
	for (const intersection of intersections) {
		letterFreq[intersection.letter] =
			(letterFreq[intersection.letter] || 0) + 1;
	}

	return {
		total,
		edgeCount: edgeIntersections.length,
		middleCount: middleIntersections.length,
		oneMiddleCount: oneMiddleIntersections.length,
		edgePercent: Math.round((edgeIntersections.length / total) * 100),
		middlePercent: Math.round((middleIntersections.length / total) * 100),
		oneMiddlePercent: Math.round((oneMiddleIntersections.length / total) * 100),
		positionCombos: Object.entries(positionCombos)
			.sort(([, a], [, b]) => (b as number) - (a as number))
			.slice(0, 10),
		topLetters: Object.entries(letterFreq)
			.sort(([, a], [, b]) => (b as number) - (a as number))
			.slice(0, 10),
		sampleMiddleIntersections: middleIntersections.slice(0, 20).map((i) => ({
			words: `${i.word1.toUpperCase()} / ${i.word2.toUpperCase()}`,
			letter: i.letter.toUpperCase(),
			positions: `${i.pos1}-${i.pos2}`,
		})),
	};
}

// Get unique letter counts for middle intersections
function analyzeUniqueLetters(intersections: IntersectionAnalysis[]) {
	const middleIntersections = intersections.filter((i) => i.bothMiddle);

	const uniqueLetterCounts: Record<number, number> = {};
	const samples: Array<{
		words: string;
		letter: string;
		positions: string;
		uniqueCount: number;
		letters: string;
	}> = [];

	for (const intersection of middleIntersections) {
		const uniqueLetters = Array.from(
			new Set([
				...intersection.word1.split(""),
				...intersection.word2.split(""),
			]),
		);
		const count = uniqueLetters.length;

		uniqueLetterCounts[count] = (uniqueLetterCounts[count] || 0) + 1;

		if (samples.length < 50) {
			samples.push({
				words: `${intersection.word1.toUpperCase()} / ${intersection.word2.toUpperCase()}`,
				letter: intersection.letter.toUpperCase(),
				positions: `${intersection.pos1}-${intersection.pos2}`,
				uniqueCount: count,
				letters: uniqueLetters
					.sort()
					.map((l) => l.toUpperCase())
					.join(""),
			});
		}
	}

	return {
		distribution: Object.entries(uniqueLetterCounts).sort(
			([a], [b]) => Number.parseInt(a) - Number.parseInt(b),
		),
		samples: samples.sort((a, b) => b.uniqueCount - a.uniqueCount),
	};
}

export async function GET() {
	console.log(`Analyzing ${WORD_LIST.length} words...`);

	const allIntersections = findAllIntersections(WORD_LIST);
	const analysis = analyzeIntersections(allIntersections);
	const uniqueLetterAnalysis = analyzeUniqueLetters(allIntersections);

	return new Response(
		JSON.stringify(
			{
				wordListSize: WORD_LIST.length,
				intersectionAnalysis: analysis,
				uniqueLetterAnalysis,
				conclusions: {
					totalPossibleIntersections: analysis.total,
					middleOnlyIntersections: analysis.middleCount,
					reductionFactor:
						Math.round((analysis.total / analysis.middleCount) * 10) / 10,
					recommendation:
						analysis.middleCount > 10000
							? "Plenty of middle intersections available - recommend using middle-only"
							: "Limited middle intersections - consider mixed approach",
				},
			},
			null,
			2,
		),
		{
			status: 200,
			headers: { "Content-Type": "application/json" },
		},
	);
}
