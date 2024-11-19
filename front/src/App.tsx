import React from 'react';
import './App.css';
import WebRTCComponent from './components/webrtc/WebRTCComponents.tsx';

function App() {
  return (
    <div className="App">
      <WebRTCComponent roomId="test-room" />
    </div>
  );
}

export default App;
