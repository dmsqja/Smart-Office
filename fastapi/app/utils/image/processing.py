import cv2
import numpy as np
from app.core.logging.logger import logger

class ImageProcessor:
    """문서 이미지 전처리를 위한 클래스"""
    
    def __init__(self):
        self.logger = logger

    def preprocess_document(self, image):
        """
        ## 문서 외곽선 검출 및 투시 변환 적용
        
            Args:
                image: 입력 이미지 (numpy.ndarray)
            Returns:
                투시 변환이 적용된 이미지 (numpy.ndarray)
        """
        try:
            # 외곽선 검출을 위해서만 그레이스케일 사용
            gray = cv2.cvtColor(image.copy(), cv2.COLOR_BGR2GRAY)
            edges = cv2.Canny(gray, 100, 200)
            
            # 문서 외곽선 검출 (그레이스케일 이미지 사용)
            edges = cv2.Canny(gray, 100, 200)
            
            # 외곽선 찾기
            contours, _ = cv2.findContours(edges, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
            if not contours:
                raise ValueError("문서 외곽선을 찾을 수 없습니다.")
            
            # 가장 큰 외곽선 선택
            doc_contour = max(contours, key=cv2.contourArea)
            
            # 코너 포인트 근사화
            epsilon = 0.02 * cv2.arcLength(doc_contour, True)
            corners = cv2.approxPolyDP(doc_contour, epsilon, True)
            
            if len(corners) != 4:
                raise ValueError("문서의 4개 코너를 찾을 수 없습니다.")
            
            # 코너 포인트 정렬
            corners = self._order_points(corners.reshape(4, 2))
            
            # 최종 투시 변환도 원본 컬러 이미지에 적용
            return self._apply_perspective_transform(image, corners)
            
        except Exception as e:
            self.logger.error(f"이미지 전처리 중 오류 발생: {str(e)}")
            raise

    def _order_points(self, pts):
        """
        ## 4개의 코너 포인트를 순서대로 정렬
        
            [top-left, top-right, bottom-right, bottom-left]
        """
        rect = np.zeros((4, 2), dtype=np.float32)
        
        s = pts.sum(axis=1)
        rect[0] = pts[np.argmin(s)]  # top-left
        rect[2] = pts[np.argmax(s)]  # bottom-right
        
        diff = np.diff(pts, axis=1)
        rect[1] = pts[np.argmin(diff)]  # top-right
        rect[3] = pts[np.argmax(diff)]  # bottom-left
        
        return rect

    def _apply_perspective_transform(self, image, corners):
        """
        ## 4개의 코너 포인트를 이용해 투시 변환 적용
        """
        (tl, tr, br, bl) = corners
        
        # 결과 이미지의 최대 너비 계산
        widthA = np.sqrt(((br[0] - bl[0]) ** 2) + ((br[1] - bl[1]) ** 2))
        widthB = np.sqrt(((tr[0] - tl[0]) ** 2) + ((tr[1] - tl[1]) ** 2))
        max_width = max(int(widthA), int(widthB))
        
        # 결과 이미지의 최대 높이 계산
        heightA = np.sqrt(((tr[0] - br[0]) ** 2) + ((tr[1] - br[1]) ** 2))
        heightB = np.sqrt(((tl[0] - bl[0]) ** 2) + ((tl[1] - bl[1]) ** 2))
        max_height = max(int(heightA), int(heightB))
        
        # 변환 후 좌표
        dst = np.array([
            [0, 0],
            [max_width - 1, 0],
            [max_width - 1, max_height - 1],
            [0, max_height - 1]
        ], dtype=np.float32)
        
        # 투시 변환 행렬 계산 및 적용
        matrix = cv2.getPerspectiveTransform(corners, dst)
        warped = cv2.warpPerspective(image, matrix, (max_width, max_height))
        
        return warped