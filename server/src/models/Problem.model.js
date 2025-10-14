import mongoose, { Schema } from "mongoose";

const testCaseSchema = new Schema({
    input: {
        type: String,
        required: true
    },
    expectedOutput: {
        type: String,
        required: true
    },
    isHidden: {
        type: Boolean,
        default: false
    }
}, { _id: false });

const problemSchema = new Schema(
    {
        // LeetCode identifiers
        leetcodeId: {
            type: String, // Changed from Number to String to match questionFrontendId
            unique: true,
            sparse: true,
            index: true
        },
        titleSlug: {
            type: String,
            index: true
        },
        title: {
            type: String,
            required: true,
            trim: true,
            index: true
        },
        description: {
            type: String,
            required: true
        },
        difficulty: {
            type: String,
            required: true,
            enum: ["Easy", "Medium", "Hard"],
            index: true
        },
        tags: [{
            type: String,
            index: true
        }],
        constraints: {
            type: String,
            default: ""
        },
        examples: [{
            input: String,
            output: String,
            explanation: String
        }],
        testCases: [testCaseSchema],
        // Starter code templates for different languages
        starterCode: {
            javascript: {
                type: String,
                default: ""
            },
            python: {
                type: String,
                default: ""
            },
            java: {
                type: String,
                default: ""
            },
            cpp: {
                type: String,
                default: ""
            },
            c: {
                type: String,
                default: ""
            }
        },
        // Problem statistics
        totalSubmissions: {
            type: Number,
            default: 0
        },
        successfulSubmissions: {
            type: Number,
            default: 0
        },
        timeLimit: {
            type: Number, // in seconds
            default: 2
        },
        memoryLimit: {
            type: Number, // in MB
            default: 128
        },
        // Problem scoring
        points: {
            type: Number,
            default: function() {
                switch(this.difficulty) {
                    case "Easy": return 100;
                    case "Medium": return 200;
                    case "Hard": return 300;
                    default: return 100;
                }
            }
        },
        isActive: {
            type: Boolean,
            default: true
        },
        createdBy: {
            type: Schema.Types.ObjectId,
            ref: "User"
        }
    },
    {
        timestamps: true
    }
);

// Calculate acceptance rate
problemSchema.virtual('acceptanceRate').get(function() {
    if (this.totalSubmissions === 0) return 0;
    return ((this.successfulSubmissions / this.totalSubmissions) * 100).toFixed(2);
});

// Index for efficient querying
problemSchema.index({ difficulty: 1, tags: 1 });
problemSchema.index({ title: "text", description: "text" });

export const Problem = mongoose.model("Problem", problemSchema);
