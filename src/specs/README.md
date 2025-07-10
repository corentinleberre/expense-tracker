# Test Specifications

This directory contains all test specifications for the Expense Tracker application.

## 📁 Directory Structure

```
src/specs/
├── README.md                    # This file - test documentation
├── test-utils.ts               # Shared test utilities and helpers
├── landing.spec.ts             # Landing page tests
├── dark-mode.spec.ts           # Comprehensive dark mode tests
├── dark-mode-demo.spec.ts      # Interactive dark mode demonstrations
└── test-screenshots/           # Generated test screenshots
    ├── README.md               # Screenshot documentation
    ├── demo-*.png             # Demo test screenshots
    └── dark-mode.spec.ts-snapshots/  # Visual regression baselines
```

## 🧪 Test Files

### Core Tests
- **`landing.spec.ts`** - Tests for the main landing page functionality
- **`dark-mode.spec.ts`** - Comprehensive dark mode functionality tests
- **`dark-mode-demo.spec.ts`** - Interactive demonstrations of dark mode features

### Utilities
- **`test-utils.ts`** - Shared utilities for all tests including:
  - Page load helpers
  - Error checking functions
  - Responsive design testing
  - Accessibility validation
  - Screenshot path generation

## 🎯 Dark Mode Testing

### Functional Tests (`dark-mode.spec.ts`)
- ✅ Theme toggle functionality
- ✅ localStorage persistence
- ✅ System preference detection
- ✅ Cross-viewport compatibility
- ✅ Accessibility compliance
- ✅ Console error monitoring
- ✅ Visual consistency checks

### Demo Tests (`dark-mode-demo.spec.ts`)
- 🎬 Interactive theme switching demonstration
- 💾 Persistence verification
- 📱 Mobile responsiveness validation

## 📸 Screenshot Organization

Screenshots are organized in the `test-screenshots/` directory:

### Demo Screenshots
- `demo-initial-state.png` - Initial app state
- `demo-after-toggle.png` - After theme toggle
- `demo-final-state.png` - Final state verification
- `demo-persistence-dark.png` - Persistence demonstration
- `demo-mobile-dark.png` - Mobile dark mode

### Visual Regression Baselines
- `visual-dark-mode-full-page.png` - Full page dark mode
- `visual-light-mode-full-page.png` - Full page light mode
- `visual-theme-toggle-light.png` - Toggle in light mode
- `visual-theme-toggle-dark.png` - Toggle in dark mode

## 🚀 Running Tests

### All Tests
```bash
npx playwright test
```

### Specific Test Suites
```bash
# Dark mode functionality tests
npx playwright test src/specs/dark-mode.spec.ts

# Interactive dark mode demo
npx playwright test src/specs/dark-mode-demo.spec.ts

# Landing page tests
npx playwright test src/specs/landing.spec.ts
```

### Visual Testing
```bash
# Update visual baselines
npx playwright test --update-snapshots

# Run with headed browser (visible)
npx playwright test --headed

# Run specific browser
npx playwright test --project=chromium
```

## 📱 Test Coverage

### Browsers
- ✅ Chromium (Chrome/Edge)
- ✅ Firefox
- ✅ WebKit (Safari)
- ✅ Mobile Chrome
- ✅ Mobile Safari

### Viewports
- 📱 Mobile: 375x667 (iPhone-like)
- 📱 Large Mobile: 414x896
- 📱 Small Mobile: 320x568
- 📟 Tablet: 768x1024 (iPad-like)
- 🖥️ Desktop: 1920x1080

### Features Tested
- 🎨 Theme switching (light/dark)
- 💾 State persistence
- 🔄 System preference integration
- ♿ Accessibility compliance
- 📱 Responsive design
- 🎭 Visual consistency
- ⚡ Performance metrics

## 🎯 Best Practices

### Writing Tests
1. Use descriptive test names
2. Include console logging for demo tests
3. Wait for animations to complete
4. Verify both visual and functional changes
5. Test across multiple viewports

### Screenshots
1. Use consistent naming conventions
2. Organize by test type (demo vs visual)
3. Include full-page screenshots for layout tests
4. Component screenshots for specific elements

### Accessibility
1. Test keyboard navigation
2. Verify ARIA attributes
3. Check screen reader compatibility
4. Validate focus management

## 📊 Test Reports

View test results:
```bash
npx playwright show-report
```

The HTML report includes:
- ✅ Test results and timing
- 📸 Screenshots on failure
- 🎥 Video recordings
- 📊 Performance metrics
- 🔍 Detailed error information 