from logging.handlers import TimedRotatingFileHandler
import logging
import os
from ..utils import compress_log

"""
안전한 로그 파일 순환을 위한 핸들러 모듈

표준 TimedRotatingFileHandler를 확장하여 
로그 파일 순환 시 자동 압축 및 오류 처리 기능 추가
"""

class SafeTimedRotatingFileHandler(TimedRotatingFileHandler):
    """
    안전한 시간 기반 로그 파일 순환 핸들러

    로그 파일 순환 시 자동으로 gzip 압축을 수행하며,
    모든 작업에서 발생할 수 있는 예외를 적절히 처리
    """
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.root_logger = logging.getLogger()

    def rotate(self, source, dest):
        try:
            if os.path.exists(source):
                compress_log(source)
            else:
                self.root_logger.warning(f"순환 ���상 로그 파일 없음: {source}")
        except Exception as e:
            self.root_logger.error(f"로그 파일 순환 처리 실패: {e}")

    def emit(self, record):
        try:
            super().emit(record)
        except Exception as e:
            self.handleError(record)
            self.root_logger.error(f"로그 기록 실패: {e}")