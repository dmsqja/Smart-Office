import os
import cv2
import pytest
from app.utils.image.processing import ImageProcessor

TEST_IMAGE = "img/IMG_0000.jpg"
OUTPUT_DIR = "tests/output"

class TestImageProcessor:
    """이미지 전처리 테스트 클래스"""
    
    @pytest.fixture
    def processor(self):
        """ImageProcessor 인스턴스 픽스처"""
        return ImageProcessor()
        
    @pytest.fixture(autouse=True)
    def setup_output_dir(self):
        """아웃풋 디렉토리 생성 픽스처"""
        os.makedirs(OUTPUT_DIR, exist_ok=True)
        
    def test_document_preprocessing(self, processor):
        """문서 이미지 전처리 테스트"""
        # 테스트 이미지 로드
        image = cv2.imread(TEST_IMAGE)
        assert image is not None, f"테스트 이미지를 불러올 수 없습니다: {TEST_IMAGE}"
        
        # 이미지 전처리 실행
        try:
            processed_image = processor.preprocess_document(image)
            
            # 결과 검증
            assert processed_image is not None
            assert isinstance(processed_image, type(image))
            assert len(processed_image.shape) == 3  # 채널 수 확인
            
            # 결과 이미지 저장
            output_path = os.path.join(OUTPUT_DIR, "processed_document.jpg")
            cv2.imwrite(output_path, processed_image)
            assert os.path.exists(output_path)
            
        except Exception as e:
            pytest.fail(f"이미지 전처리 중 오류 발생: {str(e)}")

    def test_invalid_image(self, processor):
        """잘못된 이미지 입력 테스트"""
        with pytest.raises(Exception):
            processor.preprocess_document(None)