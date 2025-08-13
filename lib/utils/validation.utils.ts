import { ChecklistTemplate } from "@/lib/types/template";
import { ChecklistItem } from "@/lib/types/checklist";

interface Section {
  title: string;
  items?: ChecklistItem[];
}


export class ValidationUtils {
  static validateTemplate(template: any): asserts template is ChecklistTemplate {
    if (!template) {
      throw new Error("Template is required");
    }

    if (!this.isValidObject(template)) {
      throw new Error("Template must be a valid object");
    }

    if (!template.title?.trim()) {
      throw new Error("Template title is required");
    }

    if (!template.sections || !Array.isArray(template.sections)) {
      throw new Error("Template sections must be an array");
    }

    if (template.sections.length === 0) {
      throw new Error("Template must have at least one section");
    }

    template.sections.forEach((section: any, index: number) => {
      try {
        this.validateSection(section);
      } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";
        throw new Error(`Section ${String(index + 1)} validation failed: ${String(message)}`);
      }
    });
  }

  static validateSection(section: any): asserts section is Section {
    if (!section) {
      throw new Error("Section is required");
    }

    if (!this.isValidObject(section)) {
      throw new Error("Section must be a valid object");
    }

    if (!section.title?.trim()) {
      throw new Error("Section title is required");
    }

    if (section.items && !Array.isArray(section.items)) {
      throw new Error("Section items must be an array");
    }
  }

  static isValidObject(obj: any): boolean {
    return obj !== null && 
           obj !== undefined && 
           typeof obj === "object" && 
           !Array.isArray(obj);
  }
}
