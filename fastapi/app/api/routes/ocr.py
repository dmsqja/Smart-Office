from fastapi import APIRouter, HTTPException
from app.services.ocr_service import OCRService

router = APIRouter()
ocr_service = OCRService()

@router.post("/process")
async def process_document(filename: str):
    """
    ## 문서 이미지에 대해 OCR 처리를 수행하는 엔드포인트
    
        Args:
            filename (str): GCS에 저장된 이미지 파일명
            
        Returns:
            dict: OCR 처리 결과
                {
                    "status": "success",
                    "data": {
                        "apiVersion": str,
                        "confidence": float,
                        "metadata": dict,
                        "mimeType": str,
                        "text": str,
                        ...
                    }
                }
                
        Raises:
            HTTPException: OCR 처리 중 오류 발생 시 (500)
        
        Note:
            - 파일은 GCS의 설정된 경로에 미리 업로드되어 있어야 함
            - 전처리된 이미지는 processed/ 경로에 자동 저장됨
    """
    try:
        result = await ocr_service.process_document(filename)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
