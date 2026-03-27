import React, { useState } from 'react';
import './ShareButton.css';

interface ShareButtonProps {
  completionTimeMs: number;
  puzzleDate: string;
}

const ShareButton: React.FC<ShareButtonProps> = ({ completionTimeMs, puzzleDate }) => {
  const [copied, setCopied] = useState(false);

  const buildMessage = (): string => {
    const seconds = Math.floor(completionTimeMs / 1000);
    const url = `${window.location.origin}?date=${puzzleDate}`;
    return `I solved today's riddle in ${seconds} seconds! 🧩 Can you beat my time? ${url}`;
  };

  const handleShare = async () => {
    const message = buildMessage();

    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(message);
      } else {
        // Fallback for older browsers without Clipboard API
        const textarea = document.createElement('textarea');
        textarea.value = message;
        textarea.style.position = 'fixed';
        textarea.style.top = '0';
        textarea.style.left = '0';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }

      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy share message:', err);
    }
  };

  return (
    <button
      className={`share-btn${copied ? ' share-btn--copied' : ''}`}
      onClick={handleShare}
      aria-label="Copy your result to clipboard"
      title={copied ? 'Copied to clipboard!' : 'Copy result to share'}
    >
      <span className="share-btn-icon" aria-hidden="true">
        {copied ? '✓' : '🎉'}
      </span>
      <span className="share-btn-label">
        {copied ? 'Copied!' : 'Share Result'}
      </span>
    </button>
  );
};

export default ShareButton;
