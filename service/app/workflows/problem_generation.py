"""LangGraph workflow for problem generation."""

from typing import Dict, Any, List
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import HumanMessage, SystemMessage
from langgraph.graph import StateGraph, END
from pydantic import BaseModel
import json
import logging

from app.core.config import settings
from app.schemas.schemas import TestCase

logger = logging.getLogger(__name__)


class ProblemGenerationState(BaseModel):
    """State for problem generation workflow."""
    leetcode_id: str = None  # Changed to string to match questionFrontendId
    title: str = ""
    title_slug: str = ""
    original_statement: str = ""
    difficulty: str = ""
    tags: List[str] = []  # Added tags from topicTags
    acceptance_rate: float = 0.0  # Added acceptance rate
    
    # Generated content
    formatted_statement: str = ""
    input_format: str = ""
    output_format: str = ""
    constraints: str = ""
    test_cases: List[TestCase] = []
    time_limit: int = 0
    memory_limit: int = 0
    scoring_weight: int = 1
    
    # Workflow control
    error: str = ""
    completed: bool = False


class ProblemGenerationWorkflow:
    """LangGraph workflow for generating competitive programming problems."""
    
    def __init__(self):
        self.llm = ChatGoogleGenerativeAI(
            model="gemini-pro",
            google_api_key=settings.GOOGLE_API_KEY,
            temperature=0.3
        )
        self.workflow = self._create_workflow()
    
    def _create_workflow(self) -> StateGraph:
        """Create the LangGraph workflow."""
        workflow = StateGraph(ProblemGenerationState)
        
        # Add nodes
        workflow.add_node("retrieve_problem", self.retrieve_problem)
        workflow.add_node("format_problem", self.format_problem)
        workflow.add_node("generate_testcases", self.generate_testcases)
        workflow.add_node("finalize", self.finalize)
        
        # Add edges
        workflow.set_entry_point("retrieve_problem")
        workflow.add_edge("retrieve_problem", "format_problem")
        workflow.add_edge("format_problem", "generate_testcases")
        workflow.add_edge("generate_testcases", "finalize")
        workflow.add_edge("finalize", END)
        
        return workflow.compile()
    
    async def retrieve_problem(self, state: ProblemGenerationState) -> Dict[str, Any]:
        """Retrieve problem from LeetCode dataset."""
        try:
            # Load LeetCode dataset
            with open(settings.LEETCODE_DATASET_PATH, 'r') as f:
                dataset = json.load(f)
            
            # Get the problems list from the new structure
            problems = dataset.get('problemsetQuestionList', [])
            
            # Find problem by ID or title
            problem = None
            for p in problems:
                if (state.leetcode_id and p.get('questionFrontendId') == state.leetcode_id) or \
                   (state.title and state.title.lower() in p.get('title', '').lower()):
                    problem = p
                    break
            
            if not problem:
                return {
                    "error": f"Problem not found: ID={state.leetcode_id}, Title={state.title}"
                }
            
            # Extract tags from topicTags
            tags = [tag.get('name', '') for tag in problem.get('topicTags', [])]
            
            return {
                "leetcode_id": problem.get('questionFrontendId'),
                "title": problem.get('title', ''),
                "title_slug": problem.get('titleSlug', ''),
                "difficulty": problem.get('difficulty', 'Medium'),
                "tags": tags,
                "acceptance_rate": problem.get('acRate', 0.0),
                "original_statement": f"Problem: {problem.get('title')}\nDifficulty: {problem.get('difficulty')}\nAcceptance Rate: {problem.get('acRate', 0):.1f}%\nTags: {', '.join(tags)}",
                "error": ""
            }
            
        except Exception as e:
            logger.error(f"Error retrieving problem: {e}")
            return {"error": f"Failed to retrieve problem: {str(e)}"}
    
    async def format_problem(self, state: ProblemGenerationState) -> Dict[str, Any]:
        """Format problem using Gemini LLM."""
        try:
            prompt = f"""
            You are a competitive programming problem formatter. Given this LeetCode problem, 
            reformat it for a coding competition with the following structure:
            
            Original Problem:
            Title: {state.title}
            Slug: {state.title_slug}
            Difficulty: {state.difficulty}
            Tags: {', '.join(state.tags)}
            Acceptance Rate: {state.acceptance_rate:.1f}%
            Statement: {state.original_statement}
            
            Please format this as a competitive programming problem with:
            1. A concise problem statement (2-3 paragraphs max)
            2. Clear input format specification
            3. Clear output format specification
            4. Constraints section
            5. Suggested time and memory limits
            6. Scoring weight based on difficulty
            
            Return your response in this JSON format:
            {{
                "formatted_statement": "concise problem description",
                "input_format": "input format description",
                "output_format": "output format description", 
                "constraints": "constraints description",
                "time_limit": 60,
                "memory_limit": 256,
                "scoring_weight": 1
            }}
            """
            
            messages = [
                SystemMessage(content="You are a competitive programming expert."),
                HumanMessage(content=prompt)
            ]
            
            response = await self.llm.ainvoke(messages)
            
            # Parse JSON response
            try:
                result = json.loads(response.content)
                return {
                    "formatted_statement": result.get("formatted_statement", ""),
                    "input_format": result.get("input_format", ""),
                    "output_format": result.get("output_format", ""),
                    "constraints": result.get("constraints", ""),
                    "time_limit": result.get("time_limit", 60),
                    "memory_limit": result.get("memory_limit", 256),
                    "scoring_weight": result.get("scoring_weight", 1)
                }
            except json.JSONDecodeError:
                # Fallback parsing if JSON fails
                content = response.content
                return {
                    "formatted_statement": content[:500] + "..." if len(content) > 500 else content,
                    "input_format": "Standard input format",
                    "output_format": "Standard output format",
                    "constraints": "Standard constraints apply",
                    "time_limit": 60,
                    "memory_limit": 256,
                    "scoring_weight": 1
                }
                
        except Exception as e:
            logger.error(f"Error formatting problem: {e}")
            return {"error": f"Failed to format problem: {str(e)}"}
    
    async def generate_testcases(self, state: ProblemGenerationState) -> Dict[str, Any]:
        """Generate test cases using Gemini LLM."""
        try:
            prompt = f"""
            Generate 4-6 test cases for this competitive programming problem:
            
            Problem: {state.title}
            Statement: {state.formatted_statement}
            Input Format: {state.input_format}
            Output Format: {state.output_format}
            Constraints: {state.constraints}
            
            Generate test cases including:
            - 2-3 example cases (simple, medium complexity)
            - 1-2 edge cases (boundary conditions)
            - 1 complex case
            
            Return as JSON array:
            [
                {{
                    "input": "test input",
                    "expected_output": "expected output",
                    "explanation": "brief explanation",
                    "is_example": true
                }}
            ]
            """
            
            messages = [
                SystemMessage(content="You are a test case generation expert."),
                HumanMessage(content=prompt)
            ]
            
            response = await self.llm.ainvoke(messages)
            
            try:
                test_cases_data = json.loads(response.content)
                test_cases = [TestCase(**tc) for tc in test_cases_data]
                return {"test_cases": test_cases}
            except (json.JSONDecodeError, ValueError):
                # Fallback test cases
                return {
                    "test_cases": [
                        TestCase(
                            input="Sample input",
                            expected_output="Sample output",
                            explanation="Example test case",
                            is_example=True
                        )
                    ]
                }
                
        except Exception as e:
            logger.error(f"Error generating test cases: {e}")
            return {"error": f"Failed to generate test cases: {str(e)}"}
    
    async def finalize(self, state: ProblemGenerationState) -> Dict[str, Any]:
        """Finalize the problem generation."""
        if state.error:
            return {"completed": False}
        
        return {"completed": True}
    
    async def generate_problem(self, leetcode_id: str = None, title: str = None, difficulty: str = None) -> ProblemGenerationState:
        """Generate a competitive programming problem."""
        initial_state = ProblemGenerationState(
            leetcode_id=leetcode_id,
            title=title,
            difficulty=difficulty or ""
        )
        
        try:
            # Run the workflow
            result = await self.workflow.ainvoke(initial_state.dict())
            return ProblemGenerationState(**result)
        except Exception as e:
            logger.error(f"Workflow execution failed: {e}")
            return ProblemGenerationState(error=f"Workflow failed: {str(e)}")


# Global workflow instance
problem_workflow = ProblemGenerationWorkflow()