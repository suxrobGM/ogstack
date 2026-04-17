import { describe, expect, it } from "bun:test";
import { getTemplate, hasTemplate, listTemplates, templateSupportsKind } from "./template.registry";

describe("TemplateRegistry", () => {
  describe("listTemplates", () => {
    it("should return all 15 built-in templates when no kind is given", () => {
      const templates = listTemplates();
      expect(templates).toHaveLength(15);
    });

    it("should filter to 10 OG templates when kind=og", () => {
      const templates = listTemplates("og");
      expect(templates).toHaveLength(10);
      for (const t of templates) {
        expect(t.supportedKinds).toContain("og");
      }
    });

    it("should filter to 5 hero templates when kind=blog_hero", () => {
      const templates = listTemplates("blog_hero");
      expect(templates).toHaveLength(5);
      for (const t of templates) {
        expect(t.supportedKinds).toContain("blog_hero");
      }
    });

    it("should include OG slugs", () => {
      const slugs = listTemplates("og").map((t) => t.slug);
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

    it("should include hero slugs", () => {
      const slugs = listTemplates("blog_hero").map((t) => t.slug);
      expect(slugs).toContain("hero_editorial");
      expect(slugs).toContain("hero_spotlight");
      expect(slugs).toContain("hero_panorama");
      expect(slugs).toContain("hero_minimal");
      expect(slugs).toContain("hero_brand_card");
    });

    it("should populate name, description, category, and supportedKinds for each template", () => {
      for (const t of listTemplates()) {
        expect(t.name).toBeTruthy();
        expect(t.description).toBeTruthy();
        expect(t.category).toBeTruthy();
        expect(t.supportedKinds.length).toBeGreaterThan(0);
      }
    });
  });

  describe("getTemplate", () => {
    it("should return a template entry with render function", () => {
      const entry = getTemplate("gradient_dark");
      expect(entry.info.slug).toBe("gradient_dark");
      expect(typeof entry.render).toBe("function");
    });

    it("should return a hero entry with render function", () => {
      const entry = getTemplate("hero_editorial");
      expect(entry.info.slug).toBe("hero_editorial");
      expect(typeof entry.render).toBe("function");
    });

    it("should throw for unknown slug", () => {
      expect(() => getTemplate("nonexistent" as never)).toThrow("Unknown template");
    });
  });

  describe("hasTemplate", () => {
    it("should return true for valid OG slugs", () => {
      expect(hasTemplate("gradient_dark")).toBe(true);
      expect(hasTemplate("minimal")).toBe(true);
    });

    it("should return true for valid hero slugs", () => {
      expect(hasTemplate("hero_editorial")).toBe(true);
      expect(hasTemplate("hero_brand_card")).toBe(true);
    });

    it("should return false for invalid slugs", () => {
      expect(hasTemplate("nonexistent")).toBe(false);
      expect(hasTemplate("")).toBe(false);
    });
  });

  describe("templateSupportsKind", () => {
    it("should return true when an OG template is queried for og kind", () => {
      expect(templateSupportsKind("gradient_dark", "og")).toBe(true);
    });

    it("should return false when an OG template is queried for blog_hero kind", () => {
      expect(templateSupportsKind("gradient_dark", "blog_hero")).toBe(false);
    });

    it("should return true when a hero template is queried for blog_hero kind", () => {
      expect(templateSupportsKind("hero_editorial", "blog_hero")).toBe(true);
    });

    it("should return false when a hero template is queried for og kind", () => {
      expect(templateSupportsKind("hero_editorial", "og")).toBe(false);
    });
  });
});
