// Template Engine Service for managing checklist templates

import { 
  ChecklistTemplate, 
  GeneratedChecklist, 
  TemplateRoom, 
  TemplateTask,
  TemplateSelectionState 
} from "@/lib/types/template";

export class TemplateEngine {
  private templates: Map<string, ChecklistTemplate> = new Map();

  // Load all available templates
  async loadTemplates(): Promise<void> {
    // This will be populated from the template data
    const templates = await import("@/lib/data/templates");
    templates.default.forEach((template: ChecklistTemplate) => {
      this.templates.set(template.id, template);
    });
  }

  // Get all templates
  getAllTemplates(): ChecklistTemplate[] {
    return Array.from(this.templates.values());
  }

  // Get templates by industry
  getTemplatesByIndustry(industryCode: string): ChecklistTemplate[] {
    return Array.from(this.templates.values()).filter(
      template => template.industry.code === industryCode
    );
  }

  // Get a specific template
  getTemplate(templateId: string): ChecklistTemplate | undefined {
    return this.templates.get(templateId);
  }

  // Generate a checklist from selections
  generateChecklist(state: TemplateSelectionState): GeneratedChecklist {
    if (!state.selectedTemplate) {
      throw new Error("No template selected");
    }

    const selectedRooms: TemplateRoom[] = [];
    let totalTasks = 0;
    let selectedTasks = 0;
    let estimatedTime = 0;
    const allCustomTasks: TemplateTask[] = [];

    // Process selected rooms and tasks
    state.selectedTemplate.categories.forEach(category => {
      category.rooms.forEach(room => {
        if (state.selectedRooms.includes(room.id)) {
          const roomCopy: TemplateRoom = {
            ...room,
            isSelected: true,
            tasks: room.tasks.map(task => {
              const isTaskSelected = state.selectedTasks[room.id]?.includes(task.id);
              const editedTask = state.editedTasks[task.id];
              
              totalTasks++;
              if (isTaskSelected) {
                selectedTasks++;
                estimatedTime += editedTask?.estimatedTime || task.estimatedTime;
              }

              return {
                ...task,
                ...editedTask,
                isSelected: isTaskSelected
              };
            }),
            customTasks: state.customTasks[room.id] || []
          };

          // Add custom tasks to counts
          if (roomCopy.customTasks) {
            roomCopy.customTasks.forEach(task => {
              if (task.isSelected !== false) {
                selectedTasks++;
                estimatedTime += task.estimatedTime;
                allCustomTasks.push(task);
              }
              totalTasks++;
            });
          }

          selectedRooms.push(roomCopy);
        }
      });
    });

    return {
      id: this.generateId(),
      templateId: state.selectedTemplate.id,
      name: `${state.selectedTemplate.name} - ${new Date().toLocaleDateString()}`,
      description: state.selectedTemplate.description,
      rooms: selectedRooms,
      totalTasks,
      selectedTasks,
      estimatedTime,
      customTasks: allCustomTasks,
      createdAt: new Date(),
      modifiedAt: new Date()
    };
  }

  // Calculate estimated time for selected tasks
  calculateEstimatedTime(state: TemplateSelectionState): number {
    if (!state.selectedTemplate) return 0;

    let totalTime = 0;

    state.selectedTemplate.categories.forEach(category => {
      category.rooms.forEach(room => {
        if (state.selectedRooms.includes(room.id)) {
          room.tasks.forEach(task => {
            if (state.selectedTasks[room.id]?.includes(task.id)) {
              const editedTask = state.editedTasks[task.id];
              totalTime += editedTask?.estimatedTime || task.estimatedTime;
            }
          });

          // Add custom task times
          const customTasks = state.customTasks[room.id];
          if (customTasks) {
            customTasks.forEach(task => {
              if (task.isSelected !== false) {
                totalTime += task.estimatedTime;
              }
            });
          }
        }
      });
    });

    return totalTime;
  }

  // Add a custom task to a room
  addCustomTask(
    roomId: string, 
    task: Omit<TemplateTask, "id" | "isCustom">
  ): TemplateTask {
    return {
      ...task,
      id: this.generateId(),
      isCustom: true,
      isSelected: true
    };
  }

  // Generate unique ID
  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  // Export checklist to different formats
  exportChecklist(checklist: GeneratedChecklist, format: "json" | "pdf" | "csv"): any {
    switch (format) {
      case "json":
        return JSON.stringify(checklist, null, 2);
      case "pdf":
        // PDF generation will be implemented later
        throw new Error("PDF export not yet implemented");
      case "csv":
        return this.convertToCSV(checklist);
      default:
        throw new Error(`Unsupported format: ${format}`);
    }
  }

  private convertToCSV(checklist: GeneratedChecklist): string {
    const rows: string[][] = [
      ["Room", "Task", "Description", "Time (min)", "Priority", "Selected"]
    ];

    checklist.rooms.forEach(room => {
      room.tasks.forEach(task => {
        rows.push([
          room.name,
          task.name,
          task.description || "",
          task.estimatedTime.toString(),
          task.priority || "medium",
          task.isSelected ? "Yes" : "No"
        ]);
      });

      // Add custom tasks
      if (room.customTasks) {
        room.customTasks.forEach(task => {
          rows.push([
            room.name,
            `[Custom] ${task.name}`,
            task.description || "",
            task.estimatedTime.toString(),
            task.priority || "medium",
            task.isSelected !== false ? "Yes" : "No"
          ]);
        });
      }
    });

    return rows.map(row => row.map(cell => `"${cell}"`).join(",")).join("\n");
  }
}

// Singleton instance
export const templateEngine = new TemplateEngine();
