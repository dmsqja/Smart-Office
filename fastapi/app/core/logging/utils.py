import os
import gzip
import shutil
import psutil
from pathlib import Path
from datetime import datetime, timedelta

def get_memory_usage() -> str:
    """
    현재 프로세스의 메모리 사용량을 MB 단위로 반환

    Returns:
        str: 메모리 사용량 (예: "123.45MB")
    """
    process = psutil.Process()
    memory = process.memory_info().rss / 1024 / 1024
    return f"{memory:.2f}MB"

def cleanup_old_logs(log_dir: Path, days: int = 30) -> None:
    """
    지정된 기간보다 오래된 로그 파일들을 삭제

    Args:
        log_dir (Path): 로그 파일이 저장된 디렉토리 경로
        days (int, optional): 보관할 로그 파일의 기간(일). 기본값 30일
    """
    try:
        cutoff = datetime.now() - timedelta(days=days)
        for log_file in log_dir.glob("fastapi-app-*.log*"):
            if log_file.stat().st_mtime < cutoff.timestamp():
                log_file.unlink()
    except Exception as e:
        print(f"로그 정리 중 오류 발생: {e}")

def compress_log(source_path: str, delete_source: bool = True) -> None:
    """
    로그 파일을 gzip 형식으로 압축

    Args:
        source_path (str): 압축할 로그 파일의 경로
        delete_source (bool, optional): 압축 후 원본 파일 삭제 여부. 기본값 True
    """
    try:
        compression_time = datetime.now().strftime('%Y%m%d_%H%M%S')
        source_path_obj = Path(source_path)
        compressed_path = f"{source_path_obj.parent}/{source_path_obj.stem}_{compression_time}.gz"
        
        with open(source_path, 'rb') as f_in:
            with gzip.open(compressed_path, 'wb') as f_out:
                shutil.copyfileobj(f_in, f_out)
        if delete_source:
            os.unlink(source_path)
    except Exception as e:
        print(f"로그 파일 압축 실패: {e}")