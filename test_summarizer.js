const { processArticles } = require('./research_summarizer');

async function testSummarizer() {
  // Test URLs - replace with actual research article URLs
  const testUrls = [
    'https://arxiv.org/abs/2401.00123',
    'https://www.sciencedaily.com/releases/2024/01/240101123456.htm',
    'https://www.nature.com/articles/s41586-024-00001-2'
  ];

  console.log('🧪 Testing Research Summarizer');
  console.log('='.repeat(40));
  
  try {
    const summaries = await processArticles(testUrls);
    
    console.log('\n📊 TEST RESULTS:');
    console.log('='.repeat(40));
    console.log(JSON.stringify(summaries, null, 2));
    
    console.log(`\n✅ Processed ${summaries.length} articles successfully`);
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run test if called directly
if (require.main === module) {
  testSummarizer();
}

module.exports = { testSummarizer }; 