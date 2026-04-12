import { describe, expect, it } from "bun:test";
import { decodeHtmlEntities } from "./html-entities";

describe("decodeHtmlEntities", () => {
  it("decodes &amp; to &", () => {
    expect(decodeHtmlEntities("DepVault &amp; Environment")).toBe("DepVault & Environment");
  });

  it("decodes common named entities", () => {
    expect(decodeHtmlEntities("&lt;div&gt; &quot;a&quot; &apos;b&apos;")).toBe("<div> \"a\" 'b'");
  });

  it("decodes non-breaking space", () => {
    expect(decodeHtmlEntities("a&nbsp;b")).toBe("a\u00A0b");
  });

  it("decodes decimal numeric references", () => {
    expect(decodeHtmlEntities("&#8212;")).toBe("\u2014");
  });

  it("decodes hex numeric references (lowercase and uppercase x)", () => {
    expect(decodeHtmlEntities("&#x2014;")).toBe("\u2014");
    expect(decodeHtmlEntities("&#X2014;")).toBe("\u2014");
  });

  it("leaves unknown named entities untouched", () => {
    expect(decodeHtmlEntities("&bogus;")).toBe("&bogus;");
  });

  it("is a no-op for strings without entities", () => {
    expect(decodeHtmlEntities("plain text")).toBe("plain text");
  });

  it("decodes multiple entities in one pass", () => {
    expect(decodeHtmlEntities("A &amp; B &mdash; C")).toBe("A & B \u2014 C");
  });
});
