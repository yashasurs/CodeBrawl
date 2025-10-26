import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const duelSchema = new Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true
        },
        status: {
            type: String,
            enum: ["waiting", "in_progress", "completed", "cancelled"],
            default: "waiting",
            index: true
        },
        problem: {
            type: Schema.Types.ObjectId,
            ref: "Problem",
            required: true
        },
        // Players
        player1: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        player2: {
            type: Schema.Types.ObjectId,
            ref: "User",
            default: null
        },
        // Scoring
        player1Score: {
            type: Number,
            default: 0
        },
        player2Score: {
            type: Number,
            default: 0
        },
        winner: {
            type: Schema.Types.ObjectId,
            ref: "User",
            default: null
        },
        // Settings
        maxParticipants: {
            type: Number,
            default: 2
        },
        timeLimit: {
            type: Number, // in seconds
            default: 3600
        },
        isPublic: {
            type: Boolean,
            default: true
        },
        // Timing
        startedAt: {
            type: Date,
            default: null
        },
        completedAt: {
            type: Date,
            default: null
        },
        // Room for real-time features
        roomId: {
            type: String,
            unique: true,
            required: true
        }
    },
    {
        timestamps: true
    }
);

// Virtual for actual duration
duelSchema.virtual('actualDuration').get(function() {
    if (this.startedAt && this.completedAt) {
        return Math.round((this.completedAt - this.startedAt) / (1000 * 60)); // in minutes
    }
    return 0;
});

// Virtual to check if duel is active
duelSchema.virtual('isActive').get(function() {
    return this.status === 'in_progress' || this.status === 'waiting';
});

// Virtual to check if duel is full
duelSchema.virtual('isFull').get(function() {
    return this.player2 !== null;
});

// Pre-save middleware to generate roomId
duelSchema.pre('save', function(next) {
    if (this.isNew && !this.roomId) {
        this.roomId = `duel_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    next();
});

// Indexes for efficient querying
duelSchema.index({ status: 1, createdAt: -1 });
duelSchema.index({ player1: 1 });
duelSchema.index({ player2: 1 });
// roomId index already created by unique: true in schema definition

// Add pagination plugin
duelSchema.plugin(mongooseAggregatePaginate);

// Ensure virtual fields are included in JSON output
duelSchema.set('toJSON', { virtuals: true });
duelSchema.set('toObject', { virtuals: true });

export const Duel = mongoose.model("Duel", duelSchema);