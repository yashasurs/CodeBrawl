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
    language: Optional[str] = None  # Optional: generate boilerplate for specific language


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
    language: Optional[str] = None
    boilerplate_code: Optional[str] = None
    boilerplate_cache: Dict[str, str] = {}  # Cache of all generated boilerplates


@router.post("/generate", response_model=ProblemGenerateResponse)
async def generate_problem(request: ProblemGenerateRequest):
    """Generate a new competitive programming problem using LangGraph workflow."""
    try:
        # Run the LangGraph workflow
        result = await problem_workflow.generate_problem(
            leetcode_id=request.leetcode_id,
            title=request.title,
            difficulty=request.difficulty,
            language=request.language
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
            acceptance_rate=result.acceptance_rate,
            language=result.language if result.language else None,
            boilerplate_code=result.boilerplate_code if result.boilerplate_code else None,
            boilerplate_cache=result.boilerplate_cache
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Problem generation service error: {str(e)}"
        )


class BoilerplateGenerateRequest(BaseModel):
    """Request model for boilerplate generation."""
    title: str
    title_slug: str
    formatted_statement: str
    input_format: str
    output_format: str
    constraints: str
    language: str  # python, javascript, java, cpp, go, rust, etc.
    test_cases: Optional[List[TestCase]] = []


class BoilerplateGenerateResponse(BaseModel):
    """Response model for generated boilerplate."""
    language: str
    boilerplate_code: str
    problem_title: str


@router.post("/boilerplate", response_model=BoilerplateGenerateResponse)
async def generate_boilerplate(request: BoilerplateGenerateRequest):
    """Generate language-specific boilerplate code for a problem."""
    try:
        # Create a partial state with the problem information
        from app.workflows.problem_generation import ProblemGenerationState
        from app.schemas.schemas import TestCase as SchemaTestCase
        
        # Convert test cases to schema format
        schema_test_cases = [
            SchemaTestCase(
                input=tc.input,
                expected_output=tc.expected_output,
                explanation="",
                is_example=not tc.is_hidden
            )
            for tc in request.test_cases
        ]
        
        # Create state for boilerplate generation
        state = ProblemGenerationState(
            title=request.title,
            title_slug=request.title_slug,
            formatted_statement=request.formatted_statement,
            input_format=request.input_format,
            output_format=request.output_format,
            constraints=request.constraints,
            language=request.language,
            test_cases=schema_test_cases
        )
        
        # Generate boilerplate using the workflow method
        result = await problem_workflow.generate_boilerplate(state)
        
        if "error" in result and result["error"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Boilerplate generation failed: {result['error']}"
            )
        
        return BoilerplateGenerateResponse(
            language=request.language,
            boilerplate_code=result.get("boilerplate_code", ""),
            problem_title=request.title
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Boilerplate generation service error: {str(e)}"
        )


class LanguageSwitchRequest(BaseModel):
    """Request model for switching programming language."""
    title: str
    formatted_statement: str
    input_format: str
    output_format: str
    constraints: str
    test_cases: List[TestCase]
    current_language: str
    new_language: str
    boilerplate_cache: Dict[str, str] = {}  # Existing cache from frontend


class LanguageSwitchResponse(BaseModel):
    """Response model for language switch."""
    language: str
    boilerplate_code: str
    from_cache: bool
    boilerplate_cache: Dict[str, str]  # Updated cache


@router.post("/switch-language", response_model=LanguageSwitchResponse)
async def switch_language(request: LanguageSwitchRequest):
    """
    Switch to a different programming language for boilerplate code.
    Uses cached boilerplate if available, generates new one if not.
    """
    try:
        from app.workflows.problem_generation import ProblemGenerationState
        from app.schemas.schemas import TestCase as SchemaTestCase
        
        # Convert test cases to schema format
        schema_test_cases = [
            SchemaTestCase(
                input=tc.input,
                expected_output=tc.expected_output,
                explanation="",
                is_example=not tc.is_hidden
            )
            for tc in request.test_cases
        ]
        
        # Create state with problem information and existing cache
        state = ProblemGenerationState(
            title=request.title,
            formatted_statement=request.formatted_statement,
            input_format=request.input_format,
            output_format=request.output_format,
            constraints=request.constraints,
            test_cases=schema_test_cases,
            language=request.current_language,
            boilerplate_cache=request.boilerplate_cache
        )
        
        # Switch to new language using workflow method
        result = await problem_workflow.switch_language(state, request.new_language)
        
        if "error" in result and result["error"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Language switch failed: {result['error']}"
            )
        
        return LanguageSwitchResponse(
            language=result["language"],
            boilerplate_code=result["boilerplate_code"],
            from_cache=result["from_cache"],
            boilerplate_cache=result.get("boilerplate_cache", request.boilerplate_cache)
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Language switch service error: {str(e)}"
        )


@router.get("/health")
async def health_check():
    """Health check for problem generation service."""
    return {"status": "healthy", "service": "problem-generation"}