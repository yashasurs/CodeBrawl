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
        matchesWon: {
            type: Number,
            default: 0
        },
        matchesLost: {
            type: Number,
            default: 0
        },
        problemsSolved: {
            type: Number,
            default: 0
        },
        badges: [{
            name: String,
            description: String,
            earnedAt: {
                type: Date,
                default: Date.now
            }
        }],
        preferredLanguage: {
            type: String,
            default: "cpp",
            enum: ["javascript", "python", "java", "cpp", "c"]
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
    return ((this.matchesWon / this.totalMatches) * 100).toFixed(2);
});

// Calculate rank based on ELO rating
userSchema.virtual('rank').get(function() {
    if (this.eloRating < 1000) return 'Bronze';
    if (this.eloRating < 1300) return 'Silver';
    if (this.eloRating < 1600) return 'Gold';
    if (this.eloRating < 1900) return 'Platinum';
    return 'Diamond';
});

export const User = mongoose.model("User", userSchema);
