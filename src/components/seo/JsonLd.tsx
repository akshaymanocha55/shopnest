import { serializeJsonLd } from '@/lib/seo';

/** Renders schema.org structured data. A native <script> is correct here (data, not code). */
export function JsonLd({ data }: { data: unknown }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: serializeJsonLd(data) }}
    />
  );
}
