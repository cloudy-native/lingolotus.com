#!/usr/bin/env bash
set -euo pipefail

# Deploy script for Lingo Lotus
# Builds the Astro site and deploys to S3 + CloudFront
#
# Resolves targets from the CloudFormation stack (override with env if needed):
#   STACK_NAME           - default: LingoLotusWebsiteStack
#   S3_BUCKET            - optional override (else stack output BucketName)
#   CF_DISTRIBUTION_ID   - optional override (else stack CloudFront resource)

STACK_NAME="${STACK_NAME:-LingoLotusWebsiteStack}"

require_cmd() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "Error: required command not found: $1" >&2
    exit 1
  fi
}

require_cmd aws
require_cmd pnpm

echo "==> Resolving deploy targets from stack: ${STACK_NAME}"

if [[ -z "${S3_BUCKET:-}" ]]; then
  S3_BUCKET="$(
    aws cloudformation describe-stacks \
      --stack-name "${STACK_NAME}" \
      --query "Stacks[0].Outputs[?OutputKey=='BucketName'].OutputValue | [0]" \
      --output text
  )"
fi

if [[ -z "${CF_DISTRIBUTION_ID:-}" ]]; then
  CF_DISTRIBUTION_ID="$(
    aws cloudformation describe-stack-resources \
      --stack-name "${STACK_NAME}" \
      --query "StackResources[?ResourceType=='AWS::CloudFront::Distribution'].PhysicalResourceId | [0]" \
      --output text
  )"
fi

if [[ -z "${S3_BUCKET}" || "${S3_BUCKET}" == "None" ]]; then
  echo "Error: could not resolve S3 bucket from stack ${STACK_NAME} (output BucketName)" >&2
  exit 1
fi

if [[ -z "${CF_DISTRIBUTION_ID}" || "${CF_DISTRIBUTION_ID}" == "None" ]]; then
  echo "Error: could not resolve CloudFront distribution ID from stack ${STACK_NAME}" >&2
  exit 1
fi

echo "  S3_BUCKET=${S3_BUCKET}"
echo "  CF_DISTRIBUTION_ID=${CF_DISTRIBUTION_ID}"

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
