/**
 * Injects a JSON-LD structured data script into <head>.
 * Used for Google rich results (Book, BreadcrumbList, etc.)
 *
 * Example:
 *   <JsonLd schema={{ "@context": "https://schema.org", "@type": "Book", ... }} />
 */
export default function JsonLd({ schema }) {
  if (!schema) return null
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}
