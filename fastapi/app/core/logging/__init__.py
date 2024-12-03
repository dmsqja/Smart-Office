"""
FastAPI 애플리케이션을 위한 로깅 시스템

FastAPI 애플리케이션의 로깅 기능 제공
비동기 안전성, 자동 로그 순환, 압축 저장 등 기능 포함
"""

from .logger import logger, setup_uvicorn_logging

__all__ = ['logger', 'setup_uvicorn_logging']