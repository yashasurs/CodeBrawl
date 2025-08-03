import axios from 'axios';

export const fetchLeetCodeUserData = async (username) => {
    try {
        // Using alfa-leetcode-api for better data structure and reliability
        const response = await axios.get(`https://alfa-leetcode-api.onrender.com/${username}`);
        
        if (response.data) {
            return response.data;
        }
        
        return null;
    } catch (error) {
        console.error(`Error fetching LeetCode data for ${username}:`, error.message);
        return null;
    }
};


export const calculateEloFromLeetCode = (leetcodeData) => {
    const baseElo = 1200; // Default ELO
    
    if (!leetcodeData) {
        return baseElo;
    }

    let calculatedElo = baseElo;
    
    try {
        // Get contest data if available (alfa-leetcode-api format)
        const contestData = leetcodeData.contestInfo || leetcodeData.contest;
        
        if (contestData && contestData.contestRating && contestData.contestRating > 0) {
            // If user has contest rating, map it to our ELO system
            const contestRating = contestData.contestRating;
            
            // LeetCode contest ratings typically range from 1000-3000+
            // Map to our ELO range (800-2500)
            if (contestRating >= 2500) {
                calculatedElo = 2200; // Diamond tier
            } else if (contestRating >= 2000) {
                calculatedElo = 1800; // Platinum tier
            } else if (contestRating >= 1600) {
                calculatedElo = 1500; // Gold tier
            } else if (contestRating >= 1400) {
                calculatedElo = 1300; // Silver tier
            } else if (contestRating >= 1200) {
                calculatedElo = 1100; // Bronze tier
            } else {
                calculatedElo = 900; // Below bronze
            }
        } else {
            // If no contest rating, calculate based on problems solved
            // alfa-leetcode-api typically returns solvedProblem or totalSolved
            const totalSolved = leetcodeData.totalSolved || leetcodeData.solvedProblem || 0;
            const easySolved = leetcodeData.easySolved || leetcodeData.easy || 0;
            const mediumSolved = leetcodeData.mediumSolved || leetcodeData.medium || 0;
            const hardSolved = leetcodeData.hardSolved || leetcodeData.hard || 0;
            
            // Calculate weighted score based on problem difficulty
            const weightedScore = (easySolved * 1) + (mediumSolved * 3) + (hardSolved * 6);
            
            // Map weighted score to ELO
            if (weightedScore >= 500) {
                calculatedElo = 2000; // Platinum
            } else if (weightedScore >= 300) {
                calculatedElo = 1700; // High Gold
            } else if (weightedScore >= 150) {
                calculatedElo = 1400; // Gold
            } else if (weightedScore >= 75) {
                calculatedElo = 1200; // Silver
            } else if (weightedScore >= 30) {
                calculatedElo = 1000; // Bronze
            } else if (totalSolved >= 10) {
                calculatedElo = 900; // Beginner with some experience
            }
        }
        
        // Additional bonus for acceptance rate (if available)
        const acceptanceRate = leetcodeData.acceptanceRate || leetcodeData.acceptance;
        if (acceptanceRate && acceptanceRate > 60) {
            calculatedElo += Math.floor((acceptanceRate - 60) * 2); // Bonus for high acceptance rate
        }
        
        // Ensure ELO is within reasonable bounds
        calculatedElo = Math.max(800, Math.min(2500, calculatedElo));
        
    } catch (error) {
        console.error('Error calculating ELO from LeetCode data:', error);
        return baseElo;
    }
    
    return Math.floor(calculatedElo);
};

/**
 * Get initial ELO rating for a user based on LeetCode username
 * @param {string} leetcodeUsername - LeetCode username
 * @returns {number} Initial ELO rating
 */
export const getInitialEloRating = async (leetcodeUsername) => {
    if (!leetcodeUsername || leetcodeUsername.trim() === '') {
        return 1200; // Default ELO for users without LeetCode
    }
    
    try {
        const leetcodeData = await fetchLeetCodeUserData(leetcodeUsername.trim());
        return calculateEloFromLeetCode(leetcodeData);
    } catch (error) {
        console.error('Error getting initial ELO rating:', error);
        return 1200; // Return default on error
    }
};
