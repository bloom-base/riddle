import React from 'react';
import './SoundToggle.css';

interface SoundToggleProps {
  enabled: boolean;
  onToggle: () => void;
}

const SoundToggle: React.FC<SoundToggleProps> = ({ enabled, onToggle }) => {
  return (
    <button
      className="sound-toggle"
      onClick={onToggle}
      title={enabled ? 'Sound effects enabled' : 'Sound effects disabled'}
      aria-label={enabled ? 'Disable sound effects' : 'Enable sound effects'}
    >
      <span className="sound-icon">{enabled ? '🔊' : '🔇'}</span>
      <span className="sound-label">{enabled ? 'Sound On' : 'Sound Off'}</span>
    </button>
  );
};

export default SoundToggle;
