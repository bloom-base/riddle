import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import HintButton from './HintButton';

describe('HintButton', () => {
  it('should render with hints count', () => {
    const onHintClick = vi.fn();
    render(<HintButton onHintClick={onHintClick} hintsUsed={0} />);
    
    expect(screen.getByRole('button', { name: /hint/i })).toBeInTheDocument();
    expect(screen.getByText(/0 used/i)).toBeInTheDocument();
  });

  it('should call onHintClick when button is clicked', () => {
    const onHintClick = vi.fn();
    render(<HintButton onHintClick={onHintClick} hintsUsed={0} />);
    
    const button = screen.getByRole('button', { name: /hint/i });
    fireEvent.click(button);
    
    expect(onHintClick).toHaveBeenCalledTimes(1);
  });

  it('should display warning when hints are used', () => {
    const onHintClick = vi.fn();
    render(<HintButton onHintClick={onHintClick} hintsUsed={3} />);
    
    expect(screen.getByText(/using hints affects leaderboard ranking/i)).toBeInTheDocument();
  });

  it('should not display warning when no hints used', () => {
    const onHintClick = vi.fn();
    render(<HintButton onHintClick={onHintClick} hintsUsed={0} />);
    
    expect(screen.queryByText(/using hints affects leaderboard ranking/i)).not.toBeInTheDocument();
  });

  it('should be disabled when disabled prop is true', () => {
    const onHintClick = vi.fn();
    render(<HintButton onHintClick={onHintClick} hintsUsed={0} disabled={true} />);
    
    const button = screen.getByRole('button', { name: /hint/i });
    expect(button).toBeDisabled();
  });

  it('should not call onHintClick when disabled', () => {
    const onHintClick = vi.fn();
    render(<HintButton onHintClick={onHintClick} hintsUsed={0} disabled={true} />);
    
    const button = screen.getByRole('button', { name: /hint/i });
    fireEvent.click(button);
    
    expect(onHintClick).not.toHaveBeenCalled();
  });
});
