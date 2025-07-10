import { Page, expect } from "@playwright/test";

/**
 * Common test utilities for Playwright tests
 */

/**
 * Wait for the page to be fully loaded including all network requests
 */
export async function waitForPageLoad(page: Page, timeout = 30000) {
  await page.waitForLoadState("domcontentloaded", { timeout });
  await page.waitForLoadState("networkidle", { timeout });
}

/**
 * Check if the page has any console errors
 */
export async function checkConsoleErrors(page: Page): Promise<string[]> {
  const consoleErrors: string[] = [];

  page.on("console", (msg) => {
    if (msg.type() === "error") {
      consoleErrors.push(msg.text());
    }
  });

  return consoleErrors;
}

/**
 * Check if the page has any network errors
 */
export async function checkNetworkErrors(page: Page): Promise<string[]> {
  const networkErrors: string[] = [];

  page.on("requestfailed", (request) => {
    const url = request.url();
    const errorText = request.failure()?.errorText || "";

    // Filter out development-specific errors that are expected
    const isDevelopmentError =
      url.includes("hmr-client") || // Hot Module Replacement
      url.includes("turbopack") || // Turbopack development
      errorText === "cancelled" || // Cancelled requests are common in dev
      (url.includes("_next/static/chunks/") && errorText === "cancelled");

    if (!isDevelopmentError) {
      networkErrors.push(`${request.method()} ${url} - ${errorText}`);
    }
  });

  return networkErrors;
}

/**
 * Test responsive design across different viewport sizes
 */
export async function testResponsiveDesign(
  page: Page,
  viewports: Array<{ width: number; height: number; name: string }>
) {
  for (const viewport of viewports) {
    await page.setViewportSize({
      width: viewport.width,
      height: viewport.height,
    });
    await page.reload();

    // Verify the page loads properly
    const body = page.locator("body");
    await expect(body).toBeVisible();

    // Check that content is not horizontally scrollable (with small tolerance)
    const scrollWidth = await page.evaluate(() => document.body.scrollWidth);
    const clientWidth = await page.evaluate(() => document.body.clientWidth);
    expect(
      scrollWidth,
      `Horizontal scroll detected on ${viewport.name} (${viewport.width}x${viewport.height})`
    ).toBeLessThanOrEqual(clientWidth + 2);
  }
}

/**
 * Common viewport sizes for testing
 */
export const VIEWPORTS = {
  mobile: { width: 375, height: 667, name: "Mobile" },
  tablet: { width: 768, height: 1024, name: "Tablet" },
  desktop: { width: 1920, height: 1080, name: "Desktop" },
  smallMobile: { width: 320, height: 568, name: "Small Mobile" },
  largeMobile: { width: 414, height: 896, name: "Large Mobile" },
} as const;

/**
 * Check basic accessibility requirements
 */
export async function checkBasicAccessibility(page: Page) {
  // Check for main content area
  const main = page.locator('main, [role="main"], #main, .main');
  const hasMainContent = (await main.count()) > 0;

  if (!hasMainContent) {
    // If no main element, at least check that there's some content
    const body = page.locator("body");
    const bodyText = await body.textContent();
    expect(
      bodyText?.trim().length,
      "Page should have some visible content"
    ).toBeGreaterThan(0);
  }

  // Check for proper meta viewport tag - use .first() to handle multiple viewport tags
  const metaViewport = page.locator('meta[name="viewport"]').first();
  await expect(metaViewport).toHaveAttribute("content", /width=device-width/);
}

/**
 * Measure page load performance
 */
export async function measurePageLoadTime(
  page: Page,
  url: string
): Promise<number> {
  const startTime = Date.now();
  await page.goto(url);
  await page.waitForLoadState("domcontentloaded");
  return Date.now() - startTime;
}

/**
 * Generate a consistent screenshot path for test files
 */
export function getScreenshotPath(testName: string, suffix?: string): string {
  const sanitizedTestName = testName
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  const fileName = suffix
    ? `${sanitizedTestName}-${suffix}.png`
    : `${sanitizedTestName}.png`;

  return `src/specs/test-screenshots/${fileName}`;
}
