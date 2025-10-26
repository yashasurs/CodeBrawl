"""Core configuration settings for Judge0 and AI services."""

try:
    from pydantic_settings import BaseSettings, SettingsConfigDict
except ImportError:
    from pydantic import BaseSettings
    SettingsConfigDict = None
from typing import List


class Settings(BaseSettings):
    """Application settings."""
    
    # API Keys
    GOOGLE_API_KEY: str = ""
    JUDGE0_API_KEY: str = ""
    
    # Judge0
    JUDGE0_BASE_URL: str = "https://judge0-ce.p.rapidapi.com"
    
    # Express API
    EXPRESS_API_URL: str = "http://localhost:8000"
    
    # CORS
    ALLOWED_ORIGINS: List[str] = ["http://localhost:3000", "http://localhost:5000"]
    
    # Application
    DEBUG: bool = True
    
    # Dataset
    LEETCODE_DATASET_PATH: str = "./data/leetcode_problems.json"

    if SettingsConfigDict:
        model_config = SettingsConfigDict(env_file=".env", extra="ignore")
    else:
        class Config:
            env_file = ".env"
            extra = "ignore"
        
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        # Convert relative path to absolute if needed
        if not self.LEETCODE_DATASET_PATH.startswith('/') and not self.LEETCODE_DATASET_PATH[1:3] == ':\\':
            import os
            base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
            self.LEETCODE_DATASET_PATH = os.path.join(base_dir, self.LEETCODE_DATASET_PATH)


settings = Settings()