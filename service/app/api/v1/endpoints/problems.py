"""Problem generation endpoints."""

from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel
from typing import Optional, List, Dict, Any

from app.workflows.problem_generation import generate_problem, ProblemData
from app.schemas.schemas import TestCase
from app.services.boilerplate_generator import boilerplate_generator

router = APIRouter()


class ProblemGenerateRequest(BaseModel):
    """Request model for problem generation from Express backend."""
    leetcode_id: Optional[str] = None
    title: str
    title_slug: str
    description: str
    difficulty: str
    tags: List[str] = []
    examples: List[Dict[str, str]] = []
    constraints: str = ""


class ProblemGenerateResponse(BaseModel):
    """Response model for generated problem."""
    leetcode_id: Optional[str]
    title: str
    title_slug: str
    difficulty: str
    tags: List[str]
    formatted_statement: str
    input_format: str
    output_format: str
    constraints: str
    test_cases: List[Dict[str, Any]]  # Will contain TestCase data
    time_limit: int
    memory_limit: int


@router.post("/generate", response_model=ProblemGenerateResponse)
async def generate_problem_endpoint(
    request: ProblemGenerateRequest
):
    """
    Generate formatted problem statement and test cases.
    
    Uses AI to:
    1. Format problem statement with clear input/output specifications
    2. Generate comprehensive test cases (visible and hidden)
    3. Set appropriate time and memory limits
    """
    import logging
    logger = logging.getLogger(__name__)
    
    logger.info("=" * 60)
    logger.info("PROBLEM GENERATION REQUEST RECEIVED")
    logger.info(f"Title: {request.title}")
    logger.info(f"Difficulty: {request.difficulty}")
    logger.info("=" * 60)
    
    try:
        # Create ProblemData object
        problem_data = ProblemData(
            leetcode_id=request.leetcode_id,
            title=request.title,
            title_slug=request.title_slug,
            description=request.description,
            difficulty=request.difficulty,
            tags=request.tags,
            examples=request.examples,
            constraints=request.constraints
        )
        
        # Generate problem using simplified workflow
        result = await generate_problem(problem_data)
        
        logger.info(f"Problem generation completed for: {request.title}")
        
        # Convert test cases to dict format for response
        test_cases_dict = [
            {
                "input": tc.input,
                "expected_output": tc.expected_output,
                "explanation": tc.explanation or "",
                "is_example": tc.is_example,
                "is_hidden": tc.is_hidden
            }
            for tc in result["test_cases"]
        ]
        
        return ProblemGenerateResponse(
            leetcode_id=result["leetcode_id"],
            title=result["title"],
            title_slug=result["title_slug"],
            difficulty=result["difficulty"],
            tags=result["tags"],
            formatted_statement=result["formatted_statement"],
            input_format=result["input_format"],
            output_format=result["output_format"],
            constraints=result["constraints"],
            test_cases=test_cases_dict,
            time_limit=result["time_limit"],
            memory_limit=result["memory_limit"]
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


class BoilerplateRequest(BaseModel):
    """Request model for boilerplate generation."""
    title: str
    description: str
    language: str
    input_format: Optional[str] = ""
    output_format: Optional[str] = ""
    constraints: Optional[str] = ""
    examples: Optional[List[Dict[str, str]]] = []
    test_cases: Optional[List[Dict[str, Any]]] = []  # Added for type inference


class BoilerplateResponse(BaseModel):
    """Response model for boilerplate generation."""
    language: str
    code: str


@router.post("/boilerplate", response_model=BoilerplateResponse)
async def generate_boilerplate(request: BoilerplateRequest):
    """
    Generate boilerplate starter code for a problem in a specific language.
    
    This endpoint uses AI to create a clean function signature with:
    - Proper imports and includes
    - Function signature with appropriate types
    - Input/output handling (stdin/stdout)
    - Helpful comments
    - Empty function body for user implementation
    """
    import logging
    logger = logging.getLogger(__name__)
    
    logger.info(f"Boilerplate generation request: {request.title} ({request.language})")
    
    try:
        code = await boilerplate_generator.generate_boilerplate(
            title=request.title,
            description=request.description,
            language=request.language,
            input_format=request.input_format,
            output_format=request.output_format,
            constraints=request.constraints,
            examples=request.examples,
            test_cases=request.test_cases  # Pass test cases for type inference
        )
        
        logger.info(f"Boilerplate generated successfully ({len(code)} chars)")
        
        return BoilerplateResponse(
            language=request.language,
            code=code
        )
        
    except Exception as e:
        logger.error(f"Boilerplate generation failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Boilerplate generation error: {str(e)}"
        )


class AllBoilerplatesRequest(BaseModel):
    """Request model for generating boilerplates for all languages."""
    title: str
    description: str
    input_format: Optional[str] = ""
    output_format: Optional[str] = ""
    constraints: Optional[str] = ""
    examples: Optional[List[Dict[str, str]]] = []
    test_cases: Optional[List[Dict[str, Any]]] = []  # Added for type inference
    languages: Optional[List[str]] = None  # If None, generate for all supported languages


class AllBoilerplatesResponse(BaseModel):
    """Response model for all boilerplates."""
    boilerplates: Dict[str, str]


@router.post("/boilerplates/all", response_model=AllBoilerplatesResponse)
async def generate_all_boilerplates(request: AllBoilerplatesRequest):
    """
    Generate boilerplate starter code for all supported languages.
    
    Used when a problem is first generated to cache boilerplates for all languages.
    """
    import logging
    logger = logging.getLogger(__name__)
    
    logger.info(f"Generating boilerplates for all languages: {request.title}")
    
    try:
        boilerplates = await boilerplate_generator.generate_all_languages(
            title=request.title,
            description=request.description,
            input_format=request.input_format,
            output_format=request.output_format,
            constraints=request.constraints,
            examples=request.examples,
            test_cases=request.test_cases,  # Pass test cases for type inference
            languages=request.languages
        )
        
        logger.info(f"Generated boilerplates for {len(boilerplates)} languages")
        
        return AllBoilerplatesResponse(boilerplates=boilerplates)
        
    except Exception as e:
        logger.error(f"All boilerplates generation failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Boilerplates generation error: {str(e)}"
        )