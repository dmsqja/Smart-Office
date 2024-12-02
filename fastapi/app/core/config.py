from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    """
    애플리케이션의 전역 설정을 관리하는 클래스
    
    환경 변수는 .env 파일에서 로드

    Attributes:
        APP_VERSION (str): 애플리케이션 버전
        OLLAMA_URL (str): Ollama API 서버 URL (.env 파일에서 로드)
        MODEL_NAME (str): 사용할 LLM 모델명 (기본값: llama-3.2-Korean)
        MAX_CONCURRENT_REQUESTS (int): 최대 동시 요청 수 (기본값: 100)
        REQUESTS_PER_MINUTE (int): 분당 최대 요청 수 제한 (기본값: 600)
        MAX_RETRIES (int): API 요청 실패 시 최대 재시도 횟수 (기본값: 3)
        TIMEOUT (int): API 요청 타임아웃 초 단위 (기본값: 60)
        GOOGLE_CREDENTIALS_PATH (str): Google 서비스 계정 키 파일 경로 (.env)
        GCS_BUCKET_NAME (str): Google Cloud Storage 버킷 이름 (.env)
        GCS_DOWNLOAD_PATH (str): GCS 다운로드 기본 경로 (기본값: "img/")
        GCS_UPLOAD_PATH (str): GCS 업로드 기본 경로 (기본값: "processing/")
        LOCAL_DOWNLOAD_PATH (str): 로컬 다운로드 경로 (기본값: "tmp/")
        LOG_LEVEL (str): 로그 레벨 (기본값: "INFO")
        LOG_FILE_PATH (str): 로그 파일 경로 (기본값: "logs/app.log")
        LOG_MAX_SIZE (int): 로그 파일 최대 크기 (기본값: 10MB)
        LOG_BACKUP_COUNT (int): 로그 파일 백업 개수 (기본값: 30)
    """
    APP_VERSION: str = "1.0.0"
    OLLAMA_URL: str
    MODEL_NAME: str = "hf.co/QuantFactory/llama-3.2-Korean-Bllossom-3B-GGUF"
    MAX_CONCURRENT_REQUESTS: int = 100
    REQUESTS_PER_MINUTE: int = 600
    MAX_RETRIES: int = 3
    TIMEOUT: int = 60
    GOOGLE_CREDENTIALS_PATH: str
    GCS_BUCKET_NAME: str
    GCS_DOWNLOAD_PATH: str = "img/"
    GCS_UPLOAD_PATH: str = "processing/"
    LOCAL_DOWNLOAD_PATH: str = "tmp/"
    LOG_LEVEL: str = "INFO"
    LOG_FILE_PATH: str = "logs/app.log"
    LOG_MAX_SIZE: int = 10 * 1024 * 1024  # 10MB
    LOG_BACKUP_COUNT: int = 30

    model_config = {
        "env_file": ".env",
        "env_file_encoding": "utf-8",
        "case_sensitive": True
    }

settings = Settings()