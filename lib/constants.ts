export const APP_NAME = 'ChecklistApp';
export const APP_DESCRIPTION = 'Professional service checklists made simple';

export const BREAKPOINTS = {
  xs: 390,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const;

export const TOUCH_TARGET_SIZE = {
  default: 44,
  small: 36,
} as const;

export const API_ENDPOINTS = {
  ANALYZE_IMAGE: '/api/analyze',
  GENERATE_CHECKLIST: '/api/generate',
  EXPORT: '/api/export',
} as const;

export const FILE_SIZE_LIMITS = {
  IMAGE: 5 * 1024 * 1024, // 5MB
  DOCUMENT: 10 * 1024 * 1024, // 10MB
} as const;

export const SUPPORTED_IMAGE_FORMATS = ['image/jpeg', 'image/png', 'image/webp'] as const;