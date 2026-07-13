import { expect, test } from "@playwright/test";

test("homepage remains within a mobile viewport", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");

  await expect
    .poll(() =>
      page.evaluate(
        () => document.documentElement.scrollWidth <= document.documentElement.clientWidth,
      ),
    )
    .toBe(true);

  const comparison = page.getByRole("table", {
    name: "Comparison of JDesk, Tauri, and Electron",
  });
  await expect(comparison).toBeVisible();
  await expect(comparison.locator("tbody th[scope='row']")).toHaveCount(6);
});

test("every documentation navigation route resolves", async ({ page, request }) => {
  await page.goto("/docs");
  const hrefs = await page
    .locator("nav a[href^='/docs/']")
    .evaluateAll((links) => [...new Set(links.map((link) => link.getAttribute("href")))].filter(Boolean));

  expect(hrefs).toHaveLength(34);
  for (const href of hrefs) {
    const response = await request.get(href!);
    expect(response.status(), href!).toBe(200);
  }
});

test("search dialog manages focus, keyboard navigation, and scroll", async ({ page }) => {
  await page.goto("/");
  const trigger = page.getByRole("button", { name: "Search documentation" });
  await trigger.click();

  const dialog = page.getByRole("dialog", { name: "Search documentation" });
  const input = page.getByRole("combobox", { name: "Search documentation" });
  await expect(dialog).toBeVisible();
  await expect(input).toBeFocused();
  await expect(page.locator("body")).toHaveCSS("overflow", "hidden");

  await input.fill("protocol");
  const firstResult = await input.getAttribute("aria-activedescendant");
  expect(firstResult).not.toBeNull();
  await input.press("ArrowDown");
  await expect(input).not.toHaveAttribute("aria-activedescendant", firstResult!);
  await input.press("ArrowUp");
  await input.press("Enter");
  await expect(page).toHaveURL(/\/docs\/protocol$/);

  await page.keyboard.press("Control+K");
  await expect(dialog).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  await expect(trigger).toBeFocused();
});

test("documentation drawer is a keyboard-safe modal", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/docs/installation");

  const trigger = page.getByRole("button", { name: "Browse docs" });
  await trigger.click();
  const drawer = page.getByRole("dialog", { name: "Documentation" });
  await expect(drawer).toBeVisible();
  await expect(page.locator("body")).toHaveCSS("overflow", "hidden");
  await expect(drawer.getByRole("button", { name: "Close" })).toBeFocused();

  await page.keyboard.press("Escape");
  await expect(drawer).toBeHidden();
  await expect(trigger).toBeFocused();
});

test("code tabs implement the ARIA keyboard pattern", async ({ page }) => {
  await page.goto("/docs/installation");
  const tablist = page.getByRole("tablist", { name: "Platform-specific commands" }).first();
  const tabs = tablist.getByRole("tab");
  await tabs.first().focus();
  await tabs.first().press("ArrowRight");

  await expect(tabs.nth(1)).toBeFocused();
  await expect(tabs.nth(1)).toHaveAttribute("aria-selected", "true");
  const panelId = await tabs.nth(1).getAttribute("aria-controls");
  await expect(page.locator(`[id="${panelId}"]`)).toBeVisible();
});

test("production responses carry the generated security policy", async ({ request }) => {
  const response = await request.get("/");
  const headers = response.headers();

  expect(headers["content-security-policy"]).toContain("script-src 'self' 'sha256-");
  expect(headers["content-security-policy"]).toContain("frame-ancestors 'none'");
  expect(headers["x-content-type-options"]).toBe("nosniff");
  expect(headers["x-frame-options"]).toBe("DENY");
  expect(headers["referrer-policy"]).toBe("strict-origin-when-cross-origin");
  expect(headers["x-powered-by"]).toBeUndefined();
});
