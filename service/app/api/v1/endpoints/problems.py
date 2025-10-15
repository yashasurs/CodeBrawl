"""Problem generation endpoints using LangGraph."""

from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel
from typing import Optional, List, Dict, Any

from app.workflows.problem_generation import problem_workflow

router = APIRouter()


class ProblemGenerateRequest(BaseModel):
    """Request model for problem generation."""
    leetcode_id: Optional[str] = None  # Changed to string to match questionFrontendId
    title: Optional[str] = None
    difficulty: Optional[str] = None


class TestCase(BaseModel):
    """Test case model."""
    input: str
    expected_output: str
    is_hidden: bool = False


class ProblemGenerateResponse(BaseModel):
    """Response model for generated problem."""
    leetcode_id: Optional[str]  # Changed to string to match questionFrontendId
    title: str
    title_slug: str
    original_statement: str
    formatted_statement: str
    input_format: str
    output_format: str
    constraints: str
    test_cases: List[TestCase]
    time_limit: int
    memory_limit: int
    difficulty: str
    scoring_weight: int
    tags: List[str] = []
    acceptance_rate: float = 0.0


@router.post("/generate", response_model=ProblemGenerateResponse)
async def generate_problem(request: ProblemGenerateRequest):
    """Generate a new competitive programming problem using LangGraph workflow."""
    try:
        # Run the LangGraph workflow
        result = await problem_workflow.generate_problem(
            leetcode_id=request.leetcode_id,
            title=request.title,
            difficulty=request.difficulty
        )
        
        if result.error:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Problem generation failed: {result.error}"
            )
        
        # Convert result to response format
        test_cases = [
            TestCase(
                input=tc.input,
                expected_output=tc.expected_output,
                is_hidden=tc.is_hidden if hasattr(tc, 'is_hidden') else False
            )
            for tc in result.test_cases
        ]
        
        return ProblemGenerateResponse(
            leetcode_id=result.leetcode_id,
            title=result.title,
            title_slug=result.title_slug,
            original_statement=result.original_statement,
            formatted_statement=result.formatted_statement,
            input_format=result.input_format,
            output_format=result.output_format,
            constraints=result.constraints,
            test_cases=test_cases,
            time_limit=result.time_limit,
            memory_limit=result.memory_limit,
            difficulty=result.difficulty,
            scoring_weight=result.scoring_weight,
            tags=result.tags,
            acceptance_rate=result.acceptance_rate
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Problem generation service error: {str(e)}"
        )


@router.get("/health")
async def health_check():
    """Health check for problem generation service."""
    return {"status": "healthy", "service": "problem-generation"}