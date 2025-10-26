const DEFAULT_LANGUAGES = [
  "python",
  "javascript",
  "java",
  "cpp",
  "c",
  "csharp",
  "go",
  "rust",
];

const AI_SERVICE_URL =
  process.env.AI_SERVICE_URL ||
  process.env.JUDGE0_SERVICE_URL ||
  "http://localhost:8000";

async function request(path, init = {}) {
  const url = `${AI_SERVICE_URL}${path}`;

  console.log(`[aiServiceClient] Making request to: ${url}`);
  console.log(`[aiServiceClient] Request method: ${init.method || 'GET'}`);
  if (init.body) {
    console.log(`[aiServiceClient] Request body:`, JSON.parse(init.body));
  }

  try {
    const response = await fetch(url, {
      headers: { "Content-Type": "application/json", ...(init.headers || {}) },
      ...init,
    });

    console.log(`[aiServiceClient] Response status: ${response.status} ${response.statusText}`);

    if (!response.ok) {
      const message = await safeReadJson(response);
      console.error(`[aiServiceClient] Error response:`, message);
      throw new Error(
        `AI service error (${response.status} ${response.statusText}): ${JSON.stringify(message) ?? "Unknown error"}`
      );
    }

    const data = await safeReadJson(response);
    console.log(`[aiServiceClient] Success response received with keys:`, Object.keys(data || {}));
    return data;
  } catch (error) {
    console.error(`[aiServiceClient] Request failed for ${url}:`, error.message);
    console.error(`[aiServiceClient] Error details:`, error);
    throw error;
  }
}

async function safeReadJson(response) {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

function normaliseTestCases(testCases = []) {
  return testCases
    .filter(Boolean)
    .map((testCase) => ({
      input: testCase.input ?? testCase.rawInput ?? "",
      expected_output:
        testCase.expected_output ?? testCase.expectedOutput ?? testCase.output ?? "",
      is_hidden: Boolean(testCase.is_hidden ?? testCase.isHidden ?? false),
    }));
}

function buildLanguageSwitchPayload(cache, newLanguage) {
  if (!cache) {
    throw new Error("Cache document is required to switch language");
  }

  const testCases = normaliseTestCases(cache.testCases || cache.test_cases || []);
  const cacheMap = cache.boilerplateCache || cache.boilerplate_cache || {};

  return {
    title: cache.title ?? cache.problemTitle ?? "Untitled Problem",
    formatted_statement:
      cache.formattedStatement ?? cache.formatted_statement ?? cache.description ?? "",
    input_format: cache.inputFormat ?? cache.input_format ?? "",
    output_format: cache.outputFormat ?? cache.output_format ?? "",
    constraints: cache.constraints ?? "",
    test_cases: testCases,
    current_language:
      cache.currentLanguage ?? cache.language ?? cache.lastLanguage ?? cache.defaultLanguage ?? "",
    new_language: newLanguage,
    boilerplate_cache: cacheMap,
  };
}

const aiServiceClient = {
  async generateProblem(payload, useValidation = true) {
    const url = `/api/v1/problems/generate?use_validation=${useValidation}`;
    return request(url, {
      method: "POST",
      body: JSON.stringify(payload ?? {}),
    });
  },

  async switchLanguage(cache, newLanguage) {
    const body = buildLanguageSwitchPayload(cache, newLanguage);
    return request("/api/v1/problems/switch-language", {
      method: "POST",
      body: JSON.stringify(body),
    });
  },

  async health() {
    try {
      return await request("/api/v1/problems/health", { method: "GET" });
    } catch (error) {
      // Fallback to root health endpoint if versioned one fails
      console.warn("Falling back to root health endpoint for AI service", error);
      return request("/health", { method: "GET" });
    }
  },

  async getLanguages() {
    try {
      const response = await request("/api/v1/problems/languages", { method: "GET" });
      if (Array.isArray(response?.languages)) {
        return response.languages;
      }
      if (Array.isArray(response)) {
        return response;
      }
    } catch (error) {
      console.warn("AI service languages endpoint unavailable, using defaults", error);
    }

    return DEFAULT_LANGUAGES;
  },
};

export default aiServiceClient;
