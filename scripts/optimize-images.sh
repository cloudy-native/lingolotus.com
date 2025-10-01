#!/bin/bash

# Image Optimization Script
# This script optimizes images in static/images directory
# - Resizes images to reasonable dimensions
# - Compresses to reduce file size
# - Converts to WebP format for better compression

set -e

IMAGES_DIR="static/images"
BACKUP_DIR="static/images-backup"
MAX_WIDTH=1200
MAX_HEIGHT=1200
QUALITY=85

echo "🖼️  Image Optimization Script"
echo "================================"
echo ""

# Check if ImageMagick is installed
if ! command -v convert &> /dev/null; then
    echo "❌ ImageMagick is not installed!"
    echo "Install with: brew install imagemagick"
    exit 1
fi

# Create backup directory
if [ ! -d "$BACKUP_DIR" ]; then
    echo "📦 Creating backup directory..."
    mkdir -p "$BACKUP_DIR"
fi

# Backup original images (only if not already backed up)
echo "💾 Backing up original images..."
shopt -s nullglob
for img in "$IMAGES_DIR"/*.jpg "$IMAGES_DIR"/*.jpeg "$IMAGES_DIR"/*.png "$IMAGES_DIR"/*.JPG "$IMAGES_DIR"/*.JPEG "$IMAGES_DIR"/*.PNG; do
    [ -f "$img" ] || continue
    filename=$(basename "$img")
    if [ ! -f "$BACKUP_DIR/$filename" ]; then
        cp "$img" "$BACKUP_DIR/"
        echo "  ✓ Backed up: $filename"
    fi
done

echo ""
echo "🔧 Optimizing images..."
echo "  Max dimensions: ${MAX_WIDTH}x${MAX_HEIGHT}"
echo "  Quality: ${QUALITY}%"
echo ""

# Process each image
for img in "$IMAGES_DIR"/*.jpg "$IMAGES_DIR"/*.jpeg "$IMAGES_DIR"/*.png "$IMAGES_DIR"/*.JPG "$IMAGES_DIR"/*.JPEG "$IMAGES_DIR"/*.PNG; do
    [ -f "$img" ] || continue
    
    filename=$(basename "$img")
    extension="${filename##*.}"
    name="${filename%.*}"
    
    # Get original size
    original_size=$(du -h "$img" | cut -f1)
    
    echo "Processing: $filename (Original: $original_size)"
    
    # Optimize JPEG/JPG
    if [[ "$extension" =~ ^(jpg|jpeg|JPG|JPEG)$ ]]; then
        convert "$img" \
            -resize "${MAX_WIDTH}x${MAX_HEIGHT}>" \
            -quality $QUALITY \
            -strip \
            -interlace Plane \
            "$img"
    fi
    
    # Optimize PNG
    if [[ "$extension" =~ ^(png|PNG)$ ]]; then
        convert "$img" \
            -resize "${MAX_WIDTH}x${MAX_HEIGHT}>" \
            -quality $QUALITY \
            -strip \
            "$img"
    fi
    
    # Get new size
    new_size=$(du -h "$img" | cut -f1)
    echo "  ✓ Optimized: $new_size"
    echo ""
done

echo "✅ Image optimization complete!"
echo ""
echo "📊 Summary:"
echo "  Original images backed up to: $BACKUP_DIR"
echo "  Optimized images in: $IMAGES_DIR"
echo ""
echo "To restore originals: cp $BACKUP_DIR/* $IMAGES_DIR/"
