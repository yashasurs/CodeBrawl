"""Pydantic schemas for Judge0 and Problem Generation services."""

from pydantic import BaseModel
from typing import List, Optional
from enum import Enum


class DifficultyLevel(str, Enum):
    """Problem difficulty levels."""
    EASY = "Easy"
    MEDIUM = "Medium" 
    HARD = "Hard"


class ProgrammingLanguage(str, Enum):
    """Supported programming languages."""
    PYTHON = "python"
    JAVASCRIPT = "javascript"
    JAVA = "java"
    CPP = "cpp"
    C = "c"
    CSHARP = "csharp"
    GO = "go"
    RUST = "rust"


class SubmissionStatus(str, Enum):
    """Submission status enum."""
    PENDING = "pending"
    ACCEPTED = "accepted"
    WRONG_ANSWER = "wrong_answer"
    TIME_LIMIT_EXCEEDED = "time_limit_exceeded"
    RUNTIME_ERROR = "runtime_error"
    COMPILATION_ERROR = "compilation_error"
    MEMORY_LIMIT_EXCEEDED = "memory_limit_exceeded"


class TestCase(BaseModel):
    """Test case schema for problem generation."""
    input: str
    expected_output: str
    explanation: Optional[str] = None
    is_example: bool = False
    is_hidden: bool = False