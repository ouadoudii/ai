import { describe, expect, it } from "vitest";
import {
  ARABIC_FATAL_MESSAGE,
  ARABIC_FATAL_TITLE,
  buildFatalErrorMarkup,
} from "./fatalUi";

describe("fatal UI", () => {
  it("renders a safe Arabic RTL fallback without exposing exception details", () => {
    const markup = buildFatalErrorMarkup();
    expect(markup).toContain('lang="ar"');
    expect(markup).toContain('dir="rtl"');
    expect(markup).toContain(ARABIC_FATAL_TITLE);
    expect(markup).toContain(ARABIC_FATAL_MESSAGE);
    expect(markup).not.toContain("Rhythm could not start");
    expect(markup).not.toContain("error.message");
    expect(buildFatalErrorMarkup()).toBe(markup);
  });
});
