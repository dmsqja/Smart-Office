import logging
from logging.handlers import RotatingFileHandler
import sys
import os
from datetime import datetime
from app.core.config import settings
"""
애플리케이션 전반의 로깅을 설정하고 관리하는 모듈

로그 설정:
    - 로그 레벨: 환경 설정에서 지정 (기본값: INFO)
    - 시간 형식: YYYY-MM-DD HH:MM:SS
    - 로그 형식: 시간 - 로그레벨 - [파일명:라인번호] - 메시지
    - 로그 순환: 
        - 최대 파일 크기: 10MB
        - 백업 파일 수: 30개
        - 파일명 형식: app.log.YYYYMMDD_HHMMSS
"""

# 로그 디렉토리 생성
os.makedirs(os.path.dirname(settings.LOG_FILE_PATH), exist_ok=True)

# 로거 생성 및 기본 설정
logger = logging.getLogger(__name__)
logger.setLevel(getattr(logging, settings.LOG_LEVEL))

# 포맷터 설정 (파일명과 라인 번호 추가)
formatter = logging.Formatter(
    '%(asctime)s - %(levelname)s - [%(filename)s:%(lineno)d] - %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)

# 콘솔 핸들러
console_handler = logging.StreamHandler(sys.stdout)
console_handler.setFormatter(formatter)
logger.addHandler(console_handler)

# 파일 핸들러 (시간 기반 파일명 + RotatingFileHandler)
timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
log_filename = f"{settings.LOG_FILE_PATH}.{timestamp}"
file_handler = RotatingFileHandler(
    filename=log_filename,
    maxBytes=settings.LOG_MAX_SIZE,
    backupCount=settings.LOG_BACKUP_COUNT,
    encoding='utf-8'
)
file_handler.setFormatter(formatter)
logger.addHandler(file_handler)

# 로거 전파 방지
logger.propagate = False