const { fetchDailyResearchDigest } = require('./researchDigest');

async function testResearchDigest() {
  console.log('🧪 Testing Research Digest Functionality...\n');

  try {
    // Test 1: Basic functionality without Firestore
    console.log('📋 Test 1: Basic functionality (no Firestore)');
    const result1 = await fetchDailyResearchDigest({
      arxivCount: 2,
      scienceDailyCount: 1,
      storeInFirestore: false
    });

    console.log('✅ Test 1 Results:');
    console.log(`- Success: ${result1.success}`);
    console.log(`- Total Articles: ${result1.totalArticles}`);
    console.log(`- Sources: arXiv(${result1.sources?.arxiv || 0}), ScienceDaily(${result1.sources?.scienceDaily || 0})`);
    console.log(`- Stored in Firestore: ${result1.storedInFirestore}`);
    console.log('');

    // Test 2: Verify article structure
    console.log('📋 Test 2: Article structure validation');
    if (result1.articles && result1.articles.length > 0) {
      const article = result1.articles[0];
      const requiredFields = ['title', 'link', 'authors', 'publishedDate', 'summary', 'source', 'category'];
      const missingFields = requiredFields.filter(field => !article[field]);
      
      if (missingFields.length === 0) {
        console.log('✅ Article structure is valid');
        console.log(`- Sample article: "${article.title.substring(0, 50)}..."`);
        console.log(`- Source: ${article.source}`);
        console.log(`- Authors: ${article.authors.substring(0, 30)}...`);
      } else {
        console.log('❌ Missing fields:', missingFields);
      }
    } else {
      console.log('❌ No articles returned');
    }
    console.log('');

    // Test 3: Error handling
    console.log('📋 Test 3: Error handling test');
    try {
      // This should fail gracefully
      const result3 = await fetchDailyResearchDigest({
        arxivCount: -1, // Invalid count
        scienceDailyCount: -1
      });
      console.log('✅ Error handling works (graceful fallback)');
    } catch (error) {
      console.log('❌ Error handling failed:', error.message);
    }

    console.log('\n🎉 All tests completed!');
    
    // Summary
    console.log('\n📊 Summary:');
    console.log(`- Total articles fetched: ${result1.totalArticles}`);
    console.log(`- arXiv articles: ${result1.sources?.arxiv || 0}`);
    console.log(`- ScienceDaily articles: ${result1.sources?.scienceDaily || 0}`);
    console.log(`- Date: ${result1.date}`);
    
    if (result1.success) {
      console.log('\n✅ Research digest is working correctly!');
    } else {
      console.log('\n❌ Research digest encountered errors');
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

// Run the test
if (require.main === module) {
  testResearchDigest()
    .then(() => {
      console.log('\n✨ Test script completed successfully');
      process.exit(0);
    })
    .catch(error => {
      console.error('\n💥 Test script failed:', error);
      process.exit(1);
    });
}

module.exports = { testResearchDigest }; 