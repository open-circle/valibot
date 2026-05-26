import { component$, useComputed$ } from '@builder.io/qwik';
import { useDocumentHead, useLocation } from '@builder.io/qwik-city';
import { useTheme } from '~/routes/plugin@theme';

/**
 * Head with title, meta, link, script and style elements.
 */
export const Head = component$(() => {
  // Use document head, location and theme
  const head = useDocumentHead();
  const location = useLocation();
  const theme = useTheme();

  // Compute document title
  const documentTitle = useComputed$(() =>
    location.url.pathname === '/' ? head.title : `${head.title} | Valibot`
  );

  // Compute theme color code
  const themeColor = useComputed$(() =>
    theme.value === 'dark' ? '#111827' : '#fff'
  );

  // Compute Open Graph type
  const ogType = useComputed$(() =>
    location.url.pathname === '/' || location.url.pathname === '/playground/'
      ? 'website'
      : 'article'
  );

  // Compute description from metadata
  const description = useComputed$(
    () => head.meta.find((item) => item.name === 'description')?.content
  );

  // Compute Open Graph image URL
  const imageUrl = useComputed$(() => {
    // Create base URL
    let imageUrl = `${location.url.origin}/og-image`;

    // Add title and path to URL
    if (location.url.pathname !== '/') {
      imageUrl += `?title=${encodeURIComponent(head.title)}&path=${
        location.url.pathname.split('/')[1]
        }`;

      // Add description to URL
      if (description.value) {
        imageUrl += `&description=${encodeURIComponent(description.value)}`;
      }
    }

    // Return image URL
    return imageUrl;
  });

  return (
    <head>
      {/* Document title */}
      <title>{documentTitle.value}</title>

      {/* Default metadata */}
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta name="theme-color" content={themeColor.value} />
      <link rel="canonical" href={location.url.href} />
      <link rel="manifest" href="/manifest.json" />

      {/* Icon metadata */}
      <link rel="icon" type="image/png" sizes="32x32" href="/icon-32px.png" />
      <link rel="icon" type="image/png" sizes="16x16" href="/icon-16px.png" />
      <link rel="apple-touch-icon" sizes="180x180" href="/icon-180px.jpg" />

      {/* Preload fonts */}
      <link
        rel="preload"
        href="/fonts/lexend-exa-500.woff2"
        as="font"
        type="font/woff2"
        crossOrigin=""
      />
      <link
        rel="preload"
        href="/fonts/lexend-500.woff2"
        as="font"
        type="font/woff2"
        crossOrigin=""
      />
      <link
        rel="preload"
        href="/fonts/lexend-400.woff2"
        as="font"
        type="font/woff2"
        crossOrigin=""
      />

      {/* Open Graph metadata */}
      <meta property="og:type" content={ogType.value} />
      <meta property="og:url" content={location.url.href} />
      <meta property="og:title" content={head.title} />
      {description.value && (
        <meta property="og:description" content={description.value} />
      )}
      <meta property="og:image" content={imageUrl.value} />
      <meta name="twitter:card" content="summary_large_image" />

      {/* Dynamic metadata */}
      {head.meta.map(({ key, ...props }) => (
        <meta key={key} {...props} />
      ))}

      {/* Umami tracking script */}
      <script
        async
        src="https://umami.valibot.dev/script.js"
        data-website-id="1fe7c3d9-66cb-43db-bb9c-dd86128e828c"
        data-domains="valibot.dev"
        data-strip-search="true"
      />

      {/* Guru Widget script */}
      <script
        async
        src="https://guru-widget.pages.dev/guru_widget.latest.min.js"
        data-text="Ask AI"
        data-link="https://gurubase.io/g/valibot"
        data-bg-color="#FACC13"
        data-icon-url="https://gurubase.io/_next/image?url=https%3A%2F%2Fvalibot.dev%2Ficon-180px.jpg&w=96&q=75"
      />

      {/* Temporary solution until attribute can be rendered dynamically */}
      {theme.value === 'dark' ? (
        <script dangerouslySetInnerHTML="document.documentElement.classList.add('dark')" />
      ) : (
        <script dangerouslySetInnerHTML="document.documentElement.classList.remove('dark')" />
      )}
    </head>
  );
});
