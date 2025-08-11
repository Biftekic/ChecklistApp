// Template data for ChecklistApp
// Based on existing CChecklist templates

import { ChecklistTemplate } from "@/lib/types/template";

const templates: ChecklistTemplate[] = [
  {
    id: "office-standard",
    name: "Office/Commercial Cleaning",
    industry: {
      id: "office",
      name: "Office/Commercial",
      code: "office",
      description: "Professional office and commercial building cleaning"
    },
    description: "Comprehensive office cleaning template with flexible room selection",
    categories: [
      {
        id: "office-workspaces",
        name: "Workspaces",
        description: "Individual and shared work areas",
        icon: "briefcase",
        rooms: [
          {
            id: "private-office",
            name: "Private Office",
            type: "office",
            tasks: [
              {
                id: "po-1",
                name: "Empty Trash & Replace Liner",
                description: "Empty waste basket and replace with new liner",
                estimatedTime: 2,
                frequency: "daily",
                priority: "high",
                supplies: ["Trash bags"],
                isSelected: true
              },
              {
                id: "po-2",
                name: "Dust & Wipe Surfaces",
                description: "Dust and wipe desk, shelves, window sills",
                estimatedTime: 5,
                frequency: "weekly",
                priority: "medium",
                supplies: ["Microfiber cloths", "All-purpose cleaner"],
                isSelected: true
              }
            ]
          }
        ]
      }
    ],
    tags: ["commercial", "office", "professional"],
    compliance: [],
    equipment: []
  }
];

export default templates;
