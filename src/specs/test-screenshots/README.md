# Test Screenshots

This directory contains screenshots generated during dark mode testing and demonstrations.

## 📁 Organization

### Demo Screenshots
- `demo-initial-state.png` - Initial app state (light/dark based on system)
- `demo-after-toggle.png` - State after first theme toggle
- `demo-final-state.png` - Final state after toggling back
- `demo-persistence-dark.png` - Dark mode persistence after reload
- `demo-mobile-dark.png` - Mobile dark mode demonstration

### Visual Regression Baselines
The `dark-mode.spec.ts-snapshots/` directory contains baseline screenshots for visual regression testing across different browsers and devices.

## 🎯 Purpose

These screenshots serve multiple purposes:

1. **Visual Documentation** - Show how the dark mode looks across different states
2. **Regression Testing** - Detect visual changes in future updates
3. **Cross-Browser Validation** - Ensure consistency across browsers
4. **Mobile Responsiveness** - Verify mobile layout and functionality

## 🚀 Generating Screenshots

Run the demo tests to generate fresh screenshots:

```bash
# Generate demo screenshots
npx playwright test src/specs/dark-mode-demo.spec.ts

# Generate visual regression baselines
npx playwright test src/specs/dark-mode.spec.ts --update-snapshots
```

## 📱 Viewport Coverage

- **Desktop**: 1280x720 (default)
- **Mobile**: 375x667 (iPhone-like)
- **Tablet**: 768x1024 (iPad-like)

## 🎨 What to Look For

When reviewing screenshots, check for:
- ✅ Consistent color schemes
- ✅ Proper toggle button states
- ✅ Readable text contrast
- ✅ Component alignment
- ✅ Icon visibility and positioning 