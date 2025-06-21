export const prerender = false;

export async function GET(context) {
  try {
    const { locals } = context;
    const { env } = locals.runtime;
    const analyticsKV = env.ANALYTICS_KV;
    
    if (!analyticsKV) {
      return new Response(JSON.stringify({ error: 'KV not available' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Get all analytics keys
    const keys = await analyticsKV.list({ prefix: "analytics:" });
    
    // Fetch all data
    const promises = keys.keys.map(async (key) => {
      const data = await analyticsKV.get(key.name);
      return data ? JSON.parse(data) : null;
    });
    
    const analytics = (await Promise.all(promises)).filter(Boolean);
    
    // Sort by timestamp (newest first)
    analytics.sort((a, b) => b.timestamp - a.timestamp);
    
    // Calculate overall stats
    const totalGames = analytics.length;
    const wins = analytics.filter(d => d.outcome === 'won').length;
    const losses = analytics.filter(d => d.outcome === 'lost').length;
    const winRate = totalGames > 0 ? ((wins / totalGames) * 100).toFixed(1) : 0;
    
    const avgGuesses = totalGames > 0 ? 
      (analytics.reduce((sum, d) => sum + d.totalGuesses, 0) / totalGames).toFixed(1) : 0;
    
    const avgIncorrect = totalGames > 0 ? 
      (analytics.reduce((sum, d) => sum + d.incorrectGuesses, 0) / totalGames).toFixed(1) : 0;
    
    // Guess distribution
    const guessDistribution = {};
    analytics.forEach(game => {
      const guesses = game.totalGuesses;
      guessDistribution[guesses] = (guessDistribution[guesses] || 0) + 1;
    });
    
    // Daily stats
    const dailyStats = {};
    analytics.forEach(game => {
      const date = new Date(game.timestamp).toISOString().split('T')[0];
      if (!dailyStats[date]) {
        dailyStats[date] = { games: 0, wins: 0, totalGuesses: 0 };
      }
      dailyStats[date].games++;
      if (game.outcome === 'won') dailyStats[date].wins++;
      dailyStats[date].totalGuesses += game.totalGuesses;
    });
    
    // Calculate daily averages
    Object.keys(dailyStats).forEach(date => {
      const day = dailyStats[date];
      day.winRate = ((day.wins / day.games) * 100).toFixed(1);
      day.avgGuesses = (day.totalGuesses / day.games).toFixed(1);
    });
    
    return new Response(JSON.stringify({
      summary: {
        totalGames,
        wins,
        losses,
        winRate: parseFloat(winRate),
        avgGuesses: parseFloat(avgGuesses),
        avgIncorrect: parseFloat(avgIncorrect)
      },
      guessDistribution,
      dailyStats
    }, null, 2), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}