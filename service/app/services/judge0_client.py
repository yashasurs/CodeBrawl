"""Judge0 API client for code execution."""

import httpx
import asyncio
import logging
from typing import Dict, Any, Optional, List
from app.core.config import settings
from app.schemas.schemas import ProgrammingLanguage, SubmissionStatus

logger = logging.getLogger(__name__)


class Judge0Client:
    """Client for Judge0 API integration."""
    
    # Language ID mapping for Judge0
    LANGUAGE_IDS = {
        ProgrammingLanguage.PYTHON: 71,      # Python 3.8.1
        ProgrammingLanguage.JAVASCRIPT: 63,  # JavaScript (Node.js 12.14.0)
        ProgrammingLanguage.JAVA: 62,        # Java (OpenJDK 13.0.1)
        ProgrammingLanguage.CPP: 54,         # C++ (GCC 9.2.0)
        ProgrammingLanguage.C: 50,           # C (GCC 9.2.0)
        ProgrammingLanguage.CSHARP: 51,      # C# (Mono 6.6.0.161)
        ProgrammingLanguage.GO: 60,          # Go (1.13.5)
        ProgrammingLanguage.RUST: 73,        # Rust (1.40.0)
    }
    
    def __init__(self):
        self.base_url = settings.JUDGE0_BASE_URL
        self.headers = {
            "X-RapidAPI-Key": settings.JUDGE0_API_KEY,
            "X-RapidAPI-Host": "judge0-ce.p.rapidapi.com",
            "Content-Type": "application/json"
        }
    
    async def submit_code(
        self,
        source_code: str,
        language: ProgrammingLanguage,
        test_cases: List[Dict[str, str]],
        time_limit: Optional[float] = None,
        memory_limit: Optional[int] = None
    ) -> Dict[str, Any]:
        """Submit code for execution against test cases."""
        try:
            language_id = self.LANGUAGE_IDS.get(language)
            if not language_id:
                raise ValueError(f"Unsupported language: {language}")
            
            results = []
            
            async with httpx.AsyncClient(timeout=30.0) as client:
                # Submit code for each test case
                for i, test_case in enumerate(test_cases):
                    submission_data = {
                        "language_id": language_id,
                        "source_code": source_code,
                        "stdin": test_case["input"],
                        "expected_output": test_case["expected_output"],
                        "cpu_time_limit": time_limit or 2.0,
                        "memory_limit": (memory_limit or 256) * 1024  # Convert MB to KB
                    }
                    
                    # Submit for execution
                    response = await client.post(
                        f"{self.base_url}/submissions",
                        json=submission_data,
                        headers=self.headers,
                        params={"base64_encoded": "false", "wait": "false"}
                    )
                    
                    if response.status_code != 201:
                        logger.error(f"Submission failed: {response.text}")
                        continue
                    
                    submission = response.json()
                    token = submission.get("token")
                    
                    if token:
                        # Wait for execution and get result
                        result = await self._get_submission_result(client, token)
                        result["test_case_index"] = i
                        result["input"] = test_case["input"]
                        result["expected_output"] = test_case["expected_output"]
                        results.append(result)
            
            # Analyze overall results
            return self._analyze_results(results)
            
        except Exception as e:
            logger.error(f"Judge0 submission error: {e}")
            return {
                "status": SubmissionStatus.RUNTIME_ERROR,
                "error_message": str(e),
                "execution_time": 0,
                "memory_usage": 0,
                "passed_tests": 0,
                "total_tests": len(test_cases),
                "test_results": []
            }
    
    async def _get_submission_result(self, client: httpx.AsyncClient, token: str) -> Dict[str, Any]:
        """Get submission result by token."""
        max_attempts = 10
        attempt = 0
        
        while attempt < max_attempts:
            try:
                response = await client.get(
                    f"{self.base_url}/submissions/{token}",
                    headers=self.headers,
                    params={"base64_encoded": "false", "fields": "*"}
                )
                
                if response.status_code == 200:
                    result = response.json()
                    
                    # Check if execution is complete
                    if result.get("status", {}).get("id") not in [1, 2]:  # Not "In Queue" or "Processing"
                        return self._parse_judge0_result(result)
                
                # Wait before next attempt
                await asyncio.sleep(1)
                attempt += 1
                
            except Exception as e:
                logger.error(f"Error getting submission result: {e}")
                attempt += 1
                await asyncio.sleep(1)
        
        return {
            "status_id": 13,  # Internal Error
            "stdout": "",
            "stderr": "Execution timeout",
            "time": 0,
            "memory": 0
        }
    
    def _parse_judge0_result(self, judge0_result: Dict[str, Any]) -> Dict[str, Any]:
        """Parse Judge0 API result."""
        status = judge0_result.get("status", {})
        status_id = status.get("id", 13)
        
        return {
            "status_id": status_id,
            "status_description": status.get("description", "Unknown"),
            "stdout": judge0_result.get("stdout", ""),
            "stderr": judge0_result.get("stderr", ""),
            "compile_output": judge0_result.get("compile_output", ""),
            "time": float(judge0_result.get("time") or 0),
            "memory": int(judge0_result.get("memory") or 0)
        }
    
    def _analyze_results(self, results: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Analyze execution results across all test cases."""
        if not results:
            return {
                "status": SubmissionStatus.RUNTIME_ERROR,
                "error_message": "No results",
                "execution_time": 0,
                "memory_usage": 0,
                "passed_tests": 0,
                "total_tests": 0,
                "test_results": []
            }
        
        passed_tests = 0
        total_execution_time = 0
        max_memory = 0
        first_error = None
        
        for result in results:
            status_id = result.get("status_id", 13)
            
            # Check if test passed
            if status_id == 3:  # Accepted
                stdout = result.get("stdout", "").strip()
                expected = result.get("expected_output", "").strip()
                if stdout == expected:
                    passed_tests += 1
            
            # Track performance metrics
            total_execution_time += result.get("time", 0)
            max_memory = max(max_memory, result.get("memory", 0))
            
            # Capture first error
            if status_id != 3 and not first_error:
                first_error = {
                    "status_id": status_id,
                    "description": result.get("status_description", "Unknown error"),
                    "stderr": result.get("stderr", ""),
                    "compile_output": result.get("compile_output", "")
                }
        
        # Determine overall status
        overall_status = self._determine_overall_status(results, passed_tests, len(results))
        
        return {
            "status": overall_status,
            "error_message": self._get_error_message(first_error) if first_error else "",
            "execution_time": total_execution_time,
            "memory_usage": max_memory,
            "passed_tests": passed_tests,
            "total_tests": len(results),
            "test_results": results
        }
    
    def _determine_overall_status(self, results: List[Dict[str, Any]], passed: int, total: int) -> SubmissionStatus:
        """Determine overall submission status."""
        if passed == total:
            return SubmissionStatus.ACCEPTED
        
        # Check for common error types
        for result in results:
            status_id = result.get("status_id", 13)
            
            if status_id == 5:  # Time Limit Exceeded
                return SubmissionStatus.TIME_LIMIT_EXCEEDED
            elif status_id == 6:  # Compilation Error
                return SubmissionStatus.COMPILATION_ERROR
            elif status_id == 7:  # Runtime Error (SIGSEGV)
                return SubmissionStatus.RUNTIME_ERROR
            elif status_id == 8:  # Runtime Error (SIGXFSZ)
                return SubmissionStatus.RUNTIME_ERROR
            elif status_id == 9:  # Runtime Error (SIGFPE)
                return SubmissionStatus.RUNTIME_ERROR
            elif status_id == 10:  # Runtime Error (SIGABRT)
                return SubmissionStatus.RUNTIME_ERROR
            elif status_id == 11:  # Runtime Error (NZEC)
                return SubmissionStatus.RUNTIME_ERROR
            elif status_id == 12:  # Runtime Error (Other)
                return SubmissionStatus.RUNTIME_ERROR
            elif status_id == 17:  # Memory Limit Exceeded
                return SubmissionStatus.MEMORY_LIMIT_EXCEEDED
        
        # Default to wrong answer if no specific error
        return SubmissionStatus.WRONG_ANSWER
    
    def _get_error_message(self, error: Dict[str, Any]) -> str:
        """Get human-readable error message."""
        if not error:
            return ""
        
        description = error.get("description", "")
        stderr = error.get("stderr", "").strip()
        compile_output = error.get("compile_output", "").strip()
        
        if compile_output:
            return f"Compilation Error: {compile_output}"
        elif stderr:
            return f"{description}: {stderr}"
        else:
            return description


# Global Judge0 client instance
judge0_client = Judge0Client()