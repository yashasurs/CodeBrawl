import asyncHandler from "../utils/asyncHandler.js";
import aiServiceClient from "../utils/aiServiceClient.js";
import ProblemGenerationCache from "../models/ProblemGenerationCache.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";

// POST /api/v1/ai-problems/generate
export const generateAIProblem = asyncHandler(async (req, res) => {
    const { leetcode_id, title, difficulty, language } = req.body;
    // Try cache first
    let cache = await ProblemGenerationCache.findByKey(leetcode_id, title, difficulty);
    if (cache && cache.hasBoilerplate(language)) {
        return res.status(200).json(new ApiResponse(200, cache.toClient(language), "AI problem (cached)"));
    }
    // Proxy to FastAPI
    const aiResult = await aiServiceClient.generateProblem({ leetcode_id, title, difficulty, language });
    // Save to cache
    cache = await ProblemGenerationCache.saveFromAI(aiResult);
    return res.status(201).json(new ApiResponse(201, cache.toClient(language), "AI problem generated"));
});

// POST /api/v1/ai-problems/switch-language
export const switchLanguage = asyncHandler(async (req, res) => {
    const { cache_id, new_language } = req.body;
    const cache = await ProblemGenerationCache.findById(cache_id);
    if (!cache) throw new ApiError(404, "Cache not found");
    if (cache.hasBoilerplate(new_language)) {
        return res.status(200).json(new ApiResponse(200, cache.toClient(new_language), "Boilerplate (cached)"));
    }
    // Proxy to FastAPI
    const aiResult = await aiServiceClient.switchLanguage(cache, new_language);
    await cache.addBoilerplate(new_language, aiResult.boilerplate_code);
    return res.status(200).json(new ApiResponse(200, cache.toClient(new_language), "Boilerplate generated"));
});

// GET /api/v1/ai-problems/cache/:id
export const getCache = asyncHandler(async (req, res) => {
    const cache = await ProblemGenerationCache.findById(req.params.id);
    if (!cache) throw new ApiError(404, "Cache not found");
    return res.status(200).json(new ApiResponse(200, cache.toClient(), "Cache entry"));
});

// GET /api/v1/ai-problems/cache/stats
export const getCacheStats = asyncHandler(async (req, res) => {
    const stats = await ProblemGenerationCache.getStats();
    return res.status(200).json(new ApiResponse(200, stats, "Cache stats"));
});

// DELETE /api/v1/ai-problems/cache/:id
export const clearCache = asyncHandler(async (req, res) => {
    await ProblemGenerationCache.deleteById(req.params.id);
    return res.status(200).json(new ApiResponse(200, {}, "Cache cleared"));
});

// GET /api/v1/ai-problems/health
export const aiHealth = asyncHandler(async (req, res) => {
    const health = await aiServiceClient.health();
    return res.status(200).json(new ApiResponse(200, health, "AI service health"));
});

// GET /api/v1/ai-problems/languages
export const getLanguages = asyncHandler(async (req, res) => {
    const langs = await aiServiceClient.getLanguages();
    return res.status(200).json(new ApiResponse(200, langs, "Supported languages"));
});
