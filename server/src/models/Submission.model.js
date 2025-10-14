import mongoose, { Schema } from "mongoose";

const submissionSchema = new Schema(
    {
        // Reference to duel (can be null for practice submissions)
        duel: {
            type: Schema.Types.ObjectId,
            ref: "Duel",
            default: null
        },
        // Reference to match (for compatibility with existing match system)
        match: {
            type: Schema.Types.ObjectId,
            ref: "Match",
            default: null
        },
        // User who made the submission
        user: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        // Problem being solved
        problem: {
            type: Schema.Types.ObjectId,
            ref: "Problem",
            required: true
        },
        // Code details
        code: {
            type: String,
            required: true
        },
        language: {
            type: String,
            required: true,
            enum: ["python", "javascript", "java", "cpp", "c", "csharp", "go", "rust"]
        },
        // Execution results
        status: {
            type: String,
            enum: [
                "pending",
                "accepted", 
                "wrong_answer",
                "time_limit_exceeded",
                "runtime_error",
                "compilation_error",
                "memory_limit_exceeded"
            ],
            default: "pending"
        },
        output: {
            type: String,
            default: ""
        },
        errorMessage: {
            type: String,
            default: ""
        },
        // Performance metrics
        executionTime: {
            type: Number, // in seconds
            default: 0
        },
        memoryUsage: {
            type: Number, // in KB
            default: 0
        },
        // Judge0 details
        judge0Token: {
            type: String,
            default: ""
        },
        // Test case results
        testCasesPassed: {
            type: Number,
            default: 0
        },
        totalTestCases: {
            type: Number,
            default: 0
        },
        testResults: [{
            input: String,
            expectedOutput: String,
            actualOutput: String,
            passed: Boolean,
            executionTime: Number,
            memoryUsage: Number
        }],
        // Scoring
        score: {
            type: Number,
            default: 0
        },
        isCorrect: {
            type: Boolean,
            default: false
        },
        // Timestamps
        submittedAt: {
            type: Date,
            default: Date.now
        },
        completedAt: {
            type: Date,
            default: null
        }
    },
    {
        timestamps: true
    }
);

// Virtual for pass rate
submissionSchema.virtual('passRate').get(function() {
    if (this.totalTestCases === 0) return 0;
    return Math.round((this.testCasesPassed / this.totalTestCases) * 100);
});

// Virtual to check if submission is complete
submissionSchema.virtual('isComplete').get(function() {
    return this.status !== 'pending';
});

// Indexes for efficient querying
submissionSchema.index({ user: 1, createdAt: -1 });
submissionSchema.index({ duel: 1, user: 1 });
submissionSchema.index({ match: 1, user: 1 });
submissionSchema.index({ problem: 1, status: 1 });
submissionSchema.index({ status: 1 });

// Ensure virtual fields are included in JSON output
submissionSchema.set('toJSON', { virtuals: true });
submissionSchema.set('toObject', { virtuals: true });

export const Submission = mongoose.model("Submission", submissionSchema);