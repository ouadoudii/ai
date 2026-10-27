import React from "react";
import { describe, expect, it, beforeEach } from "vitest";
import { renderToString } from "react-dom/server";
import { LanguageProvider } from "./i18n";
import { CaptureChoiceModal } from "./components/CaptureChoiceModal";
import { PersonalDataExportButton } from "./components/LanguagePicker";

const noop = () => {};
beforeEach(() => {
  (globalThis as any).localStorage = {
    getItem: (k: string) => (k === "rhythm_language_v1" ? "ar" : null),
    setItem: () => {},
  };
});

describe("Arabic-only capture contract", () => {
  it("removes UI language selection while preserving personal data export", () => {
    const html = renderToString(
      <LanguageProvider>
        <PersonalDataExportButton surface="bottom_nav" />
      </LanguageProvider>,
    );
    expect(html).not.toContain("data-language-option");
    expect(html).not.toContain("English");
    expect(html).not.toContain("Arabic");
    expect(html).not.toContain("Deutsch");
    expect(html).not.toContain("Français");
    expect(html).toContain('data-testid="personal-data-export"');
    expect(html).toContain("تصدير بياناتي");
  });

  it("does not render legacy language choices inside capture", () => {
    const html = renderToString(
      <LanguageProvider>
        <CaptureChoiceModal
          isOpen
          onClose={noop}
          onFood={noop}
          onTellCary={noop}
        />
      </LanguageProvider>,
    );
    expect(html).not.toContain("English");
    expect(html).not.toContain("Deutsch");
    expect(html).not.toContain("Français");
    expect(html).not.toContain("data-language-option");
    expect(html).toContain("ما اللحظة التي تريد تسجيلها؟");
    expect(html).toContain("صورة");
    expect(html).toContain("احكِ لي");
    expect(html).not.toContain("اختيار سريع");
  });
  it("keeps the capture UI Arabic for a persisted Arabic locale", () => {
    const html = renderToString(
      <LanguageProvider>
        <CaptureChoiceModal
          isOpen
          onClose={noop}
          onFood={noop}
          onTellCary={noop}
        />
      </LanguageProvider>,
    );
    expect(html).toContain('aria-label="إغلاق"');
    expect(html).not.toContain("What would you like to capture?");
  });
});
