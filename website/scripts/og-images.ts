/**
 * Pre-generates static Open Graph PNGs (one per route) into public/og/.
 *
 * Each route's title and description is extracted from MDX frontmatter or
 * from the `head: DocumentHead = {...}` literal in a route's `index.tsx`.
 */
import { ImageResponse } from '@vercel/og';
import matter from 'gray-matter';
import { promises as fsp } from 'node:fs';
import path from 'node:path';
import { html } from 'satori-html';
import { findNestedFiles } from './utils/index';

interface RouteInfo {
  /** Path component (e.g. "guides_quick-start") or "index" for "/". */
  slug: string;
  /** First URL segment for the small "valibot.dev/<segment>" badge. */
  pathLabel: string;
  title: string;
  description?: string;
}

const ROUTES_DIR = path.join('src', 'routes');
const OUT_DIR = path.join('public', 'og');

function urlPathFromFilePath(filePath: string): string {
  return filePath
    .replace(/\\/g, '/')
    .replace(/src\/routes\//, '')
    .replace(/\(.+?\)\//g, '')
    .replace(/index\.(tsx|mdx)$/, '');
}

function slugFromUrlPath(urlPath: string): string {
  const trimmed = urlPath.replace(/^\/+|\/+$/g, '');
  return trimmed === '' ? 'index' : trimmed.replace(/\//g, '_');
}

function unquote(value: string): string {
  return value
    .trim()
    .replace(/^['"`]|['"`]$/g, '')
    .replace(/\\'/g, "'")
    .replace(/\\"/g, '"');
}

function extractFromMdx(source: string): {
  title?: string;
  description?: string;
} {
  try {
    const parsed = matter(source);
    const data = parsed.data as Record<string, unknown>;
    const title = typeof data.title === 'string' ? data.title : undefined;
    const description =
      typeof data.description === 'string' ? data.description : undefined;
    return { title, description };
  } catch {
    return {};
  }
}

const QUOTED_STRING = /("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|`(?:\\.|[^`\\])*`)/
  .source;

function extractFromTsx(source: string): {
  title?: string;
  description?: string;
} {
  const headMatch = source.match(/head:\s*DocumentHead\s*=\s*{([\s\S]*?)\n};/);
  if (!headMatch) return {};
  const block = headMatch[1];
  const titleMatch = block.match(new RegExp(`title:\\s*${QUOTED_STRING}`));
  const descMatch = block.match(
    new RegExp(`name:\\s*['"]description['"],?\\s*content:\\s*${QUOTED_STRING}`)
  );
  return {
    title: titleMatch ? unquote(titleMatch[1]) : undefined,
    description: descMatch ? unquote(descMatch[1]) : undefined,
  };
}

async function collectRoutes(): Promise<RouteInfo[]> {
  const filePaths = findNestedFiles(
    [ROUTES_DIR],
    (fileName) => fileName === 'index.tsx' || fileName === 'index.mdx'
  );

  const routes: RouteInfo[] = [];
  for (const filePath of filePaths) {
    const urlPath = urlPathFromFilePath(filePath);
    const slug = slugFromUrlPath(urlPath);
    const pathLabel = urlPath.replace(/\/+$/, '').split('/')[0] ?? '';

    const source = await fsp.readFile(filePath, 'utf8');
    const extracted = filePath.endsWith('.mdx')
      ? extractFromMdx(source)
      : extractFromTsx(source);

    routes.push({
      slug,
      pathLabel,
      title: extracted.title ?? 'Valibot',
      description: extracted.description,
    });
  }

  return routes;
}

async function fetchFonts(publicDir: string) {
  const fontsDir = path.join(publicDir, 'fonts');
  const [lexend400, lexend500, lexendExa500, iconPng] = await Promise.all([
    fsp.readFile(path.join(fontsDir, 'lexend-400.ttf')),
    fsp.readFile(path.join(fontsDir, 'lexend-500.ttf')),
    fsp.readFile(path.join(fontsDir, 'lexend-exa-500.ttf')),
    fsp.readFile(path.join(publicDir, 'icon-192px.png')),
  ]);
  const iconData = `data:image/png;base64,${iconPng.toString('base64')}`;
  return {
    fonts: [
      { name: 'Lexend', data: lexend400, style: 'normal', weight: 400 },
      { name: 'Lexend', data: lexend500, style: 'normal', weight: 500 },
      {
        name: 'Lexend Exa',
        data: lexendExa500,
        style: 'normal',
        weight: 500,
      },
    ] as const,
    iconData,
  };
}

function renderTitledOg(
  route: RouteInfo,
  iconData: string,
  fonts: readonly {
    name: string;
    data: Buffer;
    style: 'normal';
    weight: number;
  }[]
): ImageResponse {
  const description = route.description
    ? route.description.length > 110
      ? route.description.slice(0, 110).trimEnd() + '...'
      : route.description
    : '';
  return new ImageResponse(
    html`
      <div
        tw="flex h-full w-full flex-col justify-between bg-gray-900 p-16"
        style="font-family: 'Lexend'"
      >
        <div tw="flex items-center justify-between">
          <div tw="flex items-center">
            <img tw="w-16 h-16" src="${iconData}" />
            <div
              tw="text-4xl font-medium text-slate-300 ml-4"
              style="font-family: 'Lexend Exa'"
            >
              Valibot
            </div>
          </div>
          <div
            tw="max-w-[50%] text-4xl text-slate-500"
            style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap"
          >
            valibot.dev${route.pathLabel ? `/` + route.pathLabel : ''}
          </div>
        </div>
        <div tw="flex flex-col">
          <h1
            tw="max-w-[80%] text-6xl font-medium leading-normal text-slate-200"
            style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap"
          >
            ${route.title}
          </h1>
          <p
            tw="text-4xl text-slate-400 leading-loose"
            style="${description ? '' : 'display: none'}"
          >
            ${description}
          </p>
        </div>
      </div>
    `,
    { width: 1200, height: 630, fonts: fonts as never }
  );
}

function renderLogoOg(
  iconData: string,
  fonts: readonly {
    name: string;
    data: Buffer;
    style: 'normal';
    weight: number;
  }[]
): ImageResponse {
  return new ImageResponse(
    html`
      <div
        tw="flex h-full w-full items-center justify-center bg-gray-900"
        style="font-family: 'Lexend Exa'"
      >
        <div tw="flex items-center">
          <img tw="w-36 h-36" src="${iconData}" />
          <div tw="text-8xl font-medium text-slate-300 ml-10">Valibot</div>
        </div>
      </div>
    `,
    { width: 1200, height: 630, fonts: fonts as never }
  );
}

async function main() {
  await fsp.mkdir(OUT_DIR, { recursive: true });
  const routes = await collectRoutes();
  const { fonts, iconData } = await fetchFonts('public');

  for (const route of routes) {
    const isHome = route.slug === 'index';
    const image = isHome
      ? renderLogoOg(iconData, fonts)
      : renderTitledOg(route, iconData, fonts);
    const buffer = Buffer.from(await image.arrayBuffer());
    const outPath = path.join(OUT_DIR, `${route.slug}.png`);
    await fsp.writeFile(outPath, buffer);
    process.stdout.write(`og: ${route.slug}\n`);
  }

  process.stdout.write(`og: generated ${routes.length} images\n`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
