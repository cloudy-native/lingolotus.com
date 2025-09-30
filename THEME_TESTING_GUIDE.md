# Theme Testing Guide

## Quick Theme Switching

All color themes are now centralized! To test different themes, simply edit **one line** in `src/theme/colors.ts`:

```typescript
// Change this line to switch themes:
export { semanticColors, tagColorSchemes } from "./colors-original";
```

## Available Themes

### 1. 🌸 Zen Garden (Recommended)
**File:** `colors-zen-garden.ts`  
**Colors:** Purple + Teal  
**Vibe:** Calming, nature-inspired, perfect for learning  
**Best for:** Ties into "Lingo Lotus" branding, promotes focus

```typescript
export { semanticColors, tagColorSchemes } from "./colors-zen-garden";
```

**Preview:**
- Flashcards header: Soft lavender (purple.50)
- Reading header: Peaceful teal (teal.50)
- Phonetics: Purple accent (purple.600)
- Breakdowns: Teal accent (teal.600)

---

### 2. 🌅 Sunset Vibes
**File:** `colors-sunset-vibes.ts`  
**Colors:** Orange + Pink  
**Vibe:** Warm, energetic, motivating  
**Best for:** Creating excitement and energy

```typescript
export { semanticColors, tagColorSchemes } from "./colors-sunset-vibes";
```

**Preview:**
- Flashcards header: Warm orange (orange.50)
- Reading header: Soft pink (pink.50)
- Phonetics: Pink accent (pink.600)
- Breakdowns: Pink accent (pink.600)

---

### 3. 🌊 Ocean Breeze
**File:** `colors-ocean-breeze.ts`  
**Colors:** Blue + Cyan  
**Vibe:** Cool, professional, focused  
**Best for:** Traditional, trustworthy feel

```typescript
export { semanticColors, tagColorSchemes } from "./colors-ocean-breeze";
```

**Preview:**
- Flashcards header: Classic blue (blue.50)
- Reading header: Fresh cyan (cyan.50)
- Phonetics: Cyan accent (cyan.600)
- Breakdowns: Cyan accent (cyan.600)

---

### 4. 🍵 Matcha Latte
**File:** `colors-matcha-latte.ts`  
**Colors:** Green + Yellow  
**Vibe:** Earthy, sophisticated, organic  
**Best for:** Natural, growth-oriented feel

```typescript
export { semanticColors, tagColorSchemes } from "./colors-matcha-latte";
```

**Preview:**
- Flashcards header: Fresh green (green.50)
- Reading header: Soft yellow (yellow.50)
- Phonetics: Deep green (green.700)
- Breakdowns: Green accent (green.600)

---

### 5. Original (Current)
**File:** `colors-original.ts`  
**Colors:** Blue + Orange  
**Vibe:** Current design  
**Best for:** Keeping the status quo

```typescript
export { semanticColors, tagColorSchemes } from "./colors-original";
```

## Testing Workflow

1. **Edit** `src/theme/colors.ts` and change the import line
2. **Save** the file
3. **Refresh** your browser (hot reload should work)
4. **Navigate** through different pages:
   - Home page
   - Flash Cards section
   - Reading section
   - Individual story pages
   - Deck detail pages

## What Changes with Each Theme

### Headers & Heroes
- Page headers (breadcrumb sections)
- Hero sections on list pages

### Accents
- Phonetic text color
- Word breakdown borders and accents
- Section backgrounds

### Tags
- Language tags
- Difficulty tags
- Category tags

### Borders
- Header borders
- Card borders (stay consistent across themes)

## Comparison Checklist

Test each theme and rate:

| Theme | Visual Appeal | Readability | Brand Fit | Energy Level | Overall |
|-------|--------------|-------------|-----------|--------------|---------|
| 🌸 Zen Garden | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | Calm | ? |
| 🌅 Sunset Vibes | ? | ? | ? | High | ? |
| 🌊 Ocean Breeze | ? | ? | ? | Medium | ? |
| 🍵 Matcha Latte | ? | ? | ? | Low | ? |
| Original | ? | ? | ? | Medium | ? |

## Making Your Choice

Consider:
1. **Brand Identity** - Does it match "Lingo Lotus"?
2. **User Experience** - Is it easy to read and navigate?
3. **Emotional Response** - How does it make you feel?
4. **Differentiation** - Does it stand out from competitors?
5. **Accessibility** - Are contrast ratios sufficient?

## Recommendation

**Zen Garden (🌸)** is recommended because:
- Purple connects to lotus flowers (your brand)
- Teal represents water and growth
- Calming colors are ideal for learning
- Modern and distinctive
- Good contrast and readability

## Need a Custom Theme?

All theme files follow the same structure. To create a custom theme:

1. Copy any `colors-*.ts` file
2. Rename it (e.g., `colors-custom.ts`)
3. Modify the color values
4. Update the import in `colors.ts`

Happy theme testing! 🎨
