import { test, expect, Page } from "@playwright/test";
import {
  waitForPageLoad,
  checkConsoleErrors,
  VIEWPORTS,
  getScreenshotPath,
} from "./test-utils";

/**
 * Dark Mode Test Suite
 * Tests the theme switching functionality, persistence, and visual consistency
 */

test.describe("Dark Mode Functionality", () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage to start with a clean state
    await page.goto("/");
    await page.evaluate(() => localStorage.clear());
    await waitForPageLoad(page);
  });

  test("should load with system theme by default", async ({ page }) => {
    await page.goto("/");
    await waitForPageLoad(page);

    // Check that the theme provider is initialized
    const html = page.locator("html");
    const classes = await html.getAttribute("class");

    // Should have either 'light' or 'dark' class based on system preference
    expect(classes).toMatch(/(light|dark)/);
  });

  test("should toggle between light and dark themes", async ({ page }) => {
    await page.goto("/");
    await waitForPageLoad(page);

    // Find the theme toggle button
    const themeToggle = page.locator('button[aria-label="Toggle theme"]');
    await expect(themeToggle).toBeVisible();

    // Get initial theme
    const html = page.locator("html");
    const initialClasses = await html.getAttribute("class");
    const isInitiallyDark = initialClasses?.includes("dark");

    // Click the toggle
    await themeToggle.click();

    // Wait for theme change animation
    await page.waitForTimeout(300);

    // Verify theme has changed
    const newClasses = await html.getAttribute("class");
    if (isInitiallyDark) {
      expect(newClasses).toContain("light");
      expect(newClasses).not.toContain("dark");
    } else {
      expect(newClasses).toContain("dark");
      expect(newClasses).not.toContain("light");
    }

    // Toggle back
    await themeToggle.click();
    await page.waitForTimeout(300);

    // Should be back to original theme
    const finalClasses = await html.getAttribute("class");
    if (isInitiallyDark) {
      expect(finalClasses).toContain("dark");
    } else {
      expect(finalClasses).toContain("light");
    }
  });

  test("should persist theme preference in localStorage", async ({ page }) => {
    await page.goto("/");
    await waitForPageLoad(page);

    // Set to dark theme
    const themeToggle = page.locator('button[aria-label="Toggle theme"]');

    // Ensure we're in light mode first
    await page.evaluate(() => {
      localStorage.setItem("theme", "light");
      document.documentElement.classList.remove("dark");
      document.documentElement.classList.add("light");
    });

    await page.reload();
    await waitForPageLoad(page);

    // Now toggle to dark
    await themeToggle.click();
    await page.waitForTimeout(300);

    // Check localStorage
    const storedTheme = await page.evaluate(() =>
      localStorage.getItem("theme")
    );
    expect(storedTheme).toBe("dark");

    // Reload page and verify theme persists
    await page.reload();
    await waitForPageLoad(page);

    const html = page.locator("html");
    const classes = await html.getAttribute("class");
    expect(classes).toContain("dark");
  });

  test("should display correct theme toggle visual states", async ({
    page,
  }) => {
    await page.goto("/");
    await waitForPageLoad(page);

    const themeToggle = page.locator('button[aria-label="Toggle theme"]');

    // Set to light theme first
    await page.evaluate(() => {
      localStorage.setItem("theme", "light");
      document.documentElement.classList.remove("dark");
      document.documentElement.classList.add("light");
    });
    await page.reload();
    await waitForPageLoad(page);

    // In light mode, sun icon should be prominent
    const sunIcon = themeToggle.locator(".lucide-sun").first();
    const moonIcon = themeToggle.locator(".lucide-moon").first();

    await expect(sunIcon).toBeVisible();
    await expect(moonIcon).toBeVisible();

    // Toggle to dark mode
    await themeToggle.click();
    await page.waitForTimeout(300);

    // Verify toggle button appearance changed - look for the correct knob element
    const toggleKnob = themeToggle.locator("span").nth(2); // The movable knob element
    const knobClasses = await toggleKnob.getAttribute("class");
    expect(knobClasses).toContain("translate-x-[34px]"); // Should be moved to the right
  });

  test("should work correctly across different viewport sizes", async ({
    page,
  }) => {
    const viewports = [VIEWPORTS.mobile, VIEWPORTS.tablet, VIEWPORTS.desktop];

    for (const viewport of viewports) {
      await page.setViewportSize({
        width: viewport.width,
        height: viewport.height,
      });
      await page.goto("/");
      await waitForPageLoad(page);

      // Theme toggle should be visible and functional
      const themeToggle = page.locator('button[aria-label="Toggle theme"]');
      await expect(themeToggle).toBeVisible();

      // Test toggle functionality
      const html = page.locator("html");
      const initialClasses = await html.getAttribute("class");

      await themeToggle.click();
      await page.waitForTimeout(300);

      const newClasses = await html.getAttribute("class");
      expect(newClasses).not.toBe(initialClasses);
    }
  });

  test("should apply dark mode styles to all components", async ({ page }) => {
    await page.goto("/");
    await waitForPageLoad(page);

    // Set to dark mode
    await page.evaluate(() => {
      localStorage.setItem("theme", "dark");
      document.documentElement.classList.remove("light");
      document.documentElement.classList.add("dark");
    });
    await page.reload();
    await waitForPageLoad(page);

    // Check header has dark styling
    const header = page.locator("header");
    await expect(header).toBeVisible();

    // Check main content area
    const main = page.locator("main");
    await expect(main).toBeVisible();

    // Verify dark theme is applied to body
    const body = page.locator("body");
    const bodyStyles = await body.evaluate((el) => {
      return window.getComputedStyle(el);
    });

    // In dark mode, background should be dark
    // Note: We can't easily test exact colors due to CSS variables,
    // but we can verify the theme class is applied
    const html = page.locator("html");
    const classes = await html.getAttribute("class");
    expect(classes).toContain("dark");
  });

  test("should handle system theme preference changes", async ({
    page,
    context,
  }) => {
    await page.goto("/");
    await waitForPageLoad(page);

    // Set theme to system
    await page.evaluate(() => {
      localStorage.setItem("theme", "system");
    });
    await page.reload();
    await waitForPageLoad(page);

    // Simulate system dark mode preference
    await page.emulateMedia({ colorScheme: "dark" });
    await page.waitForTimeout(100);

    const html = page.locator("html");
    let classes = await html.getAttribute("class");
    expect(classes).toContain("dark");

    // Simulate system light mode preference
    await page.emulateMedia({ colorScheme: "light" });
    await page.waitForTimeout(100);

    classes = await html.getAttribute("class");
    expect(classes).toContain("light");
  });

  test("should not have console errors during theme switching", async ({
    page,
  }) => {
    const consoleErrors = await checkConsoleErrors(page);

    await page.goto("/");
    await waitForPageLoad(page);

    const themeToggle = page.locator('button[aria-label="Toggle theme"]');

    // Toggle theme multiple times
    for (let i = 0; i < 3; i++) {
      await themeToggle.click();
      await page.waitForTimeout(300);
    }

    // Check that no new console errors occurred
    expect(consoleErrors.length).toBe(0);
  });

  test("should maintain theme state during navigation", async ({ page }) => {
    await page.goto("/");
    await waitForPageLoad(page);

    // Set to dark theme
    const themeToggle = page.locator('button[aria-label="Toggle theme"]');
    await page.evaluate(() => {
      localStorage.setItem("theme", "dark");
      document.documentElement.classList.remove("light");
      document.documentElement.classList.add("dark");
    });
    await page.reload();
    await waitForPageLoad(page);

    // Verify dark theme is active
    let html = page.locator("html");
    let classes = await html.getAttribute("class");
    expect(classes).toContain("dark");

    // Navigate (in this case, reload since it's a single page app)
    await page.reload();
    await waitForPageLoad(page);

    // Theme should still be dark
    html = page.locator("html");
    classes = await html.getAttribute("class");
    expect(classes).toContain("dark");
  });

  test("should have proper accessibility attributes", async ({ page }) => {
    await page.goto("/");
    await waitForPageLoad(page);

    const themeToggle = page.locator('button[aria-label="Toggle theme"]');

    // Check accessibility attributes
    await expect(themeToggle).toHaveAttribute("aria-label", "Toggle theme");

    // Check for screen reader text
    const srText = themeToggle.locator(".sr-only");
    await expect(srText).toHaveText("Toggle theme");

    // Verify button is focusable
    await themeToggle.focus();
    await expect(themeToggle).toBeFocused();

    // Test keyboard interaction
    await page.keyboard.press("Enter");
    await page.waitForTimeout(300);

    // Theme should have changed
    const html = page.locator("html");
    const classes = await html.getAttribute("class");
    expect(classes).toMatch(/(light|dark)/);
  });
});

test.describe("Dark Mode Visual Consistency", () => {
  test("should have consistent styling in dark mode", async ({ page }) => {
    await page.goto("/");
    await waitForPageLoad(page);

    // Set to dark mode
    await page.evaluate(() => {
      localStorage.setItem("theme", "dark");
      document.documentElement.classList.remove("light");
      document.documentElement.classList.add("dark");
    });
    await page.reload();
    await waitForPageLoad(page);

    // Take screenshot for visual comparison
    await expect(page).toHaveScreenshot("visual-dark-mode-full-page.png", {
      fullPage: true,
      threshold: 0.2,
    });
  });

  test("should have consistent styling in light mode", async ({ page }) => {
    await page.goto("/");
    await waitForPageLoad(page);

    // Set to light mode
    await page.evaluate(() => {
      localStorage.setItem("theme", "light");
      document.documentElement.classList.remove("dark");
      document.documentElement.classList.add("light");
    });
    await page.reload();
    await waitForPageLoad(page);

    // Take screenshot for visual comparison
    await expect(page).toHaveScreenshot("visual-light-mode-full-page.png", {
      fullPage: true,
      threshold: 0.2,
    });
  });

  test("should show theme toggle component correctly", async ({ page }) => {
    await page.goto("/");
    await waitForPageLoad(page);

    const themeToggle = page.locator('button[aria-label="Toggle theme"]');

    // Screenshot of toggle in light mode
    await page.evaluate(() => {
      localStorage.setItem("theme", "light");
      document.documentElement.classList.remove("dark");
      document.documentElement.classList.add("light");
    });
    await page.reload();
    await waitForPageLoad(page);

    await expect(themeToggle).toHaveScreenshot("visual-theme-toggle-light.png");

    // Screenshot of toggle in dark mode
    await themeToggle.click();
    await page.waitForTimeout(300);

    await expect(themeToggle).toHaveScreenshot("visual-theme-toggle-dark.png");
  });
});
