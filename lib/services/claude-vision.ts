import Anthropic from '@anthropic-ai/sdk';
import type { 
  VisionAnalysisRequest, 
  VisionAnalysisResponse, 
  DetectedTask,
  TaskCategory 
} from '@/lib/types/vision';

interface ServiceConfig {
  model: string;
  maxTokens: number;
  temperature: number;
}

export class ClaudeVisionService {
  private client: Anthropic;
  private config: ServiceConfig;

  constructor() {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    
    if (!apiKey) {
      throw new Error('ANTHROPIC_API_KEY is required');
    }

    this.client = new Anthropic({
      apiKey: apiKey
    });

    this.config = {
      model: 'claude-3-opus-20240229',
      maxTokens: 4096,
      temperature: 0.3
    };
  }

  getConfig(): ServiceConfig {
    return this.config;
  }

  async analyzeImage(request: VisionAnalysisRequest): Promise<VisionAnalysisResponse> {
    try {
      // Validate image format and size
      for (const image of request.images) {
        this.validateImage(image.data);
      }

      // Build the prompt for Claude
      const prompt = this.buildPrompt(request);

      // Call Claude API with exponential backoff for rate limiting
      const response = await this.callWithRetry(prompt, request.images[0].data);

      // Parse the response
      return this.parseResponse(response);
    } catch (error: any) {
      // Handle API failures gracefully
      if (error.message === 'API unavailable') {
        return this.getFallbackResponse();
      }
      throw error;
    }
  }

  private validateImage(imageData: string): void {
    // Check format
    const supportedFormats = ['image/jpeg', 'image/png', 'image/webp'];
    const format = this.extractImageFormat(imageData);
    
    if (!supportedFormats.includes(format)) {
      throw new Error('Unsupported image format');
    }

    // Check size (5MB limit)
    const sizeInBytes = this.calculateImageSize(imageData);
    if (sizeInBytes > 5 * 1024 * 1024) {
      throw new Error('Image size exceeds 5MB limit');
    }
  }

  private extractImageFormat(imageData: string): string {
    const match = imageData.match(/data:([^;]+);/);
    return match ? match[1] : '';
  }

  private calculateImageSize(imageData: string): number {
    // Remove data URL prefix and calculate base64 size
    const base64 = imageData.split(',')[1] || '';
    return base64.length * 0.75; // Approximate size in bytes
  }

  private buildPrompt(request: VisionAnalysisRequest): string {
    return `Analyze this image and identify tasks that need to be done. 
    Focus on cleaning, organizing, maintenance, and repair tasks.
    Provide confidence scores for each task.
    Return the response in JSON format with the following structure:
    {
      "tasks": [
        {
          "id": "unique_id",
          "description": "task description",
          "area": "location in image",
          "priority": "high|medium|low",
          "confidence": 0.0-1.0,
          "category": "cleaning|organizing|maintenance|repair|other"
        }
      ],
      "summary": "brief summary of what was detected",
      "confidence": 0.0-1.0
    }`;
  }

  private async callWithRetry(prompt: string, imageData: string, retries = 3): Promise<any> {
    try {
      const response = await this.client.messages.create({
        model: this.config.model,
        max_tokens: this.config.maxTokens,
        temperature: this.config.temperature,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: prompt
              },
              {
                type: 'image',
                source: {
                  type: 'base64',
                  media_type: this.extractMediaType(imageData),
                  data: this.extractBase64(imageData)
                }
              }
            ]
          }
        ]
      });

      return response;
    } catch (error: any) {
      // Handle rate limiting with exponential backoff
      if (error.status === 429 && retries > 0) {
        const retryAfter = parseInt(error.headers?.['retry-after'] || '2');
        await this.sleep(Math.max(1000, retryAfter * 500));
        return this.callWithRetry(prompt, imageData, retries - 1);
      }
      throw error;
    }
  }

  private extractMediaType(imageData: string): 'image/jpeg' | 'image/png' | 'image/webp' | 'image/gif' {
    const format = this.extractImageFormat(imageData);
    switch (format) {
      case 'image/jpeg':
        return 'image/jpeg';
      case 'image/png':
        return 'image/png';
      case 'image/webp':
        return 'image/webp';
      default:
        return 'image/jpeg';
    }
  }

  private extractBase64(imageData: string): string {
    return imageData.split(',')[1] || '';
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private parseResponse(response: any): VisionAnalysisResponse {
    try {
      const content = response.content[0].text;
      const parsed = JSON.parse(content);
      
      return {
        tasks: parsed.tasks || [],
        summary: parsed.summary || '',
        confidence: parsed.confidence || 0,
        timestamp: new Date()
      };
    } catch (error) {
      return this.getFallbackResponse();
    }
  }

  private getFallbackResponse(): VisionAnalysisResponse {
    return {
      tasks: [],
      summary: 'unable to analyze image at this time',
      confidence: 0,
      timestamp: new Date()
    };
  }
}
