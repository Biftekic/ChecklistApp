import jsPDF from 'jspdf';
import type { Checklist, ChecklistTask } from '@/lib/types/checklist';

export interface ExportOptions {
  format?: 'pdf' | 'markdown' | 'json' | 'csv' | 'perfexcrm';
  includeMetadata?: boolean;
  includeImages?: boolean;
  githubFlavored?: boolean;
  includeFrontmatter?: boolean;
  includelogo?: boolean;
  primaryColor?: string;
  fontFamily?: string;
}

export interface PerfexCRMConfig {
  endpoint: string;
  apiKey: string;
}

export interface ExportPreview {
  format: string;
  content: string;
  size: number;
}

export class ExportService {
  private supportedFormats = ['pdf', 'markdown', 'json', 'csv', 'perfexcrm'];

  async generatePDF(checklist: Checklist, options?: ExportOptions): Promise<Blob> {
    const doc = new jsPDF();
    
    // Apply custom font if specified
    if (options?.fontFamily) {
      doc.setFont(options.fontFamily);
    }
    
    // Add title
    doc.setFontSize(20);
    doc.text(checklist.title || 'Untitled Checklist', 20, 20);
    
    // Add description
    if (checklist.description) {
      doc.setFontSize(12);
      doc.text(checklist.description, 20, 35);
    }
    
    // Add tasks
    let yPosition = 50;
    doc.setFontSize(11);
    
    checklist.tasks?.forEach((task, index) => {
      if (yPosition > 270) {
        doc.addPage();
        yPosition = 20;
      }
      
      const checkbox = task.completed ? '[x]' : '[ ]';
      const taskText = `${checkbox} ${task.description}`;
      doc.text(taskText, 20, yPosition);
      yPosition += 10;
    });
    
    // Add images if present
    if (checklist.images && options?.includeImages !== false) {
      checklist.images.forEach((image, index) => {
        if (yPosition > 200) {
          doc.addPage();
          yPosition = 20;
        }
        // Note: In real implementation, you'd add the image here
        // doc.addImage(image, 'JPEG', 20, yPosition, 170, 100);
        yPosition += 110;
      });
    }
    
    // Generate blob
    const pdfOutput = doc.output('blob');
    return pdfOutput;
  }

  async generateMarkdown(checklist: Checklist, options?: ExportOptions): Promise<string> {
    let markdown = '';
    
    // Add frontmatter if requested
    if (options?.includeFrontmatter) {
      markdown += '---\n';
      markdown += `title: ${checklist.title}\n`;
      markdown += `category: ${checklist.category}\n`;
      if (checklist.tags && checklist.tags.length > 0) {
        markdown += 'tags:\n';
        checklist.tags.forEach(tag => {
          markdown += `  - ${tag}\n`;
        });
      }
      markdown += '---\n\n';
    }
    
    // Add title
    markdown += `# ${checklist.title}\n\n`;
    
    // Add description
    if (checklist.description) {
      markdown += `${checklist.description}\n\n`;
    }
    
    // Add tasks
    if (checklist.tasks && checklist.tasks.length > 0) {
      markdown += '## Tasks\n\n';
      checklist.tasks.forEach(task => {
        const checkbox = task.completed ? '[x]' : '[ ]';
        markdown += `- ${checkbox} ${this.escapeMarkdown(task.description)}`;
        
        if (options?.githubFlavored) {
          markdown += '\n';
          if (task.priority) {
            markdown += `  **Priority:** ${task.priority}\n`;
          }
          if (task.category) {
            markdown += `  **Category:** ${task.category}\n`;
          }
        }
        markdown += '\n';
      });
    }
    
    // Add code blocks for GitHub-flavored markdown
    if (options?.githubFlavored) {
      markdown += '\n```\n';
      markdown += `Generated on: ${new Date().toISOString()}\n`;
      markdown += '```\n';
    }
    
    return markdown;
  }

  async generateJSON(checklist: Checklist): Promise<string> {
    return JSON.stringify(checklist, null, 2);
  }

  async generateCSV(checklist: Checklist): Promise<string> {
    let csv = 'Task,Priority,Category,Completed\n';
    
    checklist.tasks?.forEach(task => {
      csv += `"${task.description}","${task.priority || ''}","${task.category || ''}","${task.completed}"\n`;
    });
    
    return csv;
  }

  async exportToPerfexCRM(checklist: Checklist, config: PerfexCRMConfig): Promise<{ success: boolean; crmId?: string }> {
    const mutation = `
      mutation CreateTask($name: String!, $description: String, $status: String!, $priority: String!, $subtasks: [SubtaskInput!]) {
        createTask(input: {
          name: $name
          description: $description
          status: $status
          priority: $priority
          subtasks: $subtasks
        }) {
          id
          success
        }
      }
    `;
    
    const variables = {
      name: checklist.title,
      description: checklist.description,
      status: 'pending',
      priority: 'medium',
      subtasks: checklist.tasks?.map(task => ({
        description: task.description,
        completed: task.completed
      }))
    };
    
    const response = await fetch(config.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.apiKey}`
      },
      body: JSON.stringify({
        query: mutation,
        variables
      })
    });
    
    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Authentication failed');
      }
      throw new Error('Network error');
    }
    
    const data = await response.json();
    
    return {
      success: data.data?.createTask?.success || false,
      crmId: data.data?.createTask?.id
    };
  }

  async getSupportedFormats(): Promise<string[]> {
    return this.supportedFormats;
  }

  validateOptions(options: any): boolean {
    if (options.format && !this.supportedFormats.includes(options.format)) {
      return false;
    }
    
    if (options.includeMetadata !== undefined && typeof options.includeMetadata !== 'boolean') {
      return false;
    }
    
    if (options.includeImages !== undefined && typeof options.includeImages !== 'boolean') {
      return false;
    }
    
    return true;
  }

  async generatePreview(checklist: Checklist, format: string): Promise<ExportPreview> {
    let content = '';
    
    switch (format) {
      case 'markdown':
        content = await this.generateMarkdown(checklist);
        break;
      case 'json':
        content = await this.generateJSON(checklist);
        break;
      case 'csv':
        content = await this.generateCSV(checklist);
        break;
      default:
        content = `Preview for ${format} format`;
    }
    
    return {
      format,
      content,
      size: new Blob([content]).size
    };
  }

  private escapeMarkdown(text: string): string {
    return text
      .replace(/\*/g, '\\*')
      .replace(/\[/g, '\\[')
      .replace(/\]/g, '\\]')
      .replace(/_/g, '\\_')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }
}
