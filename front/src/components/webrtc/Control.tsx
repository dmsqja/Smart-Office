import React from 'react';

interface ControlsProps {
  isCallStarted: boolean;
  localStream: MediaStream | null;
  onStartCall: () => void;
  onEndCall: () => void;
}

export const Controls: React.FC<ControlsProps> = ({
  isCallStarted,
  localStream,
  onStartCall,
  onEndCall
}) => (
  <div className="controls">
    {!isCallStarted ? (
      <button 
        onClick={onStartCall}
        className="control-button start-call"
        disabled={!localStream}
      >
        Start Call
      </button>
    ) : (
      <button 
        onClick={onEndCall}
        className="control-button end-call"
      >
        End Call
      </button>
    )}
  </div>
);