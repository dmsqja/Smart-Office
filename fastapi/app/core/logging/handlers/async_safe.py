from logging.handlers import QueueHandler, QueueListener
from queue import Queue
from .safe_rotating import SafeTimedRotatingFileHandler

"""
비동기 환경에서 안전한 로그 처리를 위한 핸들러 모듈

Queue를 사용하여 비동기 컨텍스트에서 안전하게 로그를 처리
"""

class AsyncSafeRotatingFileHandler(SafeTimedRotatingFileHandler):
    """
    비동기 안전 로그 순환 핸들러

    Queue와 QueueListener를 사용하여 비동기 환경에서
    안전하게 로그를 처리하고 파일에 기록
    """
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.queue: Queue = Queue()
        self.queue_handler = QueueHandler(self.queue)
        self.listener = QueueListener(
            self.queue, self,
            respect_handler_level=True
        )
        self.listener.start()

    def close(self) -> None:
        self.listener.stop()
        super().close()