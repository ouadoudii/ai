import React from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { DailyCheckIn } from "./types";
import { LanguageProvider } from "./i18n";
import { TodayHomeView } from "./components/TodayHomeView";
import { getCheckInEditInitialState } from "./components/DailyCheckInModal";
import { getLocalDateKey } from "./utils/dateKey";

const existing: DailyCheckIn = {
  id: "existing-midday",
  date: getLocalDateKey(),
  time: "12:35",
  timeOfDay: "midday",
  food: {
    mealTitle: "Harira + خبز",
    category: "lunch",
    hungerBefore: 2,
    fullnessAfter: 5,
    eatingPace: "slow",
  },
  wellbeing: {
    energyLevel: 4,
    mood: "energized",
    stressLevel: 2,
    note: "unchanged note",
  },
  coachSummary: "Existing summary",
  createdAt: 1,
};

const noop = () => {};

describe("completed Today check-in editing", () => {
  it("prefills every represented value and marks existing answers as explicit", () => {
    const state = getCheckInEditInitialState(existing);
    expect(state.mealItems).toEqual(["Harira + خبز"]);
    expect(state.hungerBefore).toBe(2);
    expect(state.fullnessAfter).toBe(5);
    expect(state.energyLevel).toBe(4);
    expect(state.mood).toBe("energized");
    expect(state.hungerTouched).toBe(true);
    expect(state.fullnessTouched).toBe(true);
    expect(state.energyTouched).toBe(true);
    expect(state.moodTouched).toBe(true);
  });

  it("presents a completed phase as an actionable review/edit control", () => {
    const html = renderToString(
      <LanguageProvider>
        <TodayHomeView
          moments={[]}
          checkIns={[existing]}
          onOpenAddModal={noop}
          onOpenSnack={noop}
          onOpenCheckInModal={noop as never}
          onSelectMoment={noop as never}
          onNavigateToCoach={noop}
          onNavigateToTypeAnalysis={noop}
          onNavigateToTimeline={noop}
        />
      </LanguageProvider>,
    );
    expect(html).toContain('data-testid="today-phase-midday"');
    expect(html).toContain("This moment is captured · Review or edit");
    expect(html).not.toContain('aria-disabled="true"');
  });
});
