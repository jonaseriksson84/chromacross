#!/usr/bin/env node

// ChromaCross Analytics Viewer
// Run with: node scripts/view-analytics.cjs

const https = require('https');

function fetchAnalytics() {
  return new Promise((resolve, reject) => {
    const req = https.get('https://chromacross.app/api/get-analytics', (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (error) {
          reject(error);
        }
      });
    });
    req.on('error', reject);
  });
}

function formatDate(timestamp) {
  return new Date(timestamp).toLocaleDateString();
}

async function main() {
  console.log('📊 ChromaCross Analytics Dashboard\n');
  
  try {
    const data = await fetchAnalytics();
    
    if (data.error) {
      console.log('❌ Error:', data.error);
      return;
    }
    
    const { summary, guessDistribution, dailyStats } = data;
    
    // Overall Summary
    console.log('📈 OVERALL STATISTICS');
    console.log('=' .repeat(50));
    console.log(`Total Games:      ${summary.totalGames}`);
    console.log(`Win Rate:         ${summary.winRate}% (${summary.wins}W / ${summary.losses}L)`);
    console.log(`Avg Guesses:      ${summary.avgGuesses}`);
    console.log(`Avg Incorrect:    ${summary.avgIncorrect}\n`);
    
    // Guess Distribution
    console.log('🎯 GUESS DISTRIBUTION');
    console.log('=' .repeat(50));
    Object.entries(guessDistribution)
      .sort(([a], [b]) => parseInt(a) - parseInt(b))
      .forEach(([guesses, count]) => {
        const bar = '█'.repeat(Math.max(1, Math.round(count * 10 / summary.totalGames)));
        console.log(`${guesses.padStart(2)} guesses: ${count.toString().padStart(2)} games ${bar}`);
      });
    console.log();
    
    // Daily Stats
    console.log('📅 DAILY STATISTICS');
    console.log('=' .repeat(50));
    console.log('Date'.padEnd(12) + 'Games'.padEnd(8) + 'Win%'.padEnd(8) + 'Avg Guesses');
    console.log('-'.repeat(36));
    
    Object.entries(dailyStats)
      .sort(([a], [b]) => b.localeCompare(a)) // Most recent first
      .forEach(([date, stats]) => {
        console.log(
          date.padEnd(12) + 
          stats.games.toString().padEnd(8) + 
          `${stats.winRate}%`.padEnd(8) + 
          stats.avgGuesses
        );
      });
    console.log();
    
    console.log('\n💡 To view raw data: curl https://chromacross.app/api/get-analytics');
    
  } catch (error) {
    console.error('❌ Failed to fetch analytics:', error.message);
    console.log('\n💡 Make sure the game is deployed and accessible at chromacross.app');
  }
}

main();