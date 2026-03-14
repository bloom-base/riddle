import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import SoundToggle from './SoundToggle';

describe('SoundToggle Component', () => {
  it('should render sound toggle button', () => {
    render(<SoundToggle enabled={true} onToggle={vi.fn()} />);
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
  });

  it('should show sound on icon when enabled', () => {
    render(<SoundToggle enabled={true} onToggle={vi.fn()} />);
    expect(screen.getByText('🔊')).toBeInTheDocument();
    expect(screen.getByText('Sound On')).toBeInTheDocument();
  });

  it('should show sound off icon when disabled', () => {
    render(<SoundToggle enabled={false} onToggle={vi.fn()} />);
    expect(screen.getByText('🔇')).toBeInTheDocument();
    expect(screen.getByText('Sound Off')).toBeInTheDocument();
  });

  it('should call onToggle when clicked', () => {
    const onToggle = vi.fn();
    render(<SoundToggle enabled={true} onToggle={onToggle} />);

    const button = screen.getByRole('button');
    fireEvent.click(button);

    expect(onToggle).toHaveBeenCalledTimes(1);
  });

  it('should have correct accessibility attributes when enabled', () => {
    render(<SoundToggle enabled={true} onToggle={vi.fn()} />);
    const button = screen.getByRole('button');

    expect(button).toHaveAttribute('title', 'Sound effects enabled');
    expect(button).toHaveAttribute('aria-label', 'Disable sound effects');
  });

  it('should have correct accessibility attributes when disabled', () => {
    render(<SoundToggle enabled={false} onToggle={vi.fn()} />);
    const button = screen.getByRole('button');

    expect(button).toHaveAttribute('title', 'Sound effects disabled');
    expect(button).toHaveAttribute('aria-label', 'Enable sound effects');
  });
});
