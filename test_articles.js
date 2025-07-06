const { processArticles } = require('./article_summarizer');

async function testArticles() {
  // Custom test URLs - replace with your actual article URLs
  const testUrls = [
    'https://arxiv.org/abs/2401.00123',
    'https://www.sciencedaily.com/releases/2024/01/240101123456.htm'
  ];

  console.log('🧪 Testing Article Summarizer');
  console.log('='.repeat(40));
  
  try {
    const results = await processArticles(testUrls);
    
    console.log('\n📊 TEST RESULTS:');
    console.log('='.repeat(40));
    console.log(JSON.stringify(results, null, 2));
    
    console.log(`\n✅ Processed ${results.length} articles successfully`);
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run test if called directly
if (require.main === module) {
  testArticles();
}

module.exports = { testArticles }; 