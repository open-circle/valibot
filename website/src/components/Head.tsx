import { component$, useComputed$ } from '@builder.io/qwik';
import { useDocumentHead, useLocation } from '@builder.io/qwik-city';
import { CHAPTERS_HIDDEN_CLASS, CHAPTERS_KEY } from '~/routes/plugin@chapters';
import { THEME_KEY } from '~/routes/plugin@theme';

// Keys and classes are imported from the plugins so these pre-hydration
// scripts cannot drift from the runtime stores that read the same values.
const THEME_INIT_SCRIPT = `try{var t=localStorage.getItem('${THEME_KEY}');document.documentElement.classList.toggle('dark',t==='dark'||t!=='light'&&!matchMedia('(prefers-color-scheme:light)').matches);}catch(e){}`;

const CHAPTERS_INIT_SCRIPT = `try{document.documentElement.classList.toggle('${CHAPTERS_HIDDEN_CLASS}',localStorage.getItem('${CHAPTERS_KEY}')==='false');}catch(e){}`;

function ogImagePath(pathname: string): string {
  if (pathname === '/') return '/og/index.png';
  const slug = pathname.replace(/^\/+|\/+$/g, '').replace(/\//g, '_');
  return `/og/${slug}.png`;
}

/**
 * Head with title, meta, link, script and style elements.
 */
export const Head = component$(() => {
  // Use document head and location
  const head = useDocumentHead();
  const location = useLocation();

  // Compute document title
  const documentTitle = useComputed$(() =>
    location.url.pathname === '/' ? head.title : `${head.title} | Valibot`
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

  // Compute Open Graph image URL (points to pre-generated static PNG)
  const imageUrl = useComputed$(
    () => `${location.url.origin}${ogImagePath(location.url.pathname)}`
  );

  return (
    <head>
      {/* Pre-hydration theme + FOUC fix */}
      <script dangerouslySetInnerHTML={THEME_INIT_SCRIPT} />

      {/* Pre-hydration chapters visibility to avoid a layout shift */}
      <script dangerouslySetInnerHTML={CHAPTERS_INIT_SCRIPT} />

      {/* Document title */}
      <title>{documentTitle.value}</title>

      {/* Default metadata */}
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta
        name="theme-color"
        media="(prefers-color-scheme: light)"
        content="#fff"
      />
      <meta
        name="theme-color"
        media="(prefers-color-scheme: dark)"
        content="#111827"
      />
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
    </head>
  );
});
