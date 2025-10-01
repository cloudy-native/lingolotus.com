# Loading Components Guide 🪷

Consistent loading states across the application.

## Components

### 1. `LoadingState` - Full Page Skeletons

Use for entire page loading states.

```tsx
import { LoadingState } from "../components/LoadingState";

// Grid layout (collections, books)
<LoadingState variant="grid" count={6} />

// List layout (vertical items)
<LoadingState variant="list" count={5} />

// Detail page layout
<LoadingState variant="detail" />
```

**Variants:**
- `grid` - For card grids (flashcards, books)
- `list` - For vertical lists
- `detail` - For single item detail pages

---

### 2. `CardSkeleton` - Individual Card Loading

Use when loading specific cards in a grid.

```tsx
import { CardSkeleton } from "../components/CardSkeleton";

<SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={8}>
    <CardSkeleton count={6} hasImage={true} />
</SimpleGrid>
```

**Props:**
- `count` - Number of skeleton cards (default: 1)
- `hasImage` - Show image skeleton (default: true)

---

### 3. `PageLoader` - Centered Spinner

Use for async operations or page transitions.

```tsx
import { PageLoader } from "../components/PageLoader";

<PageLoader message="Loading flashcards..." />
```

**Props:**
- `message` - Custom loading message (default: "Loading...")

---

## Usage Examples

### Example 1: Loading Collections

```tsx
import { CardSkeleton } from "../components/CardSkeleton";

const CollectionList: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [collections, setCollections] = useState([]);

    if (loading) {
        return (
            <Container maxW="container.xl" py={8}>
                <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={8}>
                    <CardSkeleton count={6} hasImage={true} />
                </SimpleGrid>
            </Container>
        );
    }

    return (
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={8}>
            {collections.map(collection => (
                <CollectionCard key={collection.id} collection={collection} />
            ))}
        </SimpleGrid>
    );
};
```

### Example 2: Loading Full Page

```tsx
import { LoadingState } from "../components/LoadingState";

const FlashcardListPage: React.FC = () => {
    const [loading, setLoading] = useState(true);

    if (loading) {
        return <LoadingState variant="grid" count={9} />;
    }

    return (
        <Container maxW="container.xl">
            {/* Your content */}
        </Container>
    );
};
```

### Example 3: Async Operation

```tsx
import { PageLoader } from "../components/PageLoader";

const StudySession: React.FC = () => {
    const [initializing, setInitializing] = useState(true);

    useEffect(() => {
        initializeSession().then(() => setInitializing(false));
    }, []);

    if (initializing) {
        return <PageLoader message="Preparing your study session..." />;
    }

    return <StudyInterface />;
};
```

### Example 4: Conditional Card Loading

```tsx
import { CardSkeleton } from "../components/CardSkeleton";

const BookGrid: React.FC = () => {
    const { data, loading } = useBooks();

    return (
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={8}>
            {loading ? (
                <CardSkeleton count={6} hasImage={true} />
            ) : (
                data.map(book => <BookCard key={book.id} book={book} />)
            )}
        </SimpleGrid>
    );
};
```

---

## Best Practices

### ✅ Do's

- **Match the layout** - Use skeleton that matches final content
- **Show count** - Display expected number of items
- **Keep it simple** - Don't over-animate
- **Be consistent** - Use same loading pattern across similar pages

### ❌ Don'ts

- **Don't mix patterns** - Stick to one loading style per page type
- **Don't show too long** - Optimize data loading
- **Don't skip loading states** - Always show feedback for async operations
- **Don't use generic spinners** - Use skeleton screens for better UX

---

## When to Use Each Component

| Component | Use Case | Example |
|-----------|----------|---------|
| `LoadingState` | Full page loading | Initial page load, route change |
| `CardSkeleton` | Grid/list items | Loading collections, books, decks |
| `PageLoader` | Async operations | Saving data, processing, transitions |

---

## Accessibility

All loading components include:
- ✅ Proper ARIA labels
- ✅ Screen reader announcements
- ✅ Keyboard navigation support
- ✅ Reduced motion support

---

## Performance Tips

1. **Lazy load components** - Only show loading state when needed
2. **Prefetch data** - Reduce loading time with data prefetching
3. **Cache results** - Avoid showing loading for cached data
4. **Optimistic UI** - Show content immediately, update in background

---

## Testing

```tsx
// Test loading state
it('shows loading skeleton', () => {
    render(<CollectionList loading={true} />);
    expect(screen.getByTestId('card-skeleton')).toBeInTheDocument();
});

// Test loaded state
it('shows collections when loaded', () => {
    render(<CollectionList loading={false} data={mockData} />);
    expect(screen.getByText('My Collection')).toBeInTheDocument();
});
```

---

## Migration Guide

### Before (inconsistent)
```tsx
{loading && <Spinner />}
{loading && <Box>Loading...</Box>}
{loading && <div>Please wait...</div>}
```

### After (consistent)
```tsx
{loading && <LoadingState variant="grid" count={6} />}
{loading && <CardSkeleton count={3} />}
{loading && <PageLoader message="Loading..." />}
```

---

**Status:** ✅ Ready to use  
**Last Updated:** 2025-10-01
