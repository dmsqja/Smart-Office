from fastapi import FastAPI, HTTPException, Depends
import httpx
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
import os
from enum import Enum
import logging
from functools import lru_cache
import asyncio
from datetime import datetime, timedelta
from contextlib import AsyncExitStack
import sys

# 환경 변수 검증 함수 추가
def validate_environment():
    if not os.getenv('OLLAMA_URL'):
        logger.error("ERROR: OLLAMA_URL 환경 변수가 설정되지 않았습니다.")
        logger.error("다음 명령어로 환경 변수를 설정해주세요:")
        logger.error("export OLLAMA_URL='http://OLLAMA-서버-주소:11434'")
        sys.exit(1)

# 기존 상수 및 기본 설정
LLAMA_SERVER_URL = os.getenv('OLLAMA_URL')
MODEL_NAME = "hf.co/QuantFactory/llama-3.2-Korean-Bllossom-3B-GGUF"

# FastAPI 앱 설정
app = FastAPI(
    title="Llama 채팅 API",
    description="한국어 Llama 모델을 위한 채팅 API",
    version="1.0.0"
)

# 로깅 설정
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)
logger = logging.getLogger(__name__)

class ModelConfig:
    def __init__(self):
        # 환경 변수 검증 후 URL 설정
        validate_environment()
        self.llama_url = LLAMA_SERVER_URL + "/api/chat"
        self.model_name = MODEL_NAME
        self.timeout = 60
        self.max_concurrent_requests = 100
        self.requests_per_minute = 600
        self.max_retries = 3
        logger.info(f"모델 설정 초기화 완료 - URL: {self.llama_url}, 모델: {self.model_name}")

@lru_cache()
def get_config() -> ModelConfig:
    return ModelConfig()

# 사용자 역할 정의
class Role(str, Enum):
    USER = "user"
    ASSISTANT = "assistant"
    SYSTEM = "system"

# 메시지 데이터 구조 정의
class Message(BaseModel):
    role: Role
    content: str = Field(..., min_length=1)

# 요청 데이터 구조 정의
class ChatRequest(BaseModel):
    prompt: str = Field(..., min_length=1, description="사용자 입력 메시지")
    system_prompt: Optional[str] = Field(None, description="시스템 프롬프트 (선택사항)")

# 응답 데이터 구조 정의
class ChatResponse(BaseModel):
    response: str = Field(..., description="AI 응답 메시지")
    status: str = Field(..., description="요청 처리 상태")
    error: Optional[str] = Field(None, description="에러 메시지 (있는 경우)")

# 레이트 리미터 클래스 정의
class RateLimiter:
    def __init__(self, requests_per_minute: int):
        self.requests_per_minute = requests_per_minute
        self.requests: List[datetime] = []
        self._lock = asyncio.Lock()

    async def acquire(self) -> bool:
        async with self._lock:
            now = datetime.now()
            # 1분 이상 지난 요청 제거
            self.requests = [req for req in self.requests
                           if now - req < timedelta(minutes=1)]

            if len(self.requests) >= self.requests_per_minute:
                return False

            self.requests.append(now)
            return True

# Llama 클라이언트 클래스 정의
class LlamaClient:
    def __init__(self):
        self.config = get_config()
        self._client: Optional[httpx.AsyncClient] = None
        self._exit_stack = AsyncExitStack()
        self._semaphore = asyncio.Semaphore(self.config.max_concurrent_requests)
        self._rate_limiter = RateLimiter(self.config.requests_per_minute)
        self._lock = asyncio.Lock()
        logger.info("Llama 클라이언트 초기화 완료")

    async def _get_client(self) -> httpx.AsyncClient:
        """HTTP 클라이언트 싱글톤 패턴 구현"""
        if self._client is None:
            async with self._lock:
                if self._client is None:
                    self._client = await self._exit_stack.enter_async_context(
                        httpx.AsyncClient(timeout=self.config.timeout)
                    )
        return self._client

    async def cleanup(self):
        """리소스 정리"""
        if self._client:
            await self._exit_stack.aclose()
            self._client = None

    async def get_completion(self, request: ChatRequest) -> str:
        # 레이트 리미팅 검사
        if not await self._rate_limiter.acquire():
            raise HTTPException(
                status_code=429,
                detail="너무 많은 요청이 발생했습니다. 잠시 후 다시 시도해주세요."
            )

        # 동시성 제어
        async with self._semaphore:
            messages = []
            if request.system_prompt:
                messages.append({"role": Role.SYSTEM, "content": request.system_prompt})
                logger.debug(f"시스템 프롬프트 추가됨: {request.system_prompt[:50]}...")

            messages.append({"role": Role.USER, "content": request.prompt})
            logger.debug(f"사용자 메시지 추가됨: {request.prompt[:50]}...")

            client = await self._get_client()
            retries = 0

            while retries <= self.config.max_retries:
                try:
                    llama_request = {
                        "model": self.config.model_name,
                        "messages": messages,
                        "stream": False
                    }

                    logger.info("Llama 서버에 요청 전송 중...")
                    response = await client.post(
                        self.config.llama_url,
                        json=llama_request,
                        timeout=self.config.timeout
                    )
                    response.raise_for_status()

                    try:
                        data = response.json()
                    except ValueError as e:
                        logger.error(f"JSON 파싱 오류: {str(e)}")
                        raise HTTPException(
                            status_code=502,
                            detail="Llama 서버로부터 잘못된 응답 형식"
                        )

                    logger.info("Llama 서버로부터 응답 수신 완료")

                    if not isinstance(data, dict):
                        raise HTTPException(
                            status_code=502,
                            detail="예상치 못한 응답 형식"
                        )

                    response_text = data.get('message', {}).get('content')
                    if not response_text:
                        raise HTTPException(
                            status_code=502,
                            detail="응답에서 텍스트를 찾을 수 없음"
                        )

                    return response_text

                except httpx.TimeoutException:
                    retries += 1
                    if retries > self.config.max_retries:
                        logger.error(f"최대 재시도 횟수 초과 (timeout)")
                        raise HTTPException(
                            status_code=504,
                            detail="서버 응답 시간 초과"
                        )
                    await asyncio.sleep(1 * retries)  # 지수 백오프

                except httpx.HTTPError as e:
                    retries += 1
                    if retries > self.config.max_retries:
                        logger.error(f"HTTP 통신 오류 발생: {str(e)}")
                        raise HTTPException(
                            status_code=502,
                            detail="Llama 서버와 통신 중 오류 발생"
                        )
                    await asyncio.sleep(1 * retries)

                except Exception as e:
                    logger.error(f"예상치 못한 오류 발생: {str(e)}")
                    raise HTTPException(
                        status_code=500,
                        detail="내부 서버 오류"
                    )

# 서버 시작 이벤트 핸들러
@app.on_event("startup")
async def startup_event():
    try:
        validate_environment()
        logger.info("Llama 채팅 API 서버 시작")
    except SystemExit:
        # FastAPI의 정상적인 종료를 위해 예외 처리
        await app.state.lifespan.shutdown()
        sys.exit(1)

# 서버 종료 이벤트 핸들러
@app.on_event("shutdown")
async def shutdown_event():
    await llama_client.cleanup()
    logger.info("Llama 채팅 API 서버 종료")

# Llama 클라이언트 객체 생성
llama_client = LlamaClient()

# API 엔드포인트는 동일하게 유지
@app.post("/api/llama/chat", response_model=ChatResponse)
async def chat_with_llama(request: ChatRequest):
    try:
        logger.info(f"새로운 채팅 요청 수신: {request.prompt[:50]}...")
        response_text = await llama_client.get_completion(request)
        logger.info("채팅 요청 처리 완료")
        return ChatResponse(
            response=response_text,
            status="성공"
        )
    except HTTPException as e:
        logger.error(f"요청 처리 중 오류 발생: {str(e.detail)}")
        return ChatResponse(
            response="",
            status="오류",
            error=str(e.detail)
        )

# 서버 상태 확인 엔드포인트
@app.get("/status")
async def status_check():
    logger.debug("상태 확인 요청 수신")
    return {"상태": "정상 작동 중"}

# 테스트용 엔드포인트
@app.get("/test", response_model=ChatResponse)
async def test_endpoint():
    logger.debug("테스트 엔드포인트 호출됨")
    return ChatResponse(
        response="테스트 응답입니다.",
        status="성공"
    )