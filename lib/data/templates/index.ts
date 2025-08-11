// Main template index file
import { ChecklistTemplate } from "@/lib/types/template";
import { hospitalityTemplate } from "./hospitality";
import { healthcareTemplate } from "./healthcare";
import { retailTemplate } from "./retail";

export const templates: ChecklistTemplate[] = [
  hospitalityTemplate,
  healthcareTemplate,
  retailTemplate
];

export default templates;
