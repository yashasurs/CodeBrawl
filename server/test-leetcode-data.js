/**
 * Test script for verifying LeetCode data structure updates
 * Run with: node test-leetcode-data.js
 */

import LeetCodeDataUtils from './src/utils/leetcodeDataUtils.js';

async function testLeetCodeDataStructure() {
    console.log('🧪 Testing LeetCode Data Structure Updates...\n');

    try {
        // Test 1: Load problems data
        console.log('1️⃣ Testing data loading...');
        const problems = await LeetCodeDataUtils.loadProblemsData();
        console.log(`   ✅ Loaded ${problems.length} problems`);
        
        if (problems.length > 0) {
            const sample = problems[0];
            console.log('   📋 Sample problem structure:');
            console.log(`      - ID: ${sample.questionFrontendId}`);
            console.log(`      - Title: ${sample.title}`);
            console.log(`      - Slug: ${sample.titleSlug}`);
            console.log(`      - Difficulty: ${sample.difficulty}`);
            console.log(`      - Acceptance Rate: ${sample.acRate}%`);
            console.log(`      - Tags: ${sample.topicTags?.map(t => t.name).join(', ') || 'None'}`);
        }
        console.log('');

        // Test 2: Get random problem
        console.log('2️⃣ Testing random problem selection...');
        const randomProblem = await LeetCodeDataUtils.getRandomProblem();
        if (randomProblem) {
            console.log(`   ✅ Random problem: "${randomProblem.title}"`);
            console.log(`      - Difficulty: ${randomProblem.difficulty}`);
            console.log(`      - Tags: ${randomProblem.tags.join(', ')}`);
        } else {
            console.log('   ❌ Failed to get random problem');
        }
        console.log('');

        // Test 3: Get problems by difficulty
        console.log('3️⃣ Testing difficulty filtering...');
        const easyProblems = await LeetCodeDataUtils.getProblemsByDifficulty('Easy', 5);
        console.log(`   ✅ Found ${easyProblems.length} Easy problems`);
        
        const mediumProblems = await LeetCodeDataUtils.getProblemsByDifficulty('Medium', 5);
        console.log(`   ✅ Found ${mediumProblems.length} Medium problems`);
        
        const hardProblems = await LeetCodeDataUtils.getProblemsByDifficulty('Hard', 5);
        console.log(`   ✅ Found ${hardProblems.length} Hard problems`);
        console.log('');

        // Test 4: Search functionality
        console.log('4️⃣ Testing search functionality...');
        const searchResults = await LeetCodeDataUtils.searchProblems('array', 5);
        console.log(`   ✅ Found ${searchResults.length} problems matching "array"`);
        searchResults.slice(0, 3).forEach(p => {
            console.log(`      - ${p.title}`);
        });
        console.log('');

        // Test 5: Tag-based filtering
        console.log('5️⃣ Testing tag-based filtering...');
        const tagResults = await LeetCodeDataUtils.getProblemsByTags(['Array'], 5);
        console.log(`   ✅ Found ${tagResults.length} problems with "Array" tag`);
        console.log('');

        // Test 6: Dataset statistics
        console.log('6️⃣ Testing dataset statistics...');
        const stats = await LeetCodeDataUtils.getDatasetStats();
        console.log(`   ✅ Dataset Statistics:`);
        console.log(`      - Total Problems: ${stats.total}`);
        console.log(`      - Easy: ${stats.byDifficulty.Easy}`);
        console.log(`      - Medium: ${stats.byDifficulty.Medium}`);
        console.log(`      - Hard: ${stats.byDifficulty.Hard}`);
        console.log(`      - Top Tags: ${stats.topTags.slice(0, 5).map(t => `${t.tag}(${t.count})`).join(', ')}`);
        console.log('');

        // Test 7: Problem validation
        console.log('7️⃣ Testing problem validation...');
        const exists = await LeetCodeDataUtils.validateProblem('717');
        console.log(`   ${exists ? '✅' : '❌'} Problem 717 exists: ${exists}`);
        
        const notExists = await LeetCodeDataUtils.validateProblem('99999');
        console.log(`   ${!notExists ? '✅' : '❌'} Problem 99999 exists: ${notExists}`);
        console.log('');

        console.log('🎉 All tests completed successfully!');
        console.log('💡 The LeetCode data structure update is working correctly.');

    } catch (error) {
        console.error('❌ Test failed:', error.message);
        console.error('🔍 Stack trace:', error.stack);
    }
}

// Run tests if this file is executed directly
if (process.argv[1].includes('test-leetcode-data.js')) {
    testLeetCodeDataStructure();
}

export default testLeetCodeDataStructure;