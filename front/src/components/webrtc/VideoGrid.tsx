import React from 'react';

interface VideoGridProps {
  localVideoRef: React.RefObject<HTMLVideoElement>;
  remoteVideoRef: React.RefObject<HTMLVideoElement>;
}

export const VideoGrid: React.FC<VideoGridProps> = ({
  localVideoRef,
  remoteVideoRef
}) => (
  <div className="video-grid">
    <div className="video-wrapper">
      <video
        ref={localVideoRef}
        autoPlay
        playsInline
        muted
        className="video-stream"
      />
      <div className="video-label">Local Stream</div>
    </div>
    <div className="video-wrapper">
      <video
        ref={remoteVideoRef}
        autoPlay
        playsInline
        className="video-stream"
      />
      <div className="video-label">Remote Stream</div>
    </div>
  </div>
);