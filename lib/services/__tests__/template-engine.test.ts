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
  });
});
