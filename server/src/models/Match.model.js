import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const submissionSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    code: {
        type: String,
        required: true
    },
    language: {
        type: String,
        required: true,
        enum: ["javascript", "python", "java", "cpp", "c"]
    },
    verdict: {
        type: String,
        enum: ["Accepted", "Wrong Answer", "Time Limit Exceeded", "Memory Limit Exceeded", "Runtime Error", "Compilation Error", "Pending"],
        default: "Pending"
    },
    executionTime: {
        type: Number, // in milliseconds
        default: 0
    },
    memoryUsed: {
        type: Number, // in KB
        default: 0
    },
    testCasesPassed: {
        type: Number,
        default: 0
    },
    totalTestCases: {
        type: Number,
        default: 0
    },
    submittedAt: {
        type: Date,
        default: Date.now
    }
}, { _id: false });

const matchSchema = new Schema(
    {
        matchId: {
            type: String,
            required: true,
            unique: true,
            index: true
        },
        type: {
            type: String,
            enum: ["duel", "practice"],
            required: true,
            default: "duel"
        },
        status: {
            type: String,
            enum: ["waiting", "in_progress", "completed", "cancelled"],
            default: "waiting",
            index: true
        },
        participants: [{
            user: {
                type: Schema.Types.ObjectId,
                ref: "User",
                required: true
            },
            joinedAt: {
                type: Date,
                default: Date.now
            },
            isReady: {
                type: Boolean,
                default: false
            },
            submissions: [submissionSchema]
        }],
        problem: {
            type: Schema.Types.ObjectId,
            ref: "Problem",
            required: true
        },
        winner: {
            type: Schema.Types.ObjectId,
            ref: "User",
            default: null
        },
        // Match timing
        startTime: {
            type: Date,
            default: null
        },
        endTime: {
            type: Date,
            default: null
        },
        duration: {
            type: Number, // in minutes
            default: 30
        },
        // ELO rating changes
        eloChanges: [{
            user: {
                type: Schema.Types.ObjectId,
                ref: "User"
            },
            oldRating: Number,
            newRating: Number,
            change: Number
        }],
        // Match configuration
        maxParticipants: {
            type: Number,
            default: 2
        },
        isRanked: {
            type: Boolean,
            default: true
        },
        // Real-time data
        roomId: {
            type: String,
            required: true,
            unique: true
        },
        // Match results
        finalSubmissions: [{
            user: {
                type: Schema.Types.ObjectId,
                ref: "User"
            },
            submission: submissionSchema,
            finalScore: {
                type: Number,
                default: 0
            },
            completionTime: {
                type: Number, // time taken to solve in minutes
                default: null
            }
        }]
    },
    {
        timestamps: true
    }
);

// Calculate match duration
matchSchema.virtual('actualDuration').get(function() {
    if (this.startTime && this.endTime) {
        return Math.round((this.endTime - this.startTime) / (1000 * 60)); // in minutes
    }
    return 0;
});

// Check if match is active
matchSchema.virtual('isActive').get(function() {
    return this.status === 'in_progress' || this.status === 'waiting';
});

// Get current participants count
matchSchema.virtual('participantsCount').get(function() {
    return this.participants.length;
});

// Check if match is full
matchSchema.virtual('isFull').get(function() {
    return this.participants.length >= this.maxParticipants;
});

// Indexes for efficient querying
matchSchema.index({ status: 1, createdAt: -1 });
matchSchema.index({ "participants.user": 1 });
matchSchema.index({ matchId: 1 });
matchSchema.index({ roomId: 1 });

// Add pagination plugin
matchSchema.plugin(mongooseAggregatePaginate);

// Pre-save middleware to generate matchId and roomId
matchSchema.pre('save', function(next) {
    if (this.isNew) {
        if (!this.matchId) {
            this.matchId = `match_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        }
        if (!this.roomId) {
            this.roomId = `room_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        }
    }
    next();
});

export const Match = mongoose.model("Match", matchSchema);
