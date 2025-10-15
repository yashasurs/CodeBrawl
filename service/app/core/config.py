"""Core configuration settings for Judge0 and AI services."""

try:
    from pydantic_settings import BaseSettings
except ImportError:
    from pydantic import BaseSettings
from typing import List


class Settings(BaseSettings):
    """Application settings."""
    
    # API Keys
    GOOGLE_API_KEY: str = ""
    JUDGE0_API_KEY: str = ""
    
    # Judge0
    JUDGE0_BASE_URL: str = "https://judge0-ce.p.rapidapi.com"
    
    # CORS
    ALLOWED_ORIGINS: List[str] = ["http://localhost:3000", "http://localhost:5000"]
    
    # Application
    DEBUG: bool = True
    
    # Dataset
    LEETCODE_DATASET_PATH: str = "./data/leetcode_problems.json"

    class Config:
        env_file = ".env"


settings = Settings()