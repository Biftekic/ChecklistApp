// Hospitality/Hotel Cleaning Template
import { ChecklistTemplate } from "@/lib/types/template";

export const hospitalityTemplate: ChecklistTemplate = {
  id: "hospitality-hotel",
  name: "Hospitality/Hotel Cleaning",
  industry: {
    id: "hospitality",
    name: "Hospitality",
    code: "HOSP",
    description: "Hotels, motels, resorts, and hospitality facilities"
  },
  description: "Comprehensive hotel and hospitality cleaning with guest rooms, public areas, and service facilities",
  categories: [],
  estimatedTotalTime: 300,
  tags: ["hospitality", "hotel", "guest-services"],
  compliance: [],
  equipment: [],
  createdAt: new Date(),
  updatedAt: new Date()
};
