"""API v1 router."""

from fastapi import APIRouter

from app.api.v1.endpoints import problems, submissions

api_router = APIRouter()

api_router.include_router(problems.router, prefix="/problems", tags=["problems"])
api_router.include_router(submissions.router, prefix="/submissions", tags=["submissions"])