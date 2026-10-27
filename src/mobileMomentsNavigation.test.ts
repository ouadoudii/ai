import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const navSource = readFileSync(
  fileURLToPath(new URL("./components/MobileBottomNav.tsx", import.meta.url)),
  "utf8",
);
const appSource = readFileSync(
  fileURLToPath(new URL("./App.tsx", import.meta.url)),
  "utf8",
);
const compactAppSource = appSource.replace(/\s+/g, "").replace(/'/g, '"');

describe("mobile moments navigation", () => {
  it("routes the My moments item to the timeline tab and marks that tab active", () => {
    const compact = navSource.replace(/\s+/g, "");
    expect(compact).toContain('nav("timeline","moments")');
    expect(compact).toContain('activeTab==="timeline"');
    expect(navSource).toContain('data-testid="mobile-moments-nav"');
  });

  it("renders the existing chronology when the timeline tab is selected", () => {
    expect(compactAppSource).toContain('activeTab==="timeline"');
    expect(compactAppSource).toContain(
      "<FoodCalendarViewmoments={localizedMoments}",
    );
    expect(compactAppSource).toContain(
      'onNavigateToTimeline={()=>go("timeline")}',
    );
    expect(compactAppSource).toContain(
      "constgo=(tab:ActiveTab)=>{invalidateVoiceSubmission();",
    );
    expect(compactAppSource).toContain(
      "<MobileBottomNavactiveTab={activeTab}setActiveTab={go}",
    );
  });
});
