import React, { useState, useRef, useCallback, useEffect } from 'react';
import Webcam from 'react-webcam';
import { Modal, Button, Alert, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import axios from 'axios';

const VerifyModal = ({ open, onClose }) => {
  const webcamRef = useRef(null);
  const [capturedImage, setCapturedImage] = useState(null);
  const [status, setStatus] = useState(null);

  // 모든 상태 초기화를 위한 함수
  const resetState = useCallback(() => {
    setCapturedImage(null);
    setStatus(null);
  }, []);

  // 모달 닫기 처리
  const handleClose = useCallback(() => {
    resetState();
    onClose();
  }, [onClose, resetState]);

  // userInfo 가져오는 함수 분리
  const getUserInfo = useCallback(() => {
    const userInfo = sessionStorage.getItem('userInfo');
    return userInfo ? JSON.parse(userInfo) : null;
  }, []);

  const videoConstraints = {
    width: 720,
    height: 480,
    facingMode: "user"
  };

  const capture = () => {
    const video = webcamRef.current.video;
    const canvas = document.createElement('canvas');
    const width = video.videoWidth;
    const height = video.videoHeight;
    canvas.width = width;
    canvas.height = height;
    
    const ctx = canvas.getContext('2d');
    
    // 캔버스 중앙을 기준으로 좌우반전
    ctx.translate(width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0, width, height);
    
    // 원래 상태로 복원
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    
    const imageSrc = canvas.toDataURL('image/jpeg');
    setCapturedImage(imageSrc);
  };

  const retake = () => {
    setCapturedImage(null);
  };

  const verify = async () => {
    try {
      const userInfo = getUserInfo();
      if (!userInfo?.employeeId) {
        setStatus('error');
        alert('사용자 정보를 찾을 수 없습니다.');
        return;
      }

      // Base64 문자열을 Blob으로 간단하게 변환
      const blob = await fetch(capturedImage).then(res => res.blob());
      
      const formData = new FormData();
      formData.append('file', blob, `${userInfo.employeeId}.jpg`);

      const result = await axios.post('/api/verify/face', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'X-User-Id': userInfo.employeeId
        }
      });

      if (result.data.success) {
        setStatus('success');
        setTimeout(handleClose, 2000);
      } else {
        setStatus('error');
        if (result.data.message) {
          alert(result.data.message);
        }
        setTimeout(() => setStatus(null), 3000);
      }
    } catch (error) {
      setStatus('error');
      const errorMessage = error.response?.data?.message || '얼굴 인증 중 오류가 발생했습니다.';
      alert(errorMessage);
      setTimeout(() => setStatus(null), 3000);
    }
  };

  // 컴포넌트 언마운트 시 타이머 정리
  useEffect(() => {
    return () => {
      // 모든 진행 중인 타이머 정리
      const cleanup = () => {
        setStatus(null);
        setCapturedImage(null);
      };
      cleanup();
    };
  }, []);

  return (
    <Modal
      open={open}
      onClose={handleClose}
    >
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        backgroundColor: 'white',
        padding: '50px 20px 20px 20px',
        borderRadius: '8px',
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
        maxWidth: '90vw',
        maxHeight: '90vh',
        width: '720px', // 고정 너비 설정
      }}>
        <div style={{ 
          position: 'absolute',
          top: 8,
          right: 8,
          zIndex: 1000 // z-index 추가하여 항상 최상단에 표시
        }}>
          <IconButton 
            onClick={handleClose}
            size="small"
            sx={{ 
              bgcolor: 'rgba(255, 255, 255, 0.8)',
              '&:hover': {
                bgcolor: 'rgba(255, 255, 255, 0.9)'
              }
            }}
          >
            <CloseIcon />
          </IconButton>
        </div>
        
        {status && (
          <Alert 
            severity={status} 
            sx={{ mb: 2 }}
          >
            {status === 'success' ? '출근이 완료되었습니다.' : '얼굴 인증에 실패했습니다. 다시 시도해주세요.'}
          </Alert>
        )}
        
        {!capturedImage ? (
          <>
            <div style={{
              borderRadius: '12px',
              overflow: 'hidden',
              backgroundColor: '#f5f5f5',
              border: '1px solid #e0e0e0'
            }}>
              <Webcam
                audio={false}
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                videoConstraints={videoConstraints}
                mirrored={true}
                style={{ 
                  width: '100%', 
                  height: 'auto',
                  display: 'block' // 이미지 하단 갭 제거
                }}
              />
            </div>
            <Button 
              variant="contained" 
              onClick={capture}
              fullWidth
              sx={{ mt: 2 }}
            >
              사진 촬영
            </Button>
          </>
        ) : (
          <>
            <div style={{
              borderRadius: '12px',
              overflow: 'hidden',
              backgroundColor: '#f5f5f5',
              border: '1px solid #e0e0e0'
            }}>
              <img 
                src={capturedImage} 
                alt="captured" 
                style={{ 
                  width: '100%', 
                  height: 'auto',
                  display: 'block' // 이미지 하단 갭 제거
                }}
              />
            </div>
            <Button 
              variant="contained" 
              color="primary"
              onClick={verify}
              fullWidth
              sx={{ mt: 2 }}
            >
              인증하기
            </Button>
            <Button 
              variant="outlined" 
              onClick={retake}
              fullWidth
              sx={{ mt: 1 }}
            >
              다시 촬영
            </Button>
          </>
        )}
      </div>
    </Modal>
  );
};

export default VerifyModal;
