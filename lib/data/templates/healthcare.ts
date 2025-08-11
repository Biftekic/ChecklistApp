// Healthcare/Medical Facility Cleaning Template
import { ChecklistTemplate } from "@/lib/types/template";

export const healthcareTemplate: ChecklistTemplate = {
  id: "healthcare-medical",
  name: "Healthcare/Medical Facility Cleaning",
  industry: {
    id: "healthcare",
    name: "Healthcare",
    code: "MED",
    description: "Hospitals, clinics, medical offices, and healthcare facilities"
  },
  description: "Specialized medical facility cleaning with strict infection control protocols and regulatory compliance",
  categories: [],
  estimatedTotalTime: 480,
  tags: ["healthcare", "medical", "infection-control", "OSHA", "CDC"],
  compliance: [],
  equipment: [],
  createdAt: new Date(),
  updatedAt: new Date()
};
