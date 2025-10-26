"""Pydantic schemas for Problem Generation services."""

from pydantic import BaseModel
from typing import Optional


class TestCase(BaseModel):
    """Test case schema for problem generation."""
    input: str
    expected_output: str
    explanation: Optional[str] = None
    is_example: bool = False
    is_hidden: bool = False