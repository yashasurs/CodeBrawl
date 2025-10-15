"""Code execution endpoints for Judge0 integration."""

from typing import Dict, Any
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel

from app.services.judge0_client import judge0_client

router = APIRouter()


class CodeExecutionRequest(BaseModel):
    """Request model for code execution."""
    submission_id: str
    source_code: str
    language: str
    test_cases: list
    time_limit: float = 2.0
    memory_limit: int = 256


class CodeExecutionResponse(BaseModel):
    """Response model for code execution."""
    submission_id: str
    status: str
    execution_time: float
    memory_usage: int
    passed_tests: int
    total_tests: int
    error_message: str = ""
    test_results: list = []


@router.post("/execute", response_model=CodeExecutionResponse)
async def execute_code(request: CodeExecutionRequest):
    """Execute code using Judge0 API."""
    try:
        result = await judge0_client.submit_code(
            source_code=request.source_code,
            language=request.language,
            test_cases=request.test_cases,
            time_limit=request.time_limit,
            memory_limit=request.memory_limit
        )
        
        return CodeExecutionResponse(
            submission_id=request.submission_id,
            status=result["status"].value,
            execution_time=result["execution_time"],
            memory_usage=result["memory_usage"],
            passed_tests=result["passed_tests"],
            total_tests=result["total_tests"],
            error_message=result["error_message"],
            test_results=result["test_results"]
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Code execution failed: {str(e)}"
        )


@router.get("/{submission_id}/result")
async def get_execution_result(submission_id: str):
    """Get execution result for a submission."""
    # This endpoint would be used if we need to check status later
    # For now, we return the submission_id for acknowledgment
    return {"submission_id": submission_id, "message": "Use POST /execute for code execution"}