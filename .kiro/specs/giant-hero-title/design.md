# Design Document

## Overview

This design enhances the visual impact of the Lingo Lotus homepage hero section by significantly increasing the size of the main title "🪷 Lingo Lotus". The design leverages Chakra UI's responsive sizing system and custom CSS properties to create a striking, scalable title that maintains readability across all devices.

## Architecture

### Current State Analysis
- Current title uses Chakra UI `size="2xl"` which maps to approximately 36px font size
- The title is positioned in a Flex layout with responsive direction (column on mobile, row on desktop)
- Existing responsive breakpoints: `base` (mobile), `md` (tablet+)

### Proposed Enhancement
- Implement custom responsive font sizes that go beyond Chakra's standard scale
- Use Chakra UI's responsive object syntax for precise control across breakpoints
- Maintain existing layout structure while dramatically increasing visual impact

## Components and Interfaces

### Typography Scale Enhancement

**Custom Font Sizes:**
- Mobile (base): `fontSize={{ base: "4xl" }}` (~48px) - Large but fits mobile screens
- Tablet/Desktop (md+): `fontSize={{ base: "4xl", md: "6xl", lg: "7xl" }}` (~72-96px) - Maximum impact

**Alternative Approach (Custom CSS):**
If standard Chakra sizes aren't large enough, implement custom responsive values:
```typescript
fontSize={{ 
  base: "3rem",    // 48px - mobile
  md: "4.5rem",    // 72px - tablet  
  lg: "6rem"       // 96px - desktop
}}
```

### Layout Considerations

**Spacing Adjustments:**
- Increase bottom margin to accommodate larger text: `mb={{ base: 6, md: 8 }}`
- Ensure proper line height for readability: `lineHeight={{ base: "1.1", md: "1.0" }}`
- Maintain text alignment responsiveness: `textAlign={{ base: "center", md: "left" }}`

**Container Constraints:**
- Verify the title doesn't overflow the container width
- Ensure proper text wrapping on smaller screens
- Test emoji rendering at large sizes across browsers

## Data Models

### Typography Configuration
```typescript
interface HeroTitleProps {
  fontSize: ResponsiveValue<string | number>;
  lineHeight: ResponsiveValue<string | number>;
  fontWeight: string;
  marginBottom: ResponsiveValue<string | number>;
  textAlign: ResponsiveValue<"left" | "center" | "right">;
}
```

### Responsive Breakpoint Values
```typescript
const heroTitleStyles = {
  fontSize: { base: "4xl", md: "6xl", lg: "7xl" },
  lineHeight: { base: "1.1", md: "1.0" },
  mb: { base: 6, md: 8 },
  textAlign: { base: "center", md: "left" }
};
```

## Error Handling

### Responsive Fallbacks
- If custom font sizes cause overflow, implement `overflow-wrap: break-word`
- Provide fallback font sizes for browsers that don't support the largest values
- Ensure emoji fallbacks for systems without proper emoji support

### Cross-Browser Compatibility
- Test emoji rendering in Safari, Chrome, Firefox, and Edge
- Verify font scaling behavior on different operating systems
- Implement CSS fallbacks for older browsers

### Performance Considerations
- Large text shouldn't impact page load performance
- Ensure no layout shift during font loading
- Test on low-resolution displays for readability

## Testing Strategy

### Visual Regression Testing
- Screenshot comparison across breakpoints (320px, 768px, 1024px, 1440px)
- Cross-browser emoji rendering verification
- Typography scaling validation

### Responsive Testing
- Mobile devices: iPhone SE, iPhone 12, Android phones
- Tablets: iPad, Android tablets
- Desktop: Various screen resolutions (1024px to 4K)

### Accessibility Testing
- Screen reader compatibility with large text and emoji
- Keyboard navigation not affected by size changes
- Color contrast maintained at all sizes

### Performance Testing
- Page load speed impact measurement
- Layout stability during font loading
- Memory usage with large text rendering

## Implementation Approach

### Phase 1: Basic Size Enhancement
1. Update the Heading component with responsive fontSize prop
2. Adjust spacing and line height for optimal readability
3. Test across primary breakpoints

### Phase 2: Fine-tuning
1. Optimize emoji positioning and scaling
2. Adjust container spacing if needed
3. Cross-browser testing and fixes

### Phase 3: Polish
1. Performance optimization
2. Accessibility validation
3. Visual regression testing