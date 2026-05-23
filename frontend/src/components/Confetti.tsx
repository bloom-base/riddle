import { useEffect, useRef, useCallback } from 'react';
import './Confetti.css';

interface ConfettiProps {
  /** Whether the confetti animation is active */
  active: boolean;
  /** Duration in ms before confetti stops spawning (default 2500) */
  duration?: number;
  /** Number of particles to spawn (default 60) */
  particleCount?: number;
}

const COLORS = [
  '#8b5cf6', // accent purple
  '#c4b5fd', // accent light
  '#f59e0b', // warm amber
  '#10b981', // success green
  '#ef4444', // red
  '#3b82f6', // blue
  '#ec4899', // pink
  '#f97316', // orange
];

const SHAPES = ['square', 'circle', 'strip'] as const;

/**
 * Reusable confetti celebration component.
 *
 * Renders colourful particles that fall and rotate across the viewport,
 * then cleans up all DOM nodes once the animation finishes.
 */
export default function Confetti({
  active,
  duration = 2500,
  particleCount = 60,
}: ConfettiProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const spawnedRef = useRef(false);

  const spawnParticles = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    for (let i = 0; i < particleCount; i++) {
      const el = document.createElement('div');
      const color = COLORS[Math.floor(Math.random() * COLORS.length)];
      const shape = SHAPES[Math.floor(Math.random() * SHAPES.length)];

      // Random properties for natural-looking spread
      const left = Math.random() * 100;           // horizontal position (%)
      const delay = Math.random() * duration * 0.6; // stagger spawn
      const fallDuration = 2000 + Math.random() * 1500; // 2–3.5s fall time
      const drift = (Math.random() - 0.5) * 200;  // horizontal drift (px)
      const rotation = Math.random() * 720 - 360;  // spin (-360° to 360°)
      const size = shape === 'strip'
        ? { w: 3 + Math.random() * 3, h: 10 + Math.random() * 12 }
        : { w: 6 + Math.random() * 6, h: 6 + Math.random() * 6 };

      el.className = `confetti-particle confetti-${shape}`;
      el.style.cssText = `
        left: ${left}%;
        width: ${size.w}px;
        height: ${size.h}px;
        background: ${color};
        animation-delay: ${delay}ms;
        animation-duration: ${fallDuration}ms;
        --drift: ${drift}px;
        --rotation: ${rotation}deg;
      `;

      container.appendChild(el);
    }

    // Clean up all particles after the longest possible animation finishes
    const maxLifetime = duration * 0.6 + 3500 + 200; // max delay + max fall + buffer
    setTimeout(() => {
      if (container) {
        container.innerHTML = '';
      }
    }, maxLifetime);
  }, [duration, particleCount]);

  useEffect(() => {
    if (active && !spawnedRef.current) {
      spawnedRef.current = true;
      spawnParticles();
    }

    if (!active) {
      spawnedRef.current = false;
    }
  }, [active, spawnParticles]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, []);

  if (!active) return null;

  return (
    <div
      ref={containerRef}
      className="confetti-container"
      aria-hidden="true"
    />
  );
}
