import fs from "node:fs";
import path from "node:path";

// ---------------------------------------------------------------------------
// Image Reference Validation
// ---------------------------------------------------------------------------

export interface ImageValidationError {
  /** The identifier of the content entry (collectionId, bookId, etc.) */
  entryId: string;
  /** The collection the entry belongs to */
  collection: string;
  /** The imageUrl value that couldn't be resolved */
  imageUrl: string;
  /** Human-readable error message */
  message: string;
}

export interface ImageValidationResult {
  valid: boolean;
  errors: ImageValidationError[];
}

/**
 * Resolves an imageUrl path to an absolute file path in the public/ directory.
 * imageUrl values are relative to public/, e.g., "/images/photo.jpeg" resolves
 * to "<projectRoot>/public/images/photo.jpeg".
 */
export function resolveImagePath(imageUrl: string, publicDir?: string): string {
  const resolvedPublicDir =
    publicDir || path.resolve(process.cwd(), "public");
  // Strip leading slash if present to build a proper path
  const relativePath = imageUrl.startsWith("/") ? imageUrl.slice(1) : imageUrl;
  return path.join(resolvedPublicDir, relativePath);
}

/**
 * Checks if a file exists at the given absolute path.
 */
export function imageFileExists(absolutePath: string): boolean {
  try {
    return fs.existsSync(absolutePath) && fs.statSync(absolutePath).isFile();
  } catch {
    return false;
  }
}

/**
 * Validates that all imageUrl references in content collection entries
 * point to existing files in the public/ directory.
 *
 * @param entries - Array of content entries with optional imageUrl fields
 * @param publicDir - Optional override for the public directory path (useful for testing)
 * @returns Validation result with any errors found
 */
export function validateImageReferences(
  entries: Array<{
    id: string;
    collection: string;
    imageUrl?: string;
  }>,
  publicDir?: string,
): ImageValidationResult {
  const errors: ImageValidationError[] = [];

  for (const entry of entries) {
    if (!entry.imageUrl) continue;

    const absolutePath = resolveImagePath(entry.imageUrl, publicDir);

    if (!imageFileExists(absolutePath)) {
      errors.push({
        entryId: entry.id,
        collection: entry.collection,
        imageUrl: entry.imageUrl,
        message: `Entry "${entry.id}" in collection "${entry.collection}" references image "${entry.imageUrl}" which does not exist at "${absolutePath}"`,
      });
    }
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Validates image references and throws an error if any are missing.
 * Intended to be called during getStaticPaths() or at build time.
 * When a missing image is detected, the build will fail with a clear error message.
 */
export function assertImageReferencesValid(
  entries: Array<{
    id: string;
    collection: string;
    imageUrl?: string;
  }>,
  publicDir?: string,
): void {
  const result = validateImageReferences(entries, publicDir);

  if (!result.valid) {
    const errorMessages = result.errors
      .map((e) => `  - ${e.message}`)
      .join("\n");
    throw new Error(
      `Build failed: Missing image references detected:\n${errorMessages}`,
    );
  }
}
