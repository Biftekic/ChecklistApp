import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { vi } from 'vitest';
import userEvent from '@testing-library/user-event';

// Custom render function with providers
export function renderWithProviders(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) {
  // Add any providers here (Theme, Router, Query, etc.)
  const Wrapper = ({ children }: { children: React.ReactNode }) => {
    return <>{children}</>;
  };

  return {
    user: userEvent.setup(),
    ...render(ui, { wrapper: Wrapper, ...options }),
  };
}

// Re-export everything from React Testing Library
export * from '@testing-library/react';
export { renderWithProviders as render };

// Mock factories for common data structures
export const mockFactory = {
  checklist: (overrides = {}) => ({
    id: 'test-checklist-1',
    name: 'Test Checklist',
    serviceType: 'regular',
    propertyType: 'apartment',
    items: [],
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    ...overrides,
  }),
  
  template: (overrides = {}) => ({
    id: 'test-template-1',
    name: 'Test Template',
    serviceType: 'regular',
    propertyType: 'apartment',
    isDefault: false,
    items: [],
    createdAt: new Date('2024-01-01'),
    ...overrides,
  }),
  
  checklistItem: (overrides = {}) => ({
    id: 'item-1',
    text: 'Test Item',
    completed: false,
    category: 'general',
    estimatedTime: 5,
    ...overrides,
  }),
};

// Common test helpers
export const waitForAsync = () => new Promise(resolve => setTimeout(resolve, 0));

// Local storage mock
export const mockLocalStorage = () => {
  const store: Record<string, string> = {};
  
  const localStorageMock = {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      Object.keys(store).forEach(key => delete store[key]);
    }),
  };
  
  Object.defineProperty(window, 'localStorage', {
    value: localStorageMock,
    writable: true,
  });
  
  return localStorageMock;
};
ENDFILE < /dev/null
