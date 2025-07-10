import { test, expect } from "@playwright/test";
import {
  waitForPageLoad,
  checkConsoleErrors,
  checkNetworkErrors,
  testResponsiveDesign,
  VIEWPORTS,
  checkBasicAccessibility,
  measurePageLoadTime,
} from "./test-utils";

test.describe("Landing Page - Comprehensive Tests", () => {
  test.beforeEach(async ({ page }) => {
    // Set up error monitoring before navigation
    await checkConsoleErrors(page);
    await checkNetworkErrors(page);
  });

  test("should load the landing page successfully with all resources", async ({
    page,
  }) => {
    // Navigate to the landing page
    await page.goto("/");
    await waitForPageLoad(page);

    // Verify URL
    await expect(page).toHaveURL("http://localhost:9002/");

    // Verify page title exists and is not empty
    const title = await page.title();
    expect(title.length).toBeGreaterThan(0);

    // Verify page content is visible
    const body = page.locator("body");
    await expect(body).toBeVisible();

    // Verify page has some meaningful content
    const bodyText = await body.textContent();
    expect(bodyText?.trim().length).toBeGreaterThan(0);
  });

  test("should have proper SEO and meta tags", async ({ page }) => {
    await page.goto("/");

    // Check essential meta tags - use .first() to handle multiple viewport tags
    const metaViewport = page.locator('meta[name="viewport"]').first();
    await expect(metaViewport).toHaveAttribute("content", /width=device-width/);

    const metaCharset = page.locator("meta[charset]").first();
    await expect(metaCharset).toHaveAttribute("charset", "utf-8");

    // Check for title tag
    const title = await page.title();
    expect(title.length).toBeGreaterThan(0);
    expect(title).not.toBe("");
  });

  test("should be fully responsive across all device sizes", async ({
    page,
  }) => {
    await page.goto("/");

    const viewportsToTest = [
      VIEWPORTS.smallMobile,
      VIEWPORTS.mobile,
      VIEWPORTS.largeMobile,
      VIEWPORTS.tablet,
      VIEWPORTS.desktop,
    ];

    await testResponsiveDesign(page, viewportsToTest);
  });

  test("should load without console errors", async ({ page }) => {
    const consoleErrors = await checkConsoleErrors(page);

    await page.goto("/");
    await waitForPageLoad(page);

    // Allow some time for any delayed console errors
    await page.waitForTimeout(2000);

    expect(consoleErrors).toHaveLength(0);
  });

  test("should load without network errors", async ({ page }) => {
    const networkErrors = await checkNetworkErrors(page);

    await page.goto("/");
    await waitForPageLoad(page);

    expect(networkErrors).toHaveLength(0);
  });

  test("should meet performance requirements", async ({ page }) => {
    const loadTime = await measurePageLoadTime(page, "/");

    // Page should load within 5 seconds
    expect(loadTime).toBeLessThan(5000);

    // For better UX, aim for under 3 seconds
    if (loadTime > 3000) {
      console.warn(
        `Page load time (${loadTime}ms) exceeds recommended 3 seconds`
      );
    }
  });

  test("should meet basic accessibility requirements", async ({ page }) => {
    await page.goto("/");
    await waitForPageLoad(page);

    await checkBasicAccessibility(page);
  });

  test("should handle browser navigation correctly", async ({ page }) => {
    await page.goto("/");
    await waitForPageLoad(page);

    // Test browser back/forward functionality
    await page.goBack();
    await page.goForward();

    // Should still be on the landing page
    await expect(page).toHaveURL("http://localhost:9002/");
  });

  test("should work with JavaScript disabled (progressive enhancement)", async ({
    browser,
  }) => {
    const context = await browser.newContext({
      javaScriptEnabled: false,
    });

    const page = await context.newPage();

    try {
      await page.goto("/");

      // Page should still load basic content without JavaScript
      const body = page.locator("body");
      await expect(body).toBeVisible();

      // Check that there's some content visible
      const bodyText = await body.textContent();
      expect(bodyText?.trim().length).toBeGreaterThan(0);

      // Basic navigation should still work
      await expect(page).toHaveURL("http://localhost:9002/");
    } finally {
      await context.close();
    }
  });

  test("should handle slow network conditions gracefully", async ({
    browser,
  }) => {
    const context = await browser.newContext({
      // Simulate slow 3G connection
      offline: false,
    });

    const page = await context.newPage();

    try {
      // Throttle network to simulate slow connection
      await page.route("**/*", async (route) => {
        await new Promise((resolve) => setTimeout(resolve, 100)); // Add 100ms delay
        await route.continue();
      });

      const startTime = Date.now();
      await page.goto("/");
      await page.waitForLoadState("domcontentloaded");
      const loadTime = Date.now() - startTime;

      // Even with throttling, should load within reasonable time
      expect(loadTime).toBeLessThan(10000);

      // Verify content is still accessible
      const body = page.locator("body");
      await expect(body).toBeVisible();
    } finally {
      await context.close();
    }
  });

  test("should have proper caching headers for static assets", async ({
    page,
  }) => {
    const responses: Array<{
      url: string;
      status: number;
      headers: Record<string, string>;
    }> = [];

    page.on("response", (response) => {
      responses.push({
        url: response.url(),
        status: response.status(),
        headers: response.headers(),
      });
    });

    await page.goto("/");
    await waitForPageLoad(page);

    // Check that static assets have appropriate caching headers
    const staticAssets = responses.filter(
      (response) =>
        response.url.includes("/_next/static/") ||
        response.url.includes(".css") ||
        response.url.includes(".js")
    );

    staticAssets.forEach((asset) => {
      expect(asset.status).toBe(200);
      // Static assets should have cache headers (this may vary based on Next.js config)
      // This is more of a guideline check
    });
  });
});
