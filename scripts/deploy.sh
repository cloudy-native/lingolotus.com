#!/usr/bin/env bash
set -euo pipefail

# Deploy script for Lingo Lotus
# Builds the Astro site and deploys to S3 + CloudFront
#
# Required environment variables:
#   S3_BUCKET            - S3 bucket name (e.g., lingolotuswebsitestack-websitebucket75c24d94-yuvr0ssdg44a)
#   CF_DISTRIBUTION_ID   - CloudFront distribution ID

# Validate required environment variables
if [[ -z "${S3_BUCKET:-}" ]]; then
  echo "Error: S3_BUCKET environment variable is not set" >&2
  exit 1
fi

if [[ -z "${CF_DISTRIBUTION_ID:-}" ]]; then
  echo "Error: CF_DISTRIBUTION_ID environment variable is not set" >&2
  exit 1
fi

echo "==> Building site..."
pnpm build

echo "==> Build successful. Deploying to S3..."

# Sync hashed assets (_astro/) with long-lived cache headers
echo "  -> Syncing hashed assets (_astro/)..."
aws s3 sync dist/_astro/ "s3://${S3_BUCKET}/_astro/" \
  --cache-control "max-age=31536000,public" \
  --delete

# Sync HTML files with no-cache headers
echo "  -> Syncing HTML files..."
aws s3 sync dist/ "s3://${S3_BUCKET}/" \
  --exclude "*" \
  --include "*.html" \
  --cache-control "max-age=0,must-revalidate"

# Sync other static files (images, robots.txt, manifest, sitemap, etc.)
echo "  -> Syncing other static assets..."
aws s3 sync dist/ "s3://${S3_BUCKET}/" \
  --exclude "_astro/*" \
  --exclude "*.html" \
  --cache-control "max-age=86400,public" \
  --delete

echo "==> S3 sync complete. Invalidating CloudFront cache..."

# Create CloudFront invalidation
aws cloudfront create-invalidation \
  --distribution-id "${CF_DISTRIBUTION_ID}" \
  --paths "/*"

echo "==> Deployment complete!"
