import { expect, test } from "@playwright/test";

for (const viewport of [
  { name: "desktop", width: 1280, height: 900 },
  { name: "mobile", width: 390, height: 844 },
]) {
  test(`fatal runtime UI is safe Arabic RTL on ${viewport.name}`, async ({
    page,
  }) => {
    await page.setViewportSize(viewport);
    await page.addInitScript(() => {
      localStorage.setItem("cary_access_mode_v1", "guest");
      localStorage.setItem("cary_onboarding_v2_complete", "true");
      sessionStorage.setItem("nimmapp_checkin_auto_opened", "true");
    });
    await page.goto("/");
    await page.evaluate(() => {
      window.dispatchEvent(
        new ErrorEvent("error", {
          error: new Error("SECRET_INTERNAL_PROVIDER_DETAIL"),
        }),
      );
    });

    const alert = page.getByRole("alert");
    await expect(alert).toBeVisible();
    await expect(alert).toHaveAttribute("lang", "ar");
    await expect(alert).toHaveAttribute("dir", "rtl");
    await expect(
      page.getByRole("heading", { name: "تعذّر تشغيل ريثم" }),
    ).toBeVisible();
    await expect(
      page.getByText("حدث خطأ غير متوقع. أعد تحميل الصفحة وحاول مرة أخرى."),
    ).toBeVisible();
    await expect(page.getByText("SECRET_INTERNAL_PROVIDER_DETAIL")).toHaveCount(
      0,
    );
    await expect(page.getByText("Rhythm could not start")).toHaveCount(0);
  });
}
