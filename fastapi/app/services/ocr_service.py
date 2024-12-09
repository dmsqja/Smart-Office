import asyncio
import aiohttp
from concurrent.futures import ThreadPoolExecutor
from app.core.config import settings
from app.utils.image.gcs_handler import GCSHandler
from app.utils.image.processing import ImageProcessor
import cv2
import os
from app.core.logging.logger import logger

class OCRService:
    """
    ## OCR (Optical Character Recognition) 서비스를 처리하는 클래스
    
    ### 이미지 전처리, GCS 파일 관리, OCR API 호출을 담당
    
        Attributes:
            gcs_handler (GCSHandler): Google Cloud Storage 작업 처리
            image_processor (ImageProcessor): 이미지 전처리 작업 처리
            api_key (str): Upstage OCR API 키
            ocr_url (str): Upstage OCR API 엔드포인트
            _executor (ThreadPoolExecutor): I/O 작업용 스레드 풀
            _semaphore (asyncio.Semaphore): 동시 요청 제한기
    """
    
    def __init__(self):
        self.gcs_handler = GCSHandler()
        self.image_processor = ImageProcessor()
        self.api_key = settings.UPSTAGE_API_KEY
        self.ocr_url = "https://api.upstage.ai/v1/document-ai/ocr"
        self._executor = ThreadPoolExecutor(max_workers=3)  # I/O 작업을 위한 스레드 풀
        self._semaphore = asyncio.Semaphore(5)  # 동�� 요청 제한

    async def process_document(self, filename: str):
        """
        ## 문서 이미지에 대한 OCR 처리를 수행합니다.
        
        ### 처리 과정:
        1. GCS에서 이미지 파일 다운로드
        2. 이미지 전처리 수행
        3. 전처리된 이미지 GCS 업로드
        4. OCR API 호출 및 결과 반환
        
            Args:
                filename (str): 처리할 이미지 파일명
                
            Returns:
                dict: OCR 처리 결과
                    {
                        "status": "success",
                        "data": {API 응답 데이터}
                    }
                    
            Raises:
                Exception: 파일 다운로드/업로드 실패, 이미지 처리 실패, API 호출 실패 시
        """
        async with self._semaphore:  # 동시 처리 제한
            try:
                local_file_path = os.path.join(settings.LOCAL_DOWNLOAD_PATH, filename)
                processed_path = os.path.join(settings.LOCAL_PROCESSED_PATH, filename)

                # I/O 작업을 스레드 풀에서 실행
                if not await asyncio.get_event_loop().run_in_executor(
                    self._executor, self.gcs_handler.download_file, filename):
                    raise Exception("파일 다운로드 실패")

                # 이미지 처리
                image = await asyncio.get_event_loop().run_in_executor(
                    self._executor, cv2.imread, local_file_path)
                if image is None:
                    raise Exception("이미지 로드 실패")

                processed_image = await asyncio.get_event_loop().run_in_executor(
                    self._executor, self.image_processor.preprocess_document, image)

                # 처리된 이미지 저장
                os.makedirs(os.path.dirname(processed_path), exist_ok=True)
                await asyncio.get_event_loop().run_in_executor(
                    self._executor, cv2.imwrite, processed_path, processed_image)

                # GCS 업로드
                if not await asyncio.get_event_loop().run_in_executor(
                    self._executor, self.gcs_handler.upload_file, processed_path):
                    raise Exception("전처리된 이미지 업로드 실패")

                # OCR API 호출 (aiohttp 사용 권장)
                headers = {"Authorization": f"Bearer {self.api_key}"}
                async with aiohttp.ClientSession() as session:
                    with open(processed_path, "rb") as f:
                        files = {"document": f}
                        async with session.post(self.ocr_url, headers=headers, data=files) as response:
                            if response.status != 200:
                                raise Exception(f"OCR API 오류: {await response.text()}")
                            result = await response.json()

                # 임시 파일 정리
                os.remove(local_file_path)
                os.remove(processed_path)

                return {
                    "status": "success",
                    "data": result
                }

            except Exception as e:
                logger.error(f"OCR 처리 중 오류 발생: {str(e)}")
                raise

    async def cleanup(self):
        """
        ## 서비스 종료 시 리소스를 정리합니다.
        
        - ThreadPoolExecutor 종료
        """
        self._executor.shutdown(wait=True)
