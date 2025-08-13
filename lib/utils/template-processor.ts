export class TemplateProcessor {
  static generateId(): string {
    return crypto.randomUUID();
  }

  static processTemplate(template: any): any {
    return {
      ...template,
      id: template.id || this.generateId(),
      sections: this.processSections(template.sections || []),
      createdAt: template.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }

  static processSections(sections: any[]): any[] {
    return sections.map(section => ({
      ...section,
      id: section.id || this.generateId(),
      items: section.items ? section.items.map((item: any) => ({
        ...item,
        id: item.id || this.generateId()
      })) : []
    }));
  }

  static mergeTemplates(template1: any, template2: any): any {
    return {
      ...template1,
      sections: [...(template1.sections || []), ...(template2.sections || [])]
    };
  }
}
