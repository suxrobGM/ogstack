import { describe, expect, it } from "bun:test";
import { getTemplate, hasTemplate, listTemplates } from "./template.registry";

describe("TemplateRegistry", () => {
  describe("listTemplates", () => {
    it("should return all 11 built-in templates", () => {
      const templates = listTemplates();
      expect(templates).toHaveLength(11);
    });

    it("should include every canonical slug", () => {
      const slugs = listTemplates().map((t) => t.slug);
      expect(slugs).toContain("aurora");
      expect(slugs).toContain("billboard");
      expect(slugs).toContain("blog_card");
      expect(slugs).toContain("changelog");
      expect(slugs).toContain("docs_page");
      expect(slugs).toContain("editorial");
      expect(slugs).toContain("github_repo");
      expect(slugs).toContain("minimal");
      expect(slugs).toContain("panorama");
      expect(slugs).toContain("product_launch");
      expect(slugs).toContain("showcase");
    });

    it("should populate name, description, and category for each template", () => {
      for (const t of listTemplates()) {
        expect(t.name).toBeTruthy();
        expect(t.description).toBeTruthy();
        expect(t.category).toBeTruthy();
      }
    });
  });

  describe("getTemplate", () => {
    it("should return a template entry with render function", () => {
      const entry = getTemplate("aurora");
      expect(entry.info.slug).toBe("aurora");
      expect(typeof entry.render).toBe("function");
    });

    it("should return editorial with render function", () => {
      const entry = getTemplate("editorial");
      expect(entry.info.slug).toBe("editorial");
      expect(typeof entry.render).toBe("function");
    });

    it("should throw for unknown slug", () => {
      expect(() => getTemplate("nonexistent" as never)).toThrow("Unknown template");
    });
  });

  describe("hasTemplate", () => {
    it("should return true for valid slugs", () => {
      expect(hasTemplate("aurora")).toBe(true);
      expect(hasTemplate("editorial")).toBe(true);
      expect(hasTemplate("panorama")).toBe(true);
    });

    it("should return false for invalid slugs", () => {
      expect(hasTemplate("nonexistent")).toBe(false);
      expect(hasTemplate("")).toBe(false);
    });

    it("should return false for old (pre-unification) slugs", () => {
      expect(hasTemplate("gradient_dark")).toBe(false);
      expect(hasTemplate("hero_editorial")).toBe(false);
    });
  });
});
