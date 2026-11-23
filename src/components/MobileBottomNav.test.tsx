import React from "react";
import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { LanguageProvider } from "../i18n";
import { MobileBottomNav } from "./MobileBottomNav";

const renderNav = (activeTab: "today" | "coach") =>
  renderToStaticMarkup(
    <LanguageProvider>
      <MobileBottomNav
        activeTab={activeTab}
        setActiveTab={() => {}}
        onCapture={() => {}}
        favoriteCount={0}
      />
    </LanguageProvider>,
  );

describe("mobile Coach navigation regression", () => {
  it("keeps Coach, capture, moments, today, discoveries and export accessible", () => {
    const html = renderNav("today");
    expect(html).toContain('data-testid="mobile-coach-nav"');
    expect(html).toContain('data-testid="mobile-moments-nav"');
    expect(html).toContain('data-testid="primary-capture-button"');
    expect(html).toContain('grid-cols-6');
    expect(html).toContain("اكتشافاتك");
    expect(html).toContain("لحظاتي");
    expect(html).toMatch(/المدرب|المرشد|مدرب/);
    expect((html.match(/<button\b/g) ?? []).length).toBe(6);
    expect(html).toContain('aria-label=');
  });

  it("marks Coach as the active page and does not mark Today active", () => {
    const html = renderNav("coach");
    expect(html).toMatch(/data-testid="mobile-coach-nav"[^>]*aria-current="page"|aria-current="page"[^>]*data-testid="mobile-coach-nav"/);
    expect((html.match(/aria-current="page"/g) ?? []).length).toBe(1);
  });
});
