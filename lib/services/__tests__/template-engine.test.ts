import { describe, it, expect, beforeEach, vi } from "vitest";
import { TemplateEngine } from "../template-engine";
import type { Template } from "@/lib/types/checklist";

describe("Template Engine", () => {
  let engine: TemplateEngine;

  beforeEach(() => {
    engine = new TemplateEngine();
    vi.clearAllMocks();
  });

  describe("Template Loading", () => {
    it("should load all industry templates", async () => {
      const templates = await engine.loadIndustryTemplates();
      
      expect(templates.length).toBeGreaterThanOrEqual(15);
      expect(templates).toContainEqual(
        expect.objectContaining({
          industry: "residential",
          serviceType: "standard-cleaning"
        })
      );
    });

    it("should load templates for specific industry", async () => {
      const templates = await engine.loadTemplatesByIndustry("hotel");
      
      expect(templates.length).toBeGreaterThan(0);
      templates.forEach(template => {
        expect(template.industry).toBe("hotel");
      });
    });
  });

  describe("Template Customization", () => {
    it("should allow full template customization", async () => {
      const template = {
        id: "test-1",
        name: "Test Template",
        serviceType: "standard-cleaning",
        propertyType: "residential",
        items: [
          { id: "1", text: "Task 1", category: "kitchen", completed: false }
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
        isDefault: false
      };

      const customized = await engine.customizeTemplate(template, {
        addItems: [
          { text: "Custom Task", category: "bathroom", estimatedTime: 10 }
        ],
        removeItemIds: [],
        updateItems: [
          { id: "1", text: "Updated Task 1", estimatedTime: 15 }
        ],
        reorderItems: ["1"]
      });

      expect(customized.items).toHaveLength(2);
      expect(customized.items[0].text).toBe("Updated Task 1");
      expect(customized.items[0].estimatedTime).toBe(15);
      expect(customized.items[1].text).toBe("Custom Task");
    });
  });

  describe("Template Validation", () => {
    it("should validate template structure", () => {
      const validTemplate = {
        id: "valid-1",
        name: "Valid Template",
        serviceType: "standard-cleaning",
        propertyType: "residential",
        items: [
          { id: "1", text: "Task 1", category: "kitchen", completed: false }
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
        isDefault: false
      };

      const validation = engine.validateTemplate(validTemplate);
      expect(validation.isValid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    it("should detect invalid template structure", () => {
      const invalidTemplate = {
        id: "invalid-1",
        name: "",
        serviceType: "invalid-type",
        items: []
      };

      const validation = engine.validateTemplate(invalidTemplate);
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain("Template name is required");
      expect(validation.errors).toContain("Invalid service type");
      expect(validation.errors).toContain("Template must have at least one task");
    });
  });
  describe("Template-Q&A Merging", () => {
    it("should merge Q&A responses with base template", async () => {
      const baseTemplate = {
        id: "base-1",
        name: "Base Cleaning Template",
        serviceType: "standard-cleaning",
        propertyType: "residential",
        items: [
          { id: "1", text: "Dust surfaces", category: "general", completed: false, order: 1 },
          { id: "2", text: "Vacuum floors", category: "floors", completed: false, order: 2 }
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
        isDefault: true
      };

      const qaResponses = {
        rooms: ["bedroom", "bathroom", "kitchen"],
        petFriendly: true,
        deepCleanAreas: ["kitchen", "bathroom"],
        specialRequests: "Focus on kitchen appliances"
      };

      const merged = await engine.mergeTemplateWithQA(baseTemplate, qaResponses);
      
      expect(merged.items.length).toBeGreaterThan(baseTemplate.items.length);
      expect(merged.items).toContainEqual(
        expect.objectContaining({ text: "Dust surfaces" })
      );
      
      // Should add pet-related tasks
      const petTask = merged.items.find(item => 
        item.text.toLowerCase().includes("pet") || 
        item.text.toLowerCase().includes("hair")
      );
      expect(petTask).toBeDefined();
      
      // Should add deep clean tasks for specified areas
      const deepCleanTasks = merged.items.filter(item =>
        item.text.toLowerCase().includes("deep clean")
      );
      expect(deepCleanTasks.length).toBeGreaterThan(0);
    });

    it("should prioritize tasks based on Q&A responses", async () => {
      const baseTemplate = {
        id: "base-2",
        name: "Standard Template",
        serviceType: "standard-cleaning",
        propertyType: "residential",
        items: [
          { id: "1", text: "General cleaning", category: "general", completed: false, order: 1 }
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
        isDefault: true
      };

      const qaResponses = {
        priority: "bathroom",
        timeConstraint: "1 hour",
        focusAreas: ["bathroom", "kitchen"]
      };

      const merged = await engine.mergeTemplateWithQA(baseTemplate, qaResponses);
      
      // Bathroom tasks should come first
      const bathroomTaskIndex = merged.items.findIndex(item =>
        item.category === "bathroom"
      );
      const generalTaskIndex = merged.items.findIndex(item =>
        item.category === "general"
      );
      
      if (bathroomTaskIndex !== -1 && generalTaskIndex !== -1) {
        expect(bathroomTaskIndex).toBeLessThan(generalTaskIndex);
      }
    });

    it("should handle empty Q&A responses gracefully", async () => {
      const baseTemplate = {
        id: "base-3",
        name: "Base Template",
        serviceType: "standard-cleaning",
        propertyType: "residential",
        items: [
          { id: "1", text: "Basic task", category: "general", completed: false, order: 1 }
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
        isDefault: true
      };

      const merged = await engine.mergeTemplateWithQA(baseTemplate, {});
      
      expect(merged.items).toEqual(baseTemplate.items);
      expect(merged.id).toBe(baseTemplate.id);
    });

    it("should add room-specific tasks based on Q&A", async () => {
      const baseTemplate = {
        id: "base-4",
        name: "Minimal Template",
        serviceType: "standard-cleaning",
        propertyType: "residential",
        items: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        isDefault: true
      };

      const qaResponses = {
        rooms: ["bedroom", "bathroom", "kitchen", "living_room"],
        squareFootage: 1500,
        numberOfBedrooms: 2
      };

      const merged = await engine.mergeTemplateWithQA(baseTemplate, qaResponses);
      
      // Should have tasks for each room
      expect(merged.items.some(item => item.category === "bedroom")).toBe(true);
      expect(merged.items.some(item => item.category === "bathroom")).toBe(true);
      expect(merged.items.some(item => item.category === "kitchen")).toBe(true);
      expect(merged.items.some(item => item.category === "living_room")).toBe(true);
      
      // Should have appropriate number of bedroom tasks
      const bedroomTasks = merged.items.filter(item => 
        item.category === "bedroom"
      );
      expect(bedroomTasks.length).toBeGreaterThan(0);
    });
  });
});