# Design Tokens 🎨

Centralized design system values for consistency across Lingo Lotus.

## 📦 Usage

```tsx
import { tokens } from "../theme/tokens";

// Use in components
<Box p={tokens.spacing.md} borderRadius={tokens.borderRadius.md}>
    ...
</Box>
```

---

## 🎯 Available Tokens

### Spacing Scale

Consistent spacing throughout the app:

```tsx
tokens.spacing = {
    xs: 2,    // 8px  - Tight spacing
    sm: 3,    // 12px - Small gaps
    md: 4,    // 16px - Default spacing
    lg: 6,    // 24px - Section spacing
    xl: 8,    // 32px - Large gaps
    "2xl": 12, // 48px - Major sections
    "3xl": 16, // 64px - Hero sections
}
```

**Examples:**
```tsx
<Box p={tokens.spacing.md}>         // padding: 16px
<Stack spacing={tokens.spacing.lg}> // gap: 24px
<Container mb={tokens.spacing.xl}>  // margin-bottom: 32px
```

---

### Border Radius

Consistent rounded corners:

```tsx
tokens.borderRadius = {
    sm: "md", // 6px  - Subtle rounding
    md: "lg", // 8px  - Default cards
    lg: "xl", // 12px - Prominent elements
}
```

**Examples:**
```tsx
<Box borderRadius={tokens.borderRadius.md}> // Cards
<Button borderRadius={tokens.borderRadius.sm}> // Buttons
```

---

### Shadows

Elevation and depth:

```tsx
tokens.shadows = {
    card: "sm",       // Default card shadow
    cardHover: "md",  // Card hover state
    header: "sm",     // Header shadow
}
```

**Examples:**
```tsx
<Box boxShadow={tokens.shadows.card}>
<Box _hover={{ boxShadow: tokens.shadows.cardHover }}>
```

---

### Transitions

Consistent animation timing:

```tsx
tokens.transitions = {
    fast: "0.15s",   // Quick interactions
    normal: "0.2s",  // Default transitions
    slow: "0.3s",    // Smooth animations
}
```

**Examples:**
```tsx
<Box transition={tokens.hover.transition}> // "all 0.3s"
```

---

### Card Dimensions

Standardized card sizing:

```tsx
tokens.card = {
    imageHeight: "200px",  // Card image height
    padding: 5,            // 20px - Card content padding
    borderWidth: "1px",    // Card border
}
```

**Examples:**
```tsx
<LazyImage height={tokens.card.imageHeight} />
<Box p={tokens.card.padding}>
```

---

### Hover Effects

Consistent hover animations:

```tsx
tokens.hover = {
    transform: "translateY(-4px)", // Lift effect
    transition: "all 0.3s",        // Smooth transition
}
```

**Examples:**
```tsx
<Box
    transition={tokens.hover.transition}
    _hover={{ transform: tokens.hover.transform }}
>
```

---

### Icon Sizes

Standardized icon dimensions:

```tsx
tokens.iconSize = {
    sm: 4, // 16px
    md: 5, // 20px
    lg: 6, // 24px
    xl: 7, // 28px
}
```

**Examples:**
```tsx
<Icon boxSize={tokens.iconSize.md} />
```

---

## 🎨 Components Using Tokens

### LanguageCard

The `LanguageCard` component uses tokens for all styling:

```tsx
<LanguageCard>
    {/* Automatically applies:
        - borderRadius: tokens.borderRadius.md
        - boxShadow: tokens.shadows.card
        - transition: tokens.hover.transition
        - _hover: tokens.hover.transform + tokens.shadows.cardHover
    */}
</LanguageCard>
```

---

## 📝 Best Practices

### ✅ Do's

```tsx
// ✅ Use tokens for spacing
<Box p={tokens.spacing.md} />

// ✅ Use tokens for dimensions
<Image height={tokens.card.imageHeight} />

// ✅ Use tokens for transitions
<Box transition={tokens.hover.transition} />

// ✅ Combine tokens
<Box
    p={tokens.card.padding}
    borderRadius={tokens.borderRadius.md}
    boxShadow={tokens.shadows.card}
/>
```

### ❌ Don'ts

```tsx
// ❌ Don't use magic numbers
<Box p={5} />

// ❌ Don't hardcode dimensions
<Image height="200px" />

// ❌ Don't use inconsistent transitions
<Box transition="all 0.25s" />

// ❌ Don't mix token and hardcoded values
<Box p={tokens.spacing.md} m={4} /> // Inconsistent!
```

---

## 🔄 Migration Guide

### Before (Inconsistent)

```tsx
<Box
    borderWidth="1px"
    borderRadius="lg"
    p={5}
    boxShadow="sm"
    transition="all 0.3s"
    _hover={{ transform: "translateY(-4px)", shadow: "md" }}
>
```

### After (Using Tokens)

```tsx
<Box
    borderWidth={tokens.card.borderWidth}
    borderRadius={tokens.borderRadius.md}
    p={tokens.card.padding}
    boxShadow={tokens.shadows.card}
    transition={tokens.hover.transition}
    _hover={{
        transform: tokens.hover.transform,
        boxShadow: tokens.shadows.cardHover,
    }}
>
```

### Better (Using LanguageCard)

```tsx
<LanguageCard>
    {/* All tokens applied automatically! */}
</LanguageCard>
```

---

## 🎯 When to Add New Tokens

Add new tokens when you find yourself:
1. Using the same value in 3+ places
2. Hardcoding dimensions or spacing
3. Creating inconsistent hover effects
4. Defining custom transitions

**Example:**
```tsx
// Found yourself using this multiple times?
height="180px"

// Add it to tokens!
tokens.card.thumbnailHeight = "180px"
```

---

## 📊 Token Coverage

Current token usage across templates:

- ✅ `flashcard-list.tsx` - Uses card tokens
- ✅ `collection-detail.tsx` - Uses card tokens
- ✅ `reading-list.tsx` - Uses card tokens
- ✅ `LanguageCard.tsx` - Uses all card/hover tokens
- 🟡 `index.tsx` - Partial (spacing is consistent)
- 🟡 `Layout.tsx` - Partial (could use icon tokens)

---

## 🚀 Future Enhancements

Potential additions:

```tsx
// Typography scale
tokens.fontSize = {
    xs: "0.75rem",
    sm: "0.875rem",
    md: "1rem",
    lg: "1.125rem",
    xl: "1.25rem",
}

// Z-index scale
tokens.zIndex = {
    dropdown: 1000,
    sticky: 1100,
    modal: 1300,
}

// Breakpoints (if not using Chakra's)
tokens.breakpoints = {
    sm: "30em",
    md: "48em",
    lg: "62em",
    xl: "80em",
}
```

---

**Status:** ✅ Implemented and in use  
**Last Updated:** 2025-10-01
