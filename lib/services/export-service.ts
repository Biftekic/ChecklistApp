import jsPDF from 'jspdf';
import type { Checklist, ChecklistItem } from '@/lib/types/checklist';

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
    doc.text(checklist.name || 'Untitled Checklist', 20, 20);
    
    // Add notes if available
    if (checklist.notes) {
      doc.setFontSize(12);
      const lines = doc.splitTextToSize(checklist.notes, 170);
      doc.text(lines, 20, 35);
    }
    
    // Add tasks
    let yPosition = checklist.notes ? 50 : 35;
    doc.setFontSize(11);
    
    checklist.items?.forEach((task) => {
      if (yPosition > 270) {
        doc.addPage();
        yPosition = 20;
      }
      
      const checkbox = task.completed ? '[x]' : '[ ]';
      const taskText = `${checkbox} ${task.text}`;
      const lines = doc.splitTextToSize(taskText, 170);
      doc.text(lines, 20, yPosition);
      yPosition += lines.length * 5 + 5;
    });
    
    // Generate blob
    const pdfOutput = doc.output('blob');
    return pdfOutput;
  }

  async generateMarkdown(checklist: Checklist, options?: ExportOptions): Promise<string> {
    let markdown = '';
    
    // Add frontmatter if requested
    if (options?.includeFrontmatter) {
      markdown += '---\n';
      markdown += `title: ${checklist.name}\n`;
      markdown += `serviceType: ${checklist.serviceType}\n`;
      markdown += `propertyType: ${checklist.propertyType}\n`;
      markdown += `createdAt: ${checklist.createdAt}\n`;
      markdown += '---\n\n';
    }
    
    // Add title
    markdown += `# ${checklist.name}\n\n`;
    
    // Add notes if available
    if (checklist.notes) {
      markdown += `${checklist.notes}\n\n`;
    }
    
    // Add metadata
    if (options?.includeMetadata) {
      markdown += '## Metadata\n\n';
      markdown += `- **Service Type:** ${checklist.serviceType}\n`;
      markdown += `- **Property Type:** ${checklist.propertyType}\n`;
      markdown += `- **Created:** ${new Date(checklist.createdAt).toLocaleDateString()}\n`;
      markdown += `- **Updated:** ${new Date(checklist.updatedAt).toLocaleDateString()}\n`;
      markdown += '\n';
    }
    
    // Add tasks
    if (checklist.items && checklist.items.length > 0) {
      markdown += '## Tasks\n\n';
      checklist.items.forEach(task => {
        const checkbox = options?.githubFlavored 
          ? (task.completed ? '- [x]' : '- [ ]')
          : (task.completed ? '[x]' : '[ ]');
        markdown += `${checkbox} ${this.escapeMarkdown(task.text)}`;
        
        if (options?.includeMetadata && task.category) {
          markdown += ` _[${task.category}]_`;
        }
        markdown += '\n';
      });
    }
    
    return markdown;
  }

  async generateJSON(checklist: Checklist): Promise<string> {
    return JSON.stringify(checklist, null, 2);
  }

  async generateCSV(checklist: Checklist): Promise<string> {
    let csv = 'Task,Category,Completed,Order\n';
    
    checklist.items?.forEach(task => {
      const text = task.text.replace(/"/g, '""'); // Escape quotes
      const category = (task.category || '').replace(/"/g, '""');
      csv += `"${text}","${category}","${task.completed}","${task.order || ''}"\n`;
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
      name: checklist.name,
      description: checklist.notes || '',
      status: 'pending',
      priority: 'medium',
      subtasks: checklist.items?.map(task => ({
        description: task.text,
        completed: task.completed,
        category: task.category
      }))
    };
    
    try {
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
    } catch (error) {
      console.error('Error exporting to Perfex CRM:', error);
      return { success: false };
    }
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
