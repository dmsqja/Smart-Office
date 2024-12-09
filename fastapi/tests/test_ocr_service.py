import pytest
from app.services.ocr_service import OCRService
from app.core.config import settings
from app.core.logging.logger import logger
import json

@pytest.fixture
def ocr_service():
    return OCRService()

@pytest.mark.asyncio
async def test_ocr_service_initialization(ocr_service):
    assert ocr_service.api_key == settings.UPSTAGE_API_KEY
    assert ocr_service.ocr_url == "https://api.upstage.ai/v1/document-ai/ocr"

@pytest.mark.asyncio
async def test_process_document_success(ocr_service):
    filename = "IMG_0000.jpg"
    result = await ocr_service.process_document(filename)
    
    # OCR 결과 로깅
    logger.info("OCR 응답 결과:")
    logger.info(json.dumps(result, indent=2, ensure_ascii=False))
    
    assert result is not None
    assert "status" in result
    assert "data" in result
