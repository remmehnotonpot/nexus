import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useTheme } from './useTheme';

const THEME_STORAGE_KEY = 'swish-theme';

describe('useTheme', () => {
  let storageValue: string | null = null;

  beforeEach(() => {
    document.documentElement.classList.remove('dark');
    
    storageValue = null;
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: vi.fn(() => storageValue),
        setItem: vi.fn((key: string, value: string) => {
          if (key === THEME_STORAGE_KEY) storageValue = value;
        }),
        removeItem: vi.fn(),
        clear: vi.fn(),
      },
      writable: true,
    });
    
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('detects system theme', () => {
    const { result } = renderHook(() => useTheme());

    expect(result.current.theme).toBe('system');
    expect(result.current.resolvedTheme).toBe('light');
    expect(result.current.isDark).toBe(false);
  });

  it('toggles theme', () => {
    const { result } = renderHook(() => useTheme());

    act(() => {
      result.current.toggle();
    });

    expect(result.current.theme).toBe('dark');
    expect(result.current.resolvedTheme).toBe('dark');
    expect(result.current.isDark).toBe(true);
  });

  it('toggles back to light', () => {
    const { result } = renderHook(() => useTheme());

    act(() => {
      result.current.toggle();
    });

    act(() => {
      result.current.toggle();
    });

    expect(result.current.theme).toBe('light');
    expect(result.current.resolvedTheme).toBe('light');
    expect(result.current.isDark).toBe(false);
  });

  it('sets light theme', () => {
    const { result } = renderHook(() => useTheme());

    act(() => {
      result.current.setLight();
    });

    expect(result.current.theme).toBe('light');
  });

  it('sets dark theme', () => {
    const { result } = renderHook(() => useTheme());

    act(() => {
      result.current.setDark();
    });

    expect(result.current.theme).toBe('dark');
  });

  it('sets system theme', () => {
    const { result } = renderHook(() => useTheme());

    act(() => {
      result.current.setDark();
    });

    act(() => {
      result.current.setSystem();
    });

    expect(result.current.theme).toBe('system');
  });

  it('persists theme preference', () => {
    const { result } = renderHook(() => useTheme());

    act(() => {
      result.current.setDark();
    });

    expect(window.localStorage.setItem).toHaveBeenCalledWith(THEME_STORAGE_KEY, 'dark');
  });

  it('loads stored theme', () => {
    storageValue = 'dark';
    const { result } = renderHook(() => useTheme());
    act(() => {});
    expect(result.current.theme).toBe('dark');
  });

  it('allows setting theme directly', () => {
    const { result } = renderHook(() => useTheme());

    act(() => {
      result.current.setTheme('dark');
    });

    expect(result.current.theme).toBe('dark');
  });
});
