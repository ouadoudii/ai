import React from "react";
import { describe, expect, it } from "vitest";
import { renderToString } from "react-dom/server";
import { Header } from "./Header";
import { LanguageProvider } from "../i18n";

describe("desktop Header timeline navigation", () => {
  it("exposes the full moments timeline as a primary desktop destination", () => {
    const html = renderToString(
      <LanguageProvider>
        <Header
          activeTab="timeline"
          setActiveTab={() => undefined}
          onOpenAddModal={() => undefined}
        />
      </LanguageProvider>,
    );

    expect(html).toContain("التنقل الرئيسي");
    expect(html).toContain("لحظات");
    expect(html).toContain("bg-[#315F4F] text-white shadow-sm");
  });

  it("provides a spacious desktop shell with a distinct capture action", () => {
    const html = renderToString(
      <LanguageProvider>
        <Header
          activeTab="today"
          setActiveTab={() => undefined}
          onOpenAddModal={() => undefined}
        />
      </LanguageProvider>,
    );

    expect(html).toContain("max-w-[1280px]");
    expect(html).toContain("h-20");
    expect(html).toContain('data-testid="desktop-capture-button"');
    expect(html).toContain("bg-[#A15E3D] text-white");
    expect(html).toContain("rounded-2xl p-1.5");
    expect(html).toContain("التنقل الرئيسي");
  });

  it("removes the obsolete language picker while retaining direct data export", () => {
    const html = renderToString(
      <LanguageProvider>
        <Header
          activeTab="today"
          setActiveTab={() => undefined}
          onOpenAddModal={() => undefined}
        />
      </LanguageProvider>,
    );

    expect(html).not.toContain("language-picker-opener");
    expect(html).not.toContain('aria-haspopup="dialog"');
    expect(html).toContain('data-testid="personal-data-export"');
    expect(html).toContain("تصدير بياناتي");
  });
});
