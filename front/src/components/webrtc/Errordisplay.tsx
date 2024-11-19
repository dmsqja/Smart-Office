import React from 'react';

interface ErrorDisplayProps {
  error: string;
}

export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ error }) => (
  <div className="webrtc-error">
    <h2>WebRTC Error</h2>
    <p>{error}</p>
    <p>Please use a modern browser with camera and microphone support.</p>
    <p>Supported browsers:</p>
    <ul>
      <li>Google Chrome (recommended)</li>
      <li>Mozilla Firefox</li>
      <li>Microsoft Edge</li>
      <li>Safari 11+</li>
    </ul>
  </div>
);