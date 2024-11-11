import React from 'react';

interface ConnectionStatusProps {
  isConnected: boolean;
}

export const ConnectionStatus: React.FC<ConnectionStatusProps> = ({
  isConnected
}) => (
  <div className="connection-status">
    Status: {isConnected ? 'Connected' : 'Disconnected'}
  </div>
);