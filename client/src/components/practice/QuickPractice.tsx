"use client";

import dynamic from 'next/dynamic';
import { useEffect, useMemo, useState } from 'react';
import type {
  PracticeDifficulty,
  PracticeLanguage,
  PracticeProblem,
  PracticeSubmission,
} from '@/types/practice';

const MonacoEditor = dynamic(() => import('@monaco-editor/react'), { ssr: false });

const LANGUAGE_OPTIONS: { value: PracticeLanguage; label: string }[] = [
  { value: 'javascript', label: 'JavaScript' },
  { value: 'python', label: 'Python' },
  { value: 'cpp', label: 'C++' },
  { value: 'java', label: 'Java' },
  { value: 'c', label: 'C' },
  { value: 'csharp', label: 'C#' },
  { value: 'go', label: 'Go' },
  { value: 'rust', label: 'Rust' },
];

interface QuickPracticeProps {
  onRandomProblem: (difficulty?: PracticeDifficulty) => Promise<void>;
  activeProblem: PracticeProblem | null;
  onSubmitSolution: (payload: { problemId: string; code: string; language: PracticeLanguage }) => Promise<void>;
  loadingState: {
    random: boolean;
    submission: boolean;
    [key: string]: boolean;
  };
  activeSubmission: PracticeSubmission | null;
  problems: { _id: string; title: string; difficulty: string }[];
}

export default function QuickPractice({
  onRandomProblem,
  activeProblem,
  onSubmitSolution,
  loadingState,
  activeSubmission,
  problems,
}: QuickPracticeProps) {
  const [language, setLanguage] = useState<PracticeLanguage>('javascript');
  const [code, setCode] = useState('');

  const isActionDisabled = loadingState.random;

  useEffect(() => {
    if (!activeProblem) {
      setCode('');
      return;
    }

    const starter = activeProblem.starterCode || {};

    setLanguage((previous) => {
      const available = Object.keys(starter) as PracticeLanguage[];
      const nextLanguage = available.find((key) => starter[key]) || previous;
      setCode(starter[nextLanguage] || '');
      return nextLanguage;
    });
  }, [activeProblem]);

  useEffect(() => {
    if (!activeProblem) return;
    const starter = activeProblem.starterCode || {};
    if (starter[language]) {
      setCode(starter[language] || '');
    }
  }, [language, activeProblem]);

  const visibleExamples = useMemo(() => {
    if (!activeProblem?.examples?.length) {
      return [];
    }
    return activeProblem.examples.filter((example) => example.input || example.output);
  }, [activeProblem]);

  const publicTestCases = useMemo(() => {
    if (!activeProblem?.testCases?.length) {
      return [];
    }
    return activeProblem.testCases.filter((testCase) => !testCase.isHidden);
  }, [activeProblem]);

  const handleSubmit = async () => {
    if (!activeProblem) return;
    await onSubmitSolution({
      problemId: activeProblem._id,
      code,
      language,
    });
  };

  const startRandom = async (difficulty?: PracticeDifficulty) => {
    await onRandomProblem(difficulty);
  };

  return (
    <div className="py-12 px-6">
      <div className="max-w-6xl mx-auto space-y-12">
        <section className="text-center">
          <h2 className="text-3xl font-bold mb-8 bg-gradient-to-r from-purple-400 to-white bg-clip-text text-transparent">
            Quick Practice
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { label: 'Easy Challenge', emoji: '🟢', description: 'Start with fundamental problems to build confidence', difficulty: 'Easy' as PracticeDifficulty },
              { label: 'Medium Challenge', emoji: '🟡', description: 'Take on intermediate problems for steady growth', difficulty: 'Medium' as PracticeDifficulty },
              { label: 'Hard Challenge', emoji: '🔴', description: 'Push your limits with advanced algorithms', difficulty: 'Hard' as PracticeDifficulty },
            ].map((item) => (
              <div
                key={item.label}
                className="bg-black/40 backdrop-blur-sm border border-purple-800/30 rounded-xl p-6 text-center hover:bg-purple-900/20 transition-all duration-300 transform hover:scale-105"
              >
                <div className="text-4xl mb-4">{item.emoji}</div>
                <h3 className="text-xl font-bold mb-3 text-purple-200">{item.label}</h3>
                <p className="text-gray-400 mb-4">{item.description}</p>
                <button
                  type="button"
                  onClick={() => startRandom(item.difficulty)}
                  disabled={isActionDisabled}
                  className="px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 rounded-lg font-bold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Start {item.difficulty}
                </button>
              </div>
            ))}
          </div>
        </section>

        <section className="grid lg:grid-cols-2 gap-8">
          <div className="bg-black/40 backdrop-blur-sm border border-purple-800/30 rounded-2xl p-6 max-h-[80vh] overflow-y-auto">
            {activeProblem ? (
              <div className="space-y-6">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-2xl font-bold text-purple-200">{activeProblem.title}</h3>
                    <span
                      className={`px-3 py-1 text-sm font-semibold rounded-full border ${
                        activeProblem.difficulty === 'Easy'
                          ? 'border-green-500 text-green-300 bg-green-900/20'
                          : activeProblem.difficulty === 'Medium'
                          ? 'border-yellow-500 text-yellow-300 bg-yellow-900/20'
                          : 'border-red-500 text-red-300 bg-red-900/20'
                      }`}
                    >
                      {activeProblem.difficulty}
                    </span>
                  </div>
                  <p className="text-gray-300 leading-relaxed whitespace-pre-line">{activeProblem.description}</p>
                </div>

                {visibleExamples.length > 0 && (
                  <div>
                    <h4 className="text-lg font-semibold text-purple-300 mb-3">Examples</h4>
                    <div className="space-y-4">
                      {visibleExamples.map((example, index) => (
                        <div key={index} className="bg-gray-900/60 border border-purple-800/40 rounded-xl p-4">
                          {example.input && (
                            <div className="mb-2">
                              <span className="text-blue-300 font-semibold">Input:</span>
                              <pre className="mt-1 bg-black/40 rounded-lg p-3 text-sm text-gray-200 overflow-auto">{example.input}</pre>
                            </div>
                          )}
                          {example.output && (
                            <div className="mb-2">
                              <span className="text-green-300 font-semibold">Output:</span>
                              <pre className="mt-1 bg-black/40 rounded-lg p-3 text-sm text-gray-200 overflow-auto">{example.output}</pre>
                            </div>
                          )}
                          {example.explanation && (
                            <p className="text-gray-400 text-sm">{example.explanation}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeProblem.constraints && (
                  <div>
                    <h4 className="text-lg font-semibold text-purple-300 mb-3">Constraints</h4>
                    <pre className="bg-gray-900/60 border border-purple-800/40 rounded-xl p-4 text-sm text-gray-200 whitespace-pre-wrap">
                      {activeProblem.constraints}
                    </pre>
                  </div>
                )}

                {publicTestCases.length > 0 && (
                  <div>
                    <h4 className="text-lg font-semibold text-purple-300 mb-3">Sample Test Cases</h4>
                    <div className="space-y-4">
                      {publicTestCases.map((testCase, index) => (
                        <div key={index} className="bg-gray-950/60 border border-purple-800/40 rounded-xl p-4">
                          <div>
                            <span className="text-blue-300 font-semibold">Input:</span>
                            <pre className="mt-1 bg-black/40 rounded-lg p-3 text-sm text-gray-200 overflow-auto">{testCase.input}</pre>
                          </div>
                          <div className="mt-3">
                            <span className="text-green-300 font-semibold">Expected Output:</span>
                            <pre className="mt-1 bg-black/40 rounded-lg p-3 text-sm text-gray-200 overflow-auto">{testCase.expectedOutput}</pre>
                          </div>
                          {testCase.explanation && (
                            <p className="text-gray-400 text-sm mt-2">{testCase.explanation}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-purple-200">
                Generate or select a problem to get started.
              </div>
            )}
          </div>

          <div className="bg-black/40 backdrop-blur-sm border border-purple-800/30 rounded-2xl p-6 flex flex-col space-y-6">
            <div className="flex flex-col gap-3">
              <label htmlFor="language" className="text-sm font-semibold text-purple-200">
                Language
              </label>
              <select
                id="language"
                value={language}
                onChange={(event) => setLanguage(event.target.value as PracticeLanguage)}
                disabled={!activeProblem}
                className="px-4 py-3 bg-black/60 border border-purple-600/70 rounded-xl text-white focus:outline-none focus:border-purple-400 disabled:opacity-50"
              >
                {LANGUAGE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex-1 min-h-[320px] overflow-hidden rounded-xl border border-purple-800/40">
              <MonacoEditor
                height="100%"
                language={language}
                value={code}
                onChange={(value) => setCode(value ?? '')}
                options={{
                  theme: 'vs-dark',
                  minimap: { enabled: false },
                  fontSize: 15,
                  fontFamily: 'JetBrains Mono, Fira Code, Source Code Pro, monospace',
                  automaticLayout: true,
                  scrollBeyondLastLine: false,
                  wordWrap: 'on',
                }}
              />
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => startRandom(undefined)}
                disabled={isActionDisabled}
                className="px-4 py-2 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 rounded-lg font-medium text-white transition disabled:opacity-50"
              >
                {loadingState.random ? 'Loading random…' : 'Random Problem'}
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={!activeProblem || loadingState.submission}
                className="px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900 rounded-lg font-semibold text-white transition disabled:opacity-50"
              >
                {loadingState.submission ? 'Evaluating…' : 'Submit Solution'}
              </button>
            </div>

            {activeSubmission && (
              <div className="bg-gray-950/60 border border-purple-800/40 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-purple-200">Last submission</span>
                  <span className={`text-sm font-bold ${
                    activeSubmission.status === 'accepted'
                      ? 'text-green-400'
                      : activeSubmission.status === 'pending'
                      ? 'text-yellow-300'
                      : 'text-red-400'
                  }`}>
                    {activeSubmission.status.replace(/_/g, ' ')}
                  </span>
                </div>
                {typeof activeSubmission.testCasesPassed === 'number' && typeof activeSubmission.totalTestCases === 'number' && (
                  <p className="text-sm text-gray-300">
                    Passed {activeSubmission.testCasesPassed} of {activeSubmission.totalTestCases} test cases
                  </p>
                )}
                {activeSubmission.errorMessage && (
                  <p className="text-sm text-red-400">{activeSubmission.errorMessage}</p>
                )}
                {activeSubmission.testResults && activeSubmission.testResults.length > 0 && (
                  <details className="bg-black/60 rounded-lg p-3 text-sm text-gray-200">
                    <summary className="cursor-pointer text-purple-300">View detailed results</summary>
                    <div className="mt-3 space-y-3">
                      {activeSubmission.testResults.map((result, index) => (
                        <div key={index} className="border border-purple-800/30 rounded-lg p-3">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-semibold text-purple-300">Test #{index + 1}</span>
                            <span className={`text-xs font-bold ${result.passed ? 'text-green-400' : 'text-red-400'}`}>
                              {result.passed ? 'Passed' : 'Failed'}
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
                              <pre className="mt-1 bg-black/40 rounded p-2 overflow-auto">{result.actualOutput}</pre>
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
        </section>
      </div>
    </div>
  );
}
