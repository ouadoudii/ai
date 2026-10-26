import { readFileSync } from "node:fs";
import { expect, test } from "vitest";

const source = readFileSync(
  new URL("../src/components/LanguagePicker.tsx", import.meta.url),
  "utf8",
);

test("Arabic-only shell removes language picker lifecycle while keeping direct export", () => {
  expect(source).not.toContain("data-language-option");
  expect(source).not.toContain("openerRef");
  expect(source).not.toContain("setLanguage");
  expect(source).toContain('data-testid="personal-data-export"');
  expect(source).toContain('aria-label="تصدير بياناتي"');
});
