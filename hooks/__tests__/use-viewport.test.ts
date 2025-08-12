import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useViewport } from '../use-viewport';

describe('useViewport', () => {
  beforeEach(() => {
    // Reset window size before each test
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024,
    });
    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      configurable: true,
      value: 768,
    });
  });

  it('should return initial viewport size', () => {
    const { result } = renderHook(() => useViewport());
    
    expect(result.current.width).toBe(1024);
    expect(result.current.height).toBe(768);
    expect(result.current.isDesktop).toBe(true);
    expect(result.current.isTablet).toBe(false);
    expect(result.current.isMobile).toBe(false);
  });

  it('should detect mobile viewport', () => {
    window.innerWidth = 390;
    window.innerHeight = 844;
    
    const { result } = renderHook(() => useViewport());
    
    expect(result.current.width).toBe(390);
    expect(result.current.height).toBe(844);
    expect(result.current.isMobile).toBe(true);
    expect(result.current.isTablet).toBe(false);
    expect(result.current.isDesktop).toBe(false);
  });

  it('should detect tablet viewport', () => {
    window.innerWidth = 768;
    window.innerHeight = 1024;
    
    const { result } = renderHook(() => useViewport());
    
    expect(result.current.width).toBe(768);
    expect(result.current.height).toBe(1024);
    expect(result.current.isMobile).toBe(false);
    expect(result.current.isTablet).toBe(true);
    expect(result.current.isDesktop).toBe(false);
  });

  it('should update on window resize', () => {
    const { result } = renderHook(() => useViewport());
    
    expect(result.current.isDesktop).toBe(true);
    
    act(() => {
      window.innerWidth = 390;
      window.innerHeight = 844;
      window.dispatchEvent(new Event('resize'));
    });
    
    expect(result.current.width).toBe(390);
    expect(result.current.height).toBe(844);
    expect(result.current.isMobile).toBe(true);
    expect(result.current.isDesktop).toBe(false);
  });

  it('should clean up event listener on unmount', () => {
    const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');
    
    const { unmount } = renderHook(() => useViewport());
    
    unmount();
    
    expect(removeEventListenerSpy).toHaveBeenCalledWith('resize', expect.any(Function));
  });
});
