import mongoose from "mongoose";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { Problem } from "../models/Problem.model.js";

// Setup __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, "../../.env") });

const LEETCODE_JSON_PATH = path.join(
    __dirname,
    "../../../service/data/leetcode_problems.json"
);

async function importProblems() {
    try {
        console.log("🔌 Connecting to MongoDB...");
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("✅ Connected to MongoDB\n");

        // Read JSON file
        console.log("📖 Reading LeetCode problems JSON...");
        const jsonData = JSON.parse(fs.readFileSync(LEETCODE_JSON_PATH, "utf-8"));
        const problems = jsonData.problemsetQuestionList;
        console.log(`✅ Found ${problems.length} problems\n`);

        // Check if problems already exist
        const existingCount = await Problem.countDocuments();
        if (existingCount > 0) {
            console.log(`⚠️  Database already has ${existingCount} problems.`);
            
            // Check for --force flag
            const forceImport = process.argv.includes('--force');
            
            if (!forceImport) {
                console.log('Use --force flag to clear and re-import: node src/scripts/importLeetcodeProblems.js --force');
                console.log("❌ Import cancelled");
                process.exit(0);
            }

            console.log("🗑️  Clearing existing problems...");
            await Problem.deleteMany({});
            console.log("✅ Cleared\n");
        }

        // Transform and import problems
        console.log("🔄 Transforming and importing problems...");
        let imported = 0;
        let failed = 0;
        const batchSize = 100;

        for (let i = 0; i < problems.length; i += batchSize) {
            const batch = problems.slice(i, i + batchSize);
            const transformedBatch = batch.map((problem) => {
                // Extract tags
                const tags = problem.topicTags
                    ? problem.topicTags.map((tag) => tag.name)
                    : [];

                // Create a basic description from title and tags
                const description = `${problem.title}\n\nDifficulty: ${problem.difficulty}\nAcceptance Rate: ${problem.acRate?.toFixed(2)}%\nTags: ${tags.join(", ")}`;

                return {
                    leetcodeId: problem.questionFrontendId,
                    titleSlug: problem.titleSlug,
                    title: problem.title,
                    description: description,
                    difficulty: problem.difficulty,
                    tags: tags,
                    constraints: "",
                    examples: [],
                    testCases: [],
                    starterCode: {
                        javascript: "",
                        python: "",
                        java: "",
                        cpp: "",
                        c: "",
                    },
                    totalSubmissions: 0,
                    successfulSubmissions: 0,
                    timeLimit: 2,
                    memoryLimit: 128,
                    isActive: true,
                };
            });

            try {
                await Problem.insertMany(transformedBatch, { ordered: false });
                imported += transformedBatch.length;
                console.log(
                    `✅ Imported batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(problems.length / batchSize)} (${imported} problems)`
                );
            } catch (error) {
                if (error.code === 11000) {
                    // Duplicate key error
                    imported += transformedBatch.length - error.writeErrors?.length || 0;
                    failed += error.writeErrors?.length || 0;
                    console.log(
                        `⚠️  Batch ${Math.floor(i / batchSize) + 1}: ${error.writeErrors?.length || 0} duplicates skipped`
                    );
                } else {
                    console.error(`❌ Error in batch ${Math.floor(i / batchSize) + 1}:`, error.message);
                    failed += transformedBatch.length;
                }
            }
        }

        console.log("\n📊 Import Summary:");
        console.log(`✅ Successfully imported: ${imported} problems`);
        console.log(`❌ Failed: ${failed} problems`);
        console.log(`📈 Total in database: ${await Problem.countDocuments()}`);

        // Create indexes
        console.log("\n🔍 Creating indexes...");
        await Problem.createIndexes();
        console.log("✅ Indexes created");

        console.log("\n🎉 Import completed!");
    } catch (error) {
        console.error("❌ Error:", error);
    } finally {
        await mongoose.connection.close();
        console.log("\n👋 Disconnected from MongoDB");
        process.exit(0);
    }
}

// Run the import
importProblems();
