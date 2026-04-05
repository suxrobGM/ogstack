import { describe, expect, it } from "bun:test";
import { getTemplate, hasTemplate, listTemplates } from "./template.registry";

describe("TemplateRegistry", () => {
  describe("listTemplates", () => {
    it("should return all 10 MVP templates", () => {
      const templates = listTemplates();
      expect(templates).toHaveLength(10);
    });

    it("should include required slugs", () => {
      const slugs = listTemplates().map((t) => t.slug);
      expect(slugs).toContain("gradient_dark");
      expect(slugs).toContain("gradient_light");
      expect(slugs).toContain("split_hero");
      expect(slugs).toContain("centered_bold");
      expect(slugs).toContain("blog_card");
      expect(slugs).toContain("docs_page");
      expect(slugs).toContain("product_launch");
      expect(slugs).toContain("changelog");
      expect(slugs).toContain("github_repo");
      expect(slugs).toContain("minimal");
    });

    it("should include name, description, and category for each template", () => {
      for (const t of listTemplates()) {
        expect(t.name).toBeTruthy();
        expect(t.description).toBeTruthy();
        expect(t.category).toBeTruthy();
      }
    });
  });

  describe("getTemplate", () => {
    it("should return a template entry with render function", () => {
      const entry = getTemplate("gradient_dark");
      expect(entry.info.slug).toBe("gradient_dark");
      expect(typeof entry.render).toBe("function");
    });

    it("should throw for unknown slug", () => {
      expect(() => getTemplate("nonexistent" as never)).toThrow("Unknown template");
    });
  });

  describe("hasTemplate", () => {
    it("should return true for valid slugs", () => {
      expect(hasTemplate("gradient_dark")).toBe(true);
      expect(hasTemplate("minimal")).toBe(true);
    });

    it("should return false for invalid slugs", () => {
      expect(hasTemplate("nonexistent")).toBe(false);
      expect(hasTemplate("")).toBe(false);
    });
  });
});
