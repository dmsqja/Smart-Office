import logging
import sys
import os
from pathlib import Path
from datetime import datetime
from app.core.config import settings
from .handlers.async_safe import AsyncSafeRotatingFileHandler
from .formatters import EnhancedFormatter
from .utils import cleanup_old_logs

"""
FastAPI 애플리케이션을 위한 로깅 설정 및 관리 모듈

주요 기능:
    - 계층화된 로깅 시스템 구성
    - 비동기 안전 로그 처리
    - 자동 로그 순환 및 압축
    - 메모리 사용량 모니터링

설정:
    - 로그 레벨: settings.LOG_LEVEL (기본: INFO)
    - 로그 형식: [시간] [레벨] [파일:라인] 메시지
    - 파일 순환: 매일 자정, {settings.LOG_BACKUP_COUNT}개 유지
    - 압축 저장: gzip 형식 (.gz)
    - 보관 기간: 30일

사용 예시:
    from app.core.logger import logger
    
    logger.info("서버 시작")
    logger.error("오류 발생", exc_info=True)
"""

# 로그 디렉토리 설정
log_dir = Path(settings.LOG_FILE_PATH)
try:
    log_dir.mkdir(parents=True, exist_ok=True)
    if not os.access(log_dir, os.W_OK):
        raise PermissionError(f"로그 디렉토리 쓰기 권한 없음: {log_dir}")
except Exception as e:
    print(f"로그 디렉토리 생성 실패: {e}", file=sys.stderr)
    sys.exit(1)

# 로거 설정
try:
    root_logger = logging.getLogger()
    root_logger.setLevel(getattr(logging, settings.LOG_LEVEL))

    formatter = EnhancedFormatter()

    # 콘솔 핸들러
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setFormatter(formatter)
    console_handler.setLevel(logging.DEBUG)
    root_logger.addHandler(console_handler)

    # 파일 핸들러
    log_datetime = datetime.now().strftime('%Y%m%d')
    log_filename = log_dir / f"fastapi-app-{log_datetime}.log"

    file_handler = AsyncSafeRotatingFileHandler(
        filename=str(log_filename),
        when='midnight',
        interval=1,
        backupCount=settings.LOG_BACKUP_COUNT,
        encoding='utf-8',
        delay=True
    )
    file_handler.setFormatter(formatter)
    file_handler.setLevel(getattr(logging, settings.LOG_LEVEL))
    root_logger.addHandler(file_handler)

except Exception as e:
    print(f"로거 초기화 실패: {e}", file=sys.stderr)
    sys.exit(1)

logger = logging.getLogger(__name__)
logger.propagate = True

def setup_uvicorn_logging():
    """
    Uvicorn의 로깅을 애플리케이션의 로깅 시스템과 통합
    
    Uvicorn의 기본 로거와 접근 로거의 핸들러를 제거하고 루트 로거로 전파되도록 설정
    """
    try:
        for logger_name in ("uvicorn", "uvicorn.access"):
            uvicorn_logger = logging.getLogger(logger_name)
            uvicorn_logger.handlers = []
            uvicorn_logger.propagate = True
    except Exception as e:
        root_logger.error(f"Uvicorn 로거 설정 실패: {e}")

setup_uvicorn_logging()
cleanup_old_logs(log_dir)