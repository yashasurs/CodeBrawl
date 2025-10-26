"""Main FastAPI application for CodeBrawl Judge & AI microservice."""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import logging

from app.core.config import settings
from app.api.v1.api import api_router

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="CodeBrawl Judge & AI Service",
    description="FastAPI microservice for code execution and problem generation",
    version="1.0.0"
)

# Set up CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API router
app.include_router(api_router, prefix="/api/v1")

logger.info("=" * 60)
logger.info("FastAPI Service Starting")
logger.info(f"CORS Origins: {settings.ALLOWED_ORIGINS}")
logger.info(f"Google API Key configured: {bool(settings.GOOGLE_API_KEY)}")
logger.info("Routes registered:")
for route in app.routes:
    if hasattr(route, 'methods'):
        logger.info(f"  {list(route.methods)} {route.path}")
logger.info("=" * 60)


@app.get("/")
async def root():
    """Root endpoint."""
    return {"message": "CodeBrawl Judge & AI Service", "services": ["judge0", "problem-generation"]}


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy", "service": "judge-ai-service"}