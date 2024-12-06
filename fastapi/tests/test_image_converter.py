import os
import cv2
import pytest
from app.utils.image.converter import ImageConverter

# 테스트 이미지 경로 상수
TEST_IMAGE_PATH = "img/IMG_0000.jpg"
TEST_OUTPUT_PATH = "tests/output/decoded_image.jpg"

@pytest.fixture
def setup_output_dir():
    """출력 디렉토리 생성 픽스처"""
    os.makedirs("output", exist_ok=True)
    yield
    # 테스트 후 출력 파일 정리 (선택적)
    # if os.path.exists(TEST_OUTPUT_PATH):
    #     os.remove(TEST_OUTPUT_PATH)

@pytest.fixture
def test_image():
    """테스트 이미지 로드 픽스처"""
    if not os.path.exists(TEST_IMAGE_PATH):
        pytest.fail(f"테스트 이미지가 없습니다: {TEST_IMAGE_PATH}")
    
    image = cv2.imread(TEST_IMAGE_PATH)
    if image is None:
        pytest.fail("테스트 이미지 로드 실패")
    return image

def test_encode_and_print_base64(test_image):
    """Base64 인코딩 및 출력 테스트"""
    base64_string = ImageConverter.encode_image(test_image)
    
    # Base64 문자열 출력 (디버깅/확인용)
    print("\nBase64 encoded string:")
    print(base64_string[:100] + "...") # 처음 100자만 출력
    
    assert isinstance(base64_string, str)
    assert len(base64_string) > 0

def test_decode_and_show_image(test_image, setup_output_dir):
    """이미지 디코딩 및 표시/저장 테스트"""
    # 인코딩 -> 디코딩
    base64_string = ImageConverter.encode_image(test_image)
    decoded_image = ImageConverter.decode_image(base64_string)
    
    assert decoded_image is not None
    
    # 디코딩된 이미지 저장
    cv2.imwrite(TEST_OUTPUT_PATH, decoded_image)
    assert os.path.exists(TEST_OUTPUT_PATH)
    
    # 이미지 표시 (GUI 환경에서만 작동)
    if os.environ.get('DISPLAY'):
        cv2.imshow('Decoded Image', decoded_image)
        cv2.waitKey(1000)  # 1초 동안 표시
        cv2.destroyAllWindows()