import { test, expect } from "@playwright/test";
import { waitForPageLoad } from "./test-utils";

/**
 * Dark Mode Demo Test
 * A focused demonstration of the dark mode functionality
 */

test.describe("Dark Mode Demo", () => {
  test("Dark Mode Interactive Demo", async ({ page }) => {
    console.log("🌟 Starting Dark Mode Demo...");

    // Navigate to the app
    await page.goto("/");
    await waitForPageLoad(page);
    console.log("✅ App loaded successfully");

    // Find the theme toggle
    const themeToggle = page.locator('button[aria-label="Toggle theme"]');
    await expect(themeToggle).toBeVisible();
    console.log("✅ Theme toggle found");

    // Check initial state
    const html = page.locator("html");
    const initialClasses = await html.getAttribute("class");
    const isInitiallyDark = initialClasses?.includes("dark");
    console.log(`🎨 Initial theme: ${isInitiallyDark ? "Dark" : "Light"}`);

    // Take initial screenshot
    await page.screenshot({
      path: "src/specs/test-screenshots/demo-initial-state.png",
      fullPage: true,
    });
    console.log("📸 Initial screenshot taken");

    // Toggle to opposite theme
    console.log("🔄 Toggling theme...");
    await themeToggle.click();
    await page.waitForTimeout(500); // Wait for animation

    // Verify theme changed
    const newClasses = await html.getAttribute("class");
    const isNowDark = newClasses?.includes("dark");
    console.log(`🎨 New theme: ${isNowDark ? "Dark" : "Light"}`);

    // Take screenshot after toggle
    await page.screenshot({
      path: "src/specs/test-screenshots/demo-after-toggle.png",
      fullPage: true,
    });
    console.log("📸 After toggle screenshot taken");

    // Verify localStorage persistence
    const storedTheme = await page.evaluate(() =>
      localStorage.getItem("theme")
    );
    console.log(`💾 Theme stored in localStorage: ${storedTheme}`);

    // Test toggle knob position
    const toggleKnob = themeToggle.locator("span").nth(2);
    const knobClasses = await toggleKnob.getAttribute("class");
    const knobPosition = knobClasses?.includes("translate-x-[34px]")
      ? "Right"
      : "Left";
    console.log(`🎛️ Toggle knob position: ${knobPosition}`);

    // Toggle back to original
    console.log("🔄 Toggling back to original theme...");
    await themeToggle.click();
    await page.waitForTimeout(500);

    // Final verification
    const finalClasses = await html.getAttribute("class");
    const isFinallyDark = finalClasses?.includes("dark");
    console.log(`🎨 Final theme: ${isFinallyDark ? "Dark" : "Light"}`);

    // Take final screenshot
    await page.screenshot({
      path: "src/specs/test-screenshots/demo-final-state.png",
      fullPage: true,
    });
    console.log("📸 Final screenshot taken");

    // Verify we're back to original state
    expect(isFinallyDark).toBe(isInitiallyDark);
    console.log("✅ Successfully returned to original theme");

    console.log("🎉 Dark Mode Demo completed successfully!");
  });

  test("Theme Persistence Demo", async ({ page }) => {
    console.log("🔄 Testing theme persistence...");

    // Set to dark mode
    await page.goto("/");
    await waitForPageLoad(page);

    await page.evaluate(() => {
      localStorage.setItem("theme", "dark");
      document.documentElement.classList.remove("light");
      document.documentElement.classList.add("dark");
    });

    await page.reload();
    await waitForPageLoad(page);

    // Verify dark mode persisted
    const html = page.locator("html");
    const classes = await html.getAttribute("class");
    expect(classes).toContain("dark");
    console.log("✅ Dark mode persisted after reload");

    // Take screenshot
    await page.screenshot({
      path: "src/specs/test-screenshots/demo-persistence-dark.png",
      fullPage: true,
    });

    console.log("💾 Theme persistence demo completed!");
  });

  test("Mobile Responsive Demo", async ({ page }) => {
    console.log("📱 Testing mobile responsiveness...");

    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/");
    await waitForPageLoad(page);

    // Verify toggle is visible on mobile
    const themeToggle = page.locator('button[aria-label="Toggle theme"]');
    await expect(themeToggle).toBeVisible();
    console.log("✅ Theme toggle visible on mobile");

    // Test toggle on mobile
    await themeToggle.click();
    await page.waitForTimeout(300);

    // Take mobile screenshot
    await page.screenshot({
      path: "src/specs/test-screenshots/demo-mobile-dark.png",
      fullPage: true,
    });

    console.log("📱 Mobile responsive demo completed!");
  });
});
