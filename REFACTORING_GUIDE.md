# Refactoring Guide

This document explains the new shared components and constants created to reduce code duplication and improve maintainability.

## 1. Color Constants (`src/theme/colors.ts`)

### Purpose
Centralize all color values to ensure consistency and make theme changes easier.

### Usage

```typescript
import { semanticColors, tagColorSchemes } from "../theme/colors";

// Instead of:
const headerBg = "orange.50";
const cardBorder = "gray.200";

// Use:
const headerBg = semanticColors.header.reading;
const cardBorder = semanticColors.card.border;

// For tags:
<Tag colorScheme={tagColorSchemes.language}>{language}</Tag>
<Tag colorScheme={tagColorSchemes.difficulty}>{difficulty}</Tag>
```

### Available Colors

**Backgrounds:**
- `semanticColors.header.flashcards` - "blue.50"
- `semanticColors.header.reading` - "orange.50"
- `semanticColors.hero.reading` - "blue.50"
- `semanticColors.card.bg` - "white"
- `semanticColors.card.border` - "gray.200"

**Text:**
- `semanticColors.text.primary` - "gray.800"
- `semanticColors.text.secondary` - "gray.600"
- `semanticColors.text.muted` - "gray.500"
- `semanticColors.text.phonetic` - "gray.500"

**Borders:**
- `semanticColors.border.default` - "gray.200"
- `semanticColors.border.header.flashcards` - "blue.100"
- `semanticColors.border.header.reading` - "orange.100"

**Tag Color Schemes:**
- `tagColorSchemes.language` - "blue"
- `tagColorSchemes.targetLanguage` - "teal"
- `tagColorSchemes.difficulty` - "purple"
- `tagColorSchemes.category` - "orange"
- `tagColorSchemes.featured` - "yellow"
- `tagColorSchemes.easy` - "green"
- `tagColorSchemes.medium` - "yellow"
- `tagColorSchemes.hard` - "red"

## 2. Breadcrumb Component (`src/components/AppBreadcrumb.tsx`)

### Purpose
Eliminate duplicate breadcrumb code across templates.

### Usage

```typescript
import { AppBreadcrumb } from "../components/AppBreadcrumb";

// Instead of 20+ lines of Breadcrumb JSX:
<AppBreadcrumb
  items={[
    { label: "Home", path: "/" },
    { label: "Reading", path: readingPath() },
    { label: book.name, isCurrentPage: true },
  ]}
/>
```

### Props

```typescript
interface BreadcrumbItemData {
  label: string;          // Text to display
  path?: string;          // Link path (optional for current page)
  isCurrentPage?: boolean; // Marks as current page (no link)
}

interface AppBreadcrumbProps {
  items: BreadcrumbItemData[];
}
```

## 3. Page Header Component (`src/components/PageHeader.tsx`)

### Purpose
Provide a consistent header layout for detail pages with breadcrumbs, title, image, and metadata.

### Usage

```typescript
import { PageHeader } from "../components/PageHeader";

<PageHeader
  bg={semanticColors.header.reading}
  borderColor={semanticColors.border.header.reading}
  breadcrumbItems={[
    { label: "Home", path: "/" },
    { label: "Reading", path: readingPath() },
    { label: book.name, isCurrentPage: true },
  ]}
  title={book.name}
  subtitle={book.description}
  imageUrl={book.imageUrl}
  imageAlt={book.name}
  tags={
    <Stack direction="row" spacing={3}>
      <Tag colorScheme={tagColorSchemes.language}>{book.sourceLanguage}</Tag>
      <Tag colorScheme={tagColorSchemes.difficulty}>{book.difficulty}</Tag>
    </Stack>
  }
  actions={
    <Button colorScheme="primary">Start Reading</Button>
  }
>
  {/* Optional additional content */}
</PageHeader>
```

### Props

```typescript
interface PageHeaderProps {
  bg: string;                        // Background color
  borderColor: string;               // Bottom border color
  breadcrumbItems: BreadcrumbItemData[]; // Breadcrumb trail
  title: string;                     // Main heading
  subtitle?: string;                 // Optional description
  imageUrl?: string;                 // Optional image
  imageAlt?: string;                 // Image alt text
  tags?: React.ReactNode;            // Optional tags/metadata
  actions?: React.ReactNode;         // Optional action buttons
  children?: React.ReactNode;        // Additional content
}
```

## Migration Examples

### Before: book-detail.tsx (70+ lines)

```typescript
const headerBg = "orange.50";
const headerBorder = "orange.100";
const cardBorder = "gray.200";

return (
  <>
    <Box bg={headerBg} borderBottom="1px" borderColor={headerBorder} py={8}>
      <Container maxW="container.xl">
        <Breadcrumb spacing="8px" separator={<Icon as={ChevronRight} color="gray.500" />} mb={4}>
          <BreadcrumbItem>
            <BreadcrumbLink as={Link} to="/">Home</BreadcrumbLink>
          </BreadcrumbItem>
          {/* ... more breadcrumb items ... */}
        </Breadcrumb>
        
        <Flex direction={{ base: "column", md: "row" }} gap={6}>
          {/* ... image and content ... */}
        </Flex>
      </Container>
    </Box>
    {/* ... rest of template ... */}
  </>
);
```

### After: book-detail.tsx (30 lines)

```typescript
const headerBg = semanticColors.header.reading;
const headerBorder = semanticColors.border.header.reading;
const cardBorder = semanticColors.card.border;

return (
  <>
    <PageHeader
      bg={headerBg}
      borderColor={headerBorder}
      breadcrumbItems={[
        { label: "Home", path: "/" },
        { label: "Reading", path: readingPath() },
        { label: book.name, isCurrentPage: true },
      ]}
      title={book.name}
      subtitle={book.description}
      imageUrl={book.imageUrl}
      tags={
        <Stack direction="row" spacing={3}>
          <Tag colorScheme={tagColorSchemes.language}>{book.sourceLanguage}</Tag>
          <Tag colorScheme={tagColorSchemes.difficulty}>{book.difficulty}</Tag>
        </Stack>
      }
    />
    {/* ... rest of template ... */}
  </>
);
```

## Remaining Templates to Update

The following templates still need to be updated to use the new components:

1. **collection-detail.tsx** - Use `PageHeader` and color constants
2. **deck-detail.tsx** - Use `PageHeader` and color constants
3. **flashcard-detail.tsx** - Use `PageHeader` and color constants
4. **story-detail.tsx** - Use `PageHeader` and color constants
5. **reading-list.tsx** - Use color constants for hero and cards
6. **flashcard-list.tsx** - Use color constants for cards
7. **Layout.tsx** - Use color constants
8. **CardBack.tsx** - Use color constants

## Benefits

1. **Consistency**: All pages use the same color palette and component structure
2. **Maintainability**: Change colors in one place, affects entire app
3. **Reduced Duplication**: ~50-70 lines of code eliminated per template
4. **Type Safety**: TypeScript interfaces ensure correct usage
5. **Easier Theming**: Future theme changes are much simpler

## Next Steps

1. Update remaining templates to use `PageHeader` component
2. Update all components to use `semanticColors` and `tagColorSchemes`
3. Consider extracting card components (CollectionCard, DeckCard, etc.)
4. Add difficulty sorting utility function
5. Review and consolidate type definitions
