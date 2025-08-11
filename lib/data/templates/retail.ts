// Retail Store Cleaning Template
import { ChecklistTemplate } from "@/lib/types/template";

export const retailTemplate: ChecklistTemplate = {
  id: "retail-store",
  name: "Retail Store Cleaning",
  industry: {
    id: "retail",
    name: "Retail",
    code: "RTL",
    description: "Retail stores, shopping centers, boutiques, and commercial spaces"
  },
  description: "Comprehensive retail store cleaning focused on customer experience and merchandise protection",
  categories: [],
  estimatedTotalTime: 240,
  tags: ["retail", "store", "customer-service", "merchandise", "brand-standards"],
  compliance: [],
  equipment: [],
  createdAt: new Date(),
  updatedAt: new Date()
};
