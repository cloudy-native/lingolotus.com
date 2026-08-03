// ---------------------------------------------------------------------------
// SEO Metadata Generation
// ---------------------------------------------------------------------------

export interface SEOMetadata {
  title: string;
  description: string;
  canonicalUrl: string;
  ogUrl: string;
  ogType: "website" | "article";
  ogSiteName: string;
  jsonLd?: {
    "@context": string;
    "@type": string;
    name: string;
    description: string;
    url: string;
  };
}

/**
 * Generates SEO metadata for a page.
 *
 * @param name - The page title (≤60 characters)
 * @param description - The page meta description (≤160 characters)
 * @param path - The URL path (e.g., "/flash-cards/thai-beginner")
 * @param isDetailPage - Whether this is a content detail page (article) or listing page (website)
 * @returns Complete SEO metadata object
 */
export function generateSEOMetadata(
  name: string,
  description: string,
  path: string,
  isDetailPage: boolean,
): SEOMetadata {
  const canonicalUrl = `https://lingolotus.com${path}`;
  return {
    title: name,
    description,
    canonicalUrl,
    ogUrl: canonicalUrl,
    ogType: isDetailPage ? "article" : "website",
    ogSiteName: "Lingo Lotus",
    jsonLd: isDetailPage
      ? {
          "@context": "https://schema.org",
          "@type": "WebPage",
          name,
          description,
          url: canonicalUrl,
        }
      : undefined,
  };
}
