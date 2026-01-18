#!/usr/bin/env node
/**
 * Quick Performance Test
 * Runs only the 5000 URL test to verify optimizations
 */

const autocannon = require('autocannon');
const axios = require('axios');

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
};

function log(color, message) {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

const sampleUrls = [
  'https://picsum.photos',
  'https://placekitten.com',
  'https://loremflickr.com/640/480',
  'https://httpbin.org/html',
  'https://httpbin.org/image',
];

async function getStats() {
  try {
    const response = await axios.get('http://localhost:3001/stats');
    return response.data;
  } catch {
    return null;
  }
}

async function runQuickTest() {
  console.clear();
  log('bright', '\n╔════════════════════════════════════════════╗');
  log('bright', '║   QUICK PERFORMANCE VERIFICATION TEST      ║');
  log('bright', '╚════════════════════════════════════════════╝\n');

  // Health check
  log('blue', '🏥 Checking server health...');
  try {
    await axios.get('http://localhost:3001/stats', { timeout: 5000 });
    log('green', '✓ Server is healthy\n');
  } catch (error) {
    log('red', '✗ Server is not responding');
    log('yellow', 'Start the server: cd backend && npm run start:dev\n');
    process.exit(1);
  }

  const baselineStats = await getStats();
  const baselineCount = baselineStats ? baselineStats.total : 0;
  
  log('blue', '📤 Queueing 5000 URLs...');
  const startTime = Date.now();
  
  const result = await autocannon({
    url: 'http://localhost:3001/scrape',
    connections: 50,
    amount: 1000,
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      urls: [
        sampleUrls[0],
        sampleUrls[1],
        sampleUrls[2],
        sampleUrls[0],
        sampleUrls[1],
      ],
    }),
  });

  const queueingTime = ((Date.now() - startTime) / 1000).toFixed(2);
  const totalUrlsQueued = result.requests.total * 5;
  
  log('green', `✓ Queued ${totalUrlsQueued} URLs in ${queueingTime}s\n`);
  
  log('blue', '⏳ Monitoring processing (first 60 seconds)...\n');
  log('cyan', '  Time | Extracted | Rate (URLs/s) | Progress');
  console.log('  ' + '-'.repeat(50));
  
  let lastCount = baselineCount;
  const rates = [];
  
  for (let i = 1; i <= 30; i++) {
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const currentStats = await getStats();
    const currentCount = currentStats ? currentStats.total : lastCount;
    const extracted = currentCount - baselineCount;
    const rate = (currentCount - lastCount) / 2;
    const progress = ((extracted / totalUrlsQueued) * 100).toFixed(1);
    
    rates.push(rate);
    lastCount = currentCount;
    
    const status = extracted >= totalUrlsQueued * 0.95 ? '✓ Complete' : '🔄 Processing';
    console.log(
      `  ${String(i * 2).padStart(4)}s | ` +
      `${String(extracted).padStart(9)} | ` +
      `${String(rate.toFixed(1)).padStart(13)} | ` +
      `${progress}% ${status}`
    );
    
    if (extracted >= totalUrlsQueued * 0.95) {
      log('green', '\n✓ Processing complete!');
      break;
    }
  }
  
  const totalTime = ((Date.now() - startTime) / 1000).toFixed(2);
  const finalStats = await getStats();
  const processed = finalStats ? (finalStats.total - baselineCount) : 0;
  const avgRate = rates.length > 0 ? (rates.reduce((a, b) => a + b) / rates.length).toFixed(1) : '0';
  const maxRate = rates.length > 0 ? Math.max(...rates).toFixed(1) : '0';
  
  console.log('\n' + '='.repeat(60));
  log('bright', '  PERFORMANCE RESULTS');
  console.log('='.repeat(60));
  
  console.log(`\n${colors.cyan}Queueing:${colors.reset}`);
  console.log(`  • URLs queued: ${totalUrlsQueued}`);
  console.log(`  • Queueing time: ${queueingTime}s`);
  console.log(`  • Queueing rate: ${(totalUrlsQueued / queueingTime).toFixed(1)} URLs/s`);
  
  console.log(`\n${colors.cyan}Processing:${colors.reset}`);
  console.log(`  • URLs processed: ${processed}/${totalUrlsQueued}`);
  console.log(`  • Processing time: ${totalTime}s`);
  console.log(`  • Average rate: ${avgRate} URLs/s`);
  console.log(`  • Peak rate: ${maxRate} URLs/s`);
  console.log(`  • Success rate: ${((processed / totalUrlsQueued) * 100).toFixed(1)}%`);
  
  console.log(`\n${colors.cyan}Assessment:${colors.reset}`);
  
  if (parseFloat(avgRate) >= 50) {
    log('green', '  ✓ PASS: Average rate meets target (50+ URLs/s)');
  } else if (parseFloat(avgRate) >= 40) {
    log('yellow', '  ⚠️  CLOSE: Average rate near target (40-50 URLs/s)');
  } else {
    log('red', '  ✗ FAIL: Average rate below target (<40 URLs/s)');
  }
  
  if (parseFloat(maxRate) >= 80) {
    log('green', '  ✓ EXCELLENT: Peak rate is high (80+ URLs/s)');
  }
  
  if ((processed / totalUrlsQueued) >= 0.95) {
    log('green', '  ✓ PASS: High success rate (>95%)');
  }
  
  console.log(`\n${colors.cyan}Estimated Time for Full Load:${colors.reset}`);
  if (parseFloat(avgRate) > 0) {
    const timeFor5k = (5000 / parseFloat(avgRate) / 60).toFixed(1);
    const timeFor10k = (10000 / parseFloat(avgRate) / 60).toFixed(1);
    console.log(`  • 5,000 URLs: ~${timeFor5k} minutes`);
    console.log(`  • 10,000 URLs: ~${timeFor10k} minutes`);
  }
  
  console.log('\n' + '='.repeat(60));
  log('green', '\n✅ Quick test complete!\n');
  
  // Comparison with baseline
  console.log(`${colors.yellow}Optimization Target:${colors.reset}`);
  console.log('  • Before: 36.6 URLs/s average, 90 URLs/s peak');
  console.log('  • Target: 50+ URLs/s average');
  console.log(`  • Current: ${avgRate} URLs/s average, ${maxRate} URLs/s peak`);
  
  const improvement = ((parseFloat(avgRate) - 36.6) / 36.6 * 100).toFixed(1);
  if (parseFloat(improvement) > 0) {
    log('green', `  ✓ Improvement: +${improvement}%\n`);
  } else {
    log('yellow', `  ⚠️  Performance below baseline\n`);
  }
}

runQuickTest().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
