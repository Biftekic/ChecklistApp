import type { Template, ChecklistItem } from "@/lib/types/checklist";
import { v4 as uuidv4 } from "uuid";

interface IndustryTemplate extends Template {
  industry: string;
}

export class TemplateEngine {
  private templates: Map<string, IndustryTemplate> = new Map();

  constructor() {
    this.initializeTemplates();
  }

  private initializeTemplates() {
    // Initialize with default templates
  }

  async loadIndustryTemplates(): Promise<IndustryTemplate[]> {
    // Load 15+ industry-specific templates
    const industries = [
      "residential",
      "commercial",
      "hotel",
      "healthcare",
      "restaurant",
      "retail",
      "office",
      "education",
      "fitness",
      "spa",
      "dental",
      "medical",
      "warehouse",
      "industrial",
      "vacation-rental"
    ];

    const templates: IndustryTemplate[] = [];

    industries.forEach((industry) => {
      templates.push({
        id: uuidv4(),
        name: `${industry.charAt(0).toUpperCase() + industry.slice(1)} Cleaning Template`,
        industry,
        serviceType: "standard-cleaning",
        propertyType: industry === "residential" ? "residential" : "commercial",
        items: this.getDefaultItemsForIndustry(industry),
        createdAt: new Date(),
        updatedAt: new Date(),
        isDefault: true
      });
    });

    return templates;
  }

  private getDefaultItemsForIndustry(industry: string): ChecklistItem[] {
    const baseItems: ChecklistItem[] = [
      { id: uuidv4(), text: "Check and restock supplies", category: "preparation", completed: false },
      { id: uuidv4(), text: "Dust surfaces", category: "general", completed: false },
      { id: uuidv4(), text: "Vacuum floors", category: "floors", completed: false },
      { id: uuidv4(), text: "Mop floors", category: "floors", completed: false },
      { id: uuidv4(), text: "Empty trash bins", category: "general", completed: false },
      { id: uuidv4(), text: "Clean windows", category: "general", completed: false }
    ];

    // Add industry-specific items
    switch (industry) {
      case "residential":
        baseItems.push(
          { id: uuidv4(), text: "Clean kitchen counters", category: "kitchen", completed: false },
          { id: uuidv4(), text: "Clean bathroom fixtures", category: "bathroom", completed: false }
        );
        break;
      case "hotel":
        baseItems.push(
          { id: uuidv4(), text: "Change bed linens", category: "bedroom", completed: false },
          { id: uuidv4(), text: "Restock minibar", category: "amenities", completed: false }
        );
        break;
      case "restaurant":
        baseItems.push(
          { id: uuidv4(), text: "Sanitize tables", category: "dining", completed: false },
          { id: uuidv4(), text: "Deep clean kitchen equipment", category: "kitchen", completed: false }
        );
        break;
      case "healthcare":
        baseItems.push(
          { id: uuidv4(), text: "Disinfect medical equipment", category: "medical", completed: false },
          { id: uuidv4(), text: "Sanitize waiting area", category: "public", completed: false }
        );
        break;
    }

    return baseItems;
  }
}
