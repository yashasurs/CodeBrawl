/**
 * Utility functions for working with LeetCode problems data
 */

import fs from 'fs/promises';
import path from 'path';

const LEETCODE_DATA_PATH = path.join(process.cwd(), '../service/data/leetcode_problems.json');

export class LeetCodeDataUtils {
    
    static async loadProblemsData() {
        try {
            const data = await fs.readFile(LEETCODE_DATA_PATH, 'utf8');
            const dataset = JSON.parse(data);
            return dataset.problemsetQuestionList || [];
        } catch (error) {
            console.error('Error loading LeetCode problems data:', error);
            return [];
        }
    }

    static async getRandomProblem(difficulty = null) {
        const problems = await this.loadProblemsData();
        
        let filteredProblems = problems;
        if (difficulty) {
            filteredProblems = problems.filter(p => p.difficulty === difficulty);
        }

        if (filteredProblems.length === 0) {
            return null;
        }

        const randomIndex = Math.floor(Math.random() * filteredProblems.length);
        return this.transformProblemData(filteredProblems[randomIndex]);
    }

    static async getProblemById(leetcodeId) {
        const problems = await this.loadProblemsData();
        const problem = problems.find(p => p.questionFrontendId === leetcodeId);
        return problem ? this.transformProblemData(problem) : null;
    }

    static async getProblemsByDifficulty(difficulty, limit = 20) {
        const problems = await this.loadProblemsData();
        const filteredProblems = problems.filter(p => p.difficulty === difficulty);
        
        // Shuffle and limit
        const shuffled = filteredProblems.sort(() => 0.5 - Math.random());
        return shuffled.slice(0, limit).map(p => this.transformProblemData(p));
    }

    static async getProblemsByTags(tags, limit = 20) {
        const problems = await this.loadProblemsData();
        const filteredProblems = problems.filter(p => {
            const problemTags = p.topicTags?.map(tag => tag.name.toLowerCase()) || [];
            return tags.some(tag => problemTags.includes(tag.toLowerCase()));
        });

        const shuffled = filteredProblems.sort(() => 0.5 - Math.random());
        return shuffled.slice(0, limit).map(p => this.transformProblemData(p));
    }

    static async searchProblems(query, limit = 20) {
        const problems = await this.loadProblemsData();
        const filteredProblems = problems.filter(p => 
            p.title?.toLowerCase().includes(query.toLowerCase()) ||
            p.titleSlug?.toLowerCase().includes(query.toLowerCase())
        );

        return filteredProblems.slice(0, limit).map(p => this.transformProblemData(p));
    }

    /**
     * Transform raw LeetCode problem data to our application format
     */
    static transformProblemData(rawProblem) {
        if (!rawProblem) return null;

        const tags = rawProblem.topicTags?.map(tag => tag.name) || [];

        return {
            leetcodeId: rawProblem.questionFrontendId,
            title: rawProblem.title,
            titleSlug: rawProblem.titleSlug,
            difficulty: rawProblem.difficulty,
            acceptanceRate: rawProblem.acRate || 0,
            tags: tags,
            topicTags: rawProblem.topicTags || []
        };
    }

    /**
     * Get statistics about the problems dataset
     */
    static async getDatasetStats() {
        const problems = await this.loadProblemsData();
        
        const stats = {
            total: problems.length,
            byDifficulty: {
                Easy: problems.filter(p => p.difficulty === 'Easy').length,
                Medium: problems.filter(p => p.difficulty === 'Medium').length,
                Hard: problems.filter(p => p.difficulty === 'Hard').length
            },
            byAcceptanceRate: {
                high: problems.filter(p => (p.acRate || 0) >= 70).length,
                medium: problems.filter(p => (p.acRate || 0) >= 40 && (p.acRate || 0) < 70).length,
                low: problems.filter(p => (p.acRate || 0) < 40).length
            },
            topTags: this.getTopTags(problems, 10)
        };

        return stats;
    }

    /**
     * Get the most common tags
     */
    static getTopTags(problems, limit = 10) {
        const tagCounts = {};
        
        problems.forEach(problem => {
            if (problem.topicTags) {
                problem.topicTags.forEach(tag => {
                    tagCounts[tag.name] = (tagCounts[tag.name] || 0) + 1;
                });
            }
        });

        return Object.entries(tagCounts)
            .sort(([,a], [,b]) => b - a)
            .slice(0, limit)
            .map(([tag, count]) => ({ tag, count }));
    }

    /**
     * Validate if a problem exists in the dataset
     */
    static async validateProblem(leetcodeId) {
        const problem = await this.getProblemById(leetcodeId);
        return problem !== null;
    }
}

export default LeetCodeDataUtils;