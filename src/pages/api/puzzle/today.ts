export async function GET() {
  // For now, return the same hardcoded puzzle that was in index.astro
  // Later this will be replaced with the algorithm-generated daily puzzle
  const puzzle = {
    puzzleId: Math.floor(Date.now() / (1000 * 60 * 60 * 24)), // Daily ID based on days since epoch
    date: new Date().toISOString().split('T')[0], // YYYY-MM-DD format
    words: { horizontal: "WATER", vertical: "LEMON" },
    intersection: { letter: "E", horizontalIndex: 3, verticalIndex: 1 },
    uniqueLetters: ["W", "A", "T", "E", "R", "L", "M", "O", "N"],
    colorMap: {
      W: "#4a90e2",
      A: "#7ed321", 
      T: "#f5a623",
      E: "#bd10e0",
      R: "#d0021b",
      L: "#f8e71c",
      M: "#50e3c2",
      O: "#9013fe",
      N: "#b8e986",
    },
  };

  return new Response(JSON.stringify(puzzle), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=3600' // Cache for 1 hour
    }
  });
}