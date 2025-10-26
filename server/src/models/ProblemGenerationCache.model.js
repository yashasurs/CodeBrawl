import mongoose, { Schema } from "mongoose";

const testCaseSchema = new Schema(
  {
    input: { type: String, required: true },
    expectedOutput: { type: String, required: true },
    explanation: { type: String, default: "" },
    isHidden: { type: Boolean, default: false },
  },
  { _id: false }
);

const problemGenerationCacheSchema = new Schema(
  {
    leetcodeId: { type: String, index: true },
    title: { type: String, required: true, index: true },
    titleSlug: { type: String, index: true },
    difficulty: { type: String, default: "Medium", index: true },
    tags: [{ type: String }],
    acceptanceRate: { type: Number },
    originalStatement: { type: String, default: "" },
    formattedStatement: { type: String, default: "" },
    inputFormat: { type: String, default: "" },
    outputFormat: { type: String, default: "" },
    constraints: { type: String, default: "" },
    timeLimit: { type: Number, default: 0 },
    memoryLimit: { type: Number, default: 0 },
    scoringWeight: { type: Number, default: 1 },
    currentLanguage: { type: String, default: "" },
    boilerplateCache: {
      type: Map,
      of: String,
      default: {},
    },
    testCases: { type: [testCaseSchema], default: [] },
  },
  { timestamps: true }
);

problemGenerationCacheSchema.methods.hasBoilerplate = function hasBoilerplate(language) {
  if (!language) return false;
  return Boolean(this.boilerplateCache?.get(language) ?? this.boilerplateCache?.[language]);
};

problemGenerationCacheSchema.methods.addBoilerplate = async function addBoilerplate(
  language,
  code
) {
  if (!language || typeof code !== "string") return this;

  this.boilerplateCache = this.boilerplateCache || new Map();
  this.boilerplateCache.set(language, code);
  this.currentLanguage = language;
  await this.save();
  return this;
};

problemGenerationCacheSchema.methods.toClient = function toClient(language) {
  const boilerplateCache = mapToPlainObject(this.boilerplateCache);
  const starterCode = boilerplateCache;

  const response = {
    cacheId: this._id.toString(),
    leetcodeId: this.leetcodeId,
    title: this.title,
    titleSlug: this.titleSlug,
    difficulty: this.difficulty,
    tags: this.tags || [],
    acceptanceRate: this.acceptanceRate,
    description: this.formattedStatement || this.originalStatement || "",
    formattedStatement: this.formattedStatement,
    originalStatement: this.originalStatement,
    inputFormat: this.inputFormat,
    outputFormat: this.outputFormat,
    constraints: this.constraints,
    timeLimit: this.timeLimit,
    memoryLimit: this.memoryLimit,
    scoringWeight: this.scoringWeight,
    testCases: (this.testCases || []).map((testCase) => ({
      input: testCase.input,
      expectedOutput: testCase.expectedOutput,
      explanation: testCase.explanation,
      isHidden: testCase.isHidden,
    })),
    starterCode,
    boilerplateCache,
  };

  if (language) {
    response.activeLanguage = language;
    response.boilerplate = boilerplateCache?.[language] ?? boilerplateCache?.get?.(language) ?? null;
  }

  return response;
};

problemGenerationCacheSchema.statics.findByKey = async function findByKey(
  leetcodeId,
  title,
  difficulty
) {
  const filter = {};
  if (leetcodeId) filter.leetcodeId = leetcodeId;
  if (title) filter.title = title;
  if (difficulty) filter.difficulty = difficulty;

  if (Object.keys(filter).length === 0) {
    return null;
  }

  return this.findOne(filter).exec();
};

problemGenerationCacheSchema.statics.saveFromAI = async function saveFromAI(aiResult) {
  if (!aiResult) throw new Error("AI result is required to persist cache");

  const {
    leetcode_id: leetcodeId,
    title,
    title_slug: titleSlug,
    difficulty = "Medium",
    tags = [],
    acceptance_rate: acceptanceRate,
    original_statement: originalStatement,
    formatted_statement: formattedStatement,
    input_format: inputFormat,
    output_format: outputFormat,
    constraints = "",
    time_limit: timeLimit = 0,
    memory_limit: memoryLimit = 0,
    scoring_weight: scoringWeight = 1,
    test_cases: testCases = [],
    language,
    boilerplate_code: boilerplateCode,
    boilerplate_cache: boilerplateCache = {},
  } = aiResult;

  const normalizedTestCases = (testCases || []).map((testCase) => ({
    input: testCase.input ?? "",
    expectedOutput:
      testCase.expected_output ?? testCase.expectedOutput ?? testCase.output ?? "",
    explanation: testCase.explanation ?? "",
    isHidden: Boolean(testCase.is_hidden ?? testCase.isHidden ?? false),
  }));

  const mergedBoilerplate = { ...boilerplateCache };
  if (language && typeof boilerplateCode === "string" && boilerplateCode.trim().length) {
    mergedBoilerplate[language] = boilerplateCode;
  }

  const filter = buildUpsertFilter({ leetcodeId, title, difficulty });

  const update = {
    leetcodeId,
    title,
    titleSlug,
    difficulty,
    tags,
    acceptanceRate,
    originalStatement,
    formattedStatement,
    inputFormat,
    outputFormat,
    constraints,
    timeLimit,
    memoryLimit,
    scoringWeight,
    currentLanguage: language ?? "",
    testCases: normalizedTestCases,
    boilerplateCache: mergedBoilerplate,
  };

  const options = { upsert: true, new: true, setDefaultsOnInsert: true };

  return this.findOneAndUpdate(filter, { $set: update }, options).exec();
};

problemGenerationCacheSchema.statics.getStats = async function getStats() {
  const caches = await this.find({}, { difficulty: 1, boilerplateCache: 1 }).lean();
  const total = caches.length;

  const difficultyCounts = caches.reduce((acc, cache) => {
    const key = cache.difficulty || "Unknown";
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  const languages = new Set();
  caches.forEach((cache) => {
    const boilerplates = cache.boilerplateCache || {};
    Object.keys(boilerplates).forEach((key) => languages.add(key));
  });

  return {
    total,
    difficultyCounts,
    languages: Array.from(languages),
  };
};

problemGenerationCacheSchema.statics.deleteById = function deleteById(id) {
  return this.findByIdAndDelete(id).exec();
};

function mapToPlainObject(mapValue) {
  if (!mapValue) return {};
  if (mapValue instanceof Map) {
    return Object.fromEntries(mapValue.entries());
  }
  if (typeof mapValue.toObject === "function") {
    return mapValue.toObject();
  }
  return { ...mapValue };
}

function buildUpsertFilter({ leetcodeId, title, difficulty }) {
  const filter = {};
  if (leetcodeId) filter.leetcodeId = leetcodeId;
  if (title) filter.title = title;
  if (difficulty) filter.difficulty = difficulty;

  if (Object.keys(filter).length === 0) {
    filter.title = title || "Untitled Problem";
  }

  return filter;
}

export default mongoose.model("ProblemGenerationCache", problemGenerationCacheSchema);
