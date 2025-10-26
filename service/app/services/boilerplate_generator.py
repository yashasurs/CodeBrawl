"""Boilerplate code generator for different programming languages using AI."""

from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import HumanMessage, SystemMessage
import json
import logging
from typing import Dict, Optional

from app.core.config import settings

logger = logging.getLogger(__name__)


class BoilerplateGenerator:
    """Generate boilerplate starter code for problems in multiple languages."""
    
    # Language-specific details
    LANGUAGE_CONFIGS = {
        "python": {
            "extension": "py",
            "comment": "#",
            "example": "def solution(nums: List[int]) -> int:"
        },
        "javascript": {
            "extension": "js",
            "comment": "//",
            "example": "function solution(nums) {"
        },
        "java": {
            "extension": "java",
            "comment": "//",
            "example": "public int solution(int[] nums) {"
        },
        "cpp": {
            "extension": "cpp",
            "comment": "//",
            "example": "int solution(vector<int>& nums) {"
        },
        "c": {
            "extension": "c",
            "comment": "//",
            "example": "int solution(int* nums, int numsSize) {"
        },
        "csharp": {
            "extension": "cs",
            "comment": "//",
            "example": "public int Solution(int[] nums) {"
        },
        "go": {
            "extension": "go",
            "comment": "//",
            "example": "func solution(nums []int) int {"
        },
        "rust": {
            "extension": "rs",
            "comment": "//",
            "example": "fn solution(nums: Vec<i32>) -> i32 {"
        }
    }
    
    def __init__(self):
        """Initialize the boilerplate generator with Gemini model."""
        self.llm = ChatGoogleGenerativeAI(
            model="gemini-2.0-flash-exp",
            temperature=0.1,  # Low temperature for consistent code generation
            google_api_key=settings.GOOGLE_API_KEY
        )
    
    async def generate_boilerplate(
        self,
        title: str,
        description: str,
        language: str,
        input_format: str = "",
        output_format: str = "",
        constraints: str = "",
        examples: list = None,
        test_cases: list = None  # Added test cases for better type inference
    ) -> str:
        """
        Generate boilerplate code for a specific language.
        
        Args:
            title: Problem title
            description: Problem description
            language: Target programming language
            input_format: Input format description
            output_format: Output format description
            constraints: Problem constraints
            examples: List of example inputs/outputs
            test_cases: List of test case data for type inference
            
        Returns:
            Boilerplate code as a string
        """
        try:
            lang_config = self.LANGUAGE_CONFIGS.get(language.lower())
            if not lang_config:
                raise ValueError(f"Unsupported language: {language}")
            
            logger.info(f"Generating boilerplate for {title} in {language}")
            
            # Build examples text
            examples_text = ""
            if examples:
                examples_text = "\n\nExamples:\n"
                for i, ex in enumerate(examples[:2], 1):  # Use first 2 examples
                    examples_text += f"Example {i}:\n"
                    examples_text += f"Input: {ex.get('input', '')}\n"
                    examples_text += f"Output: {ex.get('output', '')}\n"
            
            # Analyze test cases for input/output structure
            test_case_analysis = ""
            if test_cases and len(test_cases) > 0:
                test_case_analysis = self._analyze_test_cases(test_cases[:3])  # Analyze first 3 test cases
            
            system_prompt = f"""You are an expert competitive programming code generator.
Generate ONLY the boilerplate/starter code that users need to complete.

CRITICAL RULES:
1. Analyze the input/output examples carefully to infer the EXACT function signature
2. Determine parameter types and names from the test case structure
3. Include necessary imports/includes at the top
4. Add helpful comments about what needs to be implemented
5. DO NOT implement the solution logic - leave the function body for the user
6. Use standard competitive programming conventions for {language}
7. Make it easy for beginners - clear parameter names and structure
8. Include a main/driver code section that reads input and calls the function
9. For input/output, use standard input (stdin) and standard output (stdout)
10. Parse the input format exactly as shown in the examples

Return ONLY the code, no explanations or markdown formatting."""

            user_prompt = f"""Generate boilerplate starter code for this problem:

Title: {title}
Language: {language}

Description:
{description}

Input Format: {input_format or 'Read from standard input'}
Output Format: {output_format or 'Write to standard output'}
{examples_text}
{test_case_analysis}

Generate complete boilerplate code that:
1. Infers the EXACT function signature from the input/output examples
2. Has proper parameter types based on the actual test case structure
3. Reads input from stdin in the exact format shown
4. Calls the solution function with parsed parameters
5. Prints the output to stdout in the required format
6. Leaves the function body empty for the user to implement

IMPORTANT: Look at the example inputs/outputs to determine:
- How many parameters the function needs
- What type each parameter should be (int, array, string, etc.)
- How the input is formatted (single line, multiple lines, space-separated, etc.)
- What type the return value should be

Make it beginner-friendly with helpful comments!"""

            messages = [
                SystemMessage(content=system_prompt),
                HumanMessage(content=user_prompt)
            ]
            
            response = await self.llm.ainvoke(messages)
            boilerplate_code = response.content.strip()
            
            # Clean up any markdown code blocks
            if boilerplate_code.startswith("```"):
                lines = boilerplate_code.split("\n")
                # Remove first and last line if they're markdown markers
                if lines[0].startswith("```"):
                    lines = lines[1:]
                if lines and lines[-1].startswith("```"):
                    lines = lines[:-1]
                boilerplate_code = "\n".join(lines)
            
            logger.info(f"Generated boilerplate ({len(boilerplate_code)} chars) for {language}")
            return boilerplate_code
            
        except Exception as e:
            logger.error(f"Error generating boilerplate for {language}: {e}")
            # Return a basic template as fallback
            return self._get_fallback_template(language, title)
    
    def _analyze_test_cases(self, test_cases: list) -> str:
        """
        Analyze test cases to provide hints about input/output structure.
        
        Args:
            test_cases: List of test case dictionaries
            
        Returns:
            Formatted analysis text
        """
        if not test_cases:
            return ""
        
        analysis = "\n\nTest Case Structure Analysis:\n"
        
        for i, tc in enumerate(test_cases[:3], 1):
            # Handle various field name formats
            input_val = tc.get('input', '')
            output_val = tc.get('expected_output') or tc.get('expectedOutput') or tc.get('output', '')
            
            # Skip if both input and output are empty
            if not input_val and not output_val:
                continue
            
            analysis += f"\nTest Case {i}:\n"
            analysis += f"  Input: {input_val}\n"
            analysis += f"  Expected Output: {output_val}\n"
            
            # Try to infer structure only if values exist
            if input_val:
                input_hints = self._infer_data_structure(str(input_val))
                if input_hints:
                    analysis += f"  Input appears to be: {input_hints}\n"
            
            if output_val:
                output_hints = self._infer_data_structure(str(output_val))
                if output_hints:
                    analysis += f"  Output appears to be: {output_hints}\n"
        
        return analysis
    
    def _infer_data_structure(self, value: str) -> str:
        """
        Infer the data structure type from a string value.
        
        Args:
            value: String representation of the value
            
        Returns:
            Description of the inferred structure
        """
        if not value:
            return ""
        
        value = value.strip()
        
        if not value:
            return ""
        
        # Check for common patterns
        if value.startswith('[') and value.endswith(']'):
            return "array/list (square brackets)"
        elif value.startswith('{') and value.endswith('}'):
            return "object/dictionary (curly braces)"
        elif ',' in value or ' ' in value:
            # Check if it's space-separated or comma-separated
            parts = value.replace(',', ' ').split()
            if parts and all(self._is_number(p) for p in parts):
                return f"space/comma-separated numbers ({len(parts)} values)"
            elif parts:
                return "space/comma-separated values"
        elif self._is_number(value):
            if '.' in value:
                return "floating-point number"
            else:
                return "integer"
        elif len(value.split('\n')) > 1:
            return f"multi-line input ({len(value.split('\n'))} lines)"
        else:
            return "string or single value"
    
    def _is_number(self, s: str) -> bool:
        """Check if string represents a number."""
        if not s:
            return False
        try:
            float(s.strip())
            return True
        except (ValueError, AttributeError):
            return False

    
    async def generate_all_languages(
        self,
        title: str,
        description: str,
        input_format: str = "",
        output_format: str = "",
        constraints: str = "",
        examples: list = None,
        test_cases: list = None,  # Added test cases
        languages: list = None
    ) -> Dict[str, str]:
        """
        Generate boilerplates for multiple languages.
        
        Args:
            title: Problem title
            description: Problem description
            input_format: Input format description
            output_format: Output format description
            constraints: Problem constraints
            examples: List of example inputs/outputs
            test_cases: List of test case data for type inference
            languages: List of languages to generate (default: all supported)
            
        Returns:
            Dictionary mapping language to boilerplate code
        """
        if languages is None:
            languages = list(self.LANGUAGE_CONFIGS.keys())
        
        boilerplates = {}
        
        for language in languages:
            try:
                boilerplate = await self.generate_boilerplate(
                    title=title,
                    description=description,
                    language=language,
                    input_format=input_format,
                    output_format=output_format,
                    constraints=constraints,
                    examples=examples,
                    test_cases=test_cases  # Pass test cases
                )
                boilerplates[language] = boilerplate
            except Exception as e:
                logger.error(f"Failed to generate boilerplate for {language}: {e}")
                boilerplates[language] = self._get_fallback_template(language, title)
        
        return boilerplates
    
    def _get_fallback_template(self, language: str, title: str = "Problem") -> str:
        """Get a basic fallback template when AI generation fails."""
        templates = {
            "python": f'''# {title}
# Write your solution below

def solution():
    """
    Implement your solution here
    Read input from stdin
    Print output to stdout
    """
    # Your code here
    pass

if __name__ == "__main__":
    # Read input
    # Call solution()
    # Print output
    pass
''',
            "javascript": f'''// {title}
// Write your solution below

function solution() {{
    // Implement your solution here
    // Read input from stdin
    // Print output to stdout
}}

// Read input and call solution
const readline = require('readline');
const rl = readline.createInterface({{
    input: process.stdin,
    output: process.stdout
}});

// Your code here
''',
            "java": f'''// {title}
import java.util.*;

public class Solution {{
    public static void solution() {{
        // Implement your solution here
    }}
    
    public static void main(String[] args) {{
        Scanner sc = new Scanner(System.in);
        // Read input
        // Call solution()
        // Print output
        sc.close();
    }}
}}
''',
            "cpp": f'''// {title}
#include <iostream>
#include <vector>
using namespace std;

void solution() {{
    // Implement your solution here
}}

int main() {{
    // Read input
    // Call solution()
    // Print output
    return 0;
}}
''',
            "c": f'''// {title}
#include <stdio.h>
#include <stdlib.h>

void solution() {{
    // Implement your solution here
}}

int main() {{
    // Read input
    // Call solution()
    // Print output
    return 0;
}}
''',
            "csharp": f'''// {title}
using System;

public class Solution {{
    public static void solve() {{
        // Implement your solution here
    }}
    
    public static void Main(string[] args) {{
        // Read input
        // Call solve()
        // Print output
    }}
}}
''',
            "go": f'''// {title}
package main

import "fmt"

func solution() {{
    // Implement your solution here
}}

func main() {{
    // Read input
    // Call solution()
    // Print output
}}
''',
            "rust": f'''// {title}
use std::io;

fn solution() {{
    // Implement your solution here
}}

fn main() {{
    // Read input
    // Call solution()
    // Print output
}}
'''
        }
        
        return templates.get(language.lower(), f"// {title}\n// Implement your solution\n")


# Global instance
boilerplate_generator = BoilerplateGenerator()
