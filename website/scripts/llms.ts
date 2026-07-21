import graymatter from 'gray-matter';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import type { PropertyProps } from '~/components';
import { serializeProperty } from './utils/index';

// Read menu.md of guides and API
const menuOfGuides = fs.readFileSync(
  path.join('src', 'routes', 'guides', 'menu.md'),
  'utf-8'
);
const menuOfApi = fs.readFileSync(
  path.join('src', 'routes', 'api', 'menu.md'),
  'utf-8'
);

/**
 * Converts a markdown menu to a string suitable for our llms.txt file.
 *
 * @param markdown The markdown string to convert.
 *
 * @returns A llms.txt compatible string.
 */
function convertMenuToLlms(markdown: string): string {
  return (
    markdown
      // Change levels of headings to one level down
      .replaceAll(/^#/gm, '##')
      // Replace relative paths with URLs to MD files
      .replaceAll(/\(\/(.+)\/\)$/gm, '(https://valibot.dev/$1.md)')
  );
}

// Create intro text with title and summary for llms files
const introText =
  '# Valibot\n\n> The modular and type safe schema library for validating structural data.\n';

// Create details text with pointers to other resources for llms.txt file
const detailsText =
  'Every link below points to the Markdown version of a documentation page. The same page is served as HTML at the same URL without the `.md` extension. The whole documentation is also available as a single file at [llms-full.txt](https://valibot.dev/llms-full.txt), the guides at [llms-guides.txt](https://valibot.dev/llms-guides.txt) and the API reference at [llms-api.txt](https://valibot.dev/llms-api.txt).\n';

// Create llms.txt file with content of guides and API menus
const llmsTxt = `${introText}\n${detailsText}\n${convertMenuToLlms(menuOfGuides)}\n${convertMenuToLlms(menuOfApi)}`;

// Write llms.txt file to public directory
fs.writeFileSync(path.join('public', 'llms.txt'), llmsTxt);

/**
 * Extracts grouped file paths from a markdown menu.
 *
 * @param markdown The markdown menu string.
 *
 * @returns A grouped array of file paths.
 */
function extractFilePathsOfMenu(
  markdown: string
): { title: string; files: { name: string; path: string }[] }[] {
  // Split menu into groups based on level 2 headings
  const groups = markdown.split(/^## /gm).slice(1);

  // Convert groups into an array of MDX file paths
  return groups.map((group) => {
    // Extract title and create slug
    const groupTitle = group.match(/(^.+)\n/)![1];
    const groupSlug = groupTitle.toLowerCase().replace(/\s+/g, '-');

    // Create object to hold title and file data
    const groupData: {
      title: string;
      files: { name: string; path: string }[];
    } = { title: groupTitle, files: [] };

    // Extract file paths from group using regex
    const filePaths = group.matchAll(/\(\/(.+)\/(.+)\/\)/gm);

    // Add data of each file path to group data
    for (const regexMatch of filePaths) {
      // Extract area and name from regex match
      const fileArea = regexMatch[1];
      const fileName = regexMatch[2];

      // Create MDX file path based on area, group slug and name
      const filePath = path.join(
        'src',
        'routes',
        fileArea,
        `(${groupSlug})`,
        fileName,
        'index.mdx'
      );

      // Add file data to fiels of group data
      groupData.files.push({
        name: fileName,
        path: filePath,
      });
    }

    // Return final group data
    return groupData;
  });
}

/**
 * Converts the MDX components of our docs to plain Markdown so that the
 * content of the generated MD files matches the rendered HTML output.
 *
 * @param mdxContent The MDX content to convert.
 * @param dirPath The directory path of the MDX file.
 * @param pageUrl The URL of the documentation page.
 *
 * @returns A plain Markdown string.
 */
async function convertMdxToMd(
  mdxContent: string,
  dirPath: string,
  pageUrl: string
): Promise<string> {
  // Import property data if MDX content uses spread Property components
  let properties: Record<string, PropertyProps> = {};
  if (mdxContent.includes('{...properties')) {
    properties = (
      await import(pathToFileURL(path.join(dirPath, 'properties.ts')).href)
    ).properties;
  }

  return (
    mdxContent
      // Split content into code blocks and text to only transform the latter
      .split(/(```[\s\S]*?```)/)
      .map((segment) => {
        // Return code blocks unchanged
        if (segment.startsWith('```')) {
          return segment;
        }

        return (
          segment
            // Replace spread Property components with serialized type
            .replaceAll(
              /<Property\s+\{\.\.\.properties(?:\.(\w+)|\['([^']+)'\])\}\s*\/>/g,
              (match, dotName: string | undefined, bracketName: string) => {
                const name = dotName ?? bracketName;
                const data = properties[name];
                if (!data) {
                  throw new Error(`Missing property "${name}" in ${dirPath}`);
                }
                return serializeProperty(data);
              }
            )

            // Replace literal Property components with inline code
            .replaceAll(/<Property\s+type=["']([^"']+)["']\s*\/>/g, '`$1`')

            // Replace Link components with Markdown links
            .replaceAll(
              /<Link\s+href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/Link>/g,
              '[$2]($1)'
            )

            // Replace ApiList components with a list of Markdown links
            .replaceAll(/<ApiList\s+([\s\S]*?)\/>/g, (match, attrs: string) => {
              const label = attrs.match(/label=["']([^"']+)["']/)?.[1];
              const items = [...attrs.matchAll(/'([^']+)'/g)].map(
                (itemMatch) => `[\`${itemMatch[1]}\`](/api/${itemMatch[1]}/)`
              );
              return `${label ? `${label}: ` : ''}${items.join(', ')}`;
            })

            // Resolve relative link paths to absolute link paths so that
            // links work outside the HTML context of the page
            .replaceAll(/\]\((\.\.?\/[^)]+)\)/g, (match, target: string) => {
              const resolvedUrl = new URL(target, pageUrl);
              return `](${resolvedUrl.pathname}${resolvedUrl.hash})`;
            })

            // Rewrite links to documentation pages to their Markdown version
            // so that AI agents stay within the Markdown context
            .replaceAll(
              /\]\(\/(guides|api)\/([\w.-]+?)\/(#[^)]*)?\)/g,
              '](/$1/$2.md$3)'
            )

            // Remove remaining components (e.g. images and interactive
            // elements) as they cannot be converted to plain Markdown
            .replaceAll(/^<[A-Z][\s\S]*?\/>\n?/gm, '')
        );
      })
      .join('')
  );
}

/**
 * Warns about component markup that our MDX to Markdown conversion did not
 * catch so that new components are noticed and handled.
 *
 * @param mdContent The converted Markdown content.
 * @param filePath The path of the source MDX file.
 */
function warnAboutUnknownComponents(mdContent: string, filePath: string) {
  for (const segment of mdContent.split(/(```[\s\S]*?```)/)) {
    if (!segment.startsWith('```')) {
      const componentMatch = segment
        // Remove inline code as it can contain generic type arguments
        .replaceAll(/(`+)[\s\S]*?\1/g, '')
        .match(/<[A-Z]\w*[\s/]/);
      if (componentMatch) {
        console.warn(
          `Unknown component "${componentMatch[0].trim()}" in Markdown output of ${filePath}`
        );
      }
    }
  }
}

// Create object to hold content for specific llms files
const llms: Record<'full' | 'guides' | 'api', string> = {
  full: introText,
  guides: introText,
  api: introText,
};

// Define content areas with all necessary data
const contentAreas = [
  {
    id: 'guides',
    name: 'guides',
    publicDir: path.join('public', 'guides'),
    groups: extractFilePathsOfMenu(menuOfGuides),
  },
  {
    id: 'api',
    name: 'API',
    publicDir: path.join('public', 'api'),
    groups: extractFilePathsOfMenu(menuOfApi),
  },
] as const;

// Copy content of MDX files to public dir and add it to llms files
for (const contentArea of contentAreas) {
  // Ensure directory of content area exists
  if (!fs.existsSync(contentArea.publicDir)) {
    fs.mkdirSync(contentArea.publicDir);
  }

  // Add group title to llms files and process its files
  for (const areaGroup of contentArea.groups) {
    // Create level 2 heading for group
    const heading = `## ${areaGroup.title}`;

    // Add heading to specific llms files
    llms.full += `\n${heading} (${contentArea.name})\n`;
    llms[contentArea.id] += `\n${heading}\n`;

    // Copy content of MDX files to public dir and add content to llms files
    for (const mdxFile of areaGroup.files) {
      // Read MDX file and extract frontmatter
      const frontmatter = graymatter.read(mdxFile.path);

      // Remove MDX import statements from MDX content
      const mdxContent = frontmatter.content.slice(
        frontmatter.content.indexOf('# ') // Index of first heading
      );

      // Create URL of documentation page
      const pageUrl = `https://valibot.dev/${contentArea.id}/${mdxFile.name}/`;

      // Convert MDX components of content to plain Markdown
      const mdContent = await convertMdxToMd(
        mdxContent,
        path.dirname(mdxFile.path),
        pageUrl
      );

      // Warn about component markup that was not converted
      warnAboutUnknownComponents(mdContent, mdxFile.path);

      // Create agent directive with pointer to HTML page and llms.txt file
      const directive = `> This document is the Markdown version of [valibot.dev/${contentArea.id}/${mdxFile.name}/](${pageUrl}). For the complete documentation index, see [llms.txt](https://valibot.dev/llms.txt).`;

      // Add agent directive below first heading of MD content
      const headingEnd = mdContent.indexOf('\n');
      const pageContent = `${mdContent.slice(0, headingEnd)}\n\n${directive}${mdContent.slice(headingEnd)}`;

      // Copy MD content with directive into public directory
      fs.writeFileSync(
        path.join(contentArea.publicDir, `${mdxFile.name}.md`),
        pageContent
      );

      // Change level of headings two levels down without touching `#`
      // comments within code blocks
      const llmsContent = mdContent
        .split(/(```[\s\S]*?```)/)
        .map((segment) =>
          segment.startsWith('```')
            ? segment
            : segment.replaceAll(/^#/gm, '###')
        )
        .join('');

      // Add content to specific llms files
      llms.full += `\n${llmsContent}`;
      llms[contentArea.id] += `\n${llmsContent}`;
    }
  }
}

// Write specific llms files to public directory
fs.writeFileSync(path.join('public', 'llms-full.txt'), llms.full);
fs.writeFileSync(path.join('public', 'llms-guides.txt'), llms.guides);
fs.writeFileSync(path.join('public', 'llms-api.txt'), llms.api);
