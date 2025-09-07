import mongoose, { Schema } from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { getInitialEloRating } from "../utils/leetcodeUtils.js";

const userSchema = new Schema(
    {
        username: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            index: true,
            minlength: 3,
            maxlength: 20
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        fullName: {
            type: String,
            required: true,
            trim: true,
            index: true
        },
        avatar: {
            type: String, 
            default: ""
        },
        leetcodeUsername: {
            type: String,
            trim: true,
            default: ""
        },
        password: {
            type: String,
            required: [true, 'Password is required'],
            minlength: 6
        },
        refreshToken: {
            type: String
        },
        eloRating: {
            type: Number,
            default: 1200
        },
        totalMatches: {
            type: Number,
            default: 0
        },
        wins: {
            type: Number,
            default: 0
        },
        losses: {
            type: Number,
            default: 0
        },
        winStreak: {
            type: Number,
            default: 0
        },
        longestWinStreak: {
            type: Number,
            default: 0
        },
        problemsSolved: {
            type: Number,
            default: 0
        },
        practiceProblemsSolved: {
            type: Number,
            default: 0
        },
        country: {
            type: String,
            default: "🌍"
        },
        tier: {
            type: String,
            default: "Novice"
        },
        globalRank: {
            type: Number,
            default: null
        },
        achievements: [{
            id: String,
            title: String,
            description: String,
            icon: String,
            unlocked: {
                type: Boolean,
                default: false
            },
            unlockedAt: {
                type: Date,
                default: null
            }
        }],
        languageStats: [{
            language: String,
            problemsSolved: {
                type: Number,
                default: 0
            },
            timeSpent: {
                type: Number,
                default: 0
            }
        }],
        practiceStats: {
            easy: {
                solved: {
                    type: Number,
                    default: 0
                },
                total: {
                    type: Number,
                    default: 60
                }
            },
            medium: {
                solved: {
                    type: Number,
                    default: 0
                },
                total: {
                    type: Number,
                    default: 80
                }
            },
            hard: {
                solved: {
                    type: Number,
                    default: 0
                },
                total: {
                    type: Number,
                    default: 70
                }
            }
        },
        preferredLanguage: {
            type: String,
            default: "cpp"
        },
        isOnline: {
            type: Boolean,
            default: false
        },
        lastActive: {
            type: Date,
            default: Date.now
        }
    },
    {
        timestamps: true
    }
);

userSchema.pre("save", async function (next) {
    if(!this.isModified("password")) return next();

    this.password = await bcrypt.hash(this.password, 10)
    next()
})

// Pre-save middleware to calculate initial ELO rating based on LeetCode data
userSchema.pre("save", async function (next) {
    // Only calculate ELO for new users with LeetCode username
    if (this.isNew && this.leetcodeUsername && this.leetcodeUsername.trim() !== '') {
        try {
            console.log(`Calculating initial ELO for user ${this.username} based on LeetCode profile: ${this.leetcodeUsername}`);
            const calculatedElo = await getInitialEloRating(this.leetcodeUsername);
            this.eloRating = calculatedElo;
            console.log(`Initial ELO set to ${calculatedElo} for user ${this.username}`);
        } catch (error) {
            console.error(`Error calculating ELO for ${this.username}:`, error);
            // Keep default ELO on error
        }
    }
    next();
});

userSchema.methods.isPasswordCorrect = async function(password){
    return await bcrypt.compare(password, this.password)
}

userSchema.methods.generateAccessToken = function(){
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            username: this.username,
            fullName: this.fullName
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}

userSchema.methods.generateRefreshToken = function(){
    return jwt.sign(
        {
            _id: this._id,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}

// Method to update ELO rating based on LeetCode profile
userSchema.methods.updateEloFromLeetCode = async function() {
    if (!this.leetcodeUsername || this.leetcodeUsername.trim() === '') {
        throw new Error('LeetCode username is required to update ELO rating');
    }
    
    try {
        console.log(`Updating ELO for user ${this.username} based on LeetCode profile: ${this.leetcodeUsername}`);
        const calculatedElo = await getInitialEloRating(this.leetcodeUsername);
        
        // Only update if the calculated ELO is higher than current (to prevent rating drops)
        if (calculatedElo > this.eloRating) {
            const oldElo = this.eloRating;
            this.eloRating = calculatedElo;
            console.log(`ELO updated from ${oldElo} to ${calculatedElo} for user ${this.username}`);
            return { updated: true, oldElo, newElo: calculatedElo };
        } else {
            console.log(`No ELO update needed for user ${this.username}. Current: ${this.eloRating}, Calculated: ${calculatedElo}`);
            return { updated: false, currentElo: this.eloRating, calculatedElo };
        }
    } catch (error) {
        console.error(`Error updating ELO for ${this.username}:`, error);
        throw error;
    }
};

// Calculate win rate
userSchema.virtual('winRate').get(function() {
    if (this.totalMatches === 0) return 0;
    return Math.round((this.wins / this.totalMatches) * 100);
});

// Calculate tier based on ELO rating
userSchema.virtual('calculatedTier').get(function() {
    if (this.eloRating < 800) return 'Novice';
    if (this.eloRating < 1200) return 'Apprentice';
    if (this.eloRating < 1600) return 'Specialist';
    if (this.eloRating < 2000) return 'Expert';
    if (this.eloRating < 2400) return 'Master';
    return 'Grandmaster';
});

// Get favorite programming language
userSchema.virtual('favoriteLanguage').get(function() {
    if (!this.languageStats || this.languageStats.length === 0) {
        return this.preferredLanguage || 'cpp';
    }
    
    const mostUsed = this.languageStats.reduce((prev, current) => 
        (prev.problemsSolved > current.problemsSolved) ? prev : current
    );
    
    return mostUsed.language;
});

// Calculate practice stats percentages
userSchema.virtual('practiceStatsWithPercentages').get(function() {
    const stats = this.practiceStats || {
        easy: { solved: 0, total: 60 },
        medium: { solved: 0, total: 80 },
        hard: { solved: 0, total: 70 }
    };
    
    return {
        easy: {
            solved: stats.easy.solved,
            total: stats.easy.total,
            percentage: stats.easy.total > 0 ? Math.round((stats.easy.solved / stats.easy.total) * 100) : 0
        },
        medium: {
            solved: stats.medium.solved,
            total: stats.medium.total,
            percentage: stats.medium.total > 0 ? Math.round((stats.medium.solved / stats.medium.total) * 100) : 0
        },
        hard: {
            solved: stats.hard.solved,
            total: stats.hard.total,
            percentage: stats.hard.total > 0 ? Math.round((stats.hard.solved / stats.hard.total) * 100) : 0
        }
    };
});

// Ensure virtual fields are included in JSON output
userSchema.set('toJSON', { virtuals: true });
userSchema.set('toObject', { virtuals: true });

export const User = mongoose.model("User", userSchema);
