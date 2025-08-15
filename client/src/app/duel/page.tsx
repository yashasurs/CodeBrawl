"use client";
import Navbar from '../../components/Navbar';
import React, { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';

const MonacoEditor = dynamic(() => import('@monaco-editor/react'), { ssr: false });

const MOCK_PROBLEM = {
  title: 'Two Sum',
  description: 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.',
  examples: [
    {
      input: 'nums = [2,7,11,15], target = 9',
      output: '[0,1]'
    }
  ],
  constraints: [
    '2 <= nums.length <= 10^4',
    '-10^9 <= nums[i] <= 10^9',
    '-10^9 <= target <= 10^9',
    'Only one valid answer exists.'
  ]
};

const MOCK_PARTICIPANTS = [
  { username: 'Alice', isReady: true },
  { username: 'Bob', isReady: false }
];

const MATCH_DURATION_MINUTES = 30;

const SUPPORTED_LANGUAGES = [
  { value: 'cpp', label: 'C++' },
  { value: 'javascript', label: 'JavaScript' },
  { value: 'python', label: 'Python' },
  { value: 'java', label: 'Java' },
  { value: 'csharp', label: 'C#' },
  { value: 'go', label: 'Go' }
];

export default function DuelMatchPage() {
  const [language, setLanguage] = useState('cpp');
  const [code, setCode] = useState('// Write your solution here');
  const [timeElapsed, setTimeElapsed] = useState(0); // seconds
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Update code template when language changes
  useEffect(() => {
    const templates: { [key: string]: string } = {
      javascript: '// Write your solution here\nfunction twoSum(nums, target) {\n    // Your code here\n}',
      python: '# Write your solution here\ndef two_sum(nums, target):\n    # Your code here\n    pass',
      java: '// Write your solution here\nclass Solution {\n    public int[] twoSum(int[] nums, int target) {\n        // Your code here\n        return new int[0];\n    }\n}',
      cpp: '// Write your solution here\n#include <vector>\nusing namespace std;\n\nclass Solution {\npublic:\n    vector<int> twoSum(vector<int>& nums, int target) {\n        // Your code here\n        return {};\n    }\n};',
      csharp: '// Write your solution here\nusing System;\n\npublic class Solution {\n    public int[] TwoSum(int[] nums, int target) {\n        // Your code here\n        return new int[0];\n    }\n}',
      go: '// Write your solution here\npackage main\n\nfunc twoSum(nums []int, target int) []int {\n    // Your code here\n    return []int{}\n}'
    };
    setCode(templates[language] || templates['cpp']);
  }, [language]);

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setTimeElapsed((prev) => prev + 1);
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const handleRun = () => {
    alert('Run code (feature coming soon)');
  };

  const handleSubmit = () => {
    alert('Submit code (feature coming soon)');
  };

  const handleEditorWillMount = (monaco: any) => {
    // Disable all diagnostics and error checking
    monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
      noSemanticValidation: true,
      noSyntaxValidation: true,
      noSuggestionDiagnostics: true,
    });
    
    monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
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

  return (
    <div className="h-screen flex flex-col">
      <Navbar showAuthButtons={false} pageTitle="Duel Match" />
      
      {/* Top Bar with Timer, Participants, and Controls */}
      <div className="flex items-center justify-between px-6 py-3 bg-black/40 backdrop-blur-sm border-b border-purple-600/30 shadow-sm">
        <div className="flex items-center gap-6">
          {/* Timer */}
          <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-800 rounded-lg shadow-lg">
            <span className="text-white font-mono text-lg font-bold">
              ⏰ {formatTime(timeElapsed)}
            </span>
          </div>
          
          {/* Participants */}
          <div className="flex items-center gap-3">
            {MOCK_PARTICIPANTS.map((p) => (
              <div 
                key={p.username} 
                className={`flex items-center gap-2 px-3 py-1 rounded-lg text-sm font-medium border ${
                  p.isReady 
                    ? 'bg-emerald-900/30 border-emerald-400 text-emerald-300' 
                    : 'bg-amber-900/30 border-amber-400 text-amber-300'
                }`}
              >
                <span>{p.username}</span>
                <span>{p.isReady ? '✓' : '⏳'}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-3">
          <select 
            value={language} 
            onChange={(e) => setLanguage(e.target.value)}
            className="px-3 py-2 border border-purple-600/30 rounded-lg bg-black/60 backdrop-blur-sm text-purple-300 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-400 hover:border-purple-500 transition-colors"
          >
            {SUPPORTED_LANGUAGES.map((lang) => (
              <option key={lang.value} value={lang.value} className="bg-gray-900 text-purple-300">{lang.label}</option>
            ))}
          </select>
          <button 
            onClick={handleRun} 
            className="px-4 py-2 bg-gradient-to-r from-gray-600 to-gray-800 border border-gray-500/30 text-white rounded-lg hover:from-gray-700 hover:to-gray-900 text-sm font-medium transition-all duration-200 shadow-lg"
          >
            Run
          </button>
          <button 
            onClick={handleSubmit} 
            className="px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-800 text-white rounded-lg hover:from-purple-700 hover:to-purple-900 text-sm font-medium transition-all duration-200 shadow-lg border border-purple-400/30"
          >
            Submit
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Problem Description Panel */}
        <div className="w-1/2 bg-black/40 backdrop-blur-sm border-r border-purple-600/30 overflow-y-auto">
          <div className="p-6">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-purple-300 mb-2">
                {MOCK_PROBLEM.title}
              </h1>
              <div className="flex gap-2 mb-4">
                <span className="px-3 py-1 bg-yellow-600/20 text-yellow-300 text-sm font-medium rounded-lg border border-yellow-600/30">
                  Medium
                </span>
              </div>
            </div>

            <div className="prose prose-invert max-w-none">
              <p className="text-gray-300 mb-6 leading-relaxed">
                {MOCK_PROBLEM.description}
              </p>

              <div className="mb-6">
                <h3 className="text-lg font-semibold text-purple-400 mb-3">
                  Example 1:
                </h3>
                <div className="bg-gray-900/60 rounded-lg p-4 font-mono text-sm border border-gray-700">
                  <div className="mb-2">
                    <span className="text-blue-300">Input: </span>
                    <span className="text-gray-200">{MOCK_PROBLEM.examples[0].input}</span>
                  </div>
                  <div>
                    <span className="text-green-300">Output: </span>
                    <span className="text-gray-200">{MOCK_PROBLEM.examples[0].output}</span>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-semibold text-purple-400 mb-3">
                  Constraints:
                </h3>
                <ul className="list-disc list-inside text-gray-300 space-y-1">
                  {MOCK_PROBLEM.constraints.map((constraint, index) => (
                    <li key={index} className="font-mono text-sm">{constraint}</li>
                  ))}
                </ul>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-semibold text-purple-400 mb-3">
                  Test Cases:
                </h3>
                <div className="space-y-4">
                  {MOCK_PROBLEM.examples.map((ex, idx) => (
                    <div key={idx} className="bg-gray-950/80 p-4 rounded-xl border border-purple-700/40 shadow-lg backdrop-blur-sm">
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-blue-300">Input:</span> 
                          <code className="bg-gray-800 px-2 py-1 rounded text-white text-sm">{ex.input}</code>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-green-400">Expected Output:</span> 
                          <code className="bg-gray-800 px-2 py-1 rounded text-white text-sm">{ex.output}</code>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
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
              <div className="flex items-center gap-2">
                <button className="p-1 hover:bg-purple-600/20 rounded text-purple-400 hover:text-purple-300 transition-colors">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/>
                    <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd"/>
                  </svg>
                </button>
                <button className="p-1 hover:bg-purple-600/20 rounded text-purple-400 hover:text-purple-300 transition-colors">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd"/>
                  </svg>
                </button>
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
        </div>
      </div>
    </div>
  );
}
