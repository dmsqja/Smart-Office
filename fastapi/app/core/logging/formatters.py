import logging
from .utils import get_memory_usage

class EnhancedFormatter(logging.Formatter):
    """
    로그 메시지 형식화를 위한 포맷터
    
    로그 레벨에 따라 다른 형식 적용, 메모리 사용량 등 추가 정보 포함
    
    Debug 레벨:
        시간 [레벨] [파일:라인] 메시지
        └─ [프로세스명:PID] [메모리사용량]
    
    기타 레벨:
        시간 [레벨] [파일:라인] 메시지
    """
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.basic_formatter = logging.Formatter(
            '%(asctime)s [%(levelname)s] [%(filename)s:%(lineno)d] %(message)s',
            datefmt='%Y-%m-%d %H:%M:%S'
        )
        self.debug_formatter = logging.Formatter(
            '%(asctime)s [%(levelname)s] [%(filename)s:%(lineno)d] %(message)s\n'
            '  └─ [%(processName)s:%(process)d] [MEM:%(memory)s]',
            datefmt='%Y-%m-%d %H:%M:%S'
        )

    def format(self, record):
        record.memory = get_memory_usage()
        if record.levelno <= logging.DEBUG:
            return self.debug_formatter.format(record)
        return self.basic_formatter.format(record)