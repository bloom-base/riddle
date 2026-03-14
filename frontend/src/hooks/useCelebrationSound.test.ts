import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useCelebrationSound } from './useCelebrationSound';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock Web Audio API
const mockOscillator = {
  connect: vi.fn(),
  start: vi.fn(),
  stop: vi.fn(),
  frequency: { value: 0 },
  type: 'sine' as OscillatorType,
};

const mockGainNode = {
  connect: vi.fn(),
  gain: {
    setValueAtTime: vi.fn(),
    linearRampToValueAtTime: vi.fn(),
    exponentialRampToValueAtTime: vi.fn(),
  },
};

const mockAudioContext = {
  currentTime: 0,
  createOscillator: vi.fn(() => mockOscillator),
  createGain: vi.fn(() => mockGainNode),
  destination: {},
  close: vi.fn(),
};

Object.defineProperty(window, 'AudioContext', {
  value: vi.fn(() => mockAudioContext),
});

describe('useCelebrationSound Hook', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should initialize with sound enabled by default', () => {
    const { result } = renderHook(() => useCelebrationSound());
    expect(result.current.soundEnabled).toBe(true);
  });

  it('should load sound preference from localStorage', () => {
    localStorageMock.setItem('riddleSoundEnabled', 'false');
    const { result } = renderHook(() => useCelebrationSound());
    expect(result.current.soundEnabled).toBe(false);
  });

  it('should toggle sound preference', () => {
    const { result } = renderHook(() => useCelebrationSound());

    expect(result.current.soundEnabled).toBe(true);

    act(() => {
      result.current.toggleSound();
    });

    expect(result.current.soundEnabled).toBe(false);
  });

  it('should save sound preference to localStorage when toggled', () => {
    const { result } = renderHook(() => useCelebrationSound());

    act(() => {
      result.current.toggleSound();
    });

    expect(localStorageMock.getItem('riddleSoundEnabled')).toBe('false');
  });

  it('should play celebration sound when enabled', () => {
    const { result } = renderHook(() => useCelebrationSound());

    act(() => {
      result.current.playCelebrationSound();
    });

    expect(mockAudioContext.createOscillator).toHaveBeenCalled();
    expect(mockAudioContext.createGain).toHaveBeenCalled();
    expect(mockOscillator.connect).toHaveBeenCalledWith(mockGainNode);
    expect(mockGainNode.connect).toHaveBeenCalledWith(mockAudioContext.destination);
  });

  it('should not play sound when disabled', () => {
    const { result } = renderHook(() => useCelebrationSound());

    act(() => {
      result.current.toggleSound(); // Disable sound
    });

    vi.clearAllMocks();

    act(() => {
      result.current.playCelebrationSound();
    });

    expect(mockAudioContext.createOscillator).not.toHaveBeenCalled();
  });

  it('should handle errors gracefully when playing sound', () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    // Replace the createOscillator method to throw an error
    const originalCreateOscillator = mockAudioContext.createOscillator;
    mockAudioContext.createOscillator = vi.fn(() => {
      throw new Error('Audio context error');
    });

    const { result } = renderHook(() => useCelebrationSound());

    act(() => {
      result.current.playCelebrationSound();
    });

    expect(consoleErrorSpy).toHaveBeenCalled();

    // Restore original function
    mockAudioContext.createOscillator = originalCreateOscillator;
    consoleErrorSpy.mockRestore();
  });
});
