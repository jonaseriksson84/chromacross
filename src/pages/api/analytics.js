export const prerender = false;

export async function POST(context) {
  try {
    const { request, locals } = context;
    const data = await request.json();
    
    // Validate required fields
    const { puzzleId, outcome, totalGuesses, incorrectGuesses, guessSequence, timestamp } = data;
    
    if (!puzzleId || !outcome || typeof totalGuesses !== 'number') {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Access Cloudflare KV through runtime
    const { env } = locals.runtime;
    const analyticsKV = env.ANALYTICS_KV;
    
    if (!analyticsKV) {
      console.warn('Analytics KV namespace not available');
      return new Response(JSON.stringify({ success: true, debug: 'KV not available' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Create a unique key for this analytics record
    const recordKey = `analytics:${puzzleId}:${timestamp}:${Math.random().toString(36).substr(2, 9)}`;
    
    // Prepare analytics data
    const analyticsData = {
      puzzleId,
      outcome,
      totalGuesses,
      incorrectGuesses,
      guessSequence,
      timestamp,
      userAgent: request.headers.get('user-agent'),
      createdAt: new Date().toISOString()
    };
    
    // Store the analytics data in KV
    await analyticsKV.put(recordKey, JSON.stringify(analyticsData));

    return new Response(JSON.stringify({ success: true, stored: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Analytics error:', error);
    
    // Always return success to avoid blocking the game
    return new Response(JSON.stringify({ 
      success: true, 
      error: error.message,
      debug: 'Exception caught' 
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}