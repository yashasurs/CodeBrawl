"use client";
import Navbar from '@/components/Navbar';
import React, { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import { useParams, useRouter } from 'next/navigation';
import practiceService from '@/services/practice.service';
import { notify } from '@/utils/notifications';
import type {
  PracticeProblem,
  PracticeLanguage,
  PracticeSubmission,
} from '@/types/practice';

const MonacoEditor = dynamic(() => import('@monaco-editor/react'), { ssr: false });

const SUPPORTED_LANGUAGES: { value: PracticeLanguage; label: string }[] = [
  { value: 'python', label: 'Python' },
  { value: 'javascript', label: 'JavaScript' },
  { value: 'cpp', label: 'C++' },
  { value: 'java', label: 'Java' },
  { value: 'c', label: 'C' },
  { value: 'csharp', label: 'C#' },
  { value: 'go', label: 'Go' },
  { value: 'rust', label: 'Rust' },
];

// Helper function to format text with backticks, bold, and other markdown
const formatTextWithCode = (text: string) => {
  if (!text) return null;
  
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  
  // Match code blocks (```code```), inline code (`code`), and bold text (**text**)
  const formatRegex = /```([\s\S]*?)```|`([^`]+)`|\*\*([^*]+)\*\*/g;
  let match;
  let key = 0;
  
  while ((match = formatRegex.exec(text)) !== null) {
    // Add text before the match
    if (match.index > lastIndex) {
      const beforeText = text.substring(lastIndex, match.index);
      // Process line breaks
      beforeText.split('\n').forEach((line, idx, arr) => {
        parts.push(
          <span key={`text-${key++}`}>{line}</span>
        );
        if (idx < arr.length - 1) {
          parts.push(<br key={`br-${key++}`} />);
        }
      });
    }
    
    // Add the formatted part
    if (match[1]) {
      // Code block (triple backticks)
      parts.push(
        <pre key={`code-${key++}`} className="bg-gray-800 p-3 rounded-lg my-2 overflow-x-auto">
          <code className="text-sm text-green-300 font-mono">{match[1].trim()}</code>
        </pre>
      );
    } else if (match[2]) {
      // Inline code (single backticks)
      parts.push(
        <code key={`inline-${key++}`} className="bg-gray-800 px-2 py-1 rounded text-sm text-green-300 font-mono">
          {match[2]}
        </code>
      );
    } else if (match[3]) {
      // Bold text
      parts.push(
        <strong key={`bold-${key++}`} className="font-bold text-purple-300">
          {match[3]}
        </strong>
      );
    }
    
    lastIndex = match.index + match[0].length;
  }
  
  // Add remaining text
  if (lastIndex < text.length) {
    const remainingText = text.substring(lastIndex);
    remainingText.split('\n').forEach((line, idx, arr) => {
      parts.push(
        <span key={`text-${key++}`}>{line}</span>
      );
      if (idx < arr.length - 1) {
        parts.push(<br key={`br-${key++}`} />);
      }
    });
  }
  
  return parts.length > 0 ? <>{parts}</> : text;
};

export default function ProblemSolvePage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;

  const [problem, setProblem] = useState<PracticeProblem | null>(null);
  const [language, setLanguage] = useState<PracticeLanguage>('python');
  const [code, setCode] = useState('');
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [submission, setSubmission] = useState<PracticeSubmission | null>(null);
  const [runResult, setRunResult] = useState<PracticeSubmission | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const isGeneratingRef = useRef(false); // Prevent multiple simultaneous generations

  // Fetch problem by slug and auto-generate if needed
  useEffect(() => {
    const fetchAndGenerateProblem = async () => {
      if (!slug) return;
      
      // Prevent multiple simultaneous generation calls
      if (isGeneratingRef.current) {
        console.log('Generation already in progress, skipping...');
        return;
      }

      setIsLoading(true);
      console.log('=== FETCHING PROBLEM ===');
      console.log('Slug:', slug);
      
      try {
        // First try to get from database by slug or ID
        try {
          console.log('Attempting to fetch from database...');
          const { data } = await practiceService.getProblem(slug, { includeTestCases: true });
          console.log('Problem found in database:', data.title);
          
          // Check if problem needs generation (missing description or test cases)
          const needsGeneration = !data.description || !data.testCases || data.testCases.length === 0;
          
          if (needsGeneration) {
            console.log('Problem needs generation, auto-generating...');
            isGeneratingRef.current = true; // Set flag
            setIsLoading(true);
            notify.info('Generating problem...', 'Creating statement and test cases with AI');
            
            try {
              const { data: generatedData, message } = await practiceService.generateProblem({
                problemId: data._id,
              });
              console.log('Problem generated successfully');
              setProblem(generatedData);
              notify.success('Problem Ready! 🎉', message);
              
              // Set initial code from generated starter code
              const starterCode = generatedData.starterCode || {};
              const preferredLanguage = (Object.keys(starterCode).find((key) => starterCode[key as PracticeLanguage]) || 'python') as PracticeLanguage;
              setLanguage(preferredLanguage);
              setCode(starterCode[preferredLanguage] || getDefaultTemplate(preferredLanguage));
            } catch (genError) {
              console.error('Generation error:', genError);
              notify.error('Generation failed', genError instanceof Error ? genError.message : 'Failed to generate problem');
              // Still set the problem even if generation fails
              setProblem(data);
              
              // Set initial code from existing starter code
              const starterCode = data.starterCode || {};
              const preferredLanguage = (Object.keys(starterCode).find((key) => starterCode[key as PracticeLanguage]) || 'python') as PracticeLanguage;
              setLanguage(preferredLanguage);
              setCode(starterCode[preferredLanguage] || getDefaultTemplate(preferredLanguage));
            } finally {
              isGeneratingRef.current = false; // Reset flag
            }
          } else {
            // Problem already has content
            setProblem(data);
            
            // Set initial code from starter code
            const starterCode = data.starterCode || {};
            const preferredLanguage = (Object.keys(starterCode).find((key) => starterCode[key as PracticeLanguage]) || 'python') as PracticeLanguage;
            setLanguage(preferredLanguage);
            setCode(starterCode[preferredLanguage] || getDefaultTemplate(preferredLanguage));
          }
        } catch (dbError) {
          // Problem must exist in database first
          console.error('Database fetch error:', dbError);
          notify.error('Problem not found', 'This problem needs to be selected from the practice page first');
          setTimeout(() => router.push('/practice'), 2000);
        }
      } catch (error) {
        console.error('=== PROBLEM FETCH/GENERATION ERROR ===');
        console.error('Error type:', error?.constructor?.name);
        console.error('Error message:', error instanceof Error ? error.message : 'Unknown error');
        console.error('Full error:', error);
        
        notify.error('Problem not found', error instanceof Error ? error.message : 'Unknown error');
        setTimeout(() => router.push('/practice'), 2000);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAndGenerateProblem();
  }, [slug, router]);

  // Timer
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setTimeElapsed((prev) => prev + 1);
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Update code when language changes
  useEffect(() => {
    if (!problem) return;
    const starterCode = problem.starterCode || {};
    if (starterCode[language]) {
      setCode(starterCode[language] || getDefaultTemplate(language));
    } else {
      setCode(getDefaultTemplate(language));
    }
  }, [language, problem]);

  const getDefaultTemplate = (lang: PracticeLanguage): string => {
    const templates: Record<PracticeLanguage, string> = {
      javascript: '// Write your solution here\nfunction solution() {\n    // Your code here\n}',
      python: '# Write your solution here\ndef solution():\n    # Your code here\n    pass',
      java: '// Write your solution here\nclass Solution {\n    public void solution() {\n        // Your code here\n    }\n}',
      cpp: '// Write your solution here\n#include <iostream>\nusing namespace std;\n\nclass Solution {\npublic:\n    void solution() {\n        // Your code here\n    }\n};',
      c: '// Write your solution here\n#include <stdio.h>\n\nvoid solution() {\n    // Your code here\n}',
      csharp: '// Write your solution here\nusing System;\n\npublic class Solution {\n    public void solution() {\n        // Your code here\n    }\n}',
      go: '// Write your solution here\npackage main\n\nimport "fmt"\n\nfunc solution() {\n    // Your code here\n}',
      rust: '// Write your solution here\nfn solution() {\n    // Your code here\n}',
    };
    return templates[lang] || templates['python'];
  };

  const handleRun = async () => {
    if (!problem) return;
    
    setIsRunning(true);
    setRunResult(null); // Clear previous run results
    
    try {
      notify.info('Running code...', 'Testing with sample test cases');
      
      const { data, message } = await practiceService.runCode({
        problemId: problem._id,
        code,
        language,
      });

      setRunResult(data);
      
      if (data.isCorrect || data.status === 'accepted') {
        notify.success('All Sample Tests Passed! ✓', `${data.testCasesPassed}/${data.totalTestCases} sample test cases passed`);
      } else if (data.status === 'wrong_answer') {
        notify.warning('Some Tests Failed', `${data.testCasesPassed}/${data.totalTestCases} sample test cases passed`);
      } else if (data.status === 'compilation_error') {
        notify.error('Compilation Error', data.errorMessage || 'Check your syntax');
      } else if (data.status === 'runtime_error') {
        notify.error('Runtime Error', data.errorMessage || 'Your code crashed during execution');
      } else if (data.status === 'time_limit_exceeded') {
        notify.error('Time Limit Exceeded', 'Your solution is too slow');
      }
    } catch (error) {
      console.error('Failed to run code', error);
      notify.error('Run failed', error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setIsRunning(false);
    }
  };

  const handleSubmit = async () => {
    if (!problem) return;

    setIsSubmitting(true);
    setSubmission(null); // Clear previous submission results
    
    try {
      const { data, message } = await practiceService.submitPracticeSolution({
        problemId: problem._id,
        code,
        language,
      });

      setSubmission(data);
      setRunResult(null); // Clear run results when submitting
      notify.info('Solution submitted', message);

      if (data.isCorrect || data.status === 'accepted') {
        notify.success('Accepted! 🎉', `All ${data.totalTestCases} test cases passed!`);
      } else if (data.status === 'wrong_answer') {
        notify.error('Wrong Answer', `${data.testCasesPassed}/${data.totalTestCases} test cases passed`);
      } else if (data.status === 'compilation_error') {
        notify.error('Compilation Error', data.errorMessage || 'Check your syntax');
      } else if (data.status === 'runtime_error') {
        notify.error('Runtime Error', data.errorMessage || 'Your code crashed during execution');
      } else if (data.status === 'time_limit_exceeded') {
        notify.error('Time Limit Exceeded', 'Your solution is too slow');
      }
    } catch (error) {
      console.error('Failed to submit solution', error);
      notify.error('Submission failed', error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditorWillMount = (monaco: unknown) => {
    const monacoTyped = monaco as {
      languages: {
        typescript: {
          javascriptDefaults: { setDiagnosticsOptions: (options: Record<string, boolean>) => void };
          typescriptDefaults: { setDiagnosticsOptions: (options: Record<string, boolean>) => void };
        };
      };
    };
    
    monacoTyped.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
      noSemanticValidation: true,
      noSyntaxValidation: true,
      noSuggestionDiagnostics: true,
    });
    
    monacoTyped.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
      noSemanticValidation: true,
      noSyntaxValidation: true,
      noSuggestionDiagnostics: true,
    });
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600 mx-auto"></div>
          <p className="text-purple-300 mt-4 text-lg">Loading problem...</p>
          <p className="text-gray-400 mt-2 text-sm">Generating with AI if needed ✨</p>
        </div>
      </div>
    );
  }

  if (!problem) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 text-xl mb-4">Problem not found</p>
          <button
            onClick={() => router.push('/practice')}
            className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            Back to Practice
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      <Navbar showAuthButtons={false} pageTitle={problem.title} />
      
      {/* Top Bar with Timer and Controls */}
      <div className="flex items-center justify-between px-6 py-3 bg-black/40 backdrop-blur-sm border-b border-purple-600/30 shadow-sm">
        <div className="flex items-center gap-6">
          {/* Timer */}
          <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-800 rounded-lg shadow-lg">
            <span className="text-white font-mono text-lg font-bold">
              ⏰ {formatTime(timeElapsed)}
            </span>
          </div>
          
          {/* Difficulty Badge */}
          <div className={`px-3 py-1 rounded-lg text-sm font-medium border ${
            problem.difficulty === 'Easy'
              ? 'bg-green-900/30 border-green-400 text-green-300'
              : problem.difficulty === 'Medium'
              ? 'bg-yellow-900/30 border-yellow-400 text-yellow-300'
              : 'bg-red-900/30 border-red-400 text-red-300'
          }`}>
            {problem.difficulty}
          </div>

          {/* Tags */}
          {problem.tags && problem.tags.length > 0 && (
            <div className="flex gap-2">
              {problem.tags.slice(0, 3).map((tag, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-purple-900/30 border border-purple-600/30 rounded text-xs text-purple-300"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/practice')}
            className="px-4 py-2 border border-gray-600/30 text-gray-300 rounded-lg hover:bg-gray-700/20 text-sm font-medium transition-all duration-200"
          >
            ← Back
          </button>
          <select 
            value={language} 
            onChange={(e) => setLanguage(e.target.value as PracticeLanguage)}
            className="px-3 py-2 border border-purple-600/30 rounded-lg bg-black/60 backdrop-blur-sm text-purple-300 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-400 hover:border-purple-500 transition-colors"
          >
            {SUPPORTED_LANGUAGES.map((lang) => (
              <option key={lang.value} value={lang.value} className="bg-gray-900 text-purple-300">
                {lang.label}
              </option>
            ))}
          </select>
          <button 
            onClick={handleRun}
            disabled={isRunning}
            className="px-4 py-2 bg-gradient-to-r from-gray-600 to-gray-800 border border-gray-500/30 text-white rounded-lg hover:from-gray-700 hover:to-gray-900 text-sm font-medium transition-all duration-200 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isRunning ? 'Running...' : 'Run'}
          </button>
          <button 
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-800 text-white rounded-lg hover:from-purple-700 hover:to-purple-900 text-sm font-medium transition-all duration-200 shadow-lg border border-purple-400/30 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Submitting...' : 'Submit'}
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Problem Description Panel */}
        <div className="w-1/2 bg-black/40 backdrop-blur-sm border-r border-purple-600/30 overflow-y-auto">
          <div className="p-6">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-purple-300 mb-4">
                {problem.title}
              </h1>
            </div>

            <div className="prose prose-invert max-w-none">
              <div className="text-gray-300 mb-6 leading-relaxed">
                {formatTextWithCode(problem.description || 'No description available yet. Click the generate button above.')}
              </div>

              {problem.examples && problem.examples.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-purple-400 mb-3">
                    Examples:
                  </h3>
                  {problem.examples.map((example, index) => (
                    <div key={index} className="bg-gray-900/60 rounded-lg p-4 font-mono text-sm border border-gray-700 mb-4">
                      {example.input && (
                        <div className="mb-2">
                          <span className="text-blue-300">Input: </span>
                          <pre className="mt-1 text-gray-200 whitespace-pre-wrap">{example.input}</pre>
                        </div>
                      )}
                      {example.output && (
                        <div className="mb-2">
                          <span className="text-green-300">Output: </span>
                          <pre className="mt-1 text-gray-200 whitespace-pre-wrap">{example.output}</pre>
                        </div>
                      )}
                      {example.explanation && (
                        <div>
                          <span className="text-yellow-300">Explanation: </span>
                          <div className="mt-1 text-gray-400">{formatTextWithCode(example.explanation)}</div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {problem.constraints && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-purple-400 mb-3">
                    Constraints:
                  </h3>
                  <div className="bg-gray-900/60 rounded-lg p-4 text-sm text-gray-300 border border-gray-700">
                    {formatTextWithCode(problem.constraints)}
                  </div>
                </div>
              )}

              {problem.testCases && problem.testCases.filter((tc) => !tc.isHidden).length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-purple-400 mb-3">
                    Sample Test Cases:
                  </h3>
                  <div className="space-y-4">
                    {problem.testCases.filter((tc) => !tc.isHidden).map((testCase, idx) => (
                      <div key={idx} className="bg-gray-950/80 p-4 rounded-xl border border-purple-700/40 shadow-lg backdrop-blur-sm">
                        <div className="flex flex-col gap-3">
                          <div className="flex items-start gap-2">
                            <span className="font-bold text-blue-300 whitespace-nowrap">Input:</span> 
                            <pre className="bg-gray-800 px-3 py-2 rounded text-white text-sm flex-1 overflow-auto whitespace-pre-wrap break-words">{testCase.input}</pre>
                          </div>
                          <div className="flex items-start gap-2">
                            <span className="font-bold text-green-400 whitespace-nowrap">Expected Output:</span> 
                            <pre className="bg-gray-800 px-3 py-2 rounded text-white text-sm flex-1 overflow-auto whitespace-pre-wrap break-words">{testCase.expectedOutput}</pre>
                          </div>
                          {testCase.explanation && (
                            <div className="mt-2 pt-3 border-t border-gray-700/50">
                              <span className="font-bold text-yellow-300 text-sm">Explanation:</span>
                              <div className="text-gray-300 text-sm mt-2 leading-relaxed">
                                {formatTextWithCode(testCase.explanation)}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Code Editor Panel */}
        <div className="w-1/2 flex flex-col bg-black/40 backdrop-blur-sm">
          {/* Editor Header */}
          <div className="px-4 py-3 border-b border-purple-600/30 bg-black/60 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-purple-300">Code</span>
                <div className="h-4 w-px bg-purple-600/30"></div>
                <span className="text-xs text-gray-400">{language}</span>
              </div>
            </div>
          </div>

          {/* Monaco Editor */}
          <div className="flex-1 overflow-hidden">
            <MonacoEditor
              height="100%"
              width="100%"
              language={language}
              value={code}
              onChange={(value) => setCode(value || '')}
              beforeMount={handleEditorWillMount}
              theme="vs-dark"
              options={{
                fontSize: 16,
                fontFamily: "'JetBrains Mono', 'Fira Code', 'Source Code Pro', monospace",
                lineHeight: 1.6,
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                automaticLayout: true,
                wordWrap: 'off',
                lineNumbers: 'on',
                glyphMargin: false,
                folding: true,
                lineDecorationsWidth: 8,
                lineNumbersMinChars: 3,
                renderValidationDecorations: 'off',
                scrollbar: {
                  verticalScrollbarSize: 8,
                  horizontalScrollbarSize: 8,
                },
                padding: { top: 16, bottom: 16 },
                tabSize: 2,
                insertSpaces: true,
                detectIndentation: false,
                renderWhitespace: 'none',
                renderControlCharacters: false,
                hideCursorInOverviewRuler: true,
                overviewRulerBorder: false,
                overviewRulerLanes: 0
              }}
            />
          </div>

          {/* Run Results (Sample Test Cases) */}
          {runResult && (
            <div className="border-t border-purple-600/30 bg-blue-950/80 p-4 max-h-64 overflow-y-auto">
              <div className="mb-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-blue-200">Run Result (Sample Tests)</span>
                  <span className={`text-sm font-bold ${
                    runResult.status === 'accepted'
                      ? 'text-green-400'
                      : runResult.status === 'pending'
                      ? 'text-yellow-300'
                      : 'text-red-400'
                  }`}>
                    {runResult.status.replace(/_/g, ' ').toUpperCase()}
                  </span>
                </div>
                {typeof runResult.testCasesPassed === 'number' && typeof runResult.totalTestCases === 'number' && (
                  <p className="text-sm text-blue-300">
                    Passed {runResult.testCasesPassed} of {runResult.totalTestCases} sample test cases
                  </p>
                )}
                {runResult.executionTime && (
                  <p className="text-xs text-blue-400">
                    Execution time: {runResult.executionTime}ms
                  </p>
                )}
                {runResult.errorMessage && (
                  <p className="text-sm text-red-400 mt-2">{runResult.errorMessage}</p>
                )}
              </div>

              {runResult.testResults && runResult.testResults.length > 0 && (
                <details className="bg-black/60 rounded-lg p-3 text-sm text-gray-200">
                  <summary className="cursor-pointer text-blue-300 font-medium">View sample test results</summary>
                  <div className="mt-3 space-y-3 max-h-48 overflow-y-auto">
                    {runResult.testResults.map((result, index) => (
                      <div key={index} className="border border-blue-800/30 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-semibold text-blue-300">Sample Test #{index + 1}</span>
                          <span className={`text-xs font-bold ${result.passed ? 'text-green-400' : 'text-red-400'}`}>
                            {result.passed ? '✓ Passed' : '✗ Failed'}
                          </span>
                        </div>
                        <div className="space-y-2 text-xs text-gray-300">
                          <div>
                            <span className="font-semibold text-blue-300">Input:</span>
                            <pre className="mt-1 bg-black/40 rounded p-2 overflow-auto">{result.input}</pre>
                          </div>
                          <div>
                            <span className="font-semibold text-green-300">Expected:</span>
                            <pre className="mt-1 bg-black/40 rounded p-2 overflow-auto">{result.expectedOutput}</pre>
                          </div>
                          <div>
                            <span className="font-semibold text-yellow-300">Your Output:</span>
                            <pre className="mt-1 bg-black/40 rounded p-2 overflow-auto">{result.actualOutput || '(no output)'}</pre>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </details>
              )}
            </div>
          )}

          {/* Submission Results (All Test Cases) */}
          {submission && (
            <div className="border-t border-purple-600/30 bg-gray-950/80 p-4 max-h-64 overflow-y-auto">
              <div className="mb-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-purple-200">Final Submission Result (All Tests)</span>
                  <span className={`text-sm font-bold ${
                    submission.status === 'accepted'
                      ? 'text-green-400'
                      : submission.status === 'pending'
                      ? 'text-yellow-300'
                      : 'text-red-400'
                  }`}>
                    {submission.status.replace(/_/g, ' ').toUpperCase()}
                  </span>
                </div>
                {typeof submission.testCasesPassed === 'number' && typeof submission.totalTestCases === 'number' && (
                  <p className="text-sm text-gray-300">
                    Passed {submission.testCasesPassed} of {submission.totalTestCases} test cases
                  </p>
                )}
                {submission.executionTime && (
                  <p className="text-xs text-gray-400">
                    Execution time: {submission.executionTime}ms
                  </p>
                )}
                {submission.errorMessage && (
                  <p className="text-sm text-red-400 mt-2">{submission.errorMessage}</p>
                )}
              </div>

              {submission.testResults && submission.testResults.length > 0 && (
                <details className="bg-black/60 rounded-lg p-3 text-sm text-gray-200">
                  <summary className="cursor-pointer text-purple-300 font-medium">View all test results</summary>
                  <div className="mt-3 space-y-3 max-h-48 overflow-y-auto">
                    {submission.testResults.map((result, index) => (
                      <div key={index} className="border border-purple-800/30 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-semibold text-purple-300">Test Case #{index + 1}</span>
                          <span className={`text-xs font-bold ${result.passed ? 'text-green-400' : 'text-red-400'}`}>
                            {result.passed ? '✓ Passed' : '✗ Failed'}
                          </span>
                        </div>
                        <div className="space-y-2 text-xs text-gray-300">
                          <div>
                            <span className="font-semibold text-blue-300">Input:</span>
                            <pre className="mt-1 bg-black/40 rounded p-2 overflow-auto">{result.input}</pre>
                          </div>
                          <div>
                            <span className="font-semibold text-green-300">Expected:</span>
                            <pre className="mt-1 bg-black/40 rounded p-2 overflow-auto">{result.expectedOutput}</pre>
                          </div>
                          <div>
                            <span className="font-semibold text-yellow-300">Your Output:</span>
                            <pre className="mt-1 bg-black/40 rounded p-2 overflow-auto">{result.actualOutput || '(no output)'}</pre>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </details>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
