import base64
import cv2
import numpy as np
from typing import Union

class ImageConverter:
    """
    ## 이미지 인코딩/디코딩을 위한 유틸리티 클래스
    
    ### 이미지를 Base64 문자열로 변환하거나 Base64 문자열을 OpenCV 이미지로 변환하는 기능을 제공
    
        Methods:
            encode_image: OpenCV/NumPy 이미지를 Base64 문자열로 인코딩
            decode_image: Base64 문자열을 OpenCV 이미지로 디코딩
    """
    
    @staticmethod
    def encode_image(image: np.ndarray) -> str:
        """
        ## 이미지를 Base64 문자열로 인코딩
        
            Args:
                image (np.ndarray): OpenCV/NumPy 형식의 이미지 배열
                
            Returns:
                str: Base64로 인코딩된 이미지 문자열
        """
        _, buffer = cv2.imencode('.png', image)
        base64_string = base64.b64encode(buffer).decode('utf-8')
        return base64_string
    
    @staticmethod
    def decode_image(base64_string: str) -> Union[np.ndarray, None]:
        """
        ## Base64 문자열을 OpenCV 이미지로 디코딩
        
            Args:
                base64_string (str): Base64로 인코딩된 이미지 문자열
                
            Returns:
                np.ndarray: OpenCV 형식의 이미지 배열
                None: 디코딩 실패시
        """
        try:
            img_data = base64.b64decode(base64_string)
            nparr = np.frombuffer(img_data, np.uint8)
            image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
            return image
        except Exception as e:
            print(f"이미지 디코딩 실패: {str(e)}")
            return None