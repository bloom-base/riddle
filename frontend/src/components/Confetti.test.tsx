import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import Confetti from './Confetti';

describe('Confetti Component', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should not render when active is false', () => {
    const { container } = render(<Confetti active={false} />);
    expect(container.querySelector('.confetti-container')).toBeNull();
  });

  it('should render confetti particles when active is true', () => {
    const { container } = render(<Confetti active={true} />);
    const confettiContainer = container.querySelector('.confetti-container');
    expect(confettiContainer).toBeInTheDocument();

    const particles = container.querySelectorAll('.confetti-particle');
    expect(particles.length).toBeGreaterThan(0);
  });

  it('should auto-hide after specified duration', async () => {
    const onComplete = vi.fn();
    const duration = 2000;

    const { container } = render(
      <Confetti active={true} duration={duration} onComplete={onComplete} />
    );

    expect(container.querySelector('.confetti-container')).toBeInTheDocument();

    // Fast-forward time
    await vi.advanceTimersByTimeAsync(duration);

    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it('should use default duration when not specified', () => {
    const { container } = render(<Confetti active={true} />);
    expect(container.querySelector('.confetti-container')).toBeInTheDocument();
  });

  it('should generate 50 confetti particles', () => {
    const { container } = render(<Confetti active={true} />);
    const particles = container.querySelectorAll('.confetti-particle');
    expect(particles.length).toBe(50);
  });

  it('should apply random styles to particles', () => {
    const { container } = render(<Confetti active={true} />);
    const particles = container.querySelectorAll('.confetti-particle');

    particles.forEach((particle) => {
      const htmlParticle = particle as HTMLElement;
      expect(htmlParticle.style.left).toBeTruthy();
      expect(htmlParticle.style.backgroundColor).toBeTruthy();
      expect(htmlParticle.style.animationDelay).toBeTruthy();
      expect(htmlParticle.style.animationDuration).toBeTruthy();
      expect(htmlParticle.style.width).toBeTruthy();
      expect(htmlParticle.style.height).toBeTruthy();
    });
  });

  it('should have aria-hidden attribute for accessibility', () => {
    const { container } = render(<Confetti active={true} />);
    const confettiContainer = container.querySelector('.confetti-container');
    expect(confettiContainer).toHaveAttribute('aria-hidden', 'true');
  });
});
