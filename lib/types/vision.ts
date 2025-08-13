// Vision AI types for Claude integration

export interface VisionAnalysisRequest {
  images: ImageInput[];
  roomType?: string;
  context?: string;
  includeConfidence?: boolean;
}

export interface ImageInput {
  data: string; // base64 or URL
  type: 'base64' | 'url';
  metadata?: ImageMetadata;
}

export interface ImageMetadata {
  filename?: string;
  mimeType?: string;
  size?: number;
  roomIdentifier?: string;
}

export interface VisionAnalysisResponse {
  tasks: DetectedTask[];
  summary: string;
  confidence: number;
  timestamp: string;
  cacheHit: boolean;
}

export interface DetectedTask {
  id: string;
  description: string;
  area: string;
  priority: 'high' | 'medium' | 'low';
  confidence: number;
  category: TaskCategory;
  suggestedTools?: string[];
}

export type TaskCategory = 
  | 'cleaning'
  | 'organizing'
  | 'maintenance'
  | 'safety'
  | 'repair';

export interface ProcessedImage {
  data: string;
  format: 'base64';
  mimeType: string;
  size: number;
  hash: string;
}

export interface AIResponse {
  id?: number;
  imageHash: string;
  roomType?: string;
  request: VisionAnalysisRequest;
  response: VisionAnalysisResponse;
  createdAt: Date;
  expiresAt: Date;
  accessCount: number;
  lastAccessedAt: Date;
}

export interface ClaudeVisionConfig {
  apiKey: string;
  model?: string;
  maxTokens?: number;
  temperature?: number;
  cacheEnabled?: boolean;
  cacheTTL?: number; // in seconds
}

export class VisionAPIError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode?: number,
    public retryable: boolean = false
  ) {
    super(message);
    this.name = 'VisionAPIError';
  }
}

export interface RateLimitInfo {
  remaining: number;
  reset: Date;
  limit: number;
}