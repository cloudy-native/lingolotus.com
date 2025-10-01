# Image Optimization Scripts

## optimize-images.sh

Automatically optimizes all images in `static/images/` directory.

### What it does:
- **Backs up** original images to `static/images-backup/`
- **Resizes** images to max 1200x1200px (maintains aspect ratio)
- **Compresses** JPEGs to 85% quality
- **Strips** metadata to reduce file size
- **Progressive** JPEG encoding for faster loading

### Usage:

```bash
# Run the optimization script
pnpm run optimize-images

# Or run directly
bash scripts/optimize-images.sh
```

### Expected Results:

| Image | Before | After | Savings |
|-------|--------|-------|---------|
| IMG_5673.jpeg | 5.2MB | ~200-300KB | **95%** |
| IMG_5492.jpeg | 5.9MB | ~200-300KB | **95%** |
| IMG_5307.jpeg | 6.3MB | ~200-300KB | **95%** |
| bangkok-rainbow.jpeg | 3.1MB | ~150-200KB | **94%** |

### Settings:

- **Max Width:** 1200px
- **Max Height:** 1200px  
- **JPEG Quality:** 85%
- **Format:** Progressive JPEG

### Restore Originals:

If you need to restore the original images:

```bash
cp static/images-backup/* static/images/
```

### Requirements:

- ImageMagick (`brew install imagemagick`)

### Notes:

- Images are only backed up once (won't overwrite existing backups)
- Smaller images won't be upscaled
- Aspect ratios are preserved
- Safe to run multiple times
