"""Simplified problem generation workflow using Gemini AI."""

from typing import Dict, Any, List, Optional
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import HumanMessage, SystemMessage
from pydantic import BaseModel
import json
import logging

from app.core.config import settings
from app.schemas.schemas import TestCase

logger = logging.getLogger(__name__)


class ProblemData(BaseModel):
    """Problem data from Express backend."""
    leetcode_id: Optional[str] = None
    title: str = ""
    title_slug: str = ""
    description: str = ""
    difficulty: str = ""
    tags: List[str] = []
    examples: List[Dict[str, str]] = []
    constraints: str = ""


class ProblemGenerator:
    """Simplified problem generator using Gemini AI."""
    
    def __init__(self):
        # Use gemini-2.5-flash - stable version, fast and cost-effective
        self.llm = ChatGoogleGenerativeAI(
            model="gemini-2.5-flash",
            google_api_key=settings.GOOGLE_API_KEY,
            temperature=0.3
        )
    
    def _clean_json_response(self, content: str) -> str:
        """Clean LLM response to extract valid JSON."""
        content = content.strip()
        
        # Remove markdown code blocks if present
        if content.startswith("```json"):
            content = content[7:]
        elif content.startswith("```"):
            content = content[3:]
        if content.endswith("```"):
            content = content[:-3]
        
        return content.strip()
    
    async def format_problem_statement(self, problem_data: ProblemData) -> Dict[str, Any]:
        """Format problem statement using Gemini LLM."""
        try:
            examples_text = ""
            if problem_data.examples:
                examples_text = "\n\nExamples:\n"
                for i, ex in enumerate(problem_data.examples[:3], 1):
                    examples_text += f"\nExample {i}:\n"
                    examples_text += f"Input: {ex.get('input', '')}\n"
                    examples_text += f"Output: {ex.get('output', '')}\n"
                    if ex.get('explanation'):
                        examples_text += f"Explanation: {ex.get('explanation', '')}\n"
            
            # Detect if this is a visual problem
            tags_str = ', '.join(problem_data.tags).lower()
            is_visual_problem = any(keyword in tags_str for keyword in ['tree', 'graph', 'binary tree', 'linked list', 'matrix'])
            
            visual_note = ""
            if is_visual_problem:
                visual_note = """
                
                IMPORTANT NOTE: This problem involves visual data structures. 
                In your problem statement, include:
                1. Clear textual representation format (e.g., how trees/graphs are represented in input)
                2. Example of structure visualization in text format
                3. Clear explanation of traversal or access patterns if relevant
                """
            
            prompt = f"""
            You are a competitive programming problem formatter. Given this problem from the database, 
            create a clear and well-formatted problem statement for a coding competition.
            
            Problem Information:
            Title: {problem_data.title}
            Difficulty: {problem_data.difficulty}
            Tags: {', '.join(problem_data.tags)}
            Original Description: {problem_data.description}
            Constraints: {problem_data.constraints}
            {examples_text}
            {visual_note}
            
            Please format this as a competitive programming problem with:
            1. A clear and concise problem statement (2-3 paragraphs)
               - If this involves trees/graphs/matrices, explain the textual representation clearly
               - Include what the data structure represents and how to interpret it
            2. Clear input format specification
               - For visual problems: Explain exactly how the structure is represented (e.g., "Tree nodes in level-order", "Adjacency list format")
            3. Clear output format specification
            4. Well-formatted constraints section
            5. Suggested time limit (in seconds) based on difficulty
            6. Suggested memory limit (in MB)
            
            Return your response in this JSON format:
            {{
                "formatted_statement": "clear problem description with structure representation explained",
                "input_format": "detailed input format description (include representation format for visual structures)",
                "output_format": "detailed output format description", 
                "constraints": "formatted constraints",
                "time_limit": 2,
                "memory_limit": 256
            }}
            
            Important: Return ONLY valid JSON, no markdown or extra text.
            """
            
            messages = [
                SystemMessage(content="You are a competitive programming expert who formats problem statements clearly."),
                HumanMessage(content=prompt)
            ]
            
            response = await self.llm.ainvoke(messages)
            
            # Clean response content
            content = response.content.strip()
            
            # Remove markdown code blocks if present
            if content.startswith("```json"):
                content = content[7:]
            elif content.startswith("```"):
                content = content[3:]
            if content.endswith("```"):
                content = content[:-3]
            content = content.strip()
            
            # Parse JSON response
            try:
                result = json.loads(content)
                return {
                    "formatted_statement": result.get("formatted_statement", problem_data.description),
                    "input_format": result.get("input_format", "Standard input format"),
                    "output_format": result.get("output_format", "Standard output format"),
                    "constraints": result.get("constraints", problem_data.constraints or "Standard constraints"),
                    "time_limit": result.get("time_limit", 2),
                    "memory_limit": result.get("memory_limit", 256)
                }
            except json.JSONDecodeError as e:
                logger.error(f"JSON parsing error: {e}\nContent: {content}")
                # Fallback to original data
                return {
                    "formatted_statement": problem_data.description,
                    "input_format": "Standard input format",
                    "output_format": "Standard output format",
                    "constraints": problem_data.constraints or "Standard constraints",
                    "time_limit": 2,
                    "memory_limit": 256
                }
                
        except Exception as e:
            logger.error(f"Error formatting problem: {e}")
            raise Exception(f"Failed to format problem: {str(e)}")
    
    async def generate_test_cases(self, problem_data: ProblemData, formatted_statement: str, 
                                 input_format: str, output_format: str, constraints: str) -> List[TestCase]:
        """Generate test cases using Gemini LLM."""
        try:
            examples_text = ""
            if problem_data.examples:
                examples_text = "\n\nExisting Examples:\n"
                for i, ex in enumerate(problem_data.examples[:3], 1):
                    examples_text += f"\nExample {i}:\n"
                    examples_text += f"Input: {ex.get('input', '')}\n"
                    examples_text += f"Output: {ex.get('output', '')}\n"
            
            # Detect if this is a visual problem (trees, graphs, etc.)
            tags_str = ', '.join(problem_data.tags).lower()
            is_visual_problem = any(keyword in tags_str for keyword in ['tree', 'graph', 'binary tree', 'linked list', 'matrix'])
            
            visual_instruction = ""
            if is_visual_problem:
                visual_instruction = """
                IMPORTANT: This problem involves visual data structures (trees/graphs/matrices/linked lists).
                Since images cannot be displayed, your explanations MUST be extremely detailed and descriptive.
                
                For EACH test case explanation, you MUST include:
                1. A detailed textual visualization of the data structure
                2. Description of what the input represents (structure, relationships, values)
                3. Description of what the output represents (not HOW to compute it)
                4. ASCII art representation where helpful (for trees use parent-child notation)
                5. Explanation of WHY this specific output is expected for this input
                
                Example for tree: "The tree structure is: root(5) with left child(3) having children(2,4), and right child(8) with children(6,9). The expected output is 3 because..."
                Example for graph: "The graph has 4 nodes. Node 0 connects to [1,2], Node 1 connects to [2,3], etc. The result is [0,1,2,3] because..."
                Example for matrix: "The 3x3 matrix has values [[1,2,3],[4,5,6],[7,8,9]]. The expected sum is 45 because it includes all elements."
                
                CRITICAL: DO NOT describe the algorithm steps. Only explain WHAT the input/output represents, not HOW to solve it.
                """
            
            prompt = f"""
            Generate comprehensive test cases for this competitive programming problem:
            
            Problem: {problem_data.title}
            Difficulty: {problem_data.difficulty}
            Tags: {', '.join(problem_data.tags)}
            Statement: {formatted_statement}
            Input Format: {input_format}
            Output Format: {output_format}
            Constraints: {constraints}
            {examples_text}
            {visual_instruction}
            
            Generate 10-15 test cases including:
            - 2-3 simple example cases (visible to users) - These MUST have detailed explanations
            - 3-4 medium complexity cases - Include explanations for variety
            - 3-4 edge cases (boundary conditions) - Explain the edge case
            - 2-3 complex/large cases - Brief explanation of complexity
            
            For each test case, provide:
            - input: the test input data (REQUIRED - must not be empty)
            - expected_output: the correct output (REQUIRED - must not be empty)
            - explanation: DETAILED explanation (REQUIRED for visible test cases, optional for hidden)
              
              **EXPLANATION GUIDELINES - VERY IMPORTANT:**
              * EXPLAIN WHAT the input represents and WHAT the output means
              * DO NOT explain HOW to solve it or describe algorithm steps
              * DO NOT give away the solution approach or algorithm
              * Focus on describing the data structure, relationships, and expected result
              * For visual problems: Describe the structure clearly (tree/graph layout, connections, values)
              * For edge cases: Explain what boundary condition is being tested (empty input, max values, etc.)
              * Think of it as: "Given THIS input structure, we expect THIS output because..."
              
              BAD example (reveals solution): "Sort the array in ascending order, then find the median by taking the middle element"
              GOOD example (explains without spoiling): "The input array [3,1,4,1,5] contains 5 elements. The expected output is 3, which represents the middle value when the elements are properly ordered."
              
              BAD example: "Use DFS to traverse from root to all leaves, tracking the maximum depth at each level"
              GOOD example: "The tree has a root node 1 with two children (2,3). Node 2 has one child (4). The maximum distance from root to any leaf node is 3."
            
            - is_example: true for first 2-3 cases (these will be shown to users), false for others
            - is_hidden: false for first 2-3 cases, true for others
            
            CRITICAL: 
            1. Every test case MUST have both "input" and "expected_output" fields with non-empty values!
            2. Explanations should be educational but NOT reveal the solution algorithm!
            
            Return ONLY a valid JSON array, no markdown or extra text:
            [
                {{
                    "input": "test input (REQUIRED)",
                    "expected_output": "expected output (REQUIRED)",
                    "explanation": "detailed explanation here - describe WHAT, not HOW (2-4 sentences for visible cases)",
                    "is_example": true,
                    "is_hidden": false
                }}
            ]
            
            Remember: Help users understand the test case WITHOUT giving away the solution approach!
            """
            
            messages = [
                SystemMessage(content="You are an expert at generating comprehensive test cases for competitive programming."),
                HumanMessage(content=prompt)
            ]
            
            response = await self.llm.ainvoke(messages)
            
            # Clean response content
            content = response.content.strip()
            
            # Remove markdown code blocks if present
            if content.startswith("```json"):
                content = content[7:]
            elif content.startswith("```"):
                content = content[3:]
            if content.endswith("```"):
                content = content[:-3]
            content = content.strip()
            
            try:
                test_cases_data = json.loads(content)
                test_cases = []
                
                # Validate and filter test cases
                for i, tc in enumerate(test_cases_data):
                    # Ensure required fields exist and are not empty
                    input_val = tc.get('input', '')
                    output_val = tc.get('expected_output', '')
                    
                    # Skip test cases with missing required fields
                    if not input_val or not output_val:
                        logger.warning(f"Skipping test case {i} with missing required fields: input={bool(input_val)}, output={bool(output_val)}")
                        continue
                    
                    # Convert to string to ensure consistency
                    test_cases.append(TestCase(
                        input=str(input_val),
                        expected_output=str(output_val),
                        explanation=tc.get('explanation', ''),
                        is_example=tc.get('is_example', False),
                        is_hidden=not tc.get('is_example', False)
                    ))
                
                # Ensure we have at least some test cases
                if len(test_cases) == 0:
                    logger.error("No valid test cases generated, using fallback")
                    raise ValueError("No valid test cases in generated data")
                
                logger.info(f"Successfully validated {len(test_cases)} test cases")
                return test_cases
            except (json.JSONDecodeError, ValueError) as e:
                logger.error(f"JSON parsing error in test cases: {e}\nContent: {content}")
                # Fallback: use examples from problem data if available
                fallback_cases = []
                for i, ex in enumerate(problem_data.examples[:3]):
                    fallback_cases.append(TestCase(
                        input=ex.get('input', ''),
                        expected_output=ex.get('output', ''),
                        explanation=ex.get('explanation', ''),
                        is_example=True,
                        is_hidden=False
                    ))
                
                if not fallback_cases:
                    # Ultimate fallback
                    fallback_cases = [
                        TestCase(
                            input="1",
                            expected_output="1",
                            explanation="Sample test case",
                            is_example=True,
                            is_hidden=False
                        )
                    ]
                return fallback_cases
                
        except Exception as e:
            logger.error(f"Error generating test cases: {e}")
            raise Exception(f"Failed to generate test cases: {str(e)}")
    
    async def generate_problem(self, problem_data: ProblemData) -> Dict[str, Any]:
        """
        Main method to generate formatted problem statement and test cases.
        This is called by the FastAPI endpoint when Express backend sends problem data.
        """
        try:
            # Step 1: Format the problem statement
            logger.info(f"Formatting problem statement for: {problem_data.title}")
            formatted_data = await self.format_problem_statement(problem_data)
            
            # Step 2: Generate comprehensive test cases
            logger.info(f"Generating test cases for: {problem_data.title}")
            test_cases = await self.generate_test_cases(
                problem_data,
                formatted_data["formatted_statement"],
                formatted_data["input_format"],
                formatted_data["output_format"],
                formatted_data["constraints"]
            )
            
            # Step 3: Return complete problem data
            logger.info(f"Problem generation completed for: {problem_data.title}")
            return {
                "leetcode_id": problem_data.leetcode_id,
                "title": problem_data.title,
                "title_slug": problem_data.title_slug,
                "difficulty": problem_data.difficulty,
                "tags": problem_data.tags,
                "formatted_statement": formatted_data["formatted_statement"],
                "input_format": formatted_data["input_format"],
                "output_format": formatted_data["output_format"],
                "constraints": formatted_data["constraints"],
                "test_cases": test_cases,
                "time_limit": formatted_data["time_limit"],
                "memory_limit": formatted_data["memory_limit"]
            }
            
        except Exception as e:
            logger.error(f"Error in generate_problem: {e}")
            raise Exception(f"Failed to generate problem content: {str(e)}")


# Global generator instance
problem_generator = ProblemGenerator()


async def generate_problem(problem_data: ProblemData) -> Dict[str, Any]:
    """
    Main entry point for problem generation.
    Use this function from your FastAPI endpoints.
    """
    return await problem_generator.generate_problem(problem_data)